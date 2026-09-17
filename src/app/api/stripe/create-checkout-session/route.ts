import { NextResponse } from 'next/server';
import { stripe, MENUFID_PLANS, encryptPayload } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function generateSlug(text: string): string {
  const base = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return base || 'restaurant';
}

function generateShortCode(name: string): string {
  const lettersOnly = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const prefix = (lettersOnly + 'REST').slice(0, 4);
  const randomNum = Math.floor(10 + Math.random() * 90); // 2 chiffres
  return `${prefix}-${randomNum}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { businessName, email, password, plan = 'pro', billing = 'monthly' } = body;

    if (!businessName || !email || !password) {
      return NextResponse.json(
        { error: 'Veuillez renseigner le nom de l\'établissement, votre email et un mot de passe.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Vérifier si un compte existe déjà avec cet email
    const { data: existingUser } = await supabaseAdmin
      .from('merchants')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte restaurant existe déjà avec cet email. Veuillez vous connecter.' },
        { status: 400 }
      );
    }

    // 2. Déterminer le plan et montant
    const selectedPlan = plan === 'starter' ? MENUFID_PLANS.starter : MENUFID_PLANS.pro;
    const isYearly = billing === 'yearly';
    const unitAmount = isYearly ? selectedPlan.amountYearly : selectedPlan.amountMonthly;

    // 3. Préparer les métadonnées (chiffrement sécurisé du mot de passe pour zéro compte sans paiement)
    const baseSlug = generateSlug(businessName);
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    const shortCode = generateShortCode(businessName);
    const encryptedPassword = encryptPayload(password);

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://menufid.site';

    // 4. Créer la session Stripe Checkout avec 3 mois d'essai offerts (90 jours)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: cleanEmail,
      subscription_data: {
        trial_period_days: 90,
        metadata: {
          business_name: businessName.trim(),
          email: cleanEmail,
          plan_tier: selectedPlan.planTier,
          billing_period: isYearly ? 'yearly' : 'monthly',
        },
      },
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${selectedPlan.name} (3 mois offerts)`,
              description: `${selectedPlan.description} • 0 € aujourd'hui puis prélèvement automatique`,
            },
            unit_amount: unitAmount,
            recurring: {
              interval: isYearly ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        business_name: businessName.trim(),
        email: cleanEmail,
        plan_tier: selectedPlan.planTier,
        billing_period: isYearly ? 'yearly' : 'monthly',
        slug: uniqueSlug,
        short_code: shortCode,
        pwd_enc: encryptedPassword,
        action: 'new_registration',
      },
      success_url: `${origin}/pro/register/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pro/register?canceled=true&plan=${plan}&billing=${billing}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[Stripe Checkout Session Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session de paiement Stripe' },
      { status: 500 }
    );
  }
}
