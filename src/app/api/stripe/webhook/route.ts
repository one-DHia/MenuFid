import { NextResponse } from 'next/server';
import { stripe, decryptPayload, calculateExpirationDate } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    if (webhookSecret && !webhookSecret.startsWith('whsec_...')) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature || '', webhookSecret);
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
      }
    } else {
      // Fallback si webhook secret pas encore configuré
      try {
        event = JSON.parse(rawBody);
      } catch (err) {
        return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
      }
    }

    // 1. Session de Checkout terminée avec succès (Inscription & Paiement)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === 'paid' && session.metadata) {
        const metadata = session.metadata;
        const email = metadata.email?.toLowerCase();
        const businessName = metadata.business_name;
        const planTier = (metadata.plan_tier as 'basic' | 'loyalty') || 'loyalty';
        const billingPeriod = (metadata.billing_period as 'monthly' | 'yearly') || 'monthly';
        const slug = metadata.slug;
        const shortCode = metadata.short_code;
        const encryptedPwd = metadata.pwd_enc;

        if (email && businessName && encryptedPwd) {
          // Vérification idempotente
          const { data: existing } = await supabaseAdmin
            .from('merchants')
            .select('id')
            .eq('email', email)
            .maybeSingle();

          if (!existing) {
            const password = decryptPayload(encryptedPwd);
            if (password) {
              const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: true,
                user_metadata: {
                  role: 'merchant',
                  business_name: businessName,
                },
              });

              if (!authError && authData.user) {
                const expiresAt = calculateExpirationDate(billingPeriod);
                const monthlyPrice = billingPeriod === 'yearly' 
                  ? (planTier === 'basic' ? 190 : 390) 
                  : (planTier === 'basic' ? 19 : 39);

                await supabaseAdmin.from('merchants').insert({
                  id: authData.user.id,
                  business_name: businessName,
                  slug: slug,
                  short_code: shortCode,
                  contact_email: email,
                  email: email,
                  plan_tier: planTier,
                  plan_status: 'active',
                  is_suspended: false,
                  monthly_price: monthlyPrice,
                  primary_color: '#FFB800',
                  currency: 'EUR',
                  subscription_expires_at: expiresAt.toISOString(),
                  deactivated_at: null,
                  stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
                  stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : null,
                  payment_method: 'stripe',
                });
              }
            }
          }
        }
      }
    }

    // 2. Renouvellement automatique récurrent réussi (Mois suivant payé)
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : null;
      
      if (customerId) {
        const nextPeriodEnd = new Date();
        nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

        await supabaseAdmin
          .from('merchants')
          .update({
            plan_status: 'active',
            is_suspended: false,
            deactivated_at: null,
            subscription_expires_at: nextPeriodEnd.toISOString(),
          })
          .eq('stripe_customer_id', customerId);
      }
    }

    // 3. Échec de paiement récurrent (Carte expirée, sans fonds)
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : null;
      
      if (customerId) {
        await supabaseAdmin
          .from('merchants')
          .update({
            plan_status: 'past_due',
          })
          .eq('stripe_customer_id', customerId);
      }
    }

    // 4. Résiliation ou fin d'abonnement Stripe
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === 'string' ? sub.customer : null;
      
      if (customerId) {
        await supabaseAdmin
          .from('merchants')
          .update({
            plan_status: 'canceled',
            is_suspended: true,
            deactivated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook Error]:', error);
    return NextResponse.json({ error: error.message || 'Webhook handler error' }, { status: 500 });
  }
}
