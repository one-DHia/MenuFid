import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

/**
 * Route POST /api/stripe/checkout
 * Génère une session Stripe Checkout pour un commerçant s'abonnant à une formule.
 */
export async function POST(req: Request) {
  try {
    const { merchantId, email, planTier } = await req.json();

    if (!merchantId || !planTier) {
      return NextResponse.json({ error: 'merchantId et planTier sont requis.' }, { status: 400 });
    }

    // Prix mensuels en cents (15€ = 1500, 29€ = 2900, 40€ = 4000)
    const priceMap: Record<string, number> = {
      basic: 1500,
      loyalty: 2900,
      premium: 4000,
    };

    const amount = priceMap[planTier] || 1500;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
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
              description: `Abonnement mensuel MenuFid ${planTier.toUpperCase()} pour restauration et fidélité.`,
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
      cancel_url: `${appUrl}/dashboard/profile?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('[Stripe Checkout Error]', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la session Stripe.' }, { status: 500 });
  }
}
