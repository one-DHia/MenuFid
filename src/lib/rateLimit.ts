/**
 * lib/rateLimit.ts
 * ─────────────────────────────────────────────────────────────
 * Rate Limiter léger basé sur un algorithme de fenêtre glissante (Sliding Window).
 * Permet de protéger les routes API, la connexion et l'inscription contre les attaques par force brute et le spam.
 */

interface RateLimitEntry {
  tokens: number;
  lastReset: number;
}

const cache = new Map<string, RateLimitEntry>();

// Nettoyage périodique des entrées expirées (toutes les 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now - entry.lastReset > 10 * 60 * 1000) {
        cache.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit: number;      // Nombre max de requêtes autorisées
  windowMs: number;   // Durée de la fenêtre en millisecondes
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetInMs: number;
}

/**
 * Vérifie si une action/IP a dépassé la limite de débit.
 * @param identifier Identifiant unique (ex: IP client, email, ou token)
 * @param options Configuration du Rate Limiter (limite, durée de fenêtre)
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 5, windowMs: 60 * 1000 }
): RateLimitResult {
  const now = Date.now();
  const key = `${identifier}`;
  const entry = cache.get(key);

  if (!entry) {
    cache.set(key, { tokens: 1, lastReset: now });
    return {
      success: true,
      remaining: options.limit - 1,
      resetInMs: options.windowMs,
    };
  }

  const elapsed = now - entry.lastReset;

  // Si la fenêtre temporelle est écoulée, réinitialiser le compteur
  if (elapsed >= options.windowMs) {
    cache.set(key, { tokens: 1, lastReset: now });
    return {
      success: true,
      remaining: options.limit - 1,
      resetInMs: options.windowMs,
    };
  }

  // Si la limite est atteinte
  if (entry.tokens >= options.limit) {
    return {
      success: false,
      remaining: 0,
      resetInMs: options.windowMs - elapsed,
    };
  }

  // Incrémenter les tentatives
  entry.tokens += 1;
  cache.set(key, entry);

  return {
    success: true,
    remaining: options.limit - entry.tokens,
    resetInMs: options.windowMs - elapsed,
  };
}
