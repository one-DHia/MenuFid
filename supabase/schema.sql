-- ─────────────────────────────────────────────────────────────
-- SCHEMA SQL SUPABASE POUR MENUFID (PostgreSQL)
-- À exécuter dans l'éditeur SQL de votre console Supabase
-- ─────────────────────────────────────────────────────────────

-- 1. Table des commerçants (PROFILES / USERS)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan_tier TEXT NOT NULL DEFAULT 'basic',
  role TEXT NOT NULL DEFAULT 'merchant',
  primary_color TEXT DEFAULT '#b45309',
  logo_url TEXT,
  google_review_url TEXT,
  pdf_menu_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des Catégories de menu
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table des Plats (MENU_ITEMS)
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  category UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10, 2) NOT NULL,
  image_url TEXT DEFAULT '',
  is_available BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  allergens JSONB DEFAULT '[]'::jsonb,
  options JSONB DEFAULT '[]'::jsonb,
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table des Clients (CUSTOMERS)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  points_balance INT DEFAULT 0,
  total_visits INT DEFAULT 0,
  last_visit TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table des Visites / Tampons (VISITS)
CREATE TABLE IF NOT EXISTS public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  points_earned INT DEFAULT 10,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Table des Récompenses / Offres (REWARDS)
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  points_required INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Table des Thèmes de Carte (THEMES)
CREATE TABLE IF NOT EXISTS public.themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id TEXT DEFAULT 'minimalist',
  primary_color TEXT DEFAULT '#b45309',
  background_color TEXT DEFAULT '#fdfbf7',
  text_color TEXT DEFAULT '#1c1917',
  font_family TEXT DEFAULT 'serif',
  card_style TEXT DEFAULT 'bordered',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Table des Plugins Config (PLUGINS_CONFIG)
CREATE TABLE IF NOT EXISTS public.plugins_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  allergens BOOLEAN DEFAULT TRUE,
  options BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- POLITIQUES DE SÉCURITÉ (ROW LEVEL SECURITY - RLS)
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugins_config ENABLE ROW LEVEL SECURITY;

-- Politiques de lecture publique pour la carte digitale
CREATE POLICY "Lecture publique profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Lecture publique categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Lecture publique menu_items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Lecture publique rewards" ON public.rewards FOR SELECT USING (true);
CREATE POLICY "Lecture publique themes" ON public.themes FOR SELECT USING (true);
CREATE POLICY "Lecture publique plugins_config" ON public.plugins_config FOR SELECT USING (true);
CREATE POLICY "Création publique customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Lecture publique customers" ON public.customers FOR SELECT USING (true);

-- Politiques d'écriture pour les utilisateurs authentifiés
CREATE POLICY "Gestion complete par authentifie categories" ON public.categories FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Gestion complete par authentifie menu_items" ON public.menu_items FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Gestion complete par authentifie customers" ON public.customers FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Gestion complete par authentifie visits" ON public.visits FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Gestion complete par authentifie rewards" ON public.rewards FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Gestion complete par authentifie profiles" ON public.profiles FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Gestion complete par authentifie themes" ON public.themes FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Gestion complete par authentifie plugins_config" ON public.plugins_config FOR ALL USING (auth.uid() IS NOT NULL);
