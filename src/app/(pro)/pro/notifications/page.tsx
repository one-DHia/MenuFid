'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { 
  Bell, 
  Send, 
  Sparkles, 
  ArrowLeft, 
  Users, 
  CheckCircle2, 
  Flame, 
  Gift, 
  Smartphone,
  Info,
  Laptop
} from 'lucide-react';
import ProFeatureLock from '@/components/ProFeatureLock';

export default function ProNotificationsPage() {
  const { t, language } = useLanguage();
  const { merchant, isLoading } = useAuth();
  const { showToast } = useToast();

  // Push Broadcast States
  const [subscribersCount, setSubscribersCount] = useState<number>(0);
  const [loadingSubs, setLoadingSubs] = useState<boolean>(true);
  const [pushTitle, setPushTitle] = useState<string>('');
  const [pushMessage, setPushMessage] = useState<string>('');
  const [pushUrl, setPushUrl] = useState<string>('');
  const [sendingPush, setSendingPush] = useState<boolean>(false);
  const [lastSentResult, setLastSentResult] = useState<any>(null);

  // Clients States
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState<boolean>(true);
  const [testingMyDevice, setTestingMyDevice] = useState<boolean>(false);

  useEffect(() => {
    if (merchant?.id && merchant?.plan_tier !== 'basic') {
      loadStatsAndSubscribers(merchant.id);
      loadCustomers(merchant.id);
      setPushUrl(`/wallet/${merchant.slug || ''}`);
    }
  }, [merchant?.id, merchant?.plan_tier]);

  async function loadStatsAndSubscribers(merchantId: string) {
    setLoadingSubs(true);
    try {
      const res = await fetch(`/api/push/stats?merchantId=${merchantId}`);
      if (res.ok) {
        const data = await res.json();
        setSubscribersCount(data.subscribersCount || 0);
      }
    } catch (e) {
      console.error('[ProNotifications] Erreur chargement abonnés:', e);
    } finally {
      setLoadingSubs(false);
    }
  }

  async function loadCustomers(merchantId: string) {
    setLoadingCustomers(true);
    try {
      const { data, error } = await supabase
        .from('loyalty_cards')
        .select(`
          id,
          stamps_count,
          total_visits,
          last_visit_at,
          customer:customers (
            id,
            full_name,
            phone,
            email,
            loyalty_code
          )
        `)
        .eq('merchant_id', merchantId)
        .order('last_visit_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (e) {
      console.error('[ProNotifications] Erreur chargement clients:', e);
    } finally {
      setLoadingCustomers(false);
    }
  }

  function applyPreset(presetType: 'happy_hour' | 'new_dish' | 'weekend' | 'gift_reminder') {
    const restoName = merchant?.business_name || (language === 'ar' ? 'مطعمنا' : language === 'en' ? 'our restaurant' : 'notre restaurant');
    if (language === 'ar') {
      switch (presetType) {
        case 'happy_hour':
          setPushTitle(`🔥 تخفيضات اليوم لدى ${restoName} !`);
          setPushMessage(`استفد من خصم 20% على أطباقنا الخاصة ابتداءً من الساعة 18:30. أهلاً بكم ! 🍕`);
          break;
        case 'new_dish':
          setPushTitle(`✨ طبق جديد في قائمة ${restoName} !`);
          setPushMessage(`اكتشف وصفتنا الحصرية الجديدة ابتداءً من اليوم في المطعم !`);
          break;
        case 'weekend':
          setPushTitle(`🎉 عطلة نهاية الأسبوع لدى ${restoName} !`);
          setPushMessage(`تعالوا لجمع أختام الوفاء والاستمتاع بطاولتكم المفضلة.`);
          break;
        case 'gift_reminder':
          setPushTitle(`🎁 أختامك بانتظارك لدى ${restoName} !`);
          setPushMessage(`أنت قريب جداً من الحصول على مكافأتك المجانية القادمة !`);
          break;
      }
    } else if (language === 'en') {
      switch (presetType) {
        case 'happy_hour':
          setPushTitle(`🔥 Happy Hour tonight at ${restoName}!`);
          setPushMessage(`Enjoy 20% off our specials starting at 6:30 PM. Come treat yourself! 🍕`);
          break;
        case 'new_dish':
          setPushTitle(`✨ New delicious dish on the menu at ${restoName}!`);
          setPushMessage(`Discover our new exclusive recipe starting today at the restaurant!`);
          break;
        case 'weekend':
          setPushTitle(`🎉 It's the weekend at ${restoName}!`);
          setPushMessage(`Come collect your loyalty stamps and enjoy your favorite table.`);
          break;
        case 'gift_reminder':
          setPushTitle(`🎁 Your stamps are waiting for you at ${restoName}!`);
          setPushMessage(`You are very close to your next free reward!`);
          break;
      }
    } else {
      switch (presetType) {
        case 'happy_hour':
          setPushTitle(`🔥 Happy Hour ce soir chez ${restoName} !`);
          setPushMessage(`Profitez de -20% sur nos spécialités dès 18h30. Venez vous régaler ! 🍕`);
          break;
        case 'new_dish':
          setPushTitle(`✨ Nouvelle pépite au menu chez ${restoName} !`);
          setPushMessage(`Découvrez notre nouvelle recette exclusive dès aujourd'hui au restaurant !`);
          break;
        case 'weekend':
          setPushTitle(`🎉 C'est le week-end chez ${restoName} !`);
          setPushMessage(`Venez cumuler vos tampons fidélité et profiter de votre table préférée.`);
          break;
        case 'gift_reminder':
          setPushTitle(`🎁 Vos tampons vous attendent chez ${restoName} !`);
          setPushMessage(`Vous êtes très proche de votre prochaine récompense offerte !`);
          break;
      }
    }
  }

  async function handleSendBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!merchant?.id) return;
    if (merchant?.plan_tier === 'basic') {
      showToast(t('feature_locked_title', 'Fonctionnalité réservée à la Formule PRO'), 'error');
      return;
    }

    if (!pushTitle.trim() || !pushMessage.trim()) {
      showToast(t('fill_all_fields', 'Veuillez remplir le titre et le message.'), 'error');
      return;
    }

    setSendingPush(true);
    setLastSentResult(null);

    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: merchant.id,
          title: pushTitle.trim(),
          message: pushMessage.trim(),
          url: pushUrl.trim() || `/wallet/${merchant.slug || ''}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Échec de la diffusion');
      }

      setLastSentResult(data);
      if (data.sentCount > 0) {
        showToast(`🚀 ${data.sentCount} ${t('push_sent_success', 'notification(s) envoyée(s) avec succès !')}`, 'success');
      } else {
        showToast(t('no_subscribers_found', 'Aucun appareil abonné pour le moment. Invitez vos clients à activer les alertes !'), 'info');
      }

      // Recharger les stats
      loadStatsAndSubscribers(merchant.id);
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l\'envoi de la notification push', 'error');
    } finally {
      setSendingPush(false);
    }
  }

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

  async function handleTestMyDevice() {
    if (!merchant?.id) return;
    setTestingMyDevice(true);
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        showToast(t('push_not_supported', 'Les notifications ne sont pas supportées par ce navigateur.'), 'error');
        setTestingMyDevice(false);
        return;
      }

      // 1. Demander la permission si non accordée
      let perm = Notification.permission;
      if (perm !== 'granted') {
        perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          showToast(
            perm === 'denied'
              ? 'Notifications bloquées dans votre navigateur. Veuillez les autoriser dans les paramètres du site.'
              : 'Permission de notification refusée.',
            'error'
          );
          setTestingMyDevice(false);
          return;
        }
      }

      // 2. Enregistrer le Service Worker et attendre qu'il soit prêt
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // 3. Obtenir ou créer la souscription Push
      let subscription = await registration.pushManager.getSubscription();
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!subscription && publicVapidKey) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });
      }

      if (!subscription) {
        throw new Error('Impossible de créer la souscription Push sur cet appareil.');
      }

      // 4. Envoyer la notification test via le backend VAPID
      const res = await fetch('/api/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          title: `🔔 Test MenuFid : ${merchant.business_name || 'Mon Établissement'}`,
          message: `Les notifications Web Push fonctionnent parfaitement sur cet écran ! 🚀`,
          url: `/wallet/${merchant.slug || ''}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Erreur lors de l\'envoi du test');
      }

      showToast(t('push_test_success_pro', 'Notification test envoyée sur cet appareil ! 📲'), 'success');
    } catch (err: any) {
      console.error('[Test Push Error]', err);
      showToast(err.message || 'Erreur lors du test', 'error');
    } finally {
      setTestingMyDevice(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Spinner size={36} className="text-black" />
      </div>
    );
  }

  if (merchant?.plan_tier === 'basic') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
        <header className="bg-white border-b-4 border-black p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link
              href="/pro/dashboard"
              className="inline-flex items-center gap-2 text-xs font-black text-black hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('back_to_dashboard_btn', 'Retour au tableau de bord')}</span>
            </Link>
            <LanguageSelector />
          </div>
        </header>
        <ProFeatureLock
          featureName={t('notifications_module_title', 'Notifications Web Push & CRM')}
          featureDesc={t('notifications_locked_desc', "L'envoi de messages push directement sur les smartphones de vos clients et le carnet de clients sont réservés aux établissements avec la formule PRO.")}
          icon={<Bell className="w-10 h-10 text-black" />}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black font-sans flex flex-col selection:bg-[#FFB800] selection:text-black">
      {/* Top Header Navigation */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/pro/dashboard"
              className="p-2 rounded-xl text-black hover:bg-[#FFB800] border-2 border-transparent hover:border-black transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FFB800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                <Bell className="w-4 h-4 text-black" />
              </div>
              <h1 className="font-black text-lg text-black tracking-tight">
                {t('notifications_and_broadcast', 'Notifications Web Push')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTestMyDevice}
              disabled={testingMyDevice}
              className="neo-pill-btn-white py-1.5 px-3 text-xs font-black hidden sm:flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]"
            >
              {testingMyDevice ? <Spinner size={14} className="text-black" /> : <Smartphone className="w-3.5 h-3.5" />}
              <span>{t('test_notification', 'Tester sur mon appareil')}</span>
            </button>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Banner Stats Abonnés */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="neo-box bg-[#FFB800] p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-black text-black uppercase tracking-wider">
                {t('webpush_subscribers', 'Abonnés Web Push')}
              </span>
              <p className="text-3xl font-black text-black">
                {loadingSubs ? '-' : subscribersCount}
              </p>
              <p className="text-[11px] font-bold text-neutral-800">
                {t('ready_to_receive', 'Appareils prêts à recevoir vos alertes')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
              <Bell className="w-6 h-6 text-black" />
            </div>
          </div>

          <div className="neo-box bg-white p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-black text-neutral-500 uppercase tracking-wider">
                {t('registered_loyalty_clients', 'Clients Fidélité')}
              </span>
              <p className="text-3xl font-black text-black">
                {loadingCustomers ? '-' : customers.length}
              </p>
              <p className="text-[11px] font-bold text-neutral-500">
                {t('cards_created', 'Cartes de fidélité créées')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-pink-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
              <Users className="w-6 h-6 text-black" />
            </div>
          </div>

          <div className="neo-box bg-[#00F59B] p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-black text-black uppercase tracking-wider">
                {t('auto_push_active', 'Push Automatiques')}
              </span>
              <p className="text-xl font-black text-black flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-black" />
                <span>{t('active_status', 'Actif 24/7')}</span>
              </p>
              <p className="text-[11px] font-bold text-neutral-800">
                {t('auto_push_subdesc', 'Tampons & Cadeaux débloqués envoyés en direct')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>

        {/* Section 1: Envoi de Diffusion Web Push */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Formulaire de Push Broadcast */}
          <div className="lg:col-span-7 space-y-6">
            <div className="neo-box bg-white p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b-2 border-black pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFB800] border-2 border-black text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_#000]">
                    <Flame className="w-3 h-3 text-black" />
                    <span>{t('broadcast_title', 'Diffusion Web Push Directe')}</span>
                  </div>
                  <h2 className="text-xl font-black text-black uppercase tracking-tight">
                    {t('send_push_to_clients', 'Envoyer une Notification Web à Vos Clients')}
                  </h2>
                </div>
              </div>

              {/* Modèles d'inspiration rapide */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-neutral-600 tracking-wider">
                  {t('quick_templates', '⚡ MODÈLES RAPIDES D\'OFFRES (CLIQUEZ POUR REMPLIR)')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('happy_hour')}
                    className="p-2.5 rounded-xl border-2 border-black bg-neutral-50 hover:bg-[#FFB800] text-left transition font-black text-xs space-y-1 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <div className="text-base">🔥</div>
                    <div className="leading-tight">Happy Hour</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('new_dish')}
                    className="p-2.5 rounded-xl border-2 border-black bg-neutral-50 hover:bg-[#93C5FD] text-left transition font-black text-xs space-y-1 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <div className="text-base">✨</div>
                    <div className="leading-tight">Nouveau Plat</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('weekend')}
                    className="p-2.5 rounded-xl border-2 border-black bg-neutral-50 hover:bg-[#00F59B] text-left transition font-black text-xs space-y-1 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <div className="text-base">🎉</div>
                    <div className="leading-tight">Week-end</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('gift_reminder')}
                    className="p-2.5 rounded-xl border-2 border-black bg-neutral-50 hover:bg-[#F9A8D4] text-left transition font-black text-xs space-y-1 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <div className="text-base">🎁</div>
                    <div className="leading-tight">Rappel Cadeau</div>
                  </button>
                </div>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-black mb-1">
                    {t('push_title_label', '* TITRE DE LA NOTIFICATION (COURT & ACCROCHEUR)')}
                  </label>
                  <input
                    type="text"
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                    placeholder="ex: 🔥 Offre Flash ce soir : -20% sur les burgers !"
                    className="w-full neo-input text-xs font-bold"
                    maxLength={100}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-black mb-1">
                    {t('push_message_label', '* MESSAGE COMPLET')}
                  </label>
                  <textarea
                    value={pushMessage}
                    onChange={(e) => setPushMessage(e.target.value)}
                    placeholder="ex: Venez savourer nos recettes exclusives et cumuler vos tampons dès 19h !"
                    rows={3}
                    className="w-full neo-input text-xs resize-none font-medium"
                    maxLength={300}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-black mb-1">
                    {t('push_url_label', 'LIEN DE DESTINATION AU CLIC')}
                  </label>
                  <input
                    type="text"
                    value={pushUrl}
                    onChange={(e) => setPushUrl(e.target.value)}
                    placeholder={`/wallet/${merchant?.slug || ''}`}
                    className="w-full neo-input text-xs font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={sendingPush || subscribersCount === 0}
                    className="neo-pill-btn w-full py-4 text-sm flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000] disabled:opacity-50"
                  >
                    {sendingPush ? (
                      <>
                        <Spinner size={20} className="text-black" />
                        <span>{t('sending_in_progress', 'Envoi en cours à tous les appareils...')}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>
                          {t('send_to_subscribers', 'Diffuser la notification à')} ({subscribersCount}) {t('devices', 'appareils')}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {lastSentResult && (
                  <div className="p-4 rounded-xl bg-green-50 border-2 border-black space-y-1">
                    <p className="text-xs font-black text-green-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-700" />
                      <span>{t('broadcast_complete', 'Diffusion terminée avec succès !')}</span>
                    </p>
                    <p className="text-[11px] text-green-800 font-bold">
                      {lastSentResult.sentCount} {t('successful_deliveries', 'notifications délivrées')} ({lastSentResult.totalSubscriptions} {t('registered_subs', 'abonnements totaux')})
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Aperçu Téléphone en Direct */}
          <div className="lg:col-span-5 space-y-6">
            <div className="neo-box bg-neutral-900 text-white p-6 sm:p-8 space-y-6 border-4 border-black shadow-[6px_6px_0px_0px_#FFB800]">
              <div className="flex items-center justify-between border-b border-neutral-700 pb-3">
                <span className="text-xs font-black text-[#FFB800] uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  {t('smartphone_preview', 'Aperçu Notification Web')}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">Mobile & Bureau</span>
              </div>

              {/* Mockup Notification Lock Screen */}
              <div className="bg-neutral-800/80 rounded-2xl p-4 border border-neutral-700 space-y-3 backdrop-blur-sm shadow-xl">
                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-[#FFB800] text-black flex items-center justify-center font-black text-[10px]">
                      M
                    </div>
                    <span className="font-bold text-neutral-200">
                      {merchant?.business_name || 'MenuFid'}
                    </span>
                  </div>
                  <span>{t('just_now', 'Maintenant')}</span>
                </div>

                <div className="space-y-1 pt-1">
                  <h4 className="text-xs font-black text-white leading-snug">
                    {pushTitle || t('preview_title_sample', '🔥 Offre Flash : -20% ce soir !')}
                  </h4>
                  <p className="text-[11px] text-neutral-300 font-normal leading-relaxed">
                    {pushMessage || t('preview_msg_sample', 'Venez profiter de votre cadeau fidélité et de nos plats faits maison dès 19h.')}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-700/60 flex items-center justify-between text-[10px] font-bold text-[#FFB800]">
                  <span>{pushUrl || `/wallet/${merchant?.slug || ''}`}</span>
                  <span>Ouvrir ➔</span>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-neutral-700 space-y-2 text-xs font-bold text-neutral-300">
                <div className="flex items-center gap-2 text-[#FFB800]">
                  <Sparkles className="w-4 h-4" />
                  <span>{t('how_it_works_title', 'Fonctionnement 100% Web')}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-neutral-400">
                  {t('how_it_works_desc', 'Les notifications Web Push sont intégrées nativement au navigateur (Safari, Chrome, Firefox). Aucun abonnement payant ni API externe n\'est requis.')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Clients Fidélité & Activité Web */}
        <div className="neo-box bg-white p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-200 border-2 border-black text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_#000]">
                <Users className="w-3 h-3 text-black" />
                <span>{t('registered_loyalty_clients', 'Clients & Cartes')}</span>
              </div>
              <h2 className="text-xl font-black text-black uppercase tracking-tight">
                {t('loyalty_members_title', 'Portefeuille des Clients Fidélité')}
              </h2>
              <p className="text-xs text-neutral-600 font-bold">
                {t('loyalty_members_desc', 'Retrouvez vos clients actifs et leurs tampons cumulés en direct.')}
              </p>
            </div>
          </div>

          {/* Liste des Clients */}
          {loadingCustomers ? (
            <div className="py-12 flex justify-center">
              <Spinner size={32} className="text-black" />
            </div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-neutral-300 rounded-xl space-y-2">
              <Users className="w-8 h-8 text-neutral-400 mx-auto" />
              <p className="text-xs font-bold text-neutral-500 uppercase">
                {t('no_customers_found', 'Aucun client enregistré pour le moment.')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers.map((card) => {
                const customer = card.customer;
                if (!customer) return null;
                const clientName = customer.full_name || 'Client VIP';

                return (
                  <div
                    key={card.id}
                    className="p-4 rounded-xl border-2 border-black bg-neutral-50 flex items-center justify-between gap-3 shadow-[2px_2px_0px_0px_#000]"
                  >
                    <div className="space-y-0.5">
                      <h4 className="font-black text-sm text-black">{clientName}</h4>
                      <p className="text-[11px] font-bold text-neutral-500">
                        {customer.phone || customer.email || `Code: ${customer.loyalty_code}`}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-bold">
                        {card.total_visits || 1} visite(s)
                      </p>
                    </div>

                    <div className="px-3 py-1.5 bg-[#00F59B] border-2 border-black rounded-xl text-center shrink-0 shadow-[1px_1px_0px_0px_#000]">
                      <span className="text-base font-black text-black block leading-none">
                        {card.stamps_count} 🎫
                      </span>
                      <span className="text-[9px] text-black uppercase font-black">Tampons</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
