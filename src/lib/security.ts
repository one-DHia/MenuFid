/**
 * lib/security.ts
 * ─────────────────────────────────────────────────────────────
 * Fonctions utilitaires de sécurité et de sanitisation.
 * Protège contre les injections de filtre PocketBase, les balises malicieuses,
 * et assainit les valeurs saisies par les utilisateurs.
 */

/**
 * Échappe les guillemets et caractères spéciaux pour empêcher les injections
 * dans les requêtes de filtre PocketBase `filter: merchant = "..."`.
 */
export function sanitizeFilterParam(value: string): string {
  if (!value) return '';
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/;/g, '')
    .trim();
}

/**
 * Nettoie une chaîne de texte saisie par un utilisateur (supprime les balises HTML).
 */
export function sanitizeInputText(value: string): string {
  if (!value) return '';
  return value
    .replace(/<[^>]*>?/gm, '') // Supprimer toutes les balises HTML
    .trim();
}

/**
 * Nettoie un slug URL pour n'autoriser que les caractères alphanumériques et tirets.
 */
export function sanitizeSlug(value: string): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Valide et borne une valeur numérique (prix, points) pour empêcher les valeurs négatives ou NaN.
 */
export function safePositiveNumber(value: unknown, defaultValue = 0): number {
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num) || !isFinite(num) || num < 0) {
    return defaultValue;
  }
  return num;
}
