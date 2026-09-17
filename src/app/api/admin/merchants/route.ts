import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const VALID_PLAN_TIERS: Record<string, 'freemium' | 'basic' | 'loyalty' | 'delivery' | 'premium'> = {
  'freemium': 'freemium',
  'free': 'freemium',
  'basic': 'basic',
  'starter': 'basic',
  'trial': 'basic',
  'monthly': 'loyalty',
  'loyalty': 'loyalty',
  'pro': 'loyalty',
  'delivery': 'delivery',
  'premium': 'premium',
  'yearly': 'premium',
};

const VALID_LICENSE_TYPES: Record<string, 'free' | 'recurring' | 'lifetime'> = {
  'free': 'free',
  'recurring': 'recurring',
  'lifetime': 'lifetime',
};

const VALID_PAYMENT_MODES: Record<string, 'cash_on_delivery' | 'online_only' | 'both'> = {
  'cash_on_delivery': 'cash_on_delivery',
  'online_only': 'online_only',
  'both': 'both',
};

const VALID_PLAN_STATUSES: Record<string, 'active' | 'trialing' | 'past_due' | 'canceled'> = {
  'active': 'active',
  'trialing': 'trialing',
  'past_due': 'past_due',
  'canceled': 'canceled'
};

/**
 * GET /api/admin/merchants
 * 🔒 IDOR / BOLA Protected:
 * - Super Admin can list all merchants or filter by distributorId.
 * - Distributor can ONLY query and see merchants where distributor_id = their own distributor ID.
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Super Admin
    let isSuperAdmin = false;
    const { data: adminData } = await supabaseAdmin.from('admins').select('id').eq('id', user.id).single();
    if (adminData) {
      isSuperAdmin = true;
    }

    let authDistributorId: string | null = null;
    if (!isSuperAdmin) {
      const { data: distData } = await supabaseAdmin
        .from('distributors')
        .select('id')
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .maybeSingle();
      if (distData) {
        authDistributorId = distData.id;
      }
    }

    if (!isSuperAdmin && !authDistributorId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const queryDistributorId = searchParams.get('distributorId');

    let query = supabaseAdmin
      .from('merchants')
      .select('*')
      .order('created_at', { ascending: false });

    // 🔒 IDOR Defense: Distributors are strictly constrained to their own portfolio
    if (!isSuperAdmin) {
      query = query.eq('distributor_id', authDistributorId);
    } else if (queryDistributorId) {
      query = query.eq('distributor_id', queryDistributorId);
    }

    const { data: merchants, error: queryError } = await query;

    if (queryError) {
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    }

    const sanitizedMerchants = (merchants || []).map((m: any) => {
      const cur = m.currency || (m.country === 'Algérie' || m.country === 'DZ' ? 'DZD' : 'EUR');
      let price = m.monthly_price;
      if (price === null || price === undefined) {
        if (m.license_type === 'lifetime' || m.plan_tier === 'freemium') {
          price = 0;
        } else if (cur === 'DZD') {
          price = m.plan_tier === 'basic' ? 1900 : (m.plan_tier === 'delivery' ? 4900 : 3900);
        } else {
          price = m.plan_tier === 'basic' ? 19 : (m.plan_tier === 'delivery' ? 49 : 39);
        }
      }
      return {
        ...m,
        currency: cur,
        monthly_price: price,
      };
    });

    return NextResponse.json({ merchants: sanitizedMerchants });
  } catch (error: any) {
    console.error('Merchant GET API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/merchants
 * 🔒 IDOR / BOLA Protected:
 * - Creates, Updates, Resets Password, Deletes merchants with strict distributor/admin ownership verification.
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify user with Supabase Admin
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Determine if the user is a Super Admin or a Distributor
    let isSuperAdmin = false;
    const { data: adminData } = await supabaseAdmin.from('admins').select('id').eq('id', user.id).single();
    if (adminData) {
      isSuperAdmin = true;
    }

    let authDistributorId: string | null = null;
    if (!isSuperAdmin) {
      const { data: distData } = await supabaseAdmin
        .from('distributors')
        .select('id')
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .maybeSingle();
      if (distData) {
        authDistributorId = distData.id;
      }
    }

    // If neither super admin nor distributor, deny access
    if (!isSuperAdmin && !authDistributorId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { 
      action, 
      email, 
      password, 
      businessName, 
      slug, 
      merchantId, 
      planTier, 
      planStatus, 
      demoStart, 
      demoEnd, 
      isSuspended, 
      distributorId, 
      newPassword,
      currency,
      licenseType,
      deliveryPaymentMode
    } = await req.json();
    
    // 🔒 IDOR Defense: For a distributor, force the distributorId to be their own authenticated ID.
    const assignedDistributorId = isSuperAdmin ? (distributorId || null) : authDistributorId;

    if (action === 'create') {
      if (!email || !password || !businessName || !slug) {
         return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
      }

      // 🔒 Validation du mot de passe côté serveur (min 8 chars, au moins 1 lettre + 1 chiffre)
      if (password.length < 8) {
        return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' }, { status: 400 });
      }
      if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        return NextResponse.json({ error: 'Le mot de passe doit contenir au moins une lettre et un chiffre.' }, { status: 400 });
      }

      // Generate a short_code (4 random uppercase letters - 2 random digits)
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let randomLetters = '';
      for (let i = 0; i < 4; i++) randomLetters += letters.charAt(Math.floor(Math.random() * letters.length));
      const randomDigits = Math.floor(10 + Math.random() * 90); // 10 to 99
      const shortCode = `${randomLetters}-${randomDigits}`;

      // 1. Create user in Supabase Auth
      const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: { role: 'merchant' }
      });

      if (createAuthError || !authData.user) {
        return NextResponse.json({ error: createAuthError?.message || 'Erreur lors de la création du compte' }, { status: 400 });
      }

      const mappedPlanTier = VALID_PLAN_TIERS[planTier] || 'loyalty';
      const mappedPlanStatus = VALID_PLAN_STATUSES[planStatus] || 'active';
      const mappedLicenseType = VALID_LICENSE_TYPES[licenseType] || (mappedPlanTier === 'freemium' ? 'free' : 'recurring');
      const mappedCurrency = currency === 'DZD' ? 'DZD' : 'EUR';
      const mappedPaymentMode = VALID_PAYMENT_MODES[deliveryPaymentMode] || (mappedCurrency === 'DZD' ? 'cash_on_delivery' : 'both');

      // Calcul dynamique du tarif mensuel
      let computedMonthlyPrice = 0;
      if (mappedLicenseType !== 'lifetime' && mappedPlanTier !== 'freemium') {
        if (mappedCurrency === 'DZD') {
          computedMonthlyPrice = mappedPlanTier === 'basic' ? 1900 : (mappedPlanTier === 'delivery' ? 4900 : 3900);
        } else {
          computedMonthlyPrice = mappedPlanTier === 'basic' ? 19 : (mappedPlanTier === 'delivery' ? 49 : 39);
        }
      }

      // 2. Create merchant profile
      const merchantInsertPayload: any = {
        id: authData.user.id,
        distributor_id: assignedDistributorId,
        business_name: businessName.trim(),
        slug: slug.trim().toLowerCase(),
        short_code: shortCode,
        contact_email: email.trim().toLowerCase(),
        plan_tier: mappedPlanTier,
        plan_status: mappedPlanStatus,
        license_type: mappedLicenseType,
        currency: mappedCurrency,
        monthly_price: computedMonthlyPrice,
        delivery_payment_mode: mappedPaymentMode,
        primary_color: '#FFB800'
      };

      let { data: merchantData, error: merchantError } = await supabaseAdmin
        .from('merchants')
        .insert(merchantInsertPayload)
        .select()
        .single();

      // Graceful fallback si la colonne currency n'existe pas encore dans PostgreSQL
      if (merchantError && (merchantError.message?.includes("'currency'") || (merchantError as any).code === 'PGRST204')) {
        console.warn('[AdminCreateMerchant] Fallback: currency column missing from schema cache, retrying without it');
        const fallbackPayload = { ...merchantInsertPayload };
        delete fallbackPayload.currency;
        const retryRes = await supabaseAdmin
          .from('merchants')
          .insert(fallbackPayload)
          .select()
          .single();
        merchantData = retryRes.data ? { ...retryRes.data, currency: mappedCurrency } : null;
        merchantError = retryRes.error;
      }

      if (merchantError) {
        // Rollback: delete auth user if merchant creation fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json({ error: merchantError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, merchant: merchantData });
    } 
    
    else if (action === 'update') {
      if (!merchantId) return NextResponse.json({ error: 'Missing merchantId' }, { status: 400 });

      // Récupérer le marchand actuel pour vérification et calcul
      const { data: existingMerchant } = await supabaseAdmin
        .from('merchants')
        .select('id, distributor_id, plan_tier, license_type, monthly_price')
        .eq('id', merchantId)
        .single();

      // 🔒 IDOR Defense: If distributor, verify the merchant strictly belongs to them
      if (!isSuperAdmin) {
        if (!existingMerchant || existingMerchant.distributor_id !== authDistributorId) {
          return NextResponse.json({ error: 'Accès refusé pour ce restaurant' }, { status: 403 });
        }
      }

      const updates: any = {};
      if (planTier !== undefined) {
        updates.plan_tier = VALID_PLAN_TIERS[planTier] || 'loyalty';
      }
      if (planStatus !== undefined) {
        updates.plan_status = VALID_PLAN_STATUSES[planStatus] || 'active';
      }
      if (licenseType !== undefined && VALID_LICENSE_TYPES[licenseType]) {
        updates.license_type = VALID_LICENSE_TYPES[licenseType];
      }
      if (currency !== undefined && (currency === 'EUR' || currency === 'DZD')) {
        updates.currency = currency;
      }
      if (deliveryPaymentMode !== undefined && VALID_PAYMENT_MODES[deliveryPaymentMode]) {
        updates.delivery_payment_mode = VALID_PAYMENT_MODES[deliveryPaymentMode];
      }
      if (demoStart !== undefined) updates.demo_start = demoStart;
      if (demoEnd !== undefined) updates.demo_end = demoEnd;
      if (typeof isSuspended !== 'undefined') updates.is_suspended = isSuspended;

      // Calcul dynamique et synchronisation du monthly_price
      const targetPlanTier = updates.plan_tier || existingMerchant?.plan_tier || 'loyalty';
      const targetLicenseType = updates.license_type || existingMerchant?.license_type || 'recurring';
      const targetCurrency = updates.currency || 'EUR';

      if (targetLicenseType === 'lifetime' || targetPlanTier === 'freemium') {
        updates.monthly_price = 0;
      } else if (targetCurrency === 'DZD') {
        updates.monthly_price = targetPlanTier === 'basic' ? 1900 : (targetPlanTier === 'delivery' ? 4900 : 3900);
      } else {
        updates.monthly_price = targetPlanTier === 'basic' ? 19 : (targetPlanTier === 'delivery' ? 49 : 39);
      }

      let { data, error } = await supabaseAdmin
        .from('merchants')
        .update(updates)
        .eq('id', merchantId)
        .select()
        .single();

      // Graceful Fallback si la colonne 'currency' n'est pas encore présente dans la table PostgreSQL
      if (error && (error.message?.includes("'currency'") || (error as any).code === 'PGRST204')) {
        console.warn('[AdminUpdateMerchant] Fallback: currency column missing from schema cache, retrying without currency column');
        const fallbackUpdates = { ...updates };
        delete fallbackUpdates.currency;
        
        const fallbackRes = await supabaseAdmin
          .from('merchants')
          .update(fallbackUpdates)
          .eq('id', merchantId)
          .select()
          .single();

        data = fallbackRes.data ? { ...fallbackRes.data, currency: updates.currency || 'EUR' } : null;
        error = fallbackRes.error;
      }

      if (error) {
        console.error('[AdminUpdateMerchant Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, merchant: data });
    }

    else if (action === 'reset_password') {
      if (!merchantId || !newPassword) return NextResponse.json({ error: 'Missing merchantId or newPassword' }, { status: 400 });

      // 🔒 IDOR Defense: If distributor, verify ownership
      if (!isSuperAdmin) {
        const { data: verifyMerchant } = await supabaseAdmin
          .from('merchants')
          .select('distributor_id')
          .eq('id', merchantId)
          .single();
        if (!verifyMerchant || verifyMerchant.distributor_id !== authDistributorId) {
          return NextResponse.json({ error: 'Accès refusé pour ce restaurant' }, { status: 403 });
        }
      }

      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' }, { status: 400 });
      }

      const { error } = await supabaseAdmin.auth.admin.updateUserById(merchantId, { password: newPassword });
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    else if (action === 'delete') {
      if (!merchantId) return NextResponse.json({ error: 'Missing merchantId' }, { status: 400 });

      // 🔒 IDOR Defense: If distributor, verify ownership
      if (!isSuperAdmin) {
        const { data: verifyMerchant } = await supabaseAdmin
          .from('merchants')
          .select('distributor_id')
          .eq('id', merchantId)
          .single();
        if (!verifyMerchant || verifyMerchant.distributor_id !== authDistributorId) {
          return NextResponse.json({ error: 'Accès refusé pour ce restaurant' }, { status: 403 });
        }
      }

      // First delete associated merchant records to avoid FK lock
      await supabaseAdmin.from('menu_items').delete().eq('merchant_id', merchantId);
      await supabaseAdmin.from('categories').delete().eq('merchant_id', merchantId);
      await supabaseAdmin.from('loyalty_cards').delete().eq('merchant_id', merchantId);
      await supabaseAdmin.from('rewards').delete().eq('merchant_id', merchantId);
      await supabaseAdmin.from('merchants').delete().eq('id', merchantId);

      // Delete user from Supabase auth
      const { error } = await supabaseAdmin.auth.admin.deleteUser(merchantId);
      if (error) {
        console.warn('Auth user deletion warning:', error);
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Merchant API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
