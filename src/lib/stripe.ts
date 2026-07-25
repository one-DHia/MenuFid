/**
 * lib/stripe.ts
 * ─────────────────────────────────────────────────────────────
 * Configuration du SDK Stripe officiel pour le paiement des abonnements SaaS.
 */

import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
  typescript: true,
});
