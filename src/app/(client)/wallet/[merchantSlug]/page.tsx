'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { walletService } from '@/lib/services/walletService';
import { useToast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { 
  Utensils, 
  Award, 
  Gift, 
  ArrowLeft, 
  Search, 
  MapPin,
  Info,
  X,
  Plus
} from 'lucide-react';
import type { Merchant, Category, MenuItem, Reward } from '@/types';
import { PushNotificationManager } from '@/components/PushNotificationManager';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { getLocalizedText, parseMultilingualText } from '@/lib/multilingual';
import { formatPrice } from '@/lib/currency';

const NEO_COLORS = ['bg-[#FFB800]', 'bg-[#93C5FD]', 'bg-[#F9A8D4]', 'bg-[#00F59B]'];

export default function RestaurantCustomerViewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isScan = searchParams.get('scan') === 'true';
  const merchantSlug = params.merchantSlug as string;
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'menu' | 'loyalty'>(
    searchParams.get('tab') === 'menu' ? 'menu' : 'loyalty'
  );
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Customer Loyalty Info
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loyaltyCard, setLoyaltyCard] = useState<any>(null);
  const [cardPage, setCardPage] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedId = localStorage.getItem('menufid_customer_id');
      if (!storedId) {
        const match = document.cookie.match(/menufid_customer_id=([^;]+)/);
        if (match && match[1]) {
          storedId = match[1];
          localStorage.setItem('menufid_customer_id', storedId);
        }
      }
      setCustomerId(storedId);

      if (storedId) {
        const isProduction = window.location.protocol === 'https:';
        const secureFlag = isProduction ? '; Secure' : '';
        document.cookie = `menufid_customer_id=${storedId}; path=/; max-age=315360000; SameSite=Lax${secureFlag}`;
      }

      if (merchantSlug) {
        localStorage.setItem('menufid_last_merchant_slug', merchantSlug);
      }
    }
  }, [isScan, merchantSlug]);

  useEffect(() => {
    if (merchantSlug) {
      loadMerchantData();
    }
  }, [merchantSlug]);

  useEffect(() => {
    // Polling pour la synchronisation en temps réel des tampons (vérifie toutes les 3 secondes)
    let interval: any = null;
    
    if (customerId && merchant?.id) {
      interval = setInterval(async () => {
        try {
          const card = await walletService.getMerchantLoyaltyCard(customerId, merchant.id);
          if (card) {
            setLoyaltyCard((prev: any) => {
              if (!prev || prev.stamps_count !== card.stamps_count || prev.total_visits !== card.total_visits) {
                if (prev && card.stamps_count > prev.stamps_count) {
                  if ((window as any).MenuFidAndroid?.notifyStampAdded) {
                    (window as any).MenuFidAndroid.notifyStampAdded();
                  }
                }
                return card;
              }
              return prev;
            });
          }
        } catch (e) {
          // Ignorer les erreurs de polling silencieusement
        }
      }, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [customerId, merchant?.id]);

  async function loadMerchantData() {
    setLoading(true);
    try {
      const { data: merch, error: merchErr } = await supabase
        .from('merchants')
        .select('*')
        .eq('slug', merchantSlug)
        .single();

      if (merchErr || !merch) {
        showToast(t('error_restaurant_not_found', 'Restaurant non trouvé'), 'error');
        setLoading(false);
        return;
      }

      setMerchant(merch);

      // Si l'établissement est sur la formule Starter (Menu QR sans fidélité), rediriger vers le menu digital
      if (merch.plan_tier === 'basic') {
        router.replace(`/menu/${merchantSlug}`);
        return;
      }

      // Charger Catégories, Plats et Récompenses
      const [catsRes, itemsRes, rewardsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('merchant_id', merch.id).eq('is_active', true).order('display_order', { ascending: true }),
        supabase.from('menu_items').select('*').eq('merchant_id', merch.id).eq('is_available', true),
        supabase.from('rewards').select('*').eq('merchant_id', merch.id).eq('is_active', true).order('stamps_required', { ascending: true }),
      ]);

      setCategories(catsRes.data || []);
      setItems(itemsRes.data || []);
      setRewards(rewardsRes.data || []);

      // Si le client est connecté, charger ou initialiser sa carte de fidélité
      if (customerId) {
        const card = await walletService.getMerchantLoyaltyCard(customerId, merch.id);
        setLoyaltyCard(card);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Spinner size={36} className="text-black" />
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-black flex items-center justify-center p-4">
        <div className="text-center space-y-4 neo-box bg-white p-8 max-w-sm w-full">
          <p className="font-black text-sm uppercase">{t('error_restaurant_not_found', 'Restaurant introuvable.')}</p>
          <Link href="/wallet" className="text-blue-600 font-black text-xs hover:underline block uppercase">
            {t('back_to_home', 'Retourner à l\'accueil')}
          </Link>
        </div>
      </div>
    );
  }

  if (merchant.is_suspended) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-black flex items-center justify-center p-4 font-sans">
        <div className="text-center space-y-4 neo-box bg-white p-8 max-w-md w-full border-4 border-black shadow-[6px_6px_0px_0px_#000]">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-black flex items-center justify-center mx-auto text-3xl shadow-[3px_3px_0px_0px_#000]">
            🍽️
          </div>
          <h2 className="text-xl font-black uppercase text-black">{merchant.business_name}</h2>
          <span className="inline-block bg-[#FFB800] text-black text-[10px] font-black uppercase px-3 py-1 rounded-full border border-black shadow-[2px_2px_0px_0px_#000]">
            {t('service_unavailable', 'Service Temporairement Indisponible')}
          </span>
          <p className="text-xs font-bold text-neutral-600">
            {t('merchant_suspended_public_desc', 'La carte de fidélité et le menu digital de cet établissement sont momentanément indisponibles.')}
          </p>
          <Link href="/wallet" className="neo-pill-btn text-xs py-2.5 px-6 inline-block mt-2">
            {t('back_to_wallet', 'Retourner à mon portefeuille')}
          </Link>
        </div>
      </div>
    );
  }

  const isSearching = searchQuery.trim().length > 0;
  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCat === 'all' || item.category_id === selectedCat;
    if (!matchesCat) return false;
    
    if (isSearching) {
      const q = searchQuery.toLowerCase().trim();
      const locName = getLocalizedText(item.name, language).toLowerCase();
      const rawName = (item.name || '').toLowerCase();
      const locDesc = getLocalizedText(item.description || '', language).toLowerCase();
      const rawDesc = (item.description || '').toLowerCase();
      return locName.includes(q) || rawName.includes(q) || locDesc.includes(q) || rawDesc.includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black font-sans flex flex-col pb-24 selection:bg-[#FFB800] selection:text-black relative">
      {/* Floating Language Selector */}
      <div className="absolute top-[max(0.75rem,calc(env(safe-area-inset-top)+0.5rem))] right-4 z-[60]">
        <LanguageSelector />
      </div>

      {/* Header Banner with Restaurant Theme Color */}
      <div 
        className="border-b-4 border-black p-6 sm:p-8 space-y-4 pt-[max(2.5rem,calc(env(safe-area-inset-top)+1.5rem))] sm:pt-8"
        style={{ backgroundColor: merchant.primary_color || '#FFB800' }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/wallet"
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border-2 border-black bg-white hover:bg-neutral-100 transition shadow-[2px_2px_0px_0px_#000] text-xs font-black uppercase"
            title={t('all_cards', 'Mes Cartes')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('all_cards', 'Mes Cartes')}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider bg-white px-3 py-1 rounded-full border-2 border-black shadow-[1px_1px_0px_0px_#000]">
              {merchant.city || t('restaurant_partner', 'Restaurant Partenaire')}
            </span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto flex items-center gap-4 pt-2">
          {merchant.logo_url ? (
            <img
              src={merchant.logo_url}
              alt={merchant.business_name}
              className="w-16 h-16 rounded-xl object-cover border-2 border-black shadow-[2px_2px_0px_0px_#000] shrink-0 bg-white"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-white border-2 border-black flex items-center justify-center font-black text-2xl shadow-[2px_2px_0px_0px_#000] shrink-0">
              {merchant.business_name?.[0] || 'R'}
            </div>
          )}

          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight">{merchant.business_name}</h1>
            <p className="text-xs font-bold flex items-center gap-1.5 opacity-90">
              <MapPin className="w-3.5 h-3.5" />
              <span>{merchant.city || t('city', 'Ville')}, {merchant.country || t('country', 'Pays')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Fidélité & Menu) */}
      <div className="sticky top-0 z-40 bg-white border-b-4 border-black shadow-sm">
        <div className="max-w-3xl mx-auto flex">
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`flex-1 py-4 font-black text-xs sm:text-sm text-center border-r-4 border-black transition flex items-center justify-center gap-2 uppercase tracking-wider ${
              activeTab === 'loyalty'
                ? 'bg-[#00F59B] text-black shadow-inner'
                : 'text-black hover:bg-neutral-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{t('tab_loyalty', 'Carte Fidélité')} ({loyaltyCard?.stamps_count || 0}/10)</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-4 font-black text-xs sm:text-sm text-center transition flex items-center justify-center gap-2 uppercase tracking-wider ${
              activeTab === 'menu'
                ? 'bg-[#FFB800] text-black shadow-inner'
                : 'text-black hover:bg-neutral-100'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>{t('tab_menu', 'Menu')} ({items.length})</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">
        {/* Push Notifications Prompt */}
        <PushNotificationManager customerId={customerId} />

        {activeTab === 'menu' ? (
          /* ── ONGLET 1 : MENU DIGITAL MULTILINGUE SYNCHRONISÉ ── */
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-5 h-5 text-black absolute left-4 top-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length > 0) {
                    setActiveCategory(null);
                  }
                }}
                placeholder={t('search_dish', 'Rechercher un plat...')}
                className="w-full bg-white border-4 border-black rounded-none p-4 pl-12 text-lg font-bold shadow-[4px_4px_0px_0px_#000] focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
              />
            </div>

            {/* CATEGORIES GRID (Home view when not searching & no active category) */}
            {searchQuery.trim().length === 0 && activeCategory === null && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {categories.map((cat, index) => {
                  const colorClass = NEO_COLORS[index % NEO_COLORS.length];
                  const count = items.filter(i => i.category_id === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full group relative overflow-hidden rounded-2xl border-4 border-black ${colorClass} min-h-[160px] sm:min-h-[175px] h-full flex flex-col justify-between p-5 sm:p-6 transition-all duration-300 shadow-[6px_6px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none text-left`}
                    >
                      <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:16px_16px]"></div>
                      
                      <div className="relative z-10 w-full mb-3">
                        <h3 className="font-black text-lg sm:text-xl md:text-2xl uppercase tracking-tight text-black leading-snug break-words">
                          {getLocalizedText(cat.name, language)}
                        </h3>
                      </div>

                      <div className="relative z-10 w-full flex justify-between items-center pt-2">
                        <p className="font-bold text-xs sm:text-sm text-black bg-white/80 backdrop-blur-sm inline-block px-2.5 py-1 border-2 border-black rounded shadow-[2px_2px_0px_0px_#000]">
                          {language === 'ar' 
                            ? `${count} ${count > 1 ? t('items', 'أطباق') : t('item', 'طبق')}`
                            : `${count} ${count > 1 ? t('items', 'articles') : t('item', 'article')}`}
                        </p>
                        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white shrink-0 flex items-center justify-center border-3 border-black group-hover:bg-black group-hover:text-white transition-all shadow-[2px_2px_0px_0px_#000]">
                          <ArrowLeft className="w-5 h-5 rotate-180" />
                        </div>
                      </div>
                    </button>
                  );
                })}
                {categories.length === 0 && (
                  <div className="col-span-full neo-box p-12 text-center bg-white border-dashed border-4 border-black">
                    <p className="font-black text-lg uppercase tracking-wider">{t('no_categories', 'Aucune catégorie disponible.')}</p>
                  </div>
                )}
              </div>
            )}

            {/* CATEGORY DETAILS OR SEARCH RESULTS */}
            {(searchQuery.trim().length > 0 || activeCategory !== null) && (
              <div className="space-y-6">
                {searchQuery.trim().length === 0 && (
                  <div className="flex items-center justify-between border-b-4 border-black pb-4">
                    <button 
                      onClick={() => setActiveCategory(null)}
                      className="flex items-center gap-2 font-black uppercase text-sm hover:underline"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      <span>{t('back_to_categories', 'Toutes les catégories')}</span>
                    </button>
                    <span className="font-black text-lg uppercase tracking-tight">
                      {getLocalizedText(categories.find(c => c.id === activeCategory)?.name, language)}
                    </span>
                  </div>
                )}

                {searchQuery.trim().length > 0 && (
                  <div className="flex items-center justify-between border-b-4 border-black pb-4">
                    <p className="font-black text-sm uppercase">
                      {filteredItems.length} {t('results_found', 'résultats trouvés')}
                    </p>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-xs font-bold text-neutral-600 hover:text-black uppercase underline"
                    >
                      {t('clear_search', 'Effacer')}
                    </button>
                  </div>
                )}

                {filteredItems.length === 0 ? (
                  <div className="neo-box p-12 text-center space-y-2 bg-white border-dashed border-4 border-black">
                    <Utensils className="w-8 h-8 text-neutral-400 mx-auto mb-4" />
                    <p className="font-black text-sm uppercase tracking-wider">{t('no_dish_found', 'Aucun plat correspondant.')}</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {filteredItems
                      .filter(item => {
                        if (activeCategory && searchQuery.trim().length === 0) {
                          return item.category_id === activeCategory;
                        }
                        return true;
                      })
                      .map((item) => {
                        const isAvail = item.is_available;
                        const locName = getLocalizedText(item.name, language);
                        const locDesc = getLocalizedText(item.description, language);

                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedDish(item)}
                            className={`neo-box p-4 bg-white border-4 border-black flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer hover:-translate-y-1 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] ${
                              isAvail ? '' : 'opacity-60 grayscale'
                            }`}
                          >
                            <div className="flex items-center gap-5 w-full">
                              {item.image_url && (
                                <img
                                  src={item.image_url}
                                  alt={locName}
                                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border-4 border-black shrink-0 shadow-[4px_4px_0px_0px_#000]"
                                />
                              )}

                              <div className="space-y-2 flex-1">
                                <h3 className="font-black text-lg sm:text-xl uppercase tracking-tight leading-tight">
                                  {locName}
                                </h3>
                                {locDesc && (
                                  <p className="text-neutral-600 text-xs sm:text-sm font-bold line-clamp-2">
                                    {locDesc}
                                  </p>
                                )}
                                <div className="pt-2 flex flex-wrap justify-between items-center gap-2">
                                  <span className="bg-[#00F59B] px-3 py-1 rounded-md border-2 border-black font-black text-sm shadow-[2px_2px_0px_0px_#000] inline-block">
                                    {formatPrice(item.price, merchant?.currency, language)}
                                  </span>

                                  {!isAvail && (
                                    <span className="bg-red-500 text-white px-2.5 py-1 rounded-md border-2 border-black font-black text-[11px] uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
                                      {t('out_of_stock', 'Rupture de stock')}
                                    </span>
                                  )}

                                  {isAvail && (
                                    <div className="h-8 w-8 rounded-full bg-[#FFB800] border-2 border-black flex items-center justify-center sm:hidden">
                                      <Plus className="w-4 h-4" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ── ONGLET 2 : CARTE DE FIDÉLITÉ & TAMPONS ── */
          <div className="space-y-8">
            {!customerId && isScan && (
              <div className="neo-box bg-[#FFB800] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-bold">{t('login_to_save_stamps', 'Connectez-vous pour sauvegarder vos tampons !')}</span>
                </div>
                <Link
                  href={`/wallet/auth?redirect=${merchantSlug}&scan=true`}
                  className="neo-pill-btn bg-white py-2 px-6 whitespace-nowrap"
                >
                  {t('login_btn', 'S\'identifier')}
                </Link>
              </div>
            )}

            {/* ── FLEXIBLE PAGINATED 10-STAMPS CARD SYSTEM ── */}
            {(() => {
              const totalStamps = loyaltyCard?.stamps_count || 0;
              const stampsPerPage = 10;
              const totalCardPages = Math.max(1, Math.ceil(totalStamps / stampsPerPage) + (totalStamps > 0 && totalStamps % stampsPerPage === 0 ? 1 : 0));
              const currentDisplayPage = Math.min(cardPage, totalCardPages - 1);

              return (
                <div className="neo-box bg-white p-6 sm:p-8 space-y-6 text-center border-dashed border-4 border-black">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-black" />
                      <h3 className="font-black text-sm uppercase tracking-tight">
                        {t('your_stamps', 'Vos Tampons')}
                      </h3>
                      {totalCardPages > 1 && (
                        <span className="text-[10px] font-black bg-neutral-100 border border-black px-2.5 py-0.5 rounded-full">
                          {t('card_page_indicator', 'Carte')} {currentDisplayPage + 1} / {totalCardPages}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black bg-[#FFB800] border-2 border-black px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_#000]">
                        {totalStamps} {t('points_total', 'Tampons au total')}
                      </span>
                    </div>
                  </div>

                  {/* Card Page Navigator if > 1 page */}
                  {totalCardPages > 1 && (
                    <div className="flex items-center justify-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setCardPage(p => Math.max(0, p - 1))}
                        disabled={currentDisplayPage === 0}
                        className="neo-pill-btn-white py-1 px-2.5 text-xs font-black disabled:opacity-30"
                      >
                        ◀
                      </button>
                      {Array.from({ length: totalCardPages }).map((_, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setCardPage(pIdx)}
                          className={`w-7 h-7 rounded-lg border-2 border-black font-black text-xs transition ${
                            currentDisplayPage === pIdx
                              ? 'bg-[#FFB800] shadow-[2px_2px_0px_0px_#000]'
                              : 'bg-white hover:bg-neutral-100'
                          }`}
                        >
                          {pIdx + 1}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setCardPage(p => Math.min(totalCardPages - 1, p + 1))}
                        disabled={currentDisplayPage === totalCardPages - 1}
                        className="neo-pill-btn-white py-1 px-2.5 text-xs font-black disabled:opacity-30"
                      >
                        ▶
                      </button>
                    </div>
                  )}

                  {/* 10-Stamps Grid for Current Page */}
                  <div className="grid grid-cols-5 gap-3 max-w-sm mx-auto py-2">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const stampNumber = currentDisplayPage * 10 + i + 1;
                      const isStamped = stampNumber <= totalStamps;
                      return (
                        <div
                          key={i}
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 flex flex-col items-center justify-center font-black transition transform duration-300 ${
                            isStamped
                              ? 'bg-[#00F59B] border-black shadow-[2px_2px_0px_0px_#000] scale-105'
                              : 'bg-neutral-100 border-black text-neutral-400 border-dashed'
                          }`}
                        >
                          {isStamped ? (
                            <span className="text-lg">✔️</span>
                          ) : (
                            <span className="text-xs">{stampNumber}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Status footer for this card */}
                  {totalStamps >= (currentDisplayPage + 1) * 10 ? (
                    <div className="p-2.5 bg-emerald-100 border-2 border-black rounded-xl text-xs font-black text-emerald-900 flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#000]">
                      <span>🎉</span>
                      <span>{t('card_completed_congrats', 'Carte')} #{currentDisplayPage + 1} {t('card_fully_completed', 'complétée ! 10/10 tampons validés')}</span>
                    </div>
                  ) : (
                    <p className="text-neutral-600 text-xs font-bold pt-2">
                      {t('present_code_for_stamp', 'Présentez votre code au comptoir pour ajouter un tampon.')}
                    </p>
                  )}
                </div>
              );
            })()}

            {/* ── CODE FIDÉLITÉ PROÉMINENT ── */}
            {customerId && (
              <div className="neo-box bg-[#FFB800] p-6 text-center space-y-3 border-4 border-black shadow-[6px_6px_0px_0px_#000]">
                <div className="flex items-center justify-center gap-2">
                  <Award className="w-5 h-5 text-black" />
                  <h4 className="font-black text-xs sm:text-sm uppercase tracking-widest text-black">
                    {t('your_secret_code', 'Votre Code Fidélité')}
                  </h4>
                </div>

                <div className="inline-block p-4 border-3 border-black rounded-2xl bg-white shadow-[4px_4px_0px_0px_#000] -rotate-1 hover:rotate-0 transition-transform">
                  <div className="font-black font-mono text-3xl sm:text-4xl tracking-widest text-black select-all">
                    {(loyaltyCard as any)?.customer?.loyalty_code || (loyaltyCard as any)?.customer?.phone || customerId.slice(0, 8).toUpperCase()}
                  </div>
                </div>

                <p className="text-xs font-bold text-black/90 max-w-sm mx-auto">
                  {t('give_code_at_counter', 'Donnez ce code en caisse pour obtenir vos tampons ou recevoir vos cadeaux.')}
                </p>
              </div>
            )}

            {/* ── CADEAUX & RÉCOMPENSES DU RESTAURANT ── */}
            <div className="space-y-4">
              <h3 className="font-black text-lg flex items-center gap-2 uppercase tracking-tight">
                <Gift className="w-5 h-5 text-black" />
                {t('rewards_to_claim', 'Cadeaux à Réclamer')}
              </h3>

              {rewards.length === 0 ? (
                <div className="neo-box p-8 text-center text-neutral-600 text-xs font-bold bg-white">
                  {t('no_rewards_configured', 'Aucun cadeau configuré.')}
                </div>
              ) : (
                <div className="space-y-4">
                  {rewards.map((reward) => {
                    const totalStamps = loyaltyCard?.stamps_count || 0;
                    const canClaim = totalStamps >= reward.stamps_required;
                    const missingStamps = reward.stamps_required - totalStamps;

                    return (
                      <div
                        key={reward.id}
                        className={`neo-box p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                          canClaim 
                            ? 'border-4 border-black bg-amber-50/50 shadow-[4px_4px_0px_0px_#000]' 
                            : 'opacity-70 grayscale'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-[10px] px-2.5 py-1 rounded border-2 border-black bg-[#FFB800] shadow-[2px_2px_0px_0px_#000]">
                              {reward.stamps_required} {t('stamps_uppercase', 'TAMPONS')}
                            </span>
                            <h4 className="font-black text-sm uppercase tracking-tight">{reward.title}</h4>
                          </div>
                          {reward.description && (
                            <p className="text-neutral-600 text-xs font-bold">{reward.description}</p>
                          )}
                        </div>

                        <div className="shrink-0">
                          {canClaim ? (
                            <div className="inline-flex items-center gap-1.5 py-2.5 px-4 bg-[#00F59B] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                              <span>{t('reward_unlocked_ask_counter', 'Débloqué ! Donnez votre code en caisse 🎁')}</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 py-2 px-3 bg-neutral-100 text-neutral-500 font-bold text-xs rounded-xl border-2 border-neutral-300">
                              <span>🔒 {t('stamps_missing_count', 'Plus que {0} tampon(s)').replace('{0}', missingStamps.toString())}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Modal Détail Plat Multilingue ── */}
      {selectedDish && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md border-4 border-black shadow-[8px_8px_0px_0px_#000] rounded-xl overflow-hidden relative flex flex-col max-h-[90vh]">
            <button
              onClick={() => setSelectedDish(null)}
              className="absolute top-4 right-4 p-2 border-4 border-black rounded-full bg-[#FFB800] hover:bg-white transition-colors shadow-[4px_4px_0px_0px_#000] z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {selectedDish.image_url && (
              <img
                src={selectedDish.image_url}
                alt={getLocalizedText(selectedDish.name, language)}
                className="w-full h-56 object-cover border-b-4 border-black"
              />
            )}

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex justify-between items-start gap-4">
                <h3 className="font-black text-2xl uppercase tracking-tight">
                  {getLocalizedText(selectedDish.name, language)}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="inline-block bg-[#00F59B] px-4 py-2 rounded-xl border-4 border-black font-black text-xl shadow-[4px_4px_0px_0px_#000] -rotate-2">
                  {formatPrice(selectedDish.price, merchant?.currency, language)}
                </div>
                {!selectedDish.is_available && (
                  <span className="bg-red-500 text-white px-3 py-1.5 rounded-lg border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000]">
                    {t('out_of_stock', 'Rupture de stock')}
                  </span>
                )}
              </div>
              
              <p className="text-neutral-700 text-sm font-bold leading-relaxed pt-2">
                {getLocalizedText(selectedDish.description, language) || t('no_description', 'Aucune description disponible pour ce produit.')}
              </p>
            </div>

            <div className="p-6 border-t-4 border-black bg-neutral-50 flex justify-center">
              <button
                onClick={() => setSelectedDish(null)}
                className="w-full bg-black text-white font-black uppercase tracking-wider py-4 border-4 border-transparent hover:bg-[#FFB800] hover:text-black hover:border-black transition-colors rounded-xl"
              >
                {t('close', 'Fermer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
