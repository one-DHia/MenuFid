-- ============================================================
-- MIGRATION : AJOUT DE LA COLONNE IMAGE_URL DANS CATEGORIES
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS image_url text;

-- Recharger le cache du schéma PostgREST
NOTIFY pgrst, 'reload schema';
