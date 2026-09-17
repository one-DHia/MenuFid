/**
 * lib/stripe.ts
 * ─────────────────────────────────────────────────────────────
 * Initialisation sécurisée du SDK Stripe (côté serveur).
 * Configuration des formules Starter & Pro (mensuel / annuel).
 */

import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

export const stripe = new Stripe(stripeSecretKey, {
  // Stripe SDK v22
  apiVersion: '2025-02-24.acacia' as any,
  appInfo: {
    name: 'Menufid SaaS',
    version: '1.0.0',
  },
});

export interface PlanConfig {
  name: string;
  planTier: 'basic' | 'loyalty';
  amountMonthly: number; // en centimes (1900 = 19.00 €)
  amountYearly: number;  // en centimes (19000 = 190.00 €)
  description: string;
}

export const MENUFID_PLANS: Record<'starter' | 'pro', PlanConfig> = {
  starter: {
    name: 'Menufid Formule ESSENTIEL',
    planTier: 'basic',
    amountMonthly: 399, // 3.99 €
    amountYearly: 3990, // 39.90 €
    description: 'Menu Digital QR Code jusqu\'à 100 plats',
  },
  pro: {
    name: 'Menufid Formule PRO & Fidélité',
    planTier: 'loyalty',
    amountMonthly: 3900, // 39.00 €
    amountYearly: 39000, // 390.00 € (2 mois offerts)
    description: 'Menu Digital + Carte de Fidélité + Notifications Web Push',
  },
};

/**
 * Calcule la date d'expiration en fonction de la période de facturation
 */
export function calculateExpirationDate(billingPeriod: 'monthly' | 'yearly'): Date {
  const expiresAt = new Date();
  if (billingPeriod === 'yearly') {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }
  return expiresAt;
}

/**
 * Chiffre une chaîne sensible (ex: mot de passe temporaire) avec AES-256-GCM
 * Utilise la clé secrète Stripe comme sel cryptographique.
 */
import crypto from 'crypto';

export function encryptPayload(text: string): string {
  const secretKey = crypto.createHash('sha256').update(stripeSecretKey || 'menufid-fallback-secret-key').digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptPayload(encryptedStr: string): string | null {
  try {
    const [ivHex, authTagHex, encryptedText] = encryptedStr.split(':');
    if (!ivHex || !authTagHex || !encryptedText) return null;
    const secretKey = crypto.createHash('sha256').update(stripeSecretKey || 'menufid-fallback-secret-key').digest();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', secretKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Erreur déchiffrement payload:', err);
    return null;
  }
}

