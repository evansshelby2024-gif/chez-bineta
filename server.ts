import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side Supabase client with Service Role Key (bypasses RLS securely on backend)
const getSupabaseServer = () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const supabaseServer = new Proxy({} as any, {
  get(_target, prop) {
    const client = getSupabaseServer();
    if (!client) return undefined;
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

// Server-side State & Admin Security (Never exposed to client bundle)
let SERVER_ADMIN_PIN = process.env.ADMIN_PIN || '1234';
const PIN_LOCKOUT_DURATION_MS = 30 * 1000;
let failedAttempts = 0;
let lockoutUntil = 0;

// Atomic Order Counter (strictly sequential, avoids client localStorage collisions)
let globalOrderCounter = 1042;

// Ephemeral server secret for HMAC signed session tokens
const SERVER_SECRET = crypto.randomBytes(32).toString('hex');

// API: Verify Admin PIN
app.post('/api/admin/verify-pin', async (req: Request, res: Response) => {
  const { pin } = req.body;
  if (!pin) {
    return res.status(400).json({ success: false, error: 'Code PIN manquant' });
  }

  const now = Date.now();
  if (now < lockoutUntil) {
    const remaining = Math.ceil((lockoutUntil - now) / 1000);
    return res.status(429).json({
      success: false,
      error: `Accès temporairement verrouillé pour sécurité. Réessayez dans ${remaining}s`,
      remainingSeconds: remaining,
    });
  }

  const cleanPin = String(pin).trim();
  let isValid = cleanPin === SERVER_ADMIN_PIN.trim();

  // Also verify via Supabase RPC if configured
  if (!isValid && supabaseServer) {
    try {
      const { data: rpcData, error: rpcError } = await supabaseServer.rpc('verify_admin_pin', {
        input_pin: cleanPin,
      });
      if (!rpcError && rpcData) {
        if (typeof rpcData === 'object' && rpcData.success) {
          isValid = true;
        } else if (typeof rpcData === 'boolean' && rpcData === true) {
          isValid = true;
        }
      }
    } catch (e) {
      console.warn('[Server] Supabase RPC pin check error:', e);
    }
  }

  if (isValid) {
    failedAttempts = 0;
    lockoutUntil = 0;
    // Issue secure signed HMAC session token
    const timestamp = Date.now();
    const signature = crypto
      .createHmac('sha256', SERVER_SECRET)
      .update(`admin:${timestamp}`)
      .digest('hex');
    const token = `${timestamp}:${signature}`;
    return res.json({ success: true, token, role: 'seller' });
  }

  failedAttempts++;
  if (failedAttempts >= 3) {
    lockoutUntil = now + PIN_LOCKOUT_DURATION_MS;
    failedAttempts = 0;
    return res.status(429).json({
      success: false,
      error: '3 tentatives incorrectes ! Accès verrouillé pendant 30 secondes pour sécurité.',
      remainingSeconds: 30,
    });
  }

  return res.status(401).json({
    success: false,
    error: `Code PIN incorrect (${failedAttempts}/3 tentatives). Veuillez réessayer.`,
    remainingAttempts: 3 - failedAttempts,
  });
});

// API: Get Admin Orders (Secure HMAC Authenticated)
app.get('/api/admin/orders', async (req: Request, res: Response) => {
  try {
    const token = String(req.headers.authorization || '').replace(/^Bearer /, '');
    const [timestamp, signature] = token.split(':');
    const expected = crypto
      .createHmac('sha256', SERVER_SECRET)
      .update(`admin:${timestamp}`)
      .digest('hex');

    if (
      !timestamp ||
      !signature ||
      signature !== expected ||
      Date.now() - Number(timestamp) > 24 * 60 * 60 * 1000
    ) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const { data, error } = await supabaseServer
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// API: Change Admin PIN (requires valid session token)
app.post('/api/admin/change-pin', (req: Request, res: Response) => {
  const { token, newPin } = req.body;
  if (!token || !newPin || String(newPin).trim().length < 4) {
    return res.status(400).json({ success: false, error: 'Données invalides ou PIN trop court (min 4 chiffres)' });
  }

  const [ts, sig] = String(token).split(':');
  if (!ts || !sig) {
    return res.status(403).json({ success: false, error: 'Format de session invalide' });
  }

  const expectedSig = crypto
    .createHmac('sha256', SERVER_SECRET)
    .update(`admin:${ts}`)
    .digest('hex');

  if (sig !== expectedSig) {
    return res.status(403).json({ success: false, error: 'Session gérante invalide ou expirée' });
  }

  SERVER_ADMIN_PIN = String(newPin).trim();
  return res.json({ success: true, message: 'Nouveau code PIN enregistré sur le serveur' });
});

// API: Atomic Collision-Proof Order Number Generation
app.post('/api/orders/next-number', (_req: Request, res: Response) => {
  globalOrderCounter++;
  const orderNum = globalOrderCounter;
  const orderId = `#CB-${orderNum}`;
  return res.json({ success: true, numericId: orderNum, orderId });
});

// API: Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    backend: 'Express + Vite Full-Stack',
  });
});

// Mount Vite or static
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chez Bineta full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
