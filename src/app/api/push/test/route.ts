import { NextResponse } from 'next/server';
import { webPushService } from '@/lib/services/webPushService';

/**
 * Route POST /api/push/test
 * Permet de tester instantanément l'envoi d'une notification Web Push sur un appareil.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subscription, customerId, title, message, url } = body;

    const payload = {
      title: title || '🔔 MenuFid Test Push',
      body: message || 'Bravo ! Les notifications Web Push fonctionnent parfaitement sur votre appareil.',
      icon: '/logo.png',
      badge: '/favicon.ico',
      url: url || '/wallet',
    };

    if (subscription && subscription.endpoint) {
      const result = await webPushService.sendPushToSubscription(subscription, payload);
      if (!result.success) {
        return NextResponse.json({ error: result.error || 'Échec de l\'envoi push direct.' }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: 'Notification test envoyée avec succès.' });
    }

    if (customerId) {
      const result = await webPushService.sendPushToCustomer(customerId, payload);
      if (!result.success && result.totalSubscriptions === 0) {
        return NextResponse.json({
          success: false,
          error: 'Aucun abonnement push trouvé pour ce client. Veuillez d\'abord autoriser les notifications.',
        }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        sentCount: result.sentCount,
        message: `${result.sentCount} notification(s) envoyée(s).`,
      });
    }

    return NextResponse.json({ error: 'subscription ou customerId requis.' }, { status: 400 });
  } catch (err: any) {
    console.error('[API Push Test] Erreur:', err);
    return NextResponse.json({ error: err?.message || 'Erreur interne du serveur.' }, { status: 500 });
  }
}
