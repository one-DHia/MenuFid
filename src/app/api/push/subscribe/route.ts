import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Route POST /api/push/subscribe
 * Enregistre ou met à jour la souscription Web Push d'un client.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subscription, customerId } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json({ error: 'Données de souscription push incomplètes.' }, { status: 400 });
    }

    if (!customerId) {
      return NextResponse.json({ error: 'customerId requis.' }, { status: 400 });
    }

    // Validation du format UUID du customerId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(customerId)) {
      return NextResponse.json({ error: 'Format de customerId invalide.' }, { status: 400 });
    }

    // Validation de l'URL de l'endpoint
    try {
      const parsedUrl = new URL(subscription.endpoint);
      if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
        return NextResponse.json({ error: 'Protocole endpoint invalide.' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Endpoint de souscription invalide.' }, { status: 400 });
    }

    // Enregistrement / mise à jour de la souscription
    const { error } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert(
        {
          customer_id: customerId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        { onConflict: 'endpoint' }
      );

    if (error) {
      console.error('[API Push Subscribe] Erreur base de données:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Souscription push enregistrée avec succès.' });
  } catch (err: any) {
    console.error('[API Push Subscribe] Erreur inattendue:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}
