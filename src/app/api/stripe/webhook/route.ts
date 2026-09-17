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

    // 1. Session de Checkout terminée avec succès
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // ── CAS A : Commande Client payée en ligne via Stripe ──
      if (session.payment_status === 'paid' && session.metadata?.type === 'customer_order') {
        const orderId = session.metadata.order_id;
        const customerPhone = session.metadata.customer_phone;
        const merchantId = session.metadata.merchant_id;

        if (orderId) {
          try {
            const { data: order } = await supabaseAdmin
              .from('orders')
              .select('id, merchant_id, customer_phone, points_awarded')
              .or(`id.eq.${orderId},order_number.eq.${orderId}`)
              .maybeSingle();

            if (order && !order.points_awarded) {
              const cleanPhone = (order.customer_phone || customerPhone)?.replace(/[^0-9]/g, '');
              const targetMerchantId = order.merchant_id || merchantId;

              // Trouver ou créer le profil client
              let customerId: string | null = null;
              if (cleanPhone) {
                const { data: customer } = await supabaseAdmin
                  .from('customers')
                  .select('id')
                  .eq('phone', cleanPhone)
                  .maybeSingle();

                if (customer) {
                  customerId = customer.id;
                } else {
                  const { data: newCust } = await supabaseAdmin
                    .from('customers')
                    .insert({
                      phone: cleanPhone,
                      loyalty_code: cleanPhone.slice(-6),
                    })
                    .select('id')
                    .single();
                  if (newCust) customerId = newCust.id;
                }
              }

              // Créditer automatiquement +1 tampon fidélité
              if (customerId && targetMerchantId) {
                const { data: card } = await supabaseAdmin
                  .from('loyalty_cards')
                  .select('id, stamps_count, total_visits')
                  .eq('customer_id', customerId)
                  .eq('merchant_id', targetMerchantId)
                  .maybeSingle();

                if (card) {
                  await supabaseAdmin
                    .from('loyalty_cards')
                    .update({
                      stamps_count: (card.stamps_count || 0) + 1,
                      total_visits: (card.total_visits || 0) + 1,
                      last_visit_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    })
                    .eq('id', card.id);

                  await supabaseAdmin.from('stamp_transactions').insert({
                    card_id: card.id,
                    type: 'stamp',
                    amount: 1,
                    reason: `Commande payée en ligne via Stripe`,
                  });
                } else {
                  const { data: newCard } = await supabaseAdmin
                    .from('loyalty_cards')
                    .insert({
                      customer_id: customerId,
                      merchant_id: targetMerchantId,
                      stamps_count: 1,
                      total_visits: 1,
                      last_visit_at: new Date().toISOString(),
                    })
                    .select('id')
                    .single();

                  if (newCard) {
                    await supabaseAdmin.from('stamp_transactions').insert({
                      card_id: newCard.id,
                      type: 'stamp',
                      amount: 1,
                      reason: `Première commande payée en ligne via Stripe`,
                    });
                  }
                }
              }

              // Mettre à jour la commande : payée, en cuisine et tampon crédité
              await supabaseAdmin
                .from('orders')
                .update({
                  payment_status: 'paid',
                  order_status: 'preparing',
                  points_awarded: true,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', order.id);
            }
          } catch (orderErr) {
            console.error('Error fulfilling online order webhook:', orderErr);
          }
        }
      }

      // ── CAS B : Inscription & Abonnement Marchand (Paiement validé ou Début d'Essai 0 €) ──
      const isRegistrationValid = (session.payment_status === 'paid' || session.payment_status === 'no_payment_required' || session.status === 'complete') 
        && session.metadata 
        && session.metadata.type !== 'customer_order';

      if (isRegistrationValid) {
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
                // 3 mois offerts (90 jours) pour le premier cycle
                const expiresAt = calculateExpirationDate(billingPeriod, 92);
                const monthlyPrice = billingPeriod === 'yearly' 
                  ? (planTier === 'basic' ? 39.90 : 390) 
                  : (planTier === 'basic' ? 3.99 : 39);

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
        const periodEndTs = invoice.lines?.data?.[0]?.period?.end;
        const nextPeriodEnd = periodEndTs ? new Date(periodEndTs * 1000) : new Date();
        if (!periodEndTs) {
          nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);
        }

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
