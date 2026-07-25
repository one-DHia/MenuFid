import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

/**
 * Route POST /api/stripe/checkout
 * Génère une VRAIE session Stripe Checkout obligatoire pour l'abonnement d'un commerçant.
 * Mode 'subscription' avec saisie de carte bancaire obligatoire.
 */
export async function POST(req: Request) {
  try {
    const { merchantId, email, planTier } = await req.json();

    if (!merchantId || !planTier) {
      return NextResponse.json({ error: 'merchantId et planTier sont requis.' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://menufid.site';

    // Prix mensuels en cents (5€ = 500, 10€ = 1000, 20€ = 2000)
    const priceMap: Record<string, number> = {
      basic: 500,
      loyalty: 1000,
      premium: 2000,
    };

    const amount = priceMap[planTier] || 500;

    // Création de la session d'abonnement bancaire Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email && email.includes('@') ? email : undefined,
      client_reference_id: merchantId,
      metadata: {
        merchantId,
        planTier,
      },
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `MenuFid Abonnement ${planTier.toUpperCase()}`,
              description: `Abonnement mensuel MenuFid ${planTier.toUpperCase()} - Digitalisation Menu QR & Carte de Fidélité Digitale.`,
            },
            unit_amount: amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard/profile?payment=success&tier=${planTier}`,
      cancel_url: `${appUrl}/pricing?payment=cancelled`,
    });

    if (!session.url) {
      throw new Error('Impossible de générer l\'URL de la session Stripe.');
    }

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('[Stripe Checkout Error Direct]', error);
    const errMessage = error instanceof Error ? error.message : 'Erreur lors de l\'accès à Stripe Checkout.';
    return NextResponse.json(
      { error: `Erreur Stripe : ${errMessage}. Vérifiez la clé STRIPE_SECRET_KEY.` },
      { status: 500 }
    );
  }
}
