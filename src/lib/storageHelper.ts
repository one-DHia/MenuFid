/**
 * src/lib/storageHelper.ts
 * ─────────────────────────────────────────────────────────────
 * Gestionnaire d'upload, de cache-control et de nettoyage
 * automatique pour Supabase Storage (bucket "restaurant-media").
 */

import { supabase } from '@/lib/supabase';

export const BUCKET_NAME = 'restaurant-media';

export interface UploadOptions {
  file: File;
  folder: 'logos' | 'dishes' | 'categories';
  merchantId: string;
  oldUrl?: string | null;
}

/**
 * Extrait le chemin relatif d'un fichier dans le bucket à partir de son URL publique
 */
export function extractStoragePath(publicUrl: string, bucketName: string = BUCKET_NAME): string | null {
  if (!publicUrl) return null;
  try {
    const marker = `/storage/v1/object/public/${bucketName}/`;
    const index = publicUrl.indexOf(marker);
    if (index !== -1) {
      return decodeURIComponent(publicUrl.substring(index + marker.length).split('?')[0]);
    }
    // Format alternatif possible
    const altMarker = `/${bucketName}/`;
    const altIndex = publicUrl.indexOf(altMarker);
    if (altIndex !== -1 && publicUrl.includes('supabase.co')) {
      return decodeURIComponent(publicUrl.substring(altIndex + altMarker.length).split('?')[0]);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Supprime un fichier du bucket Supabase à partir de son URL publique
 */
export async function deleteStorageFileByUrl(publicUrl: string | null | undefined): Promise<boolean> {
  if (!publicUrl) return false;
  
  const path = extractStoragePath(publicUrl, BUCKET_NAME);
  if (!path) return false;

  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);
    if (error) {
      console.warn(`[StorageHelper] Échec de la suppression de l'ancien fichier: ${path}`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[StorageHelper] Erreur inattendue lors de la suppression:`, err);
    return false;
  }
}

/**
 * Téléverse une image compressée dans Supabase Storage, supprime l'ancien fichier
 * et renvoie l'URL publique avec Cache-Control longue durée.
 */
export async function uploadMerchantMedia({
  file,
  folder,
  merchantId,
  oldUrl
}: UploadOptions): Promise<string> {
  // 1. Nettoyage de l'ancien fichier si présent pour économiser le stockage
  if (oldUrl) {
    await deleteStorageFileByUrl(oldUrl);
  }

  // 2. Génération d'un nom de fichier unique et propre
  const extension = file.type === 'image/webp' ? 'webp' : file.name.split('.').pop() || 'jpg';
  const cleanId = merchantId.replace(/[^a-zA-Z0-9_-]/g, '');
  const uniqueKey = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const filePath = `${folder}/${cleanId}/${uniqueKey}.${extension}`;

  // 3. Téléversement dans Supabase Storage avec Cache-Control (1 an immutable)
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '31536000, immutable',
      contentType: file.type || 'image/webp',
      upsert: true
    });

  if (error) {
    console.error('[StorageHelper] Erreur upload:', error);
    throw new Error(`Échec du téléversement : ${error.message}`);
  }

  // 4. Récupération de l'URL publique
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  if (!publicUrlData?.publicUrl) {
    throw new Error("Impossible de générer l'URL publique de l'image.");
  }

  return publicUrlData.publicUrl;
}
