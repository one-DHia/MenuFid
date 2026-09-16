-- ============================================================
-- MIGRATION : AJOUT DES COLONNES PROFIL (GOOGLE MAPS & INSTAGRAM)
-- À exécuter dans le SQL Editor de Supabase si non existantes
-- ============================================================

alter table public.merchants 
add column if not exists google_maps_url text,
add column if not exists instagram_url text;

-- Vérification de la politique de mise à jour pour les restaurateurs
-- Les restaurateurs connectés peuvent mettre à jour leur propre profil
create policy if not exists "Merchants can update own profile"
    on public.merchants for update
    using (auth.uid() = id);
