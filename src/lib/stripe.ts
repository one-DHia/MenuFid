/**
 * lib/stripe.ts
 * ─────────────────────────────────────────────────────────────
 * Configuration du SDK Stripe officiel pour le paiement des abonnements SaaS.
 */

import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
  typescript: true,
});

export const PRICING_TIERS = {
  basic: {
    name: 'Basic',
    price: 5,
    priceCents: 500,
    features: [
      'Menu digital QR Code illimité',
      'Mise à jour en temps réel',
      'Affichage allergènes & régimes',
      'Support par email',
    ],
  },
  loyalty: {
    name: 'Fidélité',
    price: 10,
    priceCents: 1000,
    features: [
      'Tout le plan Basic',
      'Carte de fidélité digitale smartphone (PWA)',
      'Gestion des clients & historique',
      'Récompenses personnalisées',
      'Offres flash par e-mail',
    ],
  },
  premium: {
    name: 'Premium Intégral',
    price: 20,
    priceCents: 2000,
    features: [
      'Tout le plan Fidélité',
      'Booster d\'avis Google 5 étoiles',
      'Imprimante thermique & QR flyers prêts à imprimer',
      'Statistiques & Analytics avancés',
      'Support VIP dédié 7/7',
    ],
  },
} as const;
