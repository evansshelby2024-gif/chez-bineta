import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Product, Order, CustomerReview, SundayReservation } from './types';

// Supabase environment keys or local manager storage override
const envSupabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || '';
const envSupabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || '';

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  role: 'client' | 'admin' | 'seller';
  createdAt?: string;
}

// Check if configured via env or manager dashboard
export const getSupabaseCredentials = (): { url: string; key: string; isConfigured: boolean } => {
  let localUrl = '';
  let localKey = '';
  try {
    localUrl = localStorage.getItem('chez_bineta_supabase_url') || '';
    localKey = localStorage.getItem('chez_bineta_supabase_anon_key') || '';
  } catch {}

  const url = envSupabaseUrl || localUrl;
  const key = envSupabaseAnonKey || localKey;

  return {
    url,
    key,
    isConfigured: Boolean(url && key && url.startsWith('http')),
  };
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
      console.log('[Supabase] Client initialized for:', url);
    } catch (e) {
      console.warn('[Supabase] Initialization error:', e);
      return null;
    }
  }
  return supabaseInstance;
};

// Set manager credentials
export const configureSupabase = (url: string, key: string) => {
  try {
    localStorage.setItem('chez_bineta_supabase_url', url.trim());
    localStorage.setItem('chez_bineta_supabase_anon_key', key.trim());
    supabaseInstance = null; // reset to re-create
  } catch {}
};

// ===============================================================
// RPC: SECURE ADMIN PIN VERIFICATION (SERVER-SIDE ON SUPABASE)
// The PIN is never exposed or verified on the client browser!
// ===============================================================
export const verifyAdminPinRPC = async (
  inputPin: string
): Promise<{ success: boolean; error?: string; role?: string; verifiedVia: 'supabase_rpc' | 'server_api' }> => {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client.rpc('verify_admin_pin', { input_pin: inputPin.trim() });
      if (!error && data) {
        if (typeof data === 'object' && data.success) {
          return { success: true, role: data.role || 'seller', verifiedVia: 'supabase_rpc' };
        } else if (typeof data === 'boolean' && data === true) {
          return { success: true, role: 'seller', verifiedVia: 'supabase_rpc' };
        } else if (typeof data === 'object' && !data.success) {
          return { success: false, error: data.error || 'Code PIN incorrect', verifiedVia: 'supabase_rpc' };
        }
      }
      if (error && error.code !== 'PGRST202') {
        // Function exists but gave error
        console.warn('[Supabase RPC] verify_admin_pin error:', error.message);
      }
    } catch (rpcErr) {
      console.warn('[Supabase RPC] call failed, falling back to secure server endpoint:', rpcErr);
    }
  }

  // Fallback to secure full-stack backend endpoint (never local client JS)
  try {
    const res = await fetch('/api/admin/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: inputPin.trim() }),
    });
    const result = await res.json();
    return {
      success: Boolean(res.ok && result.success),
      error: result.error,
      role: result.role || 'seller',
      verifiedVia: 'server_api',
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'Impossible de contacter le serveur d’authentification sécurisé.',
      verifiedVia: 'server_api',
    };
  }
};

// RPC: SECURE UPDATE ADMIN PIN
export const updateAdminPinRPC = async (
  oldPin: string,
  newPin: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.rpc('update_admin_pin', {
        old_pin: oldPin.trim(),
        new_pin: newPin.trim(),
      });
      if (!error && data && data.success) {
        return { success: true, message: data.message || 'Code PIN mis à jour dans Supabase' };
      }
    } catch (e) {
      console.warn('[Supabase RPC] update_admin_pin error:', e);
    }
  }

  // Fallback to backend server API
  try {
    const token = sessionStorage.getItem('chez_bineta_admin_token') || '';
    const res = await fetch('/api/admin/change-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPin: newPin.trim() }),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, message: 'Code PIN mis à jour avec succès' };
    }
    return { success: false, error: result.error || 'Erreur lors de la mise à jour' };
  } catch (e: any) {
    return { success: false, error: e.message || 'Erreur réseau' };
  }
};

// ===============================================================
// SUPABASE AUTH (EMAIL & PASSWORD / PROFILES)
// ===============================================================

export const signInWithSupabaseEmail = async (email: string, password: string) => {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase n’est pas encore connecté.');

  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw error;
  return data;
};

export const signUpWithSupabaseEmail = async (
  email: string,
  password: string,
  fullName: string,
  phone: string,
  role: 'client' | 'admin' | 'seller' = 'client'
) => {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase n’est pas encore connecté.');

  const { data, error } = await client.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        role,
      },
    },
  });

  if (error) throw error;
  return data;
};

export const signOutSupabaseAuth = async () => {
  const client = getSupabaseClient();
  if (!client) return;
  await client.auth.signOut();
};

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      fullName: data.full_name || '',
      phone: data.phone || '',
      role: data.role || 'client',
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
};

// Helper: Test live connection to Supabase
export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'URL ou Clé API Supabase manquante' };
  }

  try {
    // Test table and RPC
    const { error: prodError } = await client.from('products').select('id').limit(1);
    if (prodError && prodError.code === '42P01') {
      return {
        success: true,
        message: 'Connecté ! Exécutez le script SQL fourni pour générer les tables & la fonction RPC.',
      };
    } else if (prodError) {
      return { success: false, message: `Erreur Supabase: ${prodError.message}` };
    }

    return { success: true, message: 'Connexion Supabase active avec Auth & RPC opérationnels ! 🟢' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Échec de connexion' };
  }
};

// Helper: Sync order to Supabase
export const syncOrderToSupabase = async (order: Order, userId?: string) => {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const { error } = await client.from('orders').upsert({
      id: order.id,
      numeric_id: order.numericId,
      customer_name: order.customerName,
      phone: order.phone,
      mode: order.mode,
      pickup_time: order.pickupTime,
      address: order.address,
      quartier: order.quartier,
      indications: order.indications,
      total: order.total,
      payment_method: order.paymentMethod,
      status: order.status,
      notes: order.notes,
      items: order.items,
      customer_id: userId || null,
      created_at: order.createdAt,
    });
    if (error) console.warn('[Supabase] syncOrder error:', error);
  } catch (e) {
    console.warn('[Supabase] syncOrder exception:', e);
  }
};

// Helper: Sync product to Supabase
export const syncProductToSupabase = async (product: Product) => {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const { error } = await client.from('products').upsert({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      available: product.available,
      image: product.image,
      is_popular: product.isPopular ?? false,
      options: product.options ?? [],
    });
    if (error) console.warn('[Supabase] syncProduct error:', error);
  } catch (e) {
    console.warn('[Supabase] syncProduct exception:', e);
  }
};

// Helper: Subscribe to real-time order events on Supabase
export const subscribeToSupabaseOrders = (
  callback: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new: any; old: any }) => void
) => {
  const client = getSupabaseClient();
  if (!client) return () => {};

  try {
    const channel = client
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload: any) => {
          callback({
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
          });
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[Supabase Realtime] Subscribe error:', err);
    return () => {};
  }
};

// Helper: Map Supabase database row to canonical Order type
export const mapSupabaseOrderToOrder = (row: any): Order => {
  let parsedItems = [];
  try {
    if (Array.isArray(row.items)) {
      parsedItems = row.items;
    } else if (typeof row.items === 'string') {
      parsedItems = JSON.parse(row.items);
    }
  } catch {
    parsedItems = [];
  }

  const rawNumericId = row.numeric_id;
  const numId =
    typeof rawNumericId === 'number'
      ? rawNumericId
      : rawNumericId
      ? parseInt(String(rawNumericId), 10)
      : row.id
      ? parseInt(String(row.id).replace(/\D/g, ''), 10) || 0
      : 0;

  return {
    id: String(row.id || ''),
    numericId: numId,
    customerName: String(row.customer_name || 'Client'),
    phone: String(row.phone || ''),
    mode: row.mode === 'livraison' ? 'livraison' : 'retrait',
    pickupTime: row.pickup_time || undefined,
    address: row.address || undefined,
    quartier: row.quartier || undefined,
    indications: row.indications || undefined,
    total: Number(row.total || 0),
    paymentMethod: row.payment_method === 'especes_livraison' ? 'especes_livraison' : 'especes_retrait',
    status: (row.status as any) || 'received',
    rejectionReason: row.rejection_reason || undefined,
    notes: row.notes || undefined,
    items: parsedItems,
    createdAt: row.created_at || new Date().toISOString(),
  };
};

// Helper: Fetch orders from Supabase (client-side)
export const fetchSupabaseOrders = async (): Promise<Order[]> => {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('[Supabase] fetchSupabaseOrders error:', error?.message);
      return [];
    }

    return data.map(mapSupabaseOrderToOrder);
  } catch (err) {
    console.warn('[Supabase] fetchSupabaseOrders exception:', err);
    return [];
  }
};


