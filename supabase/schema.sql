-- =====================================================================
-- MenuFid - Architecture Base de Données PostgreSQL & RLS (Supabase)
-- =====================================================================

-- 1. EXTENSIONS & TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE plan_tier_enum AS ENUM ('basic', 'loyalty', 'premium');
CREATE TYPE plan_status_enum AS ENUM ('active', 'past_due', 'canceled', 'trialing');

-- 2. TABLE MERCHANTS (Établissements)
CREATE TABLE IF NOT EXISTS public.merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT UNIQUE,
  plan_tier plan_tier_enum NOT NULL DEFAULT 'basic',
  plan_status plan_status_enum NOT NULL DEFAULT 'trialing',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherche rapide par slug et propriétaire
CREATE INDEX IF NOT EXISTS idx_merchants_slug ON public.merchants(slug);
CREATE INDEX IF NOT EXISTS idx_merchants_owner ON public.merchants(owner_id);

-- 3. TABLE CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_merchant ON public.categories(merchant_id);

-- 4. TABLE MENU_ITEMS (Articles de Carte)
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  image_url TEXT,
  allergens TEXT[] DEFAULT '{}',
  is_available BOOLEAN NOT NULL DEFAULT true,
  translations JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_merchant ON public.menu_items(merchant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);

-- 5. TABLE CUSTOMERS (Membres Fidélité)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  name TEXT,
  total_points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_customer_merchant_phone UNIQUE(merchant_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_customers_merchant ON public.customers(merchant_id);

-- 6. TABLE POINTS_LEDGER (Journal d'Audit Immuable Anti-Fraude)
CREATE TABLE IF NOT EXISTS public.points_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  points INT NOT NULL,
  reason TEXT NOT NULL,
  device_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_ledger_customer ON public.points_ledger(customer_id);

-- 7. TABLE PROCESSED_WEBHOOKS (Idempotence Stripe)
CREATE TABLE IF NOT EXISTS public.processed_webhooks (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;

-- 1. Merchants: lecture/écriture réservée au propriétaire authentifié
CREATE POLICY merchants_owner_all ON public.merchants
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Lecture publique pour l'accès aux cartes par slug/domaine
CREATE POLICY merchants_public_read ON public.merchants
  FOR SELECT TO anon, authenticated
  USING (true);

-- 2. Categories: écriture par le proprio, lecture publique
CREATE POLICY categories_owner_all ON public.categories
  FOR ALL TO authenticated
  USING (merchant_id IN (SELECT id FROM public.merchants WHERE owner_id = auth.uid()));

CREATE POLICY categories_public_read ON public.categories
  FOR SELECT TO anon, authenticated
  USING (true);

-- 3. Menu Items: écriture par le proprio, lecture publique
CREATE POLICY menu_items_owner_all ON public.menu_items
  FOR ALL TO authenticated
  USING (merchant_id IN (SELECT id FROM public.merchants WHERE owner_id = auth.uid()));

CREATE POLICY menu_items_public_read ON public.menu_items
  FOR SELECT TO anon, authenticated
  USING (is_available = true);

-- 4. Customers & Points Ledger: écriture réservée au marchand authentifié
CREATE POLICY customers_owner_all ON public.customers
  FOR ALL TO authenticated
  USING (merchant_id IN (SELECT id FROM public.merchants WHERE owner_id = auth.uid()));

CREATE POLICY points_ledger_owner_all ON public.points_ledger
  FOR ALL TO authenticated
  USING (merchant_id IN (SELECT id FROM public.merchants WHERE owner_id = auth.uid()));
