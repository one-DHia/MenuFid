/**
 * src/lib/imageCompression.ts
 * ─────────────────────────────────────────────────────────────
 * Utilitaire de compression et de redimensionnement d'images
 * côté client (navigateur / mobile).
 * 
 * Réduit drastiquement l'usage de bande passante et le stockage
 * Supabase en convertissant les photos lourdes en WebP haute performance.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 à 1.0 (recommandé: 0.82)
  outputFormat?: 'image/webp' | 'image/jpeg';
}

export interface CompressionResult {
  file: File;
  blob: Blob;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // ex: 85 (%)
  width: number;
  height: number;
}

/**
 * Compresse et redimensionne une image directement dans le navigateur
 */
export async function compressImage(
  inputFile: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1000,
    maxHeight = 1000,
    quality = 0.82,
    outputFormat = 'image/webp'
  } = options;

  return new Promise((resolve, reject) => {
    // Vérification du type MIME
    if (!inputFile.type.startsWith('image/')) {
      return reject(new Error("Le fichier fourni n'est pas une image valide."));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Erreur lors de la lecture du fichier image."));
    
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Impossible de décoder l'image sélectionnée."));
      
      img.onload = () => {
        let { width, height } = img;

        // Calcul des nouvelles dimensions proportionnelles
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Création du canvas de rendu
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error("Impossible d'initialiser le contexte Canvas 2D."));
        }

        // Amélioration de la netteté lors du sous-échantillonnage
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Dessin de l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);

        // Conversion en Blob WebP (ou JPEG si non supporté)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Erreur lors de la compression de l'image."));
            }

            const extension = outputFormat === 'image/webp' ? 'webp' : 'jpg';
            const baseName = inputFile.name.substring(0, inputFile.name.lastIndexOf('.')) || 'image';
            const newFileName = `${baseName}_optimized.${extension}`;

            const compressedFile = new File([blob], newFileName, {
              type: outputFormat,
              lastModified: Date.now()
            });

            const originalSize = inputFile.size;
            const compressedSize = blob.size;
            const compressionRatio = Math.max(0, Math.round((1 - compressedSize / originalSize) * 100));

            const dataUrl = canvas.toDataURL(outputFormat, quality);

            resolve({
              file: compressedFile,
              blob,
              dataUrl,
              originalSize,
              compressedSize,
              compressionRatio,
              width,
              height
            });
          },
          outputFormat,
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(inputFile);
  });
}

/**
 * Formate un nombre d'octets en chaîne lisible (ex: "1.4 Mo" ou "120 Ko")
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Ko';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
