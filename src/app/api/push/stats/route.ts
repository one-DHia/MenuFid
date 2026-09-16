import { NextResponse } from 'next/server';
import { webPushService } from '@/lib/services/webPushService';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Route GET /api/push/stats?merchantId=...
 * Retourne les statistiques d'abonnés push pour un établissement.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get('merchantId');

    if (!merchantId) {
      return NextResponse.json({ error: 'merchantId requis' }, { status: 400 });
    }

    const { data: merchant } = await supabaseAdmin
      .from('merchants')
      .select('plan_tier')
      .eq('id', merchantId)
      .single();

    if (merchant?.plan_tier === 'basic') {
      return NextResponse.json({ subscribersCount: 0, isAllowed: false });
    }

    const count = await webPushService.getMerchantSubscriberCount(merchantId);
    return NextResponse.json({ subscribersCount: count, isAllowed: true });
  } catch (err: any) {
    console.error('[API Push Stats] Erreur:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
