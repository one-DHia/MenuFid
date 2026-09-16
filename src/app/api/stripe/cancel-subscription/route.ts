import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Route POST /api/stripe/cancel-subscription
 * Permet d'arrêter le renouvellement automatique (cancel_at_period_end) ou de réactiver l'abonnement.
 */
export async function POST(req: Request) {
  try {
    // 1. Vérification du token Bearer
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Session invalide ou expirée.' }, { status: 401 });
    }

    const { merchantId, action = 'cancel_at_period_end' } = await req.json();

    if (!merchantId) {
      return NextResponse.json({ error: 'Identifiant marchand manquant.' }, { status: 400 });
    }

    if (user.id !== merchantId) {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    // 2. Récupération des informations du marchand
    const { data: merchant, error: merchantErr } = await supabaseAdmin
      .from('merchants')
      .select('id, stripe_customer_id, stripe_subscription_id, plan_status, subscription_expires_at')
      .eq('id', merchantId)
      .maybeSingle();

    if (merchantErr || !merchant) {
      return NextResponse.json({ error: 'Compte marchand introuvable.' }, { status: 404 });
    }

    // 3. Gestion de l'action selon la méthode de paiement
    if (merchant.stripe_subscription_id) {
      if (action === 'reactivate') {
        // Annuler la demande de résiliation programmée
        await stripe.subscriptions.update(merchant.stripe_subscription_id, {
          cancel_at_period_end: false,
        });

        await supabaseAdmin
          .from('merchants')
          .update({
            plan_status: 'active',
            is_suspended: false,
          })
          .eq('id', merchantId);

        return NextResponse.json({
          success: true,
          status: 'active',
          message: 'Votre abonnement a été réactivé avec succès !',
          expiresAt: merchant.subscription_expires_at,
        });
      } else {
        // Arrêter le renouvellement à la fin de la période payée
        const updatedSub = await stripe.subscriptions.update(merchant.stripe_subscription_id, {
          cancel_at_period_end: true,
        });

        // La date de fin de période Stripe
        const currentPeriodEnd = (updatedSub as any).current_period_end
          ? new Date((updatedSub as any).current_period_end * 1000).toISOString()
          : merchant.subscription_expires_at;

        await supabaseAdmin
          .from('merchants')
          .update({
            plan_status: 'canceled',
            subscription_expires_at: currentPeriodEnd,
          })
          .eq('id', merchantId);

        return NextResponse.json({
          success: true,
          status: 'canceled',
          cancelAtPeriodEnd: true,
          expiresAt: currentPeriodEnd,
          message: 'Le renouvellement automatique a été arrêté. Vos services restent actifs jusqu’à la fin de la période payée.',
        });
      }
    } else {
      // Pas de subscription Stripe directe (ex: paiement manuel ou compte géré par distributeur)
      if (action === 'reactivate') {
        await supabaseAdmin
          .from('merchants')
          .update({ plan_status: 'active' })
          .eq('id', merchantId);

        return NextResponse.json({
          success: true,
          status: 'active',
          message: 'Abonnement réactivé.',
        });
      } else {
        await supabaseAdmin
          .from('merchants')
          .update({ plan_status: 'canceled' })
          .eq('id', merchantId);

        return NextResponse.json({
          success: true,
          status: 'canceled',
          message: 'Abonnement arrêté. Veuillez contacter votre distributeur pour toute question.',
        });
      }
    }
  } catch (error: any) {
    console.error('[Cancel Subscription Error]:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de la modification de l\'abonnement.' }, { status: 500 });
  }
}
