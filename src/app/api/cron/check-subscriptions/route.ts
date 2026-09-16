import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const now = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    let deactivatedCount = 0;
    let deletedCount = 0;

    // ─────────────────────────────────────────────────────────────
    // 1. DÉSACTIVATION DES COMPTES DONT LA DATE D'EXPIRATION EST DÉPASSÉE (> 1 mois)
    // ─────────────────────────────────────────────────────────────
    const { data: expiredMerchants, error: expError } = await supabaseAdmin
      .from('merchants')
      .select('id, business_name, email, subscription_expires_at')
      .eq('is_suspended', false)
      .not('subscription_expires_at', 'is', null)
      .lt('subscription_expires_at', now.toISOString());

    if (!expError && expiredMerchants && expiredMerchants.length > 0) {
      for (const merch of expiredMerchants) {
        await supabaseAdmin
          .from('merchants')
          .update({
            is_suspended: true,
            plan_status: 'past_due',
            deactivated_at: now.toISOString(),
          })
          .eq('id', merch.id);

        deactivatedCount++;

        // Enregistrer dans les logs d'administration
        try {
          await supabaseAdmin.from('admin_logs').insert({
            action: 'auto_suspend_expired_subscription',
            target_id: merch.id,
            details: {
              business_name: merch.business_name,
              email: merch.email,
              expired_at: merch.subscription_expires_at,
              suspended_at: now.toISOString(),
            },
          });
        } catch {}
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. SUPPRESSION DÉFINITIVE DES COMPTES DÉSACTIVÉS DEPUIS PLUS DE 3 MOIS (90 JOURS)
    // ─────────────────────────────────────────────────────────────
    const { data: abandonedMerchants, error: abError } = await supabaseAdmin
      .from('merchants')
      .select('id, business_name, email, deactivated_at')
      .eq('is_suspended', true)
      .not('deactivated_at', 'is', null)
      .lt('deactivated_at', ninetyDaysAgo.toISOString());

    if (!abError && abandonedMerchants && abandonedMerchants.length > 0) {
      for (const merch of abandonedMerchants) {
        // Cascade manuelle sécurisée
        try {
          // Supprimer les données associées
          await supabaseAdmin.from('menu_items').delete().eq('merchant_id', merch.id);
          await supabaseAdmin.from('categories').delete().eq('merchant_id', merch.id);
          await supabaseAdmin.from('loyalty_cards').delete().eq('merchant_id', merch.id);
          await supabaseAdmin.from('rewards').delete().eq('merchant_id', merch.id);
          await supabaseAdmin.from('stamp_transactions').delete().eq('merchant_id', merch.id);
          
          // Supprimer la fiche restaurant
          await supabaseAdmin.from('merchants').delete().eq('id', merch.id);

          // Supprimer le compte auth Supabase
          await supabaseAdmin.auth.admin.deleteUser(merch.id);

          deletedCount++;

          await supabaseAdmin.from('admin_logs').insert({
            action: 'auto_purge_abandoned_merchant',
            target_id: merch.id,
            details: {
              business_name: merch.business_name,
              email: merch.email,
              deactivated_at: merch.deactivated_at,
              purged_at: now.toISOString(),
            },
          });
        } catch (delErr) {
          console.error(`Erreur lors de la purge du marchand ${merch.id}:`, delErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      deactivatedCount,
      deletedCount,
    });
  } catch (error: any) {
    console.error('[Cron Check Subscriptions Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne de vérification' },
      { status: 500 }
    );
  }
}
