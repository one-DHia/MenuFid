-- ============================================================
-- SCRIPT DE CONFIGURATION DU BUCKET STORAGE "restaurant-media"
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

-- 1. Création du bucket public pour les logos et photos de menu
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'restaurant-media',
    'restaurant-media',
    true,
    2097152, -- Limite de 2 Mo par fichier
    array['image/webp', 'image/jpeg', 'image/png', 'image/gif']
)
on conflict (id) do update set
    public = true,
    file_size_limit = 2097152,
    allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png', 'image/gif'];

-- 2. Supprimer les anciennes politiques si existantes pour éviter les doublons
drop policy if exists "Public Access restaurant-media" on storage.objects;
drop policy if exists "Authenticated users upload restaurant-media" on storage.objects;
drop policy if exists "Authenticated users update restaurant-media" on storage.objects;
drop policy if exists "Authenticated users delete restaurant-media" on storage.objects;

-- 3. Règle LECTURE PUBLIQUE : Tout le monde peut voir les photos des restaurants et des plats
create policy "Public Access restaurant-media"
on storage.objects for select
using ( bucket_id = 'restaurant-media' );

-- 4. Règle INSERTION : Les restaurateurs authentifiés peuvent envoyer des photos
create policy "Authenticated users upload restaurant-media"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'restaurant-media' );

-- 5. Règle MODIFICATION : Les restaurateurs authentifiés peuvent modifier leurs photos
create policy "Authenticated users update restaurant-media"
on storage.objects for update
to authenticated
using ( bucket_id = 'restaurant-media' );

-- 6. Règle SUPPRESSION (Nettoyage) : Les restaurateurs authentifiés peuvent supprimer d'anciennes photos
create policy "Authenticated users delete restaurant-media"
on storage.objects for delete
to authenticated
using ( bucket_id = 'restaurant-media' );
