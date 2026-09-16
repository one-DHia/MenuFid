import { NextResponse } from 'next/server';
import { stripe, decryptPayload, calculateExpirationDate } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID manquant' }, { status: 400 });
    }

    // 1. Récupérer la session auprès de Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Paiement non validé ou session expirée' },
        { status: 400 }
      );
    }

    const metadata = session.metadata || {};
    const email = metadata.email?.toLowerCase();
    const businessName = metadata.business_name;
    const planTier = (metadata.plan_tier as 'basic' | 'loyalty') || 'loyalty';
    const billingPeriod = (metadata.billing_period as 'monthly' | 'yearly') || 'monthly';
    const slug = metadata.slug;
    const shortCode = metadata.short_code;
    const encryptedPwd = metadata.pwd_enc;

    if (!email || !businessName || !encryptedPwd) {
      return NextResponse.json(
        { error: 'Données de session incomplètes' },
        { status: 400 }
      );
    }

    // 2. Vérifier si le marchand a déjà été créé (ex: via le Webhook Stripe qui est arrivé avant)
    const { data: existingMerchant } = await supabaseAdmin
      .from('merchants')
      .select('id, slug, business_name, email')
      .eq('email', email)
      .maybeSingle();

    const password = decryptPayload(encryptedPwd);
    if (!password) {
      return NextResponse.json(
        { error: 'Impossible de déchiffrer les identifiants' },
        { status: 500 }
      );
    }

    if (existingMerchant) {
      return NextResponse.json({
        success: true,
        alreadyCreated: true,
        merchant: existingMerchant,
        credentials: { email, password },
      });
    }

    // 3. Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: 'merchant',
        business_name: businessName,
      },
    });

    if (authError || !authData.user) {
      console.error('[Stripe Verify Auth Create Error]:', authError);
      return NextResponse.json(
        { error: authError?.message || 'Erreur lors de la création du compte auth' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;
    const expiresAt = calculateExpirationDate(billingPeriod);
    const monthlyPrice = billingPeriod === 'yearly' 
      ? (planTier === 'basic' ? 190 : 390) 
      : (planTier === 'basic' ? 19 : 39);

    // 4. Insérer le marchand dans la table public.merchants
    const { data: newMerchant, error: insertError } = await supabaseAdmin
      .from('merchants')
      .insert({
        id: userId,
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
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Stripe Verify Merchant Insert Error]:', insertError);
      return NextResponse.json(
        { error: insertError.message || 'Erreur lors de l\'enregistrement du restaurant' },
        { status: 500 }
      );
    }

    // 5. Créer une catégorie par défaut pour que le restaurateur démarre immédiatement
    try {
      await supabaseAdmin.from('categories').insert({
        merchant_id: userId,
        name: 'Plats du Chef',
        display_order: 1,
        is_active: true,
      });
    } catch (catErr) {
      console.warn('Catégorie par défaut warning:', catErr);
    }

    return NextResponse.json({
      success: true,
      merchant: newMerchant,
      credentials: { email, password },
    });
  } catch (error: any) {
    console.error('[Stripe Verify Session Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne lors de la vérification' },
      { status: 500 }
    );
  }
}
