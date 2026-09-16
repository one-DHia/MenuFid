/**
 * lib/services/webPushService.ts
 * ─────────────────────────────────────────────────────────────
 * Service Backend pour l'envoi de Notifications Web Push (VAPID).
 * Compatible avec Chrome, Safari (iOS 16.4+ & macOS), Firefox et Edge.
 */

import webpush from 'web-push';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Configuration VAPID
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contact@menufid.site';

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  } catch (err) {
    console.error('[WebPush] Erreur d\'initialisation VAPID:', err);
  }
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  data?: Record<string, any>;
}

export interface PushSendResult {
  success: boolean;
  sentCount: number;
  totalSubscriptions: number;
  failedCount: number;
  error?: string;
}

export const webPushService = {
  /**
   * Envoie une notification push directement à un objet PushSubscription spécifique.
   */
  async sendPushToSubscription(
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    payload: PushPayload
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const fullPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/logo.png',
        badge: payload.badge || '/favicon.ico',
        url: payload.url || '/wallet',
        data: payload.data || {},
      });

      await webpush.sendNotification(subscription, fullPayload);
      return { success: true };
    } catch (err: any) {
      console.error('[WebPush] Échec d\'envoi vers subscription:', err?.statusCode, err?.message);
      return { success: false, error: err?.message || 'Push delivery failed' };
    }
  },

  /**
   * Envoie une notification push à tous les appareils enregistrés d'un client spécifique.
   */
  async sendPushToCustomer(customerId: string, payload: PushPayload): Promise<PushSendResult> {
    if (!customerId) {
      return { success: false, sentCount: 0, totalSubscriptions: 0, failedCount: 0, error: 'Customer ID manquant' };
    }

    try {
      const { data: subs, error } = await supabaseAdmin
        .from('push_subscriptions')
        .select('*')
        .eq('customer_id', customerId);

      if (error) {
        console.error('[WebPush] Erreur récupération abonnements client:', error);
        return { success: false, sentCount: 0, totalSubscriptions: 0, failedCount: 0, error: error.message };
      }

      if (!subs || subs.length === 0) {
        return { success: true, sentCount: 0, totalSubscriptions: 0, failedCount: 0 };
      }

      let sentCount = 0;
      let failedCount = 0;
      const expiredEndpoints: string[] = [];

      const fullPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/logo.png',
        badge: payload.badge || '/favicon.ico',
        url: payload.url || '/wallet',
        data: payload.data || {},
      });

      await Promise.allSettled(
        subs.map(async (sub) => {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };

          try {
            await webpush.sendNotification(pushSubscription, fullPayload);
            sentCount++;
          } catch (err: any) {
            failedCount++;
            // Nettoyage automatique des endpoints expirés (404 Not Found ou 410 Gone)
            if (err?.statusCode === 404 || err?.statusCode === 410) {
              expiredEndpoints.push(sub.endpoint);
            }
          }
        })
      );

      // Suppression des endpoints obsolètes
      if (expiredEndpoints.length > 0) {
        await supabaseAdmin
          .from('push_subscriptions')
          .delete()
          .in('endpoint', expiredEndpoints);
      }

      return {
        success: sentCount > 0 || (sentCount === 0 && failedCount === 0),
        sentCount,
        totalSubscriptions: subs.length,
        failedCount,
      };
    } catch (err: any) {
      console.error('[WebPush] Erreur globale sendPushToCustomer:', err);
      return { success: false, sentCount: 0, totalSubscriptions: 0, failedCount: 0, error: err?.message };
    }
  },

  /**
   * Envoie une notification push de diffusion à l'ensemble des clients d'un restaurateur.
   */
  async sendPushToMerchantCustomers(merchantId: string, payload: PushPayload): Promise<PushSendResult> {
    if (!merchantId) {
      return { success: false, sentCount: 0, totalSubscriptions: 0, failedCount: 0, error: 'Merchant ID manquant' };
    }

    try {
      // 1. Récupérer tous les clients qui possèdent une carte fidélité chez ce commerçant
      const { data: cards, error: cardsError } = await supabaseAdmin
        .from('loyalty_cards')
        .select('customer_id')
        .eq('merchant_id', merchantId);

      if (cardsError) {
        console.error('[WebPush] Erreur récupération cartes du restaurateur:', cardsError);
        return { success: false, sentCount: 0, totalSubscriptions: 0, failedCount: 0, error: cardsError.message };
      }

      if (!cards || cards.length === 0) {
        return { success: true, sentCount: 0, totalSubscriptions: 0, failedCount: 0 };
      }

      const customerIds = Array.from(new Set(cards.map((c) => c.customer_id).filter(Boolean)));

      if (customerIds.length === 0) {
        return { success: true, sentCount: 0, totalSubscriptions: 0, failedCount: 0 };
      }

      // 2. Récupérer toutes les souscriptions push pour ces clients
      const { data: subs, error: subsError } = await supabaseAdmin
        .from('push_subscriptions')
        .select('*')
        .in('customer_id', customerIds);

      if (subsError) {
        console.error('[WebPush] Erreur récupération souscriptions:', subsError);
        return { success: false, sentCount: 0, totalSubscriptions: 0, failedCount: 0, error: subsError.message };
      }

      if (!subs || subs.length === 0) {
        return { success: true, sentCount: 0, totalSubscriptions: 0, failedCount: 0 };
      }

      let sentCount = 0;
      let failedCount = 0;
      const expiredEndpoints: string[] = [];

      const fullPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/logo.png',
        badge: payload.badge || '/favicon.ico',
        url: payload.url || '/wallet',
        data: payload.data || {},
      });

      await Promise.allSettled(
        subs.map(async (sub) => {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };

          try {
            await webpush.sendNotification(pushSubscription, fullPayload);
            sentCount++;
          } catch (err: any) {
            failedCount++;
            if (err?.statusCode === 404 || err?.statusCode === 410) {
              expiredEndpoints.push(sub.endpoint);
            }
          }
        })
      );

      if (expiredEndpoints.length > 0) {
        await supabaseAdmin
          .from('push_subscriptions')
          .delete()
          .in('endpoint', expiredEndpoints);
      }

      return {
        success: true,
        sentCount,
        totalSubscriptions: subs.length,
        failedCount,
      };
    } catch (err: any) {
      console.error('[WebPush] Erreur globale sendPushToMerchantCustomers:', err);
      return { success: false, sentCount: 0, totalSubscriptions: 0, failedCount: 0, error: err?.message };
    }
  },

  /**
   * Récupère le nombre d'abonnés push actifs pour un restaurateur.
   */
  async getMerchantSubscriberCount(merchantId: string): Promise<number> {
    try {
      const { data: cards } = await supabaseAdmin
        .from('loyalty_cards')
        .select('customer_id')
        .eq('merchant_id', merchantId);

      if (!cards || cards.length === 0) return 0;
      const customerIds = Array.from(new Set(cards.map((c) => c.customer_id).filter(Boolean)));
      if (customerIds.length === 0) return 0;

      const { count } = await supabaseAdmin
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: true })
        .in('customer_id', customerIds);

      return count || 0;
    } catch (err) {
      console.error('[WebPush] Erreur comptage abonnés:', err);
      return 0;
    }
  },
};
