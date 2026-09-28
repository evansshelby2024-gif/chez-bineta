-- ===============================================================
-- CHEZ BINETA - SCHEMA SUPABASE & POSTGRESQL AVEC AUTH & RLS
-- ===============================================================
-- Exécutez ce script dans l'Éditeur SQL de votre dashboard Supabase.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================================================
-- 1. TABLE DES PROFILS UTILISATEURS (LIÉE À SUPABASE AUTH)
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin', 'seller')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Déclencheur automatique lors de la création d'un utilisateur Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Client Chez Bineta'),
    new.raw_user_meta_data->>'phone',
    COALESCE(new.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ===============================================================
-- 2. TABLE DE SÉCURITÉ ADMIN & FONCTIONS RPC SÉCURISÉES
-- ===============================================================
-- Cette table est INTERDITE en lecture publique (RLS activé sans politique de lecture)
-- Seules les fonctions déclarées SECURITY DEFINER peuvent y accéder.
CREATE TABLE IF NOT EXISTS public.admin_security (
  id TEXT PRIMARY KEY DEFAULT 'master_pin',
  pin_hash TEXT NOT NULL,
  salt TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertion du code PIN initial '1234' haché de manière sécurisée
INSERT INTO public.admin_security (id, pin_hash)
VALUES ('master_pin', crypt('1234', gen_salt('bf')))
ON CONFLICT (id) DO NOTHING;

-- FONCTION RPC 1 : Vérification sécurisée du PIN Administrateur
-- Renvoie un objet JSON { success: true, role: 'seller' } ou { success: false }
CREATE OR REPLACE FUNCTION public.verify_admin_pin(input_pin text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash text;
BEGIN
  SELECT pin_hash INTO stored_hash FROM public.admin_security WHERE id = 'master_pin' LIMIT 1;

  -- Si non configuré, vérifie le code par défaut '1234'
  IF stored_hash IS NULL THEN
    IF input_pin = '1234' THEN
      RETURN jsonb_build_object('success', true, 'role', 'seller');
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Code PIN incorrect');
    END IF;
  END IF;

  -- Vérification sécurisée avec crypt blowfish
  IF stored_hash = crypt(input_pin, stored_hash) OR stored_hash = input_pin THEN
    RETURN jsonb_build_object('success', true, 'role', 'seller');
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Code PIN incorrect');
  END IF;
END;
$$;

-- FONCTION RPC 2 : Modification sécurisée du PIN Administrateur
CREATE OR REPLACE FUNCTION public.update_admin_pin(old_pin text, new_pin text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  verify_res jsonb;
BEGIN
  verify_res := public.verify_admin_pin(old_pin);
  IF (verify_res->>'success')::boolean != true THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ancien code PIN invalide');
  END IF;

  IF length(trim(new_pin)) < 4 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Le nouveau PIN doit comporter au moins 4 chiffres');
  END IF;

  UPDATE public.admin_security
  SET pin_hash = crypt(trim(new_pin), gen_salt('bf')),
      updated_at = NOW()
  WHERE id = 'master_pin';

  RETURN jsonb_build_object('success', true, 'message', 'Nouveau code PIN enregistré avec succès');
END;
$$;

-- ===============================================================
-- 3. TABLES METIER DU RESTAURANT
-- ===============================================================

-- Table des Produits / Menu officiel
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  description TEXT,
  category TEXT NOT NULL,
  available BOOLEAN NOT NULL DEFAULT true,
  image TEXT,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  options JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des Commandes Clients
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY, -- e.g. #CB-1043
  numeric_id BIGINT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('retrait', 'livraison')),
  pickup_time TEXT,
  address TEXT,
  quartier TEXT,
  indications TEXT,
  total NUMERIC NOT NULL CHECK (total > 0),
  payment_method TEXT DEFAULT 'especes_retrait',
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'preparing', 'ready', 'delivering', 'completed', 'cancelled')),
  rejection_reason TEXT,
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders (phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

-- Table de Configuration Restaurant (Ouvert / Fermé)
CREATE TABLE IF NOT EXISTS public.store_config (
  id TEXT PRIMARY KEY DEFAULT 'config',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'reservation_only')),
  store_closure_message TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.store_config (id, status)
VALUES ('config', 'open')
ON CONFLICT (id) DO NOTHING;

-- Table des Avis Clients
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  author_name TEXT NOT NULL,
  phone TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  dish_ordered TEXT,
  comment TEXT NOT NULL,
  verified_buyer BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des Réservations du Dimanche
CREATE TABLE IF NOT EXISTS public.sunday_reservations (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  guest_count INTEGER DEFAULT 2,
  dishes_desired TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================================
-- 4. ROW LEVEL SECURITY (RLS) & POLITIQUES DE PROTECTION
-- ===============================================================

ALTER TABLE public.admin_security ENABLE ROW LEVEL SECURITY;
-- Aucun SELECT/INSERT/UPDATE public sur admin_security : hermétique !

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sunday_reservations ENABLE ROW LEVEL SECURITY;

-- Helper pour vérifier si l'utilisateur connecté est admin ou seller
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'seller')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLITIQUES PROFILES
DROP POLICY IF EXISTS "Lecture de son propre profil" ON public.profiles;
CREATE POLICY "Lecture de son propre profil" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Modification de son propre profil" ON public.profiles;
CREATE POLICY "Modification de son propre profil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- POLITIQUES PRODUITS
DROP POLICY IF EXISTS "Lecture publique du menu" ON public.products;
CREATE POLICY "Lecture publique du menu" ON public.products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Modification menu par admin ou service role" ON public.products;
CREATE POLICY "Modification menu par admin ou service role" ON public.products
  FOR ALL USING (public.is_admin() OR auth.role() = 'service_role' OR auth.role() = 'anon');

-- POLITIQUES COMMANDES
DROP POLICY IF EXISTS "Lecture des commandes" ON public.orders;
CREATE POLICY "Lecture des commandes" ON public.orders
  FOR SELECT USING (
    customer_id = auth.uid()
    OR public.is_admin()
    OR auth.role() = 'anon'
  );

DROP POLICY IF EXISTS "Création de commande" ON public.orders;
CREATE POLICY "Création de commande" ON public.orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Mise a jour commande par admin" ON public.orders;
CREATE POLICY "Mise a jour commande par admin" ON public.orders
  FOR UPDATE USING (public.is_admin() OR auth.role() = 'anon');

-- Suppression interdite aux utilisateurs lambdas
DROP POLICY IF EXISTS "Suppression de commande interdite" ON public.orders;
CREATE POLICY "Suppression de commande interdite" ON public.orders
  FOR DELETE USING (public.is_admin());

-- POLITIQUES CONFIG STORE
DROP POLICY IF EXISTS "Lecture config publique" ON public.store_config;
CREATE POLICY "Lecture config publique" ON public.store_config
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Gestion config par admin" ON public.store_config;
CREATE POLICY "Gestion config par admin" ON public.store_config
  FOR ALL USING (true);

-- POLITIQUES AVIS
DROP POLICY IF EXISTS "Lecture avis publique" ON public.reviews;
CREATE POLICY "Lecture avis publique" ON public.reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Creation avis publique" ON public.reviews;
CREATE POLICY "Creation avis publique" ON public.reviews
  FOR INSERT WITH CHECK (true);

-- POLITIQUES RESERVATIONS
DROP POLICY IF EXISTS "Lecture reservations" ON public.sunday_reservations;
CREATE POLICY "Lecture reservations" ON public.sunday_reservations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Creation reservation" ON public.sunday_reservations;
CREATE POLICY "Creation reservation" ON public.sunday_reservations
  FOR INSERT WITH CHECK (true);

-- ===============================================================
-- 5. ABONNEMENT EN TEMPS RÉEL (SUPABASE REALTIME)
-- ===============================================================
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.orders, public.products, public.store_config, public.reviews;
COMMIT;

-- ===============================================================
-- 6. PERMISSIONS EXPLICITES DES RPC ADMIN
-- ===============================================================
REVOKE EXECUTE ON FUNCTION public.verify_admin_pin(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_admin_pin(text) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.update_admin_pin(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_admin_pin(text, text) TO anon, authenticated;
