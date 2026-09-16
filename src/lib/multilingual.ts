/**
 * lib/multilingual.ts
 * ─────────────────────────────────────────────────────────────
 * Moteur unifié de parsing et localisation des noms et descriptions
 * pour les plats et catégories (Support FR / EN / AR).
 */

export interface MultilingualText {
  fr: string;
  en: string;
  ar: string;
}

/**
 * Détecte si une chaîne contient des caractères arabes
 */
export function containsArabic(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}

/**
 * Découpe intelligemment une chaîne multilingue :
 * - "Plat FR / Dish EN / طبق AR" (séparateur slash)
 * - "Catégorie FR — Category EN — فئة AR" (séparateur tiret long)
 * - "Item FR | Item EN | عنصر AR" (séparateur pipe)
 */
export function parseMultilingualText(raw: unknown): MultilingualText {
  if (!raw) {
    return { fr: '', en: '', ar: '' };
  }

  // Si c'est déjà un objet
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, any>;
    return {
      fr: String(obj.fr || obj.french || obj.name_fr || obj.name || '').trim(),
      en: String(obj.en || obj.english || obj.name_en || '').trim(),
      ar: String(obj.ar || obj.arabic || obj.name_ar || '').trim(),
    };
  }

  const text = String(raw).trim();
  if (!text) {
    return { fr: '', en: '', ar: '' };
  }

  // Découpage par séparateurs courants : " / ", " — ", " - ", " | "
  // On gère les espaces optionnels autour
  let parts = text.split(/\s*(?:\/|—|\|)\s*/).map((p) => p.trim()).filter(Boolean);

  // Si on n'a pas trouvé de slash ou tiret cadratin, on teste le tiret standard avec espaces " - "
  if (parts.length < 2 && text.includes(' - ')) {
    parts = text.split(/\s+-\s+/).map((p) => p.trim()).filter(Boolean);
  }

  if (parts.length >= 3) {
    let fr = parts[0];
    let en = parts[1];
    let ar = parts[2];

    // Réajustement intelligent si l'arabe est en 1ère ou 2ème position
    if (containsArabic(parts[0])) {
      ar = parts[0];
      fr = parts[1];
      en = parts[2] || parts[1];
    } else if (containsArabic(parts[1])) {
      ar = parts[1];
      en = parts[2] || parts[0];
    }

    return { fr, en, ar };
  }

  if (parts.length === 2) {
    const part0IsAr = containsArabic(parts[0]);
    const part1IsAr = containsArabic(parts[1]);

    if (part1IsAr) {
      return { fr: parts[0], en: parts[0], ar: parts[1] };
    } else if (part0IsAr) {
      return { fr: parts[1], en: parts[1], ar: parts[0] };
    } else {
      // Deux langues occidentales : FR et EN
      return { fr: parts[0], en: parts[1], ar: parts[0] };
    }
  }

  // Chaîne unique sans séparateur
  const isAr = containsArabic(text);
  return {
    fr: isAr ? '' : text,
    en: isAr ? '' : text,
    ar: isAr ? text : '',
  };
}

/**
 * Recompose une chaîne multilingue standardisée "FR / EN / AR"
 */
export function formatMultilingualString(fr: string, en?: string, ar?: string): string {
  const parts: string[] = [];
  const cleanFr = (fr || '').trim();
  const cleanEn = (en || '').trim();
  const cleanAr = (ar || '').trim();

  if (cleanFr) parts.push(cleanFr);
  if (cleanEn && cleanEn !== cleanFr) parts.push(cleanEn);
  if (cleanAr) parts.push(cleanAr);

  return parts.join(' / ') || cleanFr || cleanAr || cleanEn || '';
}

/**
 * Récupère le texte dans la langue demandée (avec fallback gracieux)
 */
export function getLocalizedText(raw: unknown, language: string = 'fr'): string {
  if (!raw) return '';
  const parsed = parseMultilingualText(raw);

  if (language === 'ar') {
    return parsed.ar || parsed.fr || parsed.en || String(raw);
  }
  if (language === 'en') {
    return parsed.en || parsed.fr || parsed.ar || String(raw);
  }
  // Par défaut français
  return parsed.fr || parsed.en || parsed.ar || String(raw);
}
