'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { walletService, WalletCardWithMerchant } from '@/lib/services/walletService';
import { Spinner } from '@/components/ui/Spinner';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { 
  Wallet, 
  Sparkles, 
  ChevronRight, 
  LogOut, 
  Store
} from 'lucide-react';
import { PushNotificationManager } from '@/components/PushNotificationManager';

export default function CustomerWalletDashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [cards, setCards] = useState<WalletCardWithMerchant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedId = localStorage.getItem('menufid_customer_id');
      const storedPhone = localStorage.getItem('menufid_customer_phone');
      const storedName = localStorage.getItem('menufid_customer_name');

      if (!storedId) {
        const match = document.cookie.match(/menufid_customer_id=([^;]+)/);
        if (match && match[1]) {
          storedId = match[1];
          localStorage.setItem('menufid_customer_id', storedId);
        }
      }

      if (!storedId) {
        router.push('/wallet/auth');
        return;
      }

      // Renouveler la validité permanente (10 ans)
      const isProduction = window.location.protocol === 'https:';
      const secureFlag = isProduction ? '; Secure' : '';
      document.cookie = `menufid_customer_id=${storedId}; path=/; max-age=315360000; SameSite=Lax${secureFlag}`;

      setCustomerId(storedId);
      setCustomerPhone(storedPhone || '');
      setCustomerName(storedName || t('my_account', 'Mon Compte'));

      loadCards(storedId);
    }
  }, [router]);

  useEffect(() => {
    let interval: any = null;
    
    if (customerId) {
      interval = setInterval(async () => {
        try {
          const walletCards = await walletService.getCustomerWalletCards(customerId);
          
          setCards((prev: any) => {
            // Détection de l'ajout de tampons pour vibration haptique native
            const prevTotalStamps = prev.reduce((acc: number, c: any) => acc + (c.stamps_count || 0), 0);
            const newTotalStamps = walletCards.reduce((acc: number, c: any) => acc + (c.stamps_count || 0), 0);

            if (newTotalStamps > prevTotalStamps && prevTotalStamps > 0) {
              if ((window as any).MenuFidAndroid?.notifyStampAdded) {
                (window as any).MenuFidAndroid.notifyStampAdded();
              }
            }

            // Vérifier s'il y a un changement pour éviter les re-rendus inutiles
            const prevStr = JSON.stringify(prev.map((c: any) => ({ id: c.id, stamps: c.stamps_count })));
            const newStr = JSON.stringify(walletCards.map((c: any) => ({ id: c.id, stamps: c.stamps_count })));
            
            if (prevStr !== newStr) {
              return walletCards;
            }
            return prev;
          });
        } catch (e) {
          // Ignorer silencieusement
        }
      }, 5000); // Mise à jour toutes les 5 secondes sur la vue globale
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [customerId]);

  async function loadCards(cId: string) {
    setLoading(true);
    try {
      const walletCards = await walletService.getCustomerWalletCards(cId);
      setCards(walletCards);
    } catch (e) {
      console.error('[CustomerWallet] Erreur:', e);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('menufid_customer_id');
      localStorage.removeItem('menufid_customer_phone');
      localStorage.removeItem('menufid_customer_name');
      document.cookie = 'menufid_customer_id=; path=/; max-age=0';
      if ((window as any).MenuFidAndroid?.onCustomerLoggedOut) {
        (window as any).MenuFidAndroid.onCustomerLoggedOut();
      }
    }
    router.push('/wallet/auth');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Spinner size={36} className="text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black font-sans flex flex-col pb-12 selection:bg-[#FFB800] selection:text-black">
      {/* Top Header */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFB800] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
              <Wallet className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="font-black text-sm text-black tracking-tight leading-tight">{t('wallet_client_title', 'Portefeuille Client')}</h1>
              <p className="text-[11px] text-neutral-600 font-mono font-bold">{customerPhone || customerName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-black hover:bg-rose-100 border-2 border-transparent hover:border-black transition"
              title={t('logout', 'Déconnexion')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Push Notifications Prompt */}
        <PushNotificationManager customerId={customerId} />

        {/* Banner Welcome */}
        <div className="neo-box p-6 space-y-3 bg-white">
          <div className="neo-badge-yellow text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('mobile_loyalty', 'Fidélité Mobile')}</span>
          </div>
          <h2 className="text-2xl font-black text-black">
            {t('my_loyalty_cards', 'Mes Cartes de Fidélité')} ({cards.length})
          </h2>
          <p className="text-neutral-600 text-xs font-bold">
            {t('present_qr_code_to_accumulate_stamps', 'Présentez votre QR Code en caisse pour cumuler vos tampons et débloquer vos cadeaux.')}
          </p>
        </div>

        {/* Cards List */}
        {cards.length === 0 ? (
          <div className="neo-box p-12 text-center space-y-4 bg-white border-dashed border-4">
            <Store className="w-12 h-12 text-neutral-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-black text-base text-black uppercase tracking-tight">{t('no_card_saved', 'Aucune carte enregistrée')}</h3>
              <p className="text-neutral-600 font-bold text-xs">
                {t('scan_qr_code_to_add_card', 'Scannez le QR Code dans votre restaurant pour ajouter sa carte !')}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((card) => {
              const merchant = card.merchant;
              if (!merchant) return null;

              return (
                <Link
                  key={card.id}
                  href={`/wallet/${merchant.slug}`}
                  className="block neo-box neo-box-hover p-5 bg-white space-y-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      {merchant.logo_url ? (
                        <img
                          src={merchant.logo_url}
                          alt={merchant.business_name}
                          className="w-14 h-14 rounded-xl object-cover border-2 border-black shrink-0 shadow-[2px_2px_0px_0px_#000]"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-pink-300 border-2 border-black flex items-center justify-center text-black font-black text-xl shrink-0 shadow-[2px_2px_0px_0px_#000]">
                          {merchant.business_name?.[0] || 'R'}
                        </div>
                      )}

                      <div className="space-y-0.5">
                        <h3 className="font-black text-base text-black group-hover:underline uppercase tracking-tight">
                          {merchant.business_name}
                        </h3>
                        <p className="text-neutral-600 text-xs font-bold flex items-center gap-1.5">
                          <span>{merchant.city || t('restaurant', 'Restaurant')}</span>
                          <span>•</span>
                          <span>{card.total_visits} {t('visits', 'visite(s)')}</span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#00F59B] border-2 border-black px-4 py-2 rounded-xl text-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                      <span className="text-xl font-black text-black block leading-tight">
                        {card.stamps_count} 🎫
                      </span>
                      <span className="text-[10px] text-black uppercase tracking-wider font-black">{t('stamps', 'Tampons')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t-2 border-black text-xs font-black uppercase text-black">
                    <span>{t('open_card_menu', 'Ouvrir la carte & le menu')}</span>
                    <ChevronRight className="w-4 h-4 text-black" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
