'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  Bike,
  Phone,
  User,
  CheckCircle2,
  Clock,
  RotateCcw,
  MessageCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import type { Merchant, Category, MenuItem, Reward } from '@/types';
import { PushNotificationManager } from '@/components/PushNotificationManager';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { getLocalizedText } from '@/lib/multilingual';
import { formatPrice } from '@/lib/currency';
import CustomerOrderModal, { OrderCartItem } from '@/components/CustomerOrderModal';

const NEO_COLORS = ['bg-[#FFB800]', 'bg-[#93C5FD]', 'bg-[#F9A8D4]', 'bg-[#00F59B]'];

export default function RestaurantCustomerViewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isScan = searchParams.get('scan') === 'true';
  const merchantSlug = params.merchantSlug as string;
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'loyalty' | 'menu' | 'orders'>(
    initialTab === 'orders' ? 'orders' : initialTab === 'menu' ? 'menu' : 'loyalty'
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

  // Customer Identification & Loyalty
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [loyaltyCard, setLoyaltyCard] = useState<any>(null);
  const [cardPage, setCardPage] = useState(0);

  // Cart & Ordering
  const [cart, setCart] = useState<OrderCartItem[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Live Orders Tracking
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Quick Auth Modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPhoneInput, setAuthPhoneInput] = useState('');
  const [authNameInput, setAuthNameInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Initialize customer identity from localStorage / cookies
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedId = localStorage.getItem('menufid_customer_id');
      const storedPhone = localStorage.getItem('menufid_customer_phone') || '';
      const storedName = localStorage.getItem('menufid_customer_name') || '';

      if (storedPhone) setCustomerPhone(storedPhone);
      if (storedName) setCustomerName(storedName);

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

  // Load Customer Orders
  const fetchCustomerOrders = useCallback(async () => {
    const phoneToQuery = customerPhone || localStorage.getItem('menufid_customer_phone');
    if (!phoneToQuery || !merchant?.id) return;

    try {
      setLoadingOrders(true);
      const res = await fetch(`/api/orders/customer?phone=${encodeURIComponent(phoneToQuery)}&merchantId=${merchant.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error('Error loading customer orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  }, [customerPhone, merchant?.id]);

  useEffect(() => {
    if (customerPhone && merchant?.id) {
      fetchCustomerOrders();
    }
  }, [customerPhone, merchant?.id, fetchCustomerOrders]);

  // Supabase Realtime for live order status updates
  useEffect(() => {
    const cleanPhone = (customerPhone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || !merchant?.id) return;

    const channel = supabase
      .channel(`customer-orders-live-${cleanPhone}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `customer_phone=eq.${cleanPhone}`,
        },
        () => {
          fetchCustomerOrders();
          // Also reload loyalty card to reflect real-time stamps
          if (customerId && merchant?.id) {
            walletService.getMerchantLoyaltyCard(customerId, merchant.id).then(setLoyaltyCard);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [customerPhone, customerId, merchant?.id, fetchCustomerOrders]);

  // Periodic polling for stamps count sync
  useEffect(() => {
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
          // ignore
        }
      }, 4000);
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

      if (merch.plan_tier === 'basic') {
        router.replace(`/menu/${merchantSlug}`);
        return;
      }

      const [catsRes, itemsRes, rewardsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('merchant_id', merch.id).eq('is_active', true).order('display_order', { ascending: true }),
        supabase.from('menu_items').select('*').eq('merchant_id', merch.id).eq('is_available', true),
        supabase.from('rewards').select('*').eq('merchant_id', merch.id).eq('is_active', true).order('stamps_required', { ascending: true }),
      ]);

      setCategories(catsRes.data || []);
      setItems(itemsRes.data || []);
      setRewards(rewardsRes.data || []);

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

  // Quick Customer Login / Registration Handler
  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPhoneInput.trim()) {
      showToast('Veuillez renseigner votre numéro de téléphone', 'error');
      return;
    }

    try {
      setAuthLoading(true);
      const customer = await walletService.getOrCreateCustomer(
        authPhoneInput.trim(),
        authNameInput.trim() || undefined
      );

      if (customer) {
        setCustomerId(customer.id);
        const cleanPhone = customer.phone || authPhoneInput.trim();
        setCustomerPhone(cleanPhone);
        if (customer.full_name) setCustomerName(customer.full_name);

        localStorage.setItem('menufid_customer_id', customer.id);
        localStorage.setItem('menufid_customer_phone', cleanPhone);
        if (customer.full_name) localStorage.setItem('menufid_customer_name', customer.full_name);

        document.cookie = `menufid_customer_id=${customer.id}; path=/; max-age=315360000; SameSite=Lax`;

        if (merchant?.id) {
          const card = await walletService.getMerchantLoyaltyCard(customer.id, merchant.id);
          setLoyaltyCard(card);
        }

        setShowAuthModal(false);
        showToast('Connexion réussie ! Vos points et commandes sont synchronisés.', 'success');

        // If cart has items, open order checkout modal right away
        if (cart.length > 0) {
          setIsOrderModalOpen(true);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la connexion', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  // Cart Management
  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((ci) => ci.item.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { item, quantity: 1 }];
    });
    showToast(`${getLocalizedText(item.name, language)} ajouté au panier`, 'success');
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => {
      const idx = prev.findIndex((ci) => ci.item.id === itemId);
      if (idx >= 0) {
        if (prev[idx].quantity > 1) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity - 1 };
          return next;
        }
        return prev.filter((ci) => ci.item.id !== itemId);
      }
      return prev;
    });
  };

  const totalCartPrice = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  const totalCartCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);

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

  const activeOrdersCount = orders.filter(
    (o) => o.order_status !== 'delivered' && o.order_status !== 'cancelled'
  ).length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black font-sans flex flex-col pb-32 selection:bg-[#FFB800] selection:text-black relative">
      {/* Floating Language Selector */}
      <div className="absolute top-[max(0.75rem,calc(env(safe-area-inset-top)+0.5rem))] right-4 z-[60]">
        <LanguageSelector />
      </div>

      {/* Header Banner with Restaurant Theme Color */}
      <div 
        className="border-b-4 border-black p-5 sm:p-8 space-y-4 pt-[max(2.5rem,calc(env(safe-area-inset-top)+1.5rem))] sm:pt-8"
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
            {!customerPhone ? (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="text-xs font-black uppercase tracking-wider bg-black text-white px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#fff] flex items-center gap-1.5 active:translate-x-[1px]"
              >
                <User className="w-3.5 h-3.5" />
                <span>S'identifier</span>
              </button>
            ) : (
              <span className="text-[11px] font-black uppercase bg-white px-3 py-1 rounded-full border-2 border-black shadow-[1px_1px_0px_0px_#000] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{customerName ? customerName.split(' ')[0] : customerPhone.slice(-4)}</span>
              </span>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto flex items-center gap-4 pt-1">
          {merchant.logo_url ? (
            <img
              src={merchant.logo_url}
              alt={merchant.business_name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-3 border-black shadow-[3px_3px_0px_0px_#000] shrink-0 bg-white"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-3 border-black flex items-center justify-center font-black text-2xl shadow-[3px_3px_0px_0px_#000] shrink-0">
              {merchant.business_name?.[0] || 'R'}
            </div>
          )}

          <div className="space-y-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight truncate">{merchant.business_name}</h1>
            <p className="text-xs font-bold flex items-center gap-1.5 opacity-90">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{merchant.city || t('city', 'Ville')}, {merchant.country || t('country', 'Pays')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── 3-Tabs Unified Navigation (Fidélité, Menu & Commandes) ── */}
      <div className="sticky top-0 z-40 bg-white border-b-4 border-black shadow-sm">
        <div className="max-w-3xl mx-auto flex">
          {/* Onglet 1: Fidélité */}
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`flex-1 py-3.5 sm:py-4 font-black text-xs sm:text-sm text-center border-r-2 sm:border-r-4 border-black transition flex items-center justify-center gap-1.5 sm:gap-2 uppercase tracking-tight ${
              activeTab === 'loyalty'
                ? 'bg-[#00F59B] text-black shadow-inner'
                : 'text-black hover:bg-neutral-100'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('tab_loyalty', 'Fidélité')}</span>
            <span className="hidden sm:inline">({loyaltyCard?.stamps_count || 0}/10)</span>
          </button>

          {/* Onglet 2: Menu / Commander */}
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-3.5 sm:py-4 font-black text-xs sm:text-sm text-center border-r-2 sm:border-r-4 border-black transition flex items-center justify-center gap-1.5 sm:gap-2 uppercase tracking-tight ${
              activeTab === 'menu'
                ? 'bg-[#FFB800] text-black shadow-inner'
                : 'text-black hover:bg-neutral-100'
            }`}
          >
            <Utensils className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('tab_menu', 'Commander')}</span>
            {totalCartCount > 0 && (
              <span className="bg-red-500 text-white font-mono text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Onglet 3: Mes Commandes & Suivi en Direct */}
          <button
            onClick={() => {
              setActiveTab('orders');
              fetchCustomerOrders();
            }}
            className={`flex-1 py-3.5 sm:py-4 font-black text-xs sm:text-sm text-center transition flex items-center justify-center gap-1.5 sm:gap-2 uppercase tracking-tight relative ${
              activeTab === 'orders'
                ? 'bg-[#93C5FD] text-black shadow-inner'
                : 'text-black hover:bg-neutral-100'
            }`}
          >
            <Truck className="w-4 h-4 shrink-0" />
            <span className="truncate">Commandes</span>
            {activeOrdersCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white animate-pulse">
                {activeOrdersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">
        <PushNotificationManager customerId={customerId} />

        {/* ══════════════════════════════════════════════════════════════════
            ONGLET 1 : MENU DIGITAL MULTILINGUE AVEC PRISE DE COMMANDE
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'menu' && (
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
                className="w-full bg-white border-3 sm:border-4 border-black rounded-2xl p-3.5 sm:p-4 pl-12 text-base sm:text-lg font-bold shadow-[4px_4px_0px_0px_#000] focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
              />
            </div>

            {/* CATEGORIES GRID */}
            {searchQuery.trim().length === 0 && activeCategory === null && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {categories.map((cat, index) => {
                  const colorClass = NEO_COLORS[index % NEO_COLORS.length];
                  const count = items.filter(i => i.category_id === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full group relative overflow-hidden rounded-2xl border-3 sm:border-4 border-black ${colorClass} min-h-[140px] sm:min-h-[160px] h-full flex flex-col justify-between p-4 sm:p-6 transition-all duration-200 shadow-[5px_5px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none text-left`}
                    >
                      <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:16px_16px]"></div>
                      
                      <div className="relative z-10 w-full mb-3">
                        <h3 className="font-black text-lg sm:text-xl md:text-2xl uppercase tracking-tight text-black leading-snug break-words">
                          {getLocalizedText(cat.name, language)}
                        </h3>
                      </div>

                      <div className="relative z-10 w-full flex justify-between items-center pt-2">
                        <p className="font-bold text-xs sm:text-sm text-black bg-white/90 backdrop-blur-sm inline-block px-2.5 py-1 border-2 border-black rounded shadow-[2px_2px_0px_0px_#000]">
                          {count} {count > 1 ? t('items', 'articles') : t('item', 'article')}
                        </p>
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white shrink-0 flex items-center justify-center border-2 border-black group-hover:bg-black group-hover:text-white transition-all shadow-[2px_2px_0px_0px_#000]">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* CATEGORY DETAILS OR SEARCH RESULTS */}
            {(searchQuery.trim().length > 0 || activeCategory !== null) && (
              <div className="space-y-4 sm:space-y-6">
                {searchQuery.trim().length === 0 && (
                  <div className="flex items-center justify-between border-b-4 border-black pb-3 sm:pb-4">
                    <button 
                      onClick={() => setActiveCategory(null)}
                      className="flex items-center gap-1.5 font-black uppercase text-xs sm:text-sm hover:underline"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{t('back_to_categories', 'Toutes les catégories')}</span>
                    </button>
                    <span className="font-black text-sm sm:text-lg uppercase tracking-tight">
                      {getLocalizedText(categories.find(c => c.id === activeCategory)?.name, language)}
                    </span>
                  </div>
                )}

                {filteredItems.length === 0 ? (
                  <div className="neo-box p-12 text-center space-y-2 bg-white border-dashed border-4 border-black">
                    <Utensils className="w-8 h-8 text-neutral-400 mx-auto mb-4" />
                    <p className="font-black text-sm uppercase tracking-wider">{t('no_dish_found', 'Aucun plat correspondant.')}</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:gap-6">
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
                        const cartItem = cart.find(ci => ci.item.id === item.id);
                        const quantityInCart = cartItem ? cartItem.quantity : 0;

                        return (
                          <div
                            key={item.id}
                            className={`neo-box p-3.5 sm:p-4 bg-white border-3 sm:border-4 border-black flex items-center justify-between gap-3 sm:gap-4 transition-all duration-200 shadow-[4px_4px_0px_0px_#000] ${
                              isAvail ? '' : 'opacity-60 grayscale'
                            }`}
                          >
                            <div 
                              onClick={() => setSelectedDish(item)}
                              className="flex items-center gap-3 sm:gap-4 flex-1 cursor-pointer min-w-0"
                            >
                              {item.image_url && (
                                <img
                                  src={item.image_url}
                                  alt={locName}
                                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2 sm:border-3 border-black shrink-0 shadow-[2px_2px_0px_0px_#000]"
                                />
                              )}

                              <div className="space-y-1.5 flex-1 min-w-0">
                                <h3 className="font-black text-base sm:text-lg uppercase tracking-tight leading-tight truncate">
                                  {locName}
                                </h3>
                                {locDesc && (
                                  <p className="text-neutral-600 text-xs font-bold line-clamp-2">
                                    {locDesc}
                                  </p>
                                )}
                                <div className="pt-1 flex items-center gap-2">
                                  <span className="bg-[#00F59B] px-2.5 py-0.5 rounded-md border border-black font-black text-xs sm:text-sm shadow-[1px_1px_0px_0px_#000] inline-block">
                                    {formatPrice(item.price, merchant?.currency, language)}
                                  </span>

                                  {!isAvail && (
                                    <span className="bg-red-500 text-white px-2 py-0.5 rounded border border-black font-black text-[10px] uppercase shadow-[1px_1px_0px_0px_#000]">
                                      {t('out_of_stock', 'Rupture')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Add / Remove from Cart Controller */}
                            {isAvail && (
                              <div className="shrink-0 flex items-center gap-1.5 sm:gap-2">
                                {quantityInCart > 0 ? (
                                  <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl border-2 border-black">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFromCart(item.id)}
                                      className="w-7 h-7 rounded-lg bg-white border border-black flex items-center justify-center font-black active:translate-y-0.5"
                                    >
                                      <Minus className="w-3.5 h-3.5 text-black" />
                                    </button>
                                    <span className="font-mono font-black text-xs sm:text-sm px-1 min-w-[1.25rem] text-center">
                                      {quantityInCart}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleAddToCart(item)}
                                      className="w-7 h-7 rounded-lg bg-[#FFB800] border border-black flex items-center justify-center font-black active:translate-y-0.5"
                                    >
                                      <Plus className="w-3.5 h-3.5 text-black" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart(item)}
                                    className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-[#FFB800] hover:bg-amber-400 border-2 border-black flex items-center gap-1.5 font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Ajouter</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            ONGLET 2 : CARTE DE FIDÉLITÉ & TAMPONS
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'loyalty' && (
          <div className="space-y-6 sm:space-y-8">
            {!customerId && (
              <div className="neo-box bg-[#FFB800] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-3 border-black shadow-[4px_4px_0px_0px_#000]">
                <div className="flex items-center gap-2.5">
                  <Info className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-bold">{t('login_to_save_stamps', 'Connectez-vous pour sauvegarder vos tampons et suivre vos commandes !')}</span>
                </div>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="neo-pill-btn bg-white py-2 px-5 whitespace-nowrap text-xs font-black"
                >
                  {t('login_btn', 'S\'identifier')}
                </button>
              </div>
            )}

            {/* Paginated 10-Stamps Card */}
            {(() => {
              const totalStamps = loyaltyCard?.stamps_count || 0;
              const stampsPerPage = 10;
              const totalCardPages = Math.max(1, Math.ceil(totalStamps / stampsPerPage) + (totalStamps > 0 && totalStamps % stampsPerPage === 0 ? 1 : 0));
              const currentDisplayPage = Math.min(cardPage, totalCardPages - 1);

              return (
                <div className="neo-box bg-white p-5 sm:p-8 space-y-6 text-center border-dashed border-3 sm:border-4 border-black">
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

                  {/* Navigator if > 1 page */}
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

                  {/* 10-Stamps Grid */}
                  <div className="grid grid-cols-5 gap-2.5 sm:gap-3 max-w-sm mx-auto py-2">
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

                  {totalStamps >= (currentDisplayPage + 1) * 10 ? (
                    <div className="p-2.5 bg-emerald-100 border-2 border-black rounded-xl text-xs font-black text-emerald-900 flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#000]">
                      <span>🎉</span>
                      <span>{t('card_completed_congrats', 'Carte')} #{currentDisplayPage + 1} {t('card_fully_completed', 'complétée ! 10/10 tampons validés')}</span>
                    </div>
                  ) : (
                    <p className="text-neutral-600 text-xs font-bold pt-1">
                      {t('present_code_for_stamp', 'Présentez votre code au comptoir ou commandez en livraison pour ajouter des tampons.')}
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Loyalty Secret Code Card */}
            {customerId && (
              <div className="neo-box bg-[#FFB800] p-5 sm:p-6 text-center space-y-3 border-3 sm:border-4 border-black shadow-[5px_5px_0px_0px_#000]">
                <div className="flex items-center justify-center gap-2">
                  <Award className="w-5 h-5 text-black" />
                  <h4 className="font-black text-xs sm:text-sm uppercase tracking-widest text-black">
                    {t('your_secret_code', 'Votre Code Fidélité')}
                  </h4>
                </div>

                <div className="inline-block p-3.5 sm:p-4 border-3 border-black rounded-2xl bg-white shadow-[3px_3px_0px_0px_#000]">
                  <div className="font-black font-mono text-2xl sm:text-4xl tracking-widest text-black select-all">
                    {(loyaltyCard as any)?.customer?.loyalty_code || customerPhone || customerId.slice(0, 8).toUpperCase()}
                  </div>
                </div>

                <p className="text-xs font-bold text-black/90 max-w-sm mx-auto">
                  {t('give_code_at_counter', 'Donnez ce code en caisse pour obtenir vos tampons ou recevoir vos cadeaux.')}
                </p>
              </div>
            )}

            {/* REWARDS SECTION */}
            <div className="space-y-4">
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2 uppercase tracking-tight">
                <Gift className="w-5 h-5 text-black" />
                {t('rewards_to_claim', 'Cadeaux à Réclamer')}
              </h3>

              {rewards.length === 0 ? (
                <div className="neo-box p-6 text-center text-neutral-600 text-xs font-bold bg-white">
                  {t('no_rewards_configured', 'Aucun cadeau configuré pour cet établissement.')}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {rewards.map((reward) => {
                    const totalStamps = loyaltyCard?.stamps_count || 0;
                    const canClaim = totalStamps >= reward.stamps_required;
                    const missingStamps = reward.stamps_required - totalStamps;

                    return (
                      <div
                        key={reward.id}
                        className={`neo-box p-4 sm:p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition ${
                          canClaim 
                            ? 'border-3 sm:border-4 border-black bg-amber-50/50 shadow-[3px_3px_0px_0px_#000]' 
                            : 'opacity-70 grayscale'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-[10px] px-2 py-0.5 rounded border border-black bg-[#FFB800] shadow-[1px_1px_0px_0px_#000]">
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
                            <div className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-[#00F59B] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                              <span>{t('reward_unlocked_ask_counter', 'Débloqué ! Donnez votre code en caisse 🎁')}</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-neutral-100 text-neutral-500 font-bold text-xs rounded-xl border border-neutral-300">
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

        {/* ══════════════════════════════════════════════════════════════════
            ONGLET 3 : MES COMMANDES & SUIVI EN TEMPS RÉEL
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-4 border-black pb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Truck className="w-5 h-5 text-black" />
                  <span>Suivi de Mes Commandes</span>
                </h2>
                <p className="text-xs text-neutral-600 font-bold">
                  Statut actualisé en direct depuis la cuisine et le livreur
                </p>
              </div>

              <button
                type="button"
                onClick={fetchCustomerOrders}
                disabled={loadingOrders}
                className="p-2.5 rounded-xl border-2 border-black bg-white hover:bg-neutral-100 shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition"
                title="Actualiser"
              >
                <RotateCcw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Prompt de connexion si pas de numéro */}
            {!customerPhone ? (
              <div className="neo-box p-6 sm:p-8 bg-white text-center space-y-4 border-3 border-black shadow-[5px_5px_0px_0px_#000]">
                <div className="w-14 h-14 rounded-2xl bg-[#93C5FD] border-2 border-black mx-auto flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                  <Phone className="w-7 h-7 text-black" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase">
                    Connectez-vous pour voir vos commandes
                  </h3>
                  <p className="text-xs text-neutral-600 font-bold max-w-sm mx-auto mt-1">
                    Indiquez votre numéro pour retrouver vos commandes récentes et suivre l'arrivée de votre livreur en direct.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="neo-pill-btn bg-[#FFB800] hover:bg-amber-400 text-black px-6 py-3 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000]"
                >
                  S'identifier avec mon numéro
                </button>
              </div>
            ) : loadingOrders ? (
              <div className="py-12 text-center">
                <Spinner size={32} className="text-black mx-auto" />
                <p className="text-xs font-bold text-neutral-500 mt-2">Chargement de vos commandes...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="neo-box p-8 sm:p-12 bg-white text-center space-y-4 border-dashed border-3 sm:border-4 border-black">
                <ShoppingBag className="w-10 h-10 text-neutral-400 mx-auto" />
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight">Aucune commande enregistrée</h3>
                  <p className="text-xs text-neutral-600 font-bold mt-1">
                    Vous n'avez pas encore passé de commande avec le numéro <span className="font-mono font-bold">{customerPhone}</span>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('menu')}
                  className="neo-pill-btn bg-[#00F59B] hover:bg-emerald-400 text-black px-6 py-3 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000] inline-flex items-center gap-2"
                >
                  <Utensils className="w-4 h-4" />
                  <span>Explorer le menu et commander</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((ord) => {
                  const isDelivered = ord.order_status === 'delivered';
                  const isCancelled = ord.order_status === 'cancelled';
                  const isInDelivery = ord.order_status === 'in_delivery';
                  const isPreparing = ord.order_status === 'preparing';
                  const isPending = ord.order_status === 'pending';

                  // Étape active du stepper (1: Reçue, 2: En cuisine, 3: En livraison, 4: Livrée)
                  const currentStep = isDelivered ? 4 : isInDelivery ? 3 : isPreparing ? 2 : 1;

                  return (
                    <div
                      key={ord.id}
                      className={`neo-box bg-white border-3 sm:border-4 border-black rounded-2xl overflow-hidden shadow-[5px_5px_0px_0px_#000] transition ${
                        isCancelled ? 'opacity-70 bg-neutral-50' : ''
                      }`}
                    >
                      {/* Order Card Header */}
                      <div className="p-4 sm:p-5 border-b-2 border-black flex flex-wrap items-center justify-between gap-2 bg-neutral-50">
                        <div className="flex items-center gap-2">
                          <span className="font-black font-mono text-sm sm:text-base px-2.5 py-1 rounded-lg bg-black text-[#FFB800]">
                            #{ord.order_number}
                          </span>
                          <span className="text-[11px] font-bold text-neutral-500">
                            {new Date(ord.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md border border-black bg-white shadow-[1px_1px_0px_0px_#000]">
                            {ord.order_type === 'delivery' ? '🛵 Livraison' : '🏪 À emporter'}
                          </span>
                          <span className="font-mono font-black text-sm">
                            {formatPrice(ord.total_amount, ord.currency || merchant?.currency, language)}
                          </span>
                        </div>
                      </div>

                      {/* ── LIVE TRACKING PROGRESS STEPPER ── */}
                      {!isCancelled ? (
                        <div className="p-4 sm:p-5 border-b-2 border-black bg-amber-50/40 space-y-3">
                          <div className="flex items-center justify-between text-xs font-black uppercase">
                            <span className="flex items-center gap-1.5 text-black">
                              <Clock className="w-4 h-4 text-black" />
                              <span>Statut en direct</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border border-black ${
                              isDelivered ? 'bg-[#00F59B]' : isInDelivery ? 'bg-[#FFB800] animate-pulse' : isPreparing ? 'bg-amber-300' : 'bg-neutral-200'
                            }`}>
                              {isDelivered ? 'Livrée' : isInDelivery ? 'En cours de livraison' : isPreparing ? 'En cuisine' : 'En attente'}
                            </span>
                          </div>

                          {/* Stepper visual bar */}
                          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-1">
                            {/* Step 1: Reçue */}
                            <div className={`p-2 rounded-xl border-2 border-black text-center ${
                              currentStep >= 1 ? 'bg-[#FFB800] text-black font-black' : 'bg-neutral-100 text-neutral-400'
                            }`}>
                              <div className="text-sm">⏱️</div>
                              <div className="text-[9px] sm:text-[10px] font-black uppercase mt-0.5 truncate">Reçue</div>
                            </div>

                            {/* Step 2: En cuisine */}
                            <div className={`p-2 rounded-xl border-2 border-black text-center ${
                              currentStep >= 2 ? 'bg-[#FFB800] text-black font-black' : 'bg-neutral-100 text-neutral-400'
                            }`}>
                              <div className="text-sm">👨‍🍳</div>
                              <div className="text-[9px] sm:text-[10px] font-black uppercase mt-0.5 truncate">En cuisine</div>
                            </div>

                            {/* Step 3: En livraison */}
                            <div className={`p-2 rounded-xl border-2 border-black text-center ${
                              currentStep >= 3 ? 'bg-[#FFB800] text-black font-black' : 'bg-neutral-100 text-neutral-400'
                            }`}>
                              <div className="text-sm">🛵</div>
                              <div className="text-[9px] sm:text-[10px] font-black uppercase mt-0.5 truncate">Livraison</div>
                            </div>

                            {/* Step 4: Livrée */}
                            <div className={`p-2 rounded-xl border-2 border-black text-center ${
                              currentStep >= 4 ? 'bg-[#00F59B] text-black font-black' : 'bg-neutral-100 text-neutral-400'
                            }`}>
                              <div className="text-sm">🎉</div>
                              <div className="text-[9px] sm:text-[10px] font-black uppercase mt-0.5 truncate">Livrée</div>
                            </div>
                          </div>

                          {/* Assigned Driver Notification Card */}
                          {isInDelivery && ord.assigned_driver && (
                            <div className="p-3 bg-white border-2 border-black rounded-xl flex items-center justify-between gap-3 shadow-[2px_2px_0px_0px_#000]">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#FFB800] border border-black flex items-center justify-center font-black">
                                  <Bike className="w-4 h-4 text-black" />
                                </div>
                                <div>
                                  <p className="text-xs font-black uppercase text-black">
                                    Livreur : {ord.assigned_driver.name}
                                  </p>
                                  <p className="text-[10px] text-neutral-500 font-bold">Votre commande est en route vers vous !</p>
                                </div>
                              </div>

                              {ord.assigned_driver.phone && (
                                <a
                                  href={`tel:${ord.assigned_driver.phone}`}
                                  className="neo-pill-btn bg-[#00F59B] text-black px-3 py-1.5 text-xs font-black flex items-center gap-1 shadow-[1px_1px_0px_0px_#000]"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>Appeler</span>
                                </a>
                              )}
                            </div>
                          )}

                          {/* Tampon Fidélité Attribué */}
                          {ord.points_awarded && (
                            <div className="p-2 bg-emerald-100 border border-black rounded-lg text-emerald-950 text-xs font-black flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                              <span>+1 tampon fidélité validé pour cette commande !</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-red-100 text-red-900 border-b-2 border-black text-xs font-black text-center">
                          Commande Annulée par le restaurant
                        </div>
                      )}

                      {/* Items & Address details */}
                      <div className="p-4 sm:p-5 space-y-3">
                        <div className="space-y-1.5">
                          {Array.isArray(ord.items) && ord.items.map((it: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-xs font-bold">
                              <span className="text-black">
                                <span className="font-mono font-black mr-1.5">{it.quantity}x</span>
                                <span>{it.name}</span>
                              </span>
                              <span className="font-mono text-neutral-600">
                                {formatPrice(it.price * it.quantity, ord.currency || merchant?.currency, language)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {ord.customer_address && (
                          <div className="pt-2 border-t border-neutral-200 text-xs font-bold text-neutral-600 flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                            <span>{ord.customer_address}</span>
                          </div>
                        )}

                        {/* Payment & WhatsApp action */}
                        <div className="pt-2 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                          <div className="flex items-center gap-1.5">
                            <span className="text-neutral-500">Paiement :</span>
                            <span className="font-black text-black">
                              {ord.payment_method === 'cash_on_delivery' ? '💵 Espèces à la porte' : '💳 Carte Bancaire (Stripe)'}
                            </span>
                          </div>

                          {merchant.contact_phone && (
                            <a
                              href={`https://wa.me/${merchant.contact_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour, j'ai une question concernant ma commande #${ord.order_number}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 text-[11px] font-black underline"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Contacter le restaurant</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── FLOATING CART ACTION BAR (Actif dans l'onglet Menu quand panier non vide) ── */}
      {cart.length > 0 && activeTab === 'menu' && (
        <div className="fixed left-3 right-3 sm:left-4 sm:right-4 z-40 max-w-xl mx-auto bottom-[max(1rem,calc(env(safe-area-inset-bottom)+0.5rem))] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="neo-box bg-[#FFB800] border-3 sm:border-4 border-black text-black p-3.5 sm:p-4 rounded-2xl shadow-[6px_6px_0px_0px_#000] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <ShoppingBag className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-red-600 text-white font-mono text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {totalCartCount}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase font-bold tracking-wider opacity-80 truncate">
                  {totalCartCount} {totalCartCount > 1 ? t('items', 'articles') : t('item', 'article')}
                </p>
                <p className="text-base sm:text-lg font-black tracking-tight font-mono">
                  {formatPrice(totalCartPrice, merchant?.currency, language)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!customerPhone && !customerId) {
                  setShowAuthModal(true);
                } else {
                  setIsOrderModalOpen(true);
                }
              }}
              className="neo-pill-btn bg-[#00F59B] hover:bg-emerald-400 text-black px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] shrink-0"
            >
              <span>{t('order_now', 'Commander')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL PRÉLÈVEMENT / COMMANDE CLIENT ── */}
      {merchant && (
        <CustomerOrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          merchant={merchant}
          cart={cart}
          totalCartPrice={totalCartPrice}
          onOrderSuccess={(confirmed) => {
            setCart([]);
            setIsOrderModalOpen(false);
            setActiveTab('orders');
            fetchCustomerOrders();
            showToast('Commande transmise avec succès !', 'success');
          }}
        />
      )}

      {/* ── MODAL RAPIDE IDENTIFICATION CLIENT ── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_#000] space-y-4">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-black bg-white hover:bg-neutral-100 flex items-center justify-center shadow-[2px_2px_0px_0px_#000] transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#FFB800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
              <Phone className="w-6 h-6 text-black" />
            </div>

            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-black">
                Identifiez-vous
              </h3>
              <p className="text-xs text-neutral-600 font-bold mt-1">
                Renseignez votre numéro pour commander, suivre vos livraisons en temps réel et cumuler vos points !
              </p>
            </div>

            <form onSubmit={handleQuickLogin} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-[11px] font-black uppercase text-black mb-1">
                  Numéro de Téléphone *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={authPhoneInput}
                    onChange={(e) => setAuthPhoneInput(e.target.value)}
                    placeholder="ex: 06 12 34 56 78"
                    className="w-full neo-input text-xs pl-9 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-black mb-1">
                  Votre Prénom & Nom (Optionnel)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={authNameInput}
                    onChange={(e) => setAuthNameInput(e.target.value)}
                    placeholder="ex: Sarah"
                    className="w-full neo-input text-xs pl-9 font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full neo-pill-btn bg-[#00F59B] hover:bg-emerald-400 text-black py-3.5 text-xs font-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000] disabled:opacity-50"
              >
                {authLoading ? (
                  <Spinner size={18} className="text-black" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Valider et Continuer</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL DÉTAIL PLAT ── */}
      {selectedDish && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md border-4 border-black shadow-[8px_8px_0px_0px_#000] rounded-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            <button
              onClick={() => setSelectedDish(null)}
              className="absolute top-4 right-4 p-2 border-3 border-black rounded-full bg-[#FFB800] hover:bg-white transition-colors shadow-[3px_3px_0px_0px_#000] z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedDish.image_url && (
              <img
                src={selectedDish.image_url}
                alt={getLocalizedText(selectedDish.name, language)}
                className="w-full h-52 object-cover border-b-4 border-black"
              />
            )}

            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <h3 className="font-black text-xl sm:text-2xl uppercase tracking-tight">
                {getLocalizedText(selectedDish.name, language)}
              </h3>
              <div className="flex items-center gap-3">
                <div className="inline-block bg-[#00F59B] px-3.5 py-1.5 rounded-xl border-3 border-black font-black text-lg shadow-[3px_3px_0px_0px_#000] -rotate-2">
                  {formatPrice(selectedDish.price, merchant?.currency, language)}
                </div>
                {!selectedDish.is_available && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-lg border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000]">
                    {t('out_of_stock', 'Rupture de stock')}
                  </span>
                )}
              </div>
              
              <p className="text-neutral-700 text-xs sm:text-sm font-bold leading-relaxed pt-1">
                {getLocalizedText(selectedDish.description, language) || t('no_description', 'Aucune description disponible pour ce produit.')}
              </p>
            </div>

            <div className="p-4 sm:p-5 border-t-3 border-black bg-neutral-50 flex gap-3">
              {selectedDish.is_available && (
                <button
                  type="button"
                  onClick={() => {
                    handleAddToCart(selectedDish);
                    setSelectedDish(null);
                  }}
                  className="flex-1 bg-[#00F59B] text-black font-black uppercase text-xs sm:text-sm py-3.5 border-3 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] hover:bg-emerald-400 active:translate-x-[1px]"
                >
                  Ajouter au panier
                </button>
              )}
              <button
                onClick={() => setSelectedDish(null)}
                className="bg-black text-white font-black uppercase text-xs sm:text-sm py-3.5 px-6 border-3 border-transparent hover:bg-neutral-800 rounded-xl"
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
