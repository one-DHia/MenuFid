/**
 * lib/whatsapp.ts
 * ─────────────────────────────────────────────────────────────
 * Service gratuit de relance client WhatsApp sans API payante (Lien direct wa.me).
 * Gestion internationale complète (France 🇫🇷 +33, Algérie 🇩🇿 +213, Espagne 🇪🇸 +34, etc.).
 */

export interface CountryPrefix {
  code: string;
  name: string;
  prefix: string;
  flag: string;
}

export const COUNTRY_PREFIXES: CountryPrefix[] = [
  { code: 'FR', name: 'France', prefix: '33', flag: '🇫🇷' },
  { code: 'DZ', name: 'Algérie', prefix: '213', flag: '🇩🇿' },
  { code: 'ES', name: 'Espagne', prefix: '34', flag: '🇪🇸' },
  { code: 'DE', name: 'Allemagne', prefix: '49', flag: '🇩🇪' },
  { code: 'MA', name: 'Maroc', prefix: '212', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisie', prefix: '216', flag: '🇹🇳' },
  { code: 'AE', name: 'Émirats Arabes Unis', prefix: '971', flag: '🇦🇪' },
  { code: 'GB', name: 'Royaume-Uni', prefix: '44', flag: '🇬🇧' },
  { code: 'US', name: 'États-Unis / Canada', prefix: '1', flag: '🇺🇸' },
];

/**
 * Nettoie et formate un numéro de téléphone au format international E.164 (sans symbole + ou espaces).
 * Détecte automatiquement +213, +33, 00213, 0033 ou applique le préfixe du pays sélectionné.
 */
export function cleanPhoneNumber(phone: string, selectedPrefix = '33'): string {
  if (!phone) return '';
  
  let cleaned = phone.trim().replace(/[\s\-\(\)]/g, '');

  // Si commence par + (ex: +213550123456 ou +33612345678)
  if (cleaned.startsWith('+')) {
    return cleaned.replace('+', '');
  }

  // Si commence par 00 (ex: 00213550123456 ou 0033612345678)
  if (cleaned.startsWith('00')) {
    return cleaned.substring(2);
  }

  // Si commence par un zéro local (ex: 0550123456 en Algérie ou 0612345678 en France)
  if (cleaned.startsWith('0')) {
    const cleanPrefix = selectedPrefix.replace('+', '');
    return cleanPrefix + cleaned.substring(1);
  }

  // Si déjà sans le 0 initial
  return selectedPrefix.replace('+', '') + cleaned;
}

/**
 * Génère le lien d'action direct WhatsApp Web / App.
 */
export function buildWhatsAppUrl(phone: string, message: string, selectedPrefix = '33'): string {
  const formattedPhone = cleanPhoneNumber(phone, selectedPrefix);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  title: string;
  body: (customerName: string, businessName: string) => string;
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'happy_hour',
    name: '🔥 Promo Flash / Happy Hour',
    title: 'Offre spéciale du jour',
    body: (customerName, businessName) =>
      `Bonjour ${customerName || 'cher client'} ! 🍕 Offre Flash chez ${businessName || 'votre restaurant'} : Profitez de -20% sur toute la carte ce soir sur présentation de ce message ! A très vite 🎉`,
  },
  {
    id: 'birthday',
    name: '🎂 Cadeau d\'Anniversaire',
    title: 'Dessert Offert',
    body: (customerName, businessName) =>
      `Bonjour ${customerName || 'cher client'} ! 🎂 Joyeux anniversaire de la part de toute l'équipe de ${businessName || 'votre restaurant'} ! Pour fêter ça, nous vous offrons 1 dessert au choix lors de votre prochaine visite 🎁`,
  },
  {
    id: 'inactive',
    name: '❤️ Relance Client Inactif',
    title: 'Vous nous manquez',
    body: (customerName, businessName) =>
      `Bonjour ${customerName || 'cher client'} ! Vous nous manquez chez ${businessName || 'votre restaurant'} ❤️ Venez profiter de vos points de fidélité cumulés et découvrez nos dernières nouveautés au menu !`,
  },
];
