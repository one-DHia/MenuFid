'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellRing, CheckCircle2, X, Send, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useLanguage } from '@/lib/i18n';
import { Spinner } from '@/components/ui/Spinner';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PushNotificationManagerProps {
  customerId: string | null;
  compact?: boolean;
}

export function PushNotificationManager({ customerId, compact = false }: PushNotificationManagerProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      // Tenter l'activation automatique en arrière-plan (Android / PWA / Granted)
      autoSubscribe();
    }

    const isDismissed = sessionStorage.getItem('menufid_push_banner_dismissed') === 'true';
    if (isDismissed) {
      setDismissed(true);
    }
  }, [customerId]);

  async function autoSubscribe() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      let perm = Notification.permission;

      // Sur Android / PWA, si permission non encore demandée, tenter la demande automatique en arrière-plan
      if (perm === 'default' && typeof navigator !== 'undefined') {
        const isAndroid = /Android/i.test(navigator.userAgent);
        if (isAndroid) {
          try {
            perm = await Notification.requestPermission();
            setPermission(perm);
          } catch (e) {}
        }
      }

      if (perm === 'granted') {
        let subscription = await registration.pushManager.getSubscription();
        const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!subscription && publicVapidKey) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
          });
        }

        if (subscription) {
          setIsSubscribed(true);
          if (customerId) {
            await fetch('/api/push/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ subscription, customerId }),
            });
          }
        }
      }
    } catch (err) {
      console.warn('[Push] Auto-subscribe check:', err);
    }
  }

  async function handleEnableNotifications() {
    if (!isSupported) {
      showToast(t('push_not_supported', 'Les notifications ne sont pas supportées par votre navigateur.'), 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Enregistrer le Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // 2. Demander la permission (User Gesture)
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        showToast(
          perm === 'denied'
            ? t('push_permission_denied', 'Notifications bloquées dans les paramètres de votre navigateur.')
            : t('push_permission_dismissed', 'Demande de notifications ignorée.'),
          'error'
        );
        setLoading(false);
        return;
      }

      // 3. Obtenir ou créer la souscription Push
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) {
        throw new Error('Clé VAPID publique manquante');
      }

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });
      }

      // 4. Envoyer la souscription à l'API
      if (customerId && subscription) {
        const res = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription, customerId }),
        });

        if (!res.ok) {
          throw new Error('Échec de l\'enregistrement sur le serveur');
        }
      }

      setIsSubscribed(true);
      showToast(t('push_enabled_success', '🔔 Notifications activées avec succès !'), 'success');

      // Envoyer immédiatement une notification test de bienvenue
      try {
        await fetch('/api/push/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription,
            title: '🎉 Notifications Fidélité Activées !',
            message: 'Vous recevrez vos tampons et récompenses en direct sur cet appareil.',
          }),
        });
      } catch (testErr) {
        console.warn('Erreur envoi notification test bienvenue:', testErr);
      }
    } catch (err: any) {
      console.error('[Push Manager] Erreur activation notifications:', err);
      showToast(err?.message || t('push_enable_error', 'Impossible d\'activer les notifications.'), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleTestNotification() {
    setTesting(true);
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!subscription && publicVapidKey) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });
      }

      if (!subscription && !customerId) {
        showToast(t('push_enable_first', 'Veuillez d\'abord activer les notifications.'), 'error');
        setTesting(false);
        return;
      }

      const res = await fetch('/api/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          customerId,
          title: '🔔 Test Notification MenuFid',
          message: 'Votre système de notifications Web Push fonctionne parfaitement ! 🚀',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Échec du test');
      }

      showToast(t('push_test_sent', 'Notification test envoyée sur votre appareil ! 📲'), 'success');
    } catch (err: any) {
      showToast(err?.message || 'Erreur lors du test de notification', 'error');
    } finally {
      setTesting(false);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('menufid_push_banner_dismissed', 'true');
    }
  }

  if (!isSupported) {
    return null;
  }

  // Si permission déjà accordée et abonné : afficher un indicateur discret et bouton de test
  if (permission === 'granted' && isSubscribed) {
    if (compact) {
      return (
        <button
          onClick={handleTestNotification}
          disabled={testing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-100 border-2 border-black text-black font-black text-xs shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
          title={t('test_push_title', 'Tester les notifications')}
        >
          {testing ? <Spinner size={14} className="text-black" /> : <BellRing className="w-3.5 h-3.5 text-green-700 animate-pulse" />}
          <span>{t('notifications_active', 'Notifications Actives')}</span>
        </button>
      );
    }

    return (
      <div className="max-w-3xl mx-auto w-full px-4 mb-4">
        <div className="neo-box bg-[#00F59B]/20 border-2 border-black p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00F59B] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
              <CheckCircle2 className="w-4 h-4 text-black" />
            </div>
            <div>
              <p className="text-xs font-black text-black">
                {t('push_enabled_badge', 'Notifications Web Push Actives')}
              </p>
              <p className="text-[11px] text-neutral-600 font-bold">
                {t('push_enabled_desc', 'Vous recevrez vos tampons et cadeaux en direct sur cet écran.')}
              </p>
            </div>
          </div>

          <button
            onClick={handleTestNotification}
            disabled={testing}
            className="neo-pill-btn-white py-1.5 px-3 text-xs font-black shrink-0 flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]"
          >
            {testing ? <Spinner size={12} className="text-black" /> : <Send className="w-3 h-3 text-black" />}
            <span>{t('test_button', 'Tester')}</span>
          </button>
        </div>
      </div>
    );
  }

  // Si refusé ou fermé : ne rien afficher
  if (permission === 'denied' || dismissed) {
    return null;
  }

  // Si permission 'default' (non encore demandée) : afficher la bannière incitative
  return (
    <div className="max-w-3xl mx-auto w-full px-4 mb-6">
      <div className="neo-box-yellow p-4 sm:p-5 border-3 border-black relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-lg text-black hover:bg-black/10 transition"
          aria-label={t('close', 'Fermer')}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 pr-6">
          <div className="w-11 h-11 rounded-xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#000]">
            <Bell className="w-6 h-6 text-black animate-bounce" />
          </div>
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
              <Sparkles className="w-3 h-3 text-[#FFB800]" />
              <span>{t('live_alerts', 'Alertes en direct')}</span>
            </div>
            <h4 className="font-black text-sm text-black tracking-tight">
              {t('enable_push_title', 'Activer les notifications de fidélité ?')}
            </h4>
            <p className="text-xs text-neutral-800 font-bold leading-tight">
              {t('enable_push_desc', 'Soyez notifié instantanément à chaque tampon validé et cadeau débloqué !')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleEnableNotifications}
            disabled={loading}
            className="neo-pill-btn flex-1 sm:flex-initial py-2.5 px-5 text-xs font-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000]"
          >
            {loading ? (
              <Spinner size={16} className="text-black" />
            ) : (
              <>
                <BellRing className="w-4 h-4" />
                <span>{t('enable_push_action', 'Activer (1 clic)')}</span>
              </>
            )}
          </button>
          <button
            onClick={handleDismiss}
            className="neo-pill-btn-white py-2.5 px-3 text-xs font-black shrink-0 shadow-[2px_2px_0px_0px_#000]"
          >
            {t('later', 'Plus tard')}
          </button>
        </div>
      </div>
    </div>
  );
}
