import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Route POST /api/stripe/customer-portal
 * Génère un lien sécurisé vers le Stripe Billing Customer Portal
 * pour mettre à jour la carte bancaire, consulter et télécharger les factures.
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Session invalide ou expirée.' }, { status: 401 });
    }

    const { merchantId } = await req.json();

    if (!merchantId) {
      return NextResponse.json({ error: 'Identifiant marchand manquant.' }, { status: 400 });
    }

    if (user.id !== merchantId) {
      return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
    }

    const { data: merchant, error: merchantErr } = await supabaseAdmin
      .from('merchants')
      .select('id, stripe_customer_id')
      .eq('id', merchantId)
      .maybeSingle();

    if (merchantErr || !merchant) {
      return NextResponse.json({ error: 'Restaurant introuvable.' }, { status: 404 });
    }

    if (!merchant.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Aucun historique de paiement Stripe trouvé. Si votre compte est géré par un distributeur, contactez-le directement.' },
        { status: 400 }
      );
    }

    // Déterminer l'URL de retour
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://menufid.site';
    const returnUrl = `${appUrl}/pro/profile`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: merchant.stripe_customer_id,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('[Stripe Customer Portal Error]:', error);
    return NextResponse.json({ error: error.message || 'Impossible d\'ouvrir le portail de facturation.' }, { status: 500 });
  }
}
