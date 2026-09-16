'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { walletService } from '@/lib/services/walletService';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { 
  Scan, 
  Phone, 
  CheckCircle2, 
  ArrowLeft, 
  Plus, 
  Minus,
  Award,
  Search,
  Camera,
  Gift,
  Check
} from 'lucide-react';

const Html5QrcodePlugin = dynamic(() => import('@/components/Html5QrcodePlugin'), { ssr: false });
import ProFeatureLock from '@/components/ProFeatureLock';
import ProBottomNav from '@/components/ProBottomNav';

export default function ProScannerPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();
  const { merchant, isLoading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !merchant) {
      router.replace('/pro/login');
    }
  }, [mounted, isLoading, merchant, router]);

  const [identifier, setIdentifier] = useState('');
  const [searching, setSearching] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<any>(null);
  const [currentCard, setCurrentCard] = useState<any>(null);
  const [addingStamp, setAddingStamp] = useState(false);
  const [claimingRewardId, setClaimingRewardId] = useState<string | null>(null);
  const [successAnimation, setSuccessAnimation] = useState(false);

  async function lookupCustomer(code: string) {
    let cleanCode = code.trim();
    if (merchant?.plan_tier === 'basic') {
      showToast(t('feature_locked_title', 'Fonctionnalité réservée à la Formule PRO'), 'error');
      return;
    }
    if (!cleanCode || !merchant?.id) {
      showToast(t('enter_valid_code', 'Entrez un code fidélité client valide (ex: ABC-123)'), 'error');
      return;
    }

    // Si le scan est une URL (ex: https://menufid.site/wallet/shop?code=4G5-6Y3)
    if (cleanCode.includes('http://') || cleanCode.includes('https://')) {
      try {
        const url = new URL(cleanCode);
        const codeParam = url.searchParams.get('code') || url.searchParams.get('customerId') || url.searchParams.get('c');
        if (codeParam) {
          cleanCode = codeParam;
        } else {
          const segments = url.pathname.split('/').filter(Boolean);
          if (segments.length > 0) {
            cleanCode = segments[segments.length - 1];
          }
        }
      } catch (e) {}
    }

    setIdentifier(cleanCode);
    setSearching(true);
    setSuccessAnimation(false);
    try {
      const cust = await walletService.getOrCreateCustomer(cleanCode, undefined);
      setCurrentCustomer(cust);

      const card = await walletService.getMerchantLoyaltyCard(cust.id, merchant.id);
      setCurrentCard(card);

      showToast(t('client_selected', 'Client sélectionné !').replace('{name}', cust.full_name || cust.loyalty_code || cust.phone || cust.email || ''), 'success');
    } catch (err: any) {
      showToast(err.message || t('client_not_found', 'Client introuvable avec ce code'), 'error');
    } finally {
      setSearching(false);
    }
  }

  async function handleSearchOrAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    await lookupCustomer(identifier);
  }

  async function handleCreditStamp(count: number = 1) {
    if (!currentCustomer || !merchant?.id) return;
    setAddingStamp(true);
    try {
      const prevStamps = currentCard?.stamps_count || 0;
      const res = await walletService.addStampToCard(merchant.id, currentCustomer.id, count);
      if (res.success) {
        const newStamps = res.stampsCount;
        setCurrentCard((prev: any) => ({
          ...prev,
          stamps_count: newStamps,
          total_visits: (prev?.total_visits || 0) + 1,
        }));

        setSuccessAnimation(true);
        showToast(`+${count} ${t('stamps_credited', 'Tampon(s) crédités ! Nouveau solde :')} ${newStamps} 🎫`, 'success');

        // Déclencher la notification Web Push instantanée au client
        try {
          const restaurantName = merchant.business_name || 'Votre restaurant';
          const unlockedReward = currentCard?.rewards?.find(
            (r: any) => r.stamps_required <= newStamps && r.stamps_required > prevStamps
          );

          let pushTitle = `🎁 +${count} Tampon${count > 1 ? 's' : ''} validé${count > 1 ? 's' : ''} chez ${restaurantName} !`;
          let pushMessage = `Votre nouveau solde est de ${newStamps} tampons. Merci de votre visite !`;

          if (unlockedReward) {
            pushTitle = `🎉 Cadeau débloqué chez ${restaurantName} !`;
            pushMessage = `Félicitations ! Vous avez débloqué : "${unlockedReward.title}". Venez vite le savourer !`;
          }

          fetch('/api/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerId: currentCustomer.id,
              title: pushTitle,
              message: pushMessage,
              url: `/wallet/${merchant.slug || ''}`,
            }),
          }).catch(console.error);
        } catch (pushErr) {
          console.error('[Scanner] Push notification error:', pushErr);
        }

        setTimeout(() => setSuccessAnimation(false), 2500);
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur', 'error');
    } finally {
      setAddingStamp(false);
    }
  }

  async function handleDebitStamp(count: number = 1) {
    if (!currentCustomer || !merchant?.id || !currentCard || (currentCard.stamps_count || 0) <= 0) return;
    setAddingStamp(true);
    try {
      const newCount = Math.max(0, (currentCard.stamps_count || 0) - count);
      const { error } = await supabase
        .from('loyalty_cards')
        .update({ stamps_count: newCount })
        .eq('id', currentCard.id);

      if (error) throw error;

      await supabase.from('stamp_transactions').insert({
        loyalty_card_id: currentCard.id,
        merchant_id: merchant.id,
        stamps_change: -count,
        note: 'Correction de tampon en caisse (-1)',
      });

      setCurrentCard((prev: any) => ({
        ...prev,
        stamps_count: newCount,
      }));

      showToast(`Correction : -${count} tampon (Solde : ${newCount})`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Erreur', 'error');
    } finally {
      setAddingStamp(false);
    }
  }

  async function handleClaimRewardForCustomer(reward: any) {
    if (!currentCustomer || !merchant?.id || !currentCard) return;

    if (currentCard.stamps_count < reward.stamps_required) {
      showToast(
        t('error_not_enough_stamps', 'Le client a besoin de {0} tampons pour ce cadeau').replace('{0}', reward.stamps_required.toString()),
        'error'
      );
      return;
    }

    const confirmMsg = t('confirm_offer_reward', 'Voulez-vous déduire {0} tampons pour offrir "{1}" ?')
      .replace('{0}', reward.stamps_required.toString())
      .replace('{1}', reward.title);

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setClaimingRewardId(reward.id);
    try {
      const res = await walletService.claimReward(merchant.id, currentCustomer.id, reward.id, reward.stamps_required);
      if (res.success) {
        setCurrentCard((prev: any) => ({
          ...prev,
          stamps_count: res.remainingStamps,
        }));

        showToast(
          t('cashier_reward_claimed_success', 'Récompense accordée avec succès : {0} ! 🎁').replace('{0}', reward.title),
          'success'
        );

        // Notification push vers le téléphone du client
        try {
          fetch('/api/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerId: currentCustomer.id,
              title: `✨ Cadeau validé chez ${merchant.business_name} !`,
              message: `Votre cadeau "${reward.title}" a été validé en caisse. Bon régal !`,
              url: `/wallet/${merchant.slug || ''}`,
            }),
          }).catch(console.error);
        } catch (e) {}
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la réclamation du cadeau', 'error');
    } finally {
      setClaimingRewardId(null);
    }
  }

  function resetScanner() {
    setIdentifier('');
    setCurrentCustomer(null);
    setCurrentCard(null);
    setSuccessAnimation(false);
  }

  if (!mounted || isLoading || !merchant) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Spinner size={36} className="text-black" />
      </div>
    );
  }

  if (merchant.plan_tier === 'basic') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
        <header className="bg-white border-b-4 border-black p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
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
          featureName={t('scanner_module_title', 'Scanner Caissier & Tampons')}
          featureDesc={t('scanner_locked_desc', "Le scanner de caisse pour créditer des tampons et valider les récompenses des clients fait partie de la formule PRO.")}
          icon={<Scan className="w-10 h-10 text-black" />}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black font-sans flex flex-col selection:bg-[#FFB800] selection:text-black pb-28 sm:pb-12">
      <header className="border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/pro/dashboard"
              className="p-2 rounded-xl text-black hover:bg-[#FFB800] border-2 border-transparent hover:border-black transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-black text-lg text-black tracking-tight flex items-center gap-2">
              <Scan className="w-5 h-5" />
              <span>{t('scanner_title', 'Web Scanner Caissier')}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector />
            {currentCustomer && (
              <button
                onClick={resetScanner}
                className="text-xs font-black text-black bg-[#FFB800] px-3 py-1.5 rounded border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition hidden sm:block"
              >
                {t('new_client', 'Nouveau Client')}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-8 space-y-6">
        {!currentCustomer ? (
          <div className="neo-box bg-white p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-xl bg-[#FFB800] border-2 border-black text-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#000]">
                <Search className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-black uppercase tracking-tight">{t('identify_client', 'Identifier le Client')}</h2>
              <p className="text-neutral-600 font-bold text-xs">
                {t('identify_client_desc', 'Entrez le code fidélité du client (ex: ABC-123) ou son numéro de téléphone pour tamponner et débloquer ses cadeaux.')}
              </p>
            </div>

            <form onSubmit={handleSearchOrAddCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wider">{t('client_code_label', 'Code Fidélité Client ou Téléphone *')}</label>
                <div className="relative">
                  <Search className="w-5 h-5 text-black absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="ex: 4G5-6Y3 ou 06XXXXXXXX"
                    className="w-full neo-input text-sm pl-11 uppercase font-mono tracking-wider"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={searching}
                className="neo-pill-btn w-full py-3.5 text-sm flex justify-center gap-2"
              >
                {searching ? (
                  <Spinner size={20} className="text-black" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>{t('search_create_card', 'Rechercher le Client')}</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t-2 border-dashed border-neutral-300"></div>
                <span className="flex-shrink-0 mx-4 text-neutral-400 font-bold text-xs">{t('or', 'OU')}</span>
                <div className="flex-grow border-t-2 border-dashed border-neutral-300"></div>
              </div>

              {isScanning ? (
                <div className="bg-black/5 rounded-xl p-4 border-2 border-black border-dashed">
                  <Html5QrcodePlugin
                    fps={10}
                    qrbox={250}
                    qrCodeSuccessCallback={(decodedText) => {
                      setIsScanning(false);
                      lookupCustomer(decodedText);
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => setIsScanning(false)}
                    className="mt-4 w-full neo-pill-btn-white py-2 text-sm text-center block"
                  >
                    {t('close_camera', 'Fermer la caméra')}
                  </button>
                </div>
              ) : (
                <button 
                  type="button" 
                  onClick={() => setIsScanning(true)}
                  className="w-full neo-pill-btn bg-black text-white py-3 flex items-center justify-center gap-2 text-xs"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t('scan_with_camera', 'Scanner un QR code avec la caméra')}</span>
                </button>
              )}
            </form>
          </div>
        ) : (
          <div className="neo-box bg-white p-6 sm:p-8 space-y-6 text-center relative overflow-hidden">
            {successAnimation && (
              <div className="absolute inset-0 bg-[#00F59B]/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 animate-fade-in z-20">
                <CheckCircle2 className="w-20 h-20 text-black animate-bounce" />
                <span className="text-2xl font-black text-black drop-shadow-md">
                  {t('stamp_validated', '+1 TAMPON VALIDÉ !')}
                </span>
              </div>
            )}

            {/* Client Profile Header */}
            <div className="space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#FFB800] border-2 border-black text-black flex items-center justify-center mx-auto font-black text-xl shadow-[2px_2px_0px_0px_#000]">
                {currentCustomer.full_name?.[0] || 'C'}
              </div>
              <h2 className="text-xl font-black text-black uppercase">{currentCustomer.full_name || t('vip_client', 'Client VIP')}</h2>
              <div className="inline-block bg-pink-200 border-2 border-black px-3 py-1 rounded-lg shadow-[2px_2px_0px_0px_#000]">
                <p className="font-mono font-black text-sm tracking-widest text-black">
                  {currentCustomer.loyalty_code || currentCustomer.phone || currentCustomer.email}
                </p>
              </div>
            </div>

            {/* Stamps Balance */}
            <div className="border-4 border-dashed border-black p-5 bg-neutral-50 space-y-2">
              <span className="text-xs font-black text-black uppercase tracking-wider">{t('stamps_balance', 'Solde de tampons')}</span>
              <div className="flex items-center justify-center gap-2">
                <Award className="w-8 h-8 text-black" />
                <span className="text-5xl font-black text-black">{currentCard?.stamps_count || 0}</span>
              </div>
              <p className="text-[11px] font-bold text-neutral-600 pt-1">
                {t('total_visits', 'Nombre total de visites :')} <strong className="text-black">{currentCard?.total_visits || 0}</strong>
              </p>
            </div>

            {/* Actions: Add / Remove Stamps */}
            <div className="space-y-3 pt-1">
              <button
                onClick={() => handleCreditStamp(1)}
                disabled={addingStamp}
                className="w-full py-4 bg-[#00F59B] border-3 border-black text-black font-black text-base shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {addingStamp ? (
                  <Spinner size={24} className="text-black" />
                ) : (
                  <>
                    <Plus className="w-6 h-6" />
                    <span>{t('add_1_stamp', 'AJOUTER 1 TAMPON (+1)')}</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleCreditStamp(2)}
                  disabled={addingStamp}
                  className="py-2.5 bg-white border-2 border-black text-black font-black text-xs shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
                >
                  +2 Tampons
                </button>
                <button
                  onClick={() => handleDebitStamp(1)}
                  disabled={addingStamp || (currentCard?.stamps_count || 0) <= 0}
                  className="py-2.5 bg-rose-100 border-2 border-black text-rose-900 font-black text-xs shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition disabled:opacity-40"
                  title="Corriger si erreur"
                >
                  -1 Tampon
                </button>
                <button
                  onClick={resetScanner}
                  className="py-2.5 bg-black border-2 border-black text-white font-black text-xs shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
                >
                  {t('next_client', 'Suivant ➔')}
                </button>
              </div>
            </div>

            {/* ── Section Récompenses Disponibles pour ce Client ── */}
            <div className="pt-4 border-t-4 border-black text-left space-y-4">
              <h3 className="font-black text-sm uppercase tracking-tight flex items-center gap-2">
                <Gift className="w-4 h-4 text-black" />
                <span>{t('available_rewards_for_client', 'Cadeaux & Récompenses du Client')}</span>
              </h3>

              {(!currentCard?.rewards || currentCard.rewards.length === 0) ? (
                <div className="p-4 bg-neutral-100 border-2 border-black border-dashed rounded-xl text-center text-xs font-bold text-neutral-500">
                  {t('no_active_rewards', 'Aucun cadeau configuré pour ce restaurant.')}
                </div>
              ) : (
                <div className="space-y-3">
                  {currentCard.rewards.map((reward: any) => {
                    const canClaim = (currentCard?.stamps_count || 0) >= reward.stamps_required;
                    const missingStamps = reward.stamps_required - (currentCard?.stamps_count || 0);

                    return (
                      <div
                        key={reward.id}
                        className={`p-4 rounded-xl border-3 border-black transition ${
                          canClaim 
                            ? 'bg-amber-50 shadow-[3px_3px_0px_0px_#000]' 
                            : 'bg-neutral-50 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-[10px] px-2 py-0.5 rounded border border-black bg-[#FFB800]">
                                {reward.stamps_required} {t('stamps_uppercase', 'TAMPONS')}
                              </span>
                              <h4 className="font-black text-sm uppercase tracking-tight">{reward.title}</h4>
                            </div>
                            {reward.description && (
                              <p className="text-neutral-600 text-xs font-bold">{reward.description}</p>
                            )}
                          </div>
                        </div>

                        {canClaim ? (
                          <button
                            onClick={() => handleClaimRewardForCustomer(reward)}
                            disabled={claimingRewardId === reward.id}
                            className="w-full py-2.5 px-4 bg-[#00F59B] hover:bg-emerald-400 border-2 border-black text-black font-black text-xs uppercase tracking-wider rounded-lg shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition flex items-center justify-center gap-2"
                          >
                            {claimingRewardId === reward.id ? (
                              <Spinner size={16} className="text-black" />
                            ) : (
                              <>
                                <Gift className="w-4 h-4" />
                                <span>{t('cashier_validate_reward', 'Valider & Offrir ce cadeau 🎁')} (-{reward.stamps_required} tampons)</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="py-2 px-3 bg-neutral-200/80 rounded-lg text-center text-[11px] font-black text-neutral-600">
                            🔒 {t('stamps_missing_count', 'Plus que {0} tampon(s)').replace('{0}', missingStamps.toString())}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <ProBottomNav />
    </div>
  );
}
