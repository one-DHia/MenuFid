/**
 * lib/geminiI18n.ts
 * ─────────────────────────────────────────────────────────────
 * Moteur de Traduction Globale Alimenté par Google Gemini 1.5 Flash.
 * Permet de traduire dynamiquement n'importe quel texte ou menu public
 * dans toutes les langues (EN, ES, AR, DE, IT, PT) avec mise en cache ultra-rapide.
 */

import type { Language } from './i18n';

const CACHE_KEY = 'menufid_gemini_i18n_cache_v2';

function getMemoryCache(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMemoryCache(cache: Record<string, string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

/**
 * Traduit un texte avec l'IA Gemini 1.5
 */
export async function translateWithGemini(
  text: string,
  targetLang: Language
): Promise<string> {
  if (!text || targetLang === 'fr') return text;

  const cacheKey = `${targetLang}:${text.trim().toLowerCase()}`;
  const cache = getMemoryCache();

  // 1. Retour du cache instantané (0 ms)
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  // 2. Appel du moteur Gemini 1.5 Flash
  try {
    const res = await fetch('/api/gemini/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'text',
        text: text,
        targetLang: targetLang,
      }),
    });

    const json = await res.json();
    if (json.success && json.translatedText) {
      const result = json.translatedText;
      cache[cacheKey] = result;
      saveMemoryCache(cache);
      return result;
    }
  } catch (err) {
    console.warn('[Gemini i18n Error]:', err);
  }

  return text;
}
