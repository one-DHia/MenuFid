import { NextResponse } from 'next/server';
import { webPushService } from '@/lib/services/webPushService';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Route POST /api/push/send
 * Envoie une notification push ciblée (par client) ou groupée (broadcast restaurateur).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { merchantId, customerId, title, message, url, data } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Titre et message requis.' }, { status: 400 });
    }

    const payload = {
      title: String(title).slice(0, 120),
      body: String(message).slice(0, 500),
      icon: '/logo.png',
      badge: '/favicon.ico',
      url: url || '/wallet',
      data: data || {},
    };

    // 1. Envoi ciblé à un client spécifique
    if (customerId) {
      const result = await webPushService.sendPushToCustomer(customerId, payload);
      return NextResponse.json(result);
    }

    // 2. Envoi groupé à tous les clients d'un restaurateur (Broadcast)
    if (merchantId) {
      // Vérifier que le restaurant existe et son plan
      const { data: merchant, error: merchErr } = await supabaseAdmin
        .from('merchants')
        .select('id, business_name, slug, plan_tier')
        .eq('id', merchantId)
        .single();

      if (merchErr || !merchant) {
        return NextResponse.json({ error: 'Établissement introuvable.' }, { status: 404 });
      }

      if (merchant.plan_tier === 'basic') {
        return NextResponse.json(
          { error: "L'envoi de notifications Push est réservé aux formules PRO. Votre compte est actuellement sur la formule Starter." },
          { status: 403 }
        );
      }

      // Si l'URL n'est pas spécifiée, rediriger vers la page du restaurant
      if (!url) {
        payload.url = `/wallet/${merchant.slug}`;
      }

      const result = await webPushService.sendPushToMerchantCustomers(merchantId, payload);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'customerId ou merchantId requis.' }, { status: 400 });
  } catch (err: any) {
    console.error('[API Push Send] Erreur:', err);
    return NextResponse.json({ error: err?.message || 'Erreur interne du serveur.' }, { status: 500 });
  }
}
