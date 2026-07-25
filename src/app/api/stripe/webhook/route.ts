import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

/**
 * Route POST /api/stripe/webhook
 * Traite les événements Stripe (paiement validé, abonnement annulé)
 * et met à jour automatiquement le statut dans Supabase.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur de signature Webhook.';
    console.error(`[Stripe Webhook Error] ${msg}`);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Traitement des événements
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const merchantId = session.metadata?.merchantId || session.client_reference_id;
      const planTier = session.metadata?.planTier;

      if (merchantId && planTier) {
        await supabase
          .from('profiles')
          .update({ plan_tier: planTier, updated_at: new Date().toISOString() })
          .eq('id', merchantId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const merchantId = subscription.metadata?.merchantId;

      if (merchantId) {
        await supabase
          .from('profiles')
          .update({ plan_tier: 'basic', updated_at: new Date().toISOString() })
          .eq('id', merchantId);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
