import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { stripe } from '@/lib/stripe';

/**
 * Route POST /api/account/delete
 * Suppression irréversible du compte marchand et de toutes ses données.
 * Résilie immédiatement tout abonnement Stripe pour couper les prélèvements.
 * 🔒 SÉCURISÉ : Vérifie le token JWT + correspondance merchantId avant toute suppression.
 */
export async function POST(req: Request) {
  try {
    // 🔒 1. Vérifier le Bearer token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide ou expiré.' }, { status: 401 });
    }

    const { merchantId } = await req.json();

    if (!merchantId) {
      return NextResponse.json({ error: 'Identifiant marchand requis.' }, { status: 400 });
    }

    // 🔒 2. Vérifier que l'utilisateur authentifié est bien le propriétaire de ce merchantId
    if (user.id !== merchantId) {
      return NextResponse.json({ error: 'Accès refusé : vous ne pouvez supprimer que votre propre compte.' }, { status: 403 });
    }

    // 🔒 3. Vérifier que le marchand existe bien en base
    const { data: merchant, error: merchantCheckErr } = await supabaseAdmin
      .from('merchants')
      .select('id, stripe_subscription_id, stripe_customer_id')
      .eq('id', merchantId)
      .maybeSingle();

    if (merchantCheckErr || !merchant) {
      return NextResponse.json({ error: 'Compte marchand introuvable.' }, { status: 404 });
    }

    // 🔒 4. Annuler immédiatement l'abonnement Stripe pour couper tout prélèvement futur
    if (merchant.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(merchant.stripe_subscription_id);
      } catch (stripeErr: any) {
        console.warn('[Account Delete] Warning canceling Stripe subscription:', stripeErr.message);
      }
    }

    // 5. Supprimer toutes les catégories et articles du menu
    await supabaseAdmin.from('menu_items').delete().eq('merchant_id', merchantId);
    await supabaseAdmin.from('categories').delete().eq('merchant_id', merchantId);

    // 6. Supprimer le système de fidélité, tampons et récompenses
    await supabaseAdmin.from('loyalty_cards').delete().eq('merchant_id', merchantId);
    await supabaseAdmin.from('rewards').delete().eq('merchant_id', merchantId);
    await supabaseAdmin.from('stamp_transactions').delete().eq('merchant_id', merchantId);
    await supabaseAdmin.from('points_ledger').delete().eq('merchant_id', merchantId);
    await supabaseAdmin.from('customers').delete().eq('merchant_id', merchantId);

    // 7. Supprimer les abonnements aux notifications push
    await supabaseAdmin.from('push_subscriptions').delete().eq('merchant_id', merchantId);

    // 8. Supprimer le profil marchand principal
    await supabaseAdmin.from('merchants').delete().eq('id', merchantId);
    await supabaseAdmin.from('profiles').delete().eq('id', merchantId);

    // 9. Supprimer le compte Auth Supabase
    await supabaseAdmin.auth.admin.deleteUser(merchantId);

    const response = NextResponse.json({ success: true, message: 'Compte et données supprimés définitivement.' });
    response.cookies.delete('menufid_merchant_id');
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur lors de la suppression du compte.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
