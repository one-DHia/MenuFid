'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, Search, Star, Clock, Plus, Minus, Trash2, Check,
  ShoppingBag, X, ArrowLeft, Award, ChevronRight, Utensils, MapPin, ExternalLink, Share2
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/InstagramIcon';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { Spinner } from '@/components/ui/Spinner';
import { getLocalizedText } from '@/lib/multilingual';
import { formatPrice } from '@/lib/currency';
import type { Merchant, Category, MenuItem } from '@/types';
import Link from 'next/link';
import CustomerOrderModal from '@/components/CustomerOrderModal';

export interface CustomerMenuProps {
  slug?: string;
  hostname?: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

const NEO_COLORS = [
  'bg-[#FFB800]', 
  'bg-[#00F59B]', 
  'bg-[#FFB4AB]', 
  'bg-white', 
  'bg-[#cfffdd]',
  'bg-[#00fbfc]'
];

export default function CustomerMenu({ slug, hostname }: CustomerMenuProps) {
  const { t, language } = useLanguage();
  
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // null = home view (show category cards)
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Cart system state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Modal détail plat
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);

  // Cart Actions
  const addToCart = (item: MenuItem, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + quantity } : ci
        );
      }
      return [...prev, { item, quantity }];
    });
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) => {
          if (ci.item.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getItemQuantityInCart = (itemId: string) => {
    const found = cart.find((ci) => ci.item.id === itemId);
    return found ? found.quantity : 0;
  };

  const totalCartCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  const totalCartPrice = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  const openItemModal = (item: MenuItem) => {
    setSelectedItem(item);
    setItemQuantity(1);
  };

  useEffect(() => {
    async function loadData() {
      const identifier = slug || hostname?.split('.')[0];
      if (!identifier) {
        setLoading(false);
        return;
      }

      // ⚡ 1. SWR Cache Hydration (0ms instant rendering on mobile/offline)
      const cacheKey = `menufid_menu_cache_${identifier}`;
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.merchant) setMerchant(parsed.merchant);
            if (parsed.categories?.length) {
              setCategories(parsed.categories);
              // Always land on categories overview (activeCategory remains null)
            }
            if (parsed.menuItems?.length) setMenuItems(parsed.menuItems);
            setLoading(false);
          }
        } catch {}
      }

      // 🌐 2. Fetch fresh data from network
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
        let query = supabase.from('merchants').select('*');
        
        if (isUUID) {
          query = query.or(`slug.eq.${identifier},id.eq.${identifier}`);
        } else {
          query = query.eq('slug', identifier);
        }

        const { data: merch } = await query.maybeSingle();

        if (merch) {
          setMerchant(merch as Merchant);

          // Track scan with session deduplication
          if (typeof window !== 'undefined' && merch.slug) {
            const sessionKey = `menufid_scanned_${merch.slug}`;
            if (!sessionStorage.getItem(sessionKey)) {
              sessionStorage.setItem(sessionKey, '1');
              fetch(`/api/merchants/${merch.slug}/track-scan`).catch(console.error);
            }
          }

          const { data: catData } = await supabase
            .from('categories')
            .select('*')
            .eq('merchant_id', merch.id)
            .eq('is_active', true)
            .order('display_order', { ascending: true });

          if (catData) setCategories(catData);

          const { data: itemData } = await supabase
            .from('menu_items')
            .select('*')
            .eq('merchant_id', merch.id)
            .eq('is_available', true);

          if (itemData) setMenuItems(itemData);

          // 💾 Save fresh data to local cache
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(
                cacheKey,
                JSON.stringify({
                  merchant: merch,
                  categories: catData || [],
                  menuItems: itemData || [],
                  timestamp: Date.now()
                })
              );
            } catch {}
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug, hostname]);

  const isSearching = searchQuery.trim().length > 0;
  const activeCategoryIds = new Set(categories.map((c) => c.id));

  const filteredItems = menuItems.filter((item) => {
    if (!activeCategoryIds.has(item.category_id)) return false;
    if (isSearching) {
      const q = searchQuery.toLowerCase().trim();
      const localizedName = getLocalizedName(item).toLowerCase();
      const rawName = (item.name || '').toLowerCase();
      const localizedDesc = getLocalizedDesc(item).toLowerCase();
      const rawDesc = (item.description || '').toLowerCase();
      
      return localizedName.includes(q) || rawName.includes(q) || localizedDesc.includes(q) || rawDesc.includes(q);
    }
    return item.category_id === activeCategory;
  });

  function getLocalizedName(item: any) {
    if (!item) return '';
    return getLocalizedText(item.name || item, language);
  }

  function getLocalizedDesc(item: any) {
    if (!item) return '';
    return getLocalizedText(item.description || '', language);
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
        <div className="text-center space-y-4 neo-box bg-white p-8 max-w-sm w-full border-dashed border-4 border-black">
          <p className="font-black text-sm uppercase">{t('error_restaurant_not_found', 'Restaurant introuvable.')}</p>
          <Link href="/" className="text-blue-600 font-black text-xs hover:underline block uppercase">
            {t('back_to_home', 'Retourner à l\'accueil')}
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: merchant?.business_name || 'Menu Digital',
      text: `Découvrez le menu de ${merchant?.business_name || 'notre restaurant'} sur MenuFid !`,
      url: shareUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      alert(t('link_copied_toast', 'Lien copié ! Vous pouvez le coller sur WhatsApp ou Instagram.'));
    }
  };

  if (merchant?.is_suspended) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="neo-box bg-white p-8 max-w-md w-full space-y-4 border-4 border-black shadow-[6px_6px_0px_0px_#000]">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-black flex items-center justify-center mx-auto text-3xl shadow-[3px_3px_0px_0px_#000]">
            🍽️
          </div>
          <h2 className="text-xl font-black uppercase text-black">{merchant.business_name}</h2>
          <span className="inline-block bg-[#FFB800] text-black text-[10px] font-black uppercase px-3 py-1 rounded-full border border-black shadow-[2px_2px_0px_0px_#000]">
            {t('service_unavailable', 'Service Temporairement Indisponible')}
          </span>
          <p className="text-xs font-bold text-neutral-600">
            {t('merchant_suspended_public_desc', 'Le menu digital de cet établissement est momentanément indisponible. Veuillez nous excuser pour la gêne occasionnée.')}
          </p>
        </div>
      </div>
    );
  }

  const theme = merchant?.primary_color || '#FFB800';
  const isMinimalist = theme === 'theme:minimalist';
  const isDark = theme === 'theme:dark';
  const isRetro = theme === 'theme:retro';
  const isNature = theme === 'theme:nature';
  const isCyberpunk = theme === 'theme:cyberpunk';
  const isLuxury = theme === 'theme:luxury';
  const isBrutalist = !isMinimalist && !isDark && !isRetro && !isNature && !isCyberpunk && !isLuxury;
  
  const themeColor = isBrutalist ? theme : '#FFB800';

  const checkerboardStyle = {
    backgroundImage: `
      linear-gradient(45deg, #000 25%, transparent 25%), 
      linear-gradient(-45deg, #000 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, #000 75%), 
      linear-gradient(-45deg, transparent 75%, #000 75%)
    `,
    backgroundSize: '16px 16px',
    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
    height: '16px',
    width: '100%',
    backgroundColor: '#fff'
  };

  const wrapperClass = isMinimalist
    ? "min-h-screen bg-[#FAF6F0] text-[#2C2520] font-serif flex flex-col pb-24 relative"
    : isDark
    ? "min-h-screen bg-[#121212] text-[#F3F4F6] font-sans flex flex-col pb-24 relative"
    : isRetro
    ? "min-h-screen bg-[#F4F1EA] text-[#3A3530] font-serif flex flex-col pb-24 relative selection:bg-[#C84B31] selection:text-white"
    : isNature
    ? "min-h-screen bg-[#F5F8F4] text-[#2D3F2E] font-sans flex flex-col pb-24 relative"
    : isCyberpunk
    ? "min-h-screen bg-[#0D0D0D] text-[#e2e2e2] font-mono flex flex-col pb-24 relative selection:bg-[#CCFF00] selection:text-black"
    : isLuxury
    ? "min-h-screen bg-[#131313] text-[#e2e2e2] font-sans flex flex-col pb-24 relative selection:bg-[#FFE600] selection:text-black"
    : "min-h-screen bg-[#FAFAFA] text-black font-sans flex flex-col pb-24 relative";

  const bannerClass = isMinimalist
    ? "bg-[#FAF6F0] border-b border-[#E3DEC3] p-6 sm:p-8 space-y-4 pt-[max(2.5rem,calc(env(safe-area-inset-top)+1.5rem))] sm:pt-8"
    : isDark
    ? "bg-[#1E1E1E] border-b border-[#2D2D2D] p-6 sm:p-8 space-y-4 pt-[max(2.5rem,calc(env(safe-area-inset-top)+1.5rem))] sm:pt-8 text-white"
    : isRetro
    ? "bg-[#F4F1EA] border-b-4 border-[#C84B31] p-6 sm:p-8 space-y-4 pt-[max(2.5rem,calc(env(safe-area-inset-top)+1.5rem))] sm:pt-8 text-[#C84B31] shadow-[0_4px_20px_rgba(200,75,49,0.1)]"
    : isNature
    ? "bg-[#E6EFE4] border-b border-[#C3D7BE] p-6 sm:p-8 space-y-4 pt-[max(2.5rem,calc(env(safe-area-inset-top)+1.5rem))] sm:pt-8 rounded-b-[32px] shadow-sm"
    : isCyberpunk
    ? "bg-[#0D0D0D]/90 backdrop-blur-xl border-b border-white/10 p-6 sm:p-8 space-y-4 pt-[max(2.5rem,calc(env(safe-area-inset-top)+1.5rem))] sm:pt-8 text-[#CCFF00]"
    : isLuxury
    ? "bg-[#131313]/90 backdrop-blur-xl border-b border-white/10 p-6 sm:p-8 space-y-4 pt-[max(2.5rem,calc(env(safe-area-inset-top)+1.5rem))] sm:pt-8 text-[#FFE600]"
    : "border-b-4 border-black p-6 sm:p-8 space-y-4 pt-[max(2.5rem,calc(env(safe-area-inset-top)+1.5rem))] sm:pt-8 text-black";

  const bannerStyle = isBrutalist ? { backgroundColor: themeColor } : undefined;

  const logoClass = isMinimalist
    ? "w-16 h-16 rounded-full object-cover border border-[#E3DEC3] shrink-0 bg-white shadow-sm"
    : isDark
    ? "w-16 h-16 rounded-xl object-cover border border-[#2D2D2D] shrink-0 bg-[#1E1E1E]"
    : isRetro
    ? "w-16 h-16 rounded-2xl object-cover border-4 border-[#C84B31] shrink-0 bg-white shadow-[4px_4px_0px_0px_rgba(200,75,49,0.25)]"
    : isNature
    ? "w-16 h-16 rounded-3xl object-cover border border-[#A9C8A3] shrink-0 bg-white"
    : isCyberpunk
    ? "w-16 h-16 rounded-xl object-cover border border-[#CCFF00]/30 shrink-0 bg-neutral-900 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
    : isLuxury
    ? "w-16 h-16 rounded-xl object-cover border border-white/20 shrink-0 bg-neutral-900 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
    : "w-16 h-16 rounded-xl object-cover border-4 border-black shadow-[4px_4px_0px_0px_#000] shrink-0 bg-white";

  const btnLinkClass = isMinimalist
    ? "inline-flex items-center gap-1.5 bg-white text-[#2C2520] px-3 py-1.5 rounded-lg border border-[#E3DEC3] font-medium text-xs hover:bg-[#FAF6F0] transition shrink-0"
    : isDark
    ? "inline-flex items-center gap-1.5 bg-[#2E2E2E] text-white px-3 py-1.5 rounded-lg border border-[#3E3E3E] font-medium text-xs hover:bg-[#3E3E3E] transition shrink-0"
    : isRetro
    ? "inline-flex items-center gap-1.5 bg-white text-[#C84B31] px-3 py-1.5 rounded-xl border-2 border-[#C84B31] font-bold text-xs hover:bg-neutral-50 transition shrink-0 shadow-[2px_2px_0px_0px_rgba(200,75,49,0.2)] font-serif"
    : isNature
    ? "inline-flex items-center gap-1.5 bg-white text-[#2D3F2E] px-3.5 py-1.5 rounded-full border border-[#C3D7BE] font-medium text-xs hover:bg-[#E6EFE4] transition shrink-0"
    : isCyberpunk
    ? "inline-flex items-center gap-1.5 bg-[#1F1F1F] text-neutral-300 px-3 py-1.5 rounded-lg border border-white/10 font-medium text-xs hover:border-[#CCFF00] hover:text-[#CCFF00] transition shrink-0 font-mono"
    : isLuxury
    ? "inline-flex items-center gap-1.5 bg-[#1F1F1F] text-neutral-300 px-3 py-1.5 rounded-full border border-white/10 font-medium text-xs hover:border-[#FFE600] hover:text-[#FFE600] transition shrink-0"
    : "inline-flex items-center gap-1.5 bg-white text-black px-2.5 py-1 rounded-lg border-2 border-black font-bold text-xs shadow-[2px_2px_0px_0px_#000] hover:bg-neutral-100 transition shrink-0";

  const searchInputClass = isMinimalist
    ? "w-full bg-white border border-[#E3DEC3] rounded-full p-4 pl-12 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#8C6D3F] transition-all text-neutral-800 placeholder-neutral-400"
    : isDark
    ? "w-full bg-[#1E1E1E] border border-[#2D2D2D] rounded-xl p-4 pl-12 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#FFB800] transition-all text-white placeholder-neutral-500"
    : isRetro
    ? "w-full bg-white border-4 border-[#C84B31] rounded-2xl p-4 pl-12 text-sm font-black focus:outline-none focus:border-red-600 focus:shadow-[0_0_15px_rgba(200,75,49,0.15)] transition-all text-neutral-800 placeholder-neutral-400 shadow-[4px_4px_0px_0px_rgba(200,75,49,0.2)] font-serif"
    : isNature
    ? "w-full bg-white border border-[#C3D7BE] rounded-2xl p-4 pl-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5F8D58] transition-all text-neutral-800 placeholder-neutral-400"
    : isCyberpunk
    ? "w-full bg-[#161616] border border-white/10 rounded-xl p-4 pl-12 text-sm font-medium focus:outline-none focus:border-[#CCFF00] focus:shadow-[0_0_15px_rgba(204,255,0,0.15)] transition-all text-white placeholder-neutral-500 font-mono"
    : isLuxury
    ? "w-full bg-[#1F1F1F] border border-white/10 rounded-xl p-4 pl-12 text-sm font-medium focus:outline-none focus:border-[#FFE600] focus:shadow-[0_0_15px_rgba(255,230,0,0.15)] transition-all text-white placeholder-neutral-500 font-sans"
    : "w-full bg-white border-4 border-black rounded-none p-4 pl-12 text-lg font-bold shadow-[4px_4px_0px_0px_#000] focus:outline-none focus:shadow-[2px_2px_0px_0px_#000] focus:translate-x-[2px] focus:translate-y-[2px] transition-all text-black";

  return (
    <div className={wrapperClass}>
      
      {isRetro && <div style={checkerboardStyle} className="border-b-2 border-black relative z-10 shrink-0" />}

      {isLuxury && (
        <div 
          className="fixed inset-0 pointer-events-none z-[5] opacity-[0.08]" 
          style={{
            backgroundImage: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)"/></svg>')`
          }}
        />
      )}

      {isCyberpunk && (
        <div 
          className="fixed inset-0 pointer-events-none z-[5] opacity-[0.12]" 
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
            backgroundSize: `24px 24px`
          }}
        />
      )}

      {/* Floating Language Selector & Share Button */}
      <div className="absolute top-[max(0.75rem,calc(env(safe-area-inset-top)+0.5rem))] right-4 z-[60] flex items-center gap-2">
        <button
          onClick={handleShare}
          className={isMinimalist 
            ? "inline-flex items-center gap-1.5 bg-white text-[#2C2520] p-2.5 rounded-full border border-[#E3DEC3] hover:bg-[#FAF6F0] transition shadow-sm"
            : isDark
            ? "inline-flex items-center gap-1.5 bg-[#2E2E2E] text-white p-2.5 rounded-xl border border-[#3E3E3E] hover:bg-[#3E3E3E] transition shadow-sm"
            : isLuxury
            ? "inline-flex items-center gap-1.5 bg-[#1F1F1F] text-[#FFE600] p-2.5 rounded-xl border border-white/10 hover:border-[#FFE600] transition shadow-sm"
            : isCyberpunk
            ? "inline-flex items-center gap-1.5 bg-[#1F1F1F] text-[#CCFF00] p-2.5 rounded-xl border border-white/10 hover:border-[#CCFF00] transition shadow-sm font-mono"
            : isRetro
            ? "inline-flex items-center gap-1.5 bg-white text-[#C84B31] p-2 rounded-xl border-4 border-[#C84B31] hover:bg-neutral-50 transition shadow-[2px_2px_0px_0px_rgba(200,75,49,0.2)] font-serif"
            : "neo-pill-btn bg-white text-black border-2 border-black p-2 rounded-xl flex items-center gap-1.5 hover:bg-[#FFB800] transition shadow-[2px_2px_0px_0px_#000]"}
          title={t('share_menu', 'Partager le menu')}
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-bold">{t('share', 'Partager')}</span>
        </button>
        <button
          onClick={() => setIsCartOpen(true)}
          className={isMinimalist
            ? "inline-flex items-center gap-1.5 bg-[#8C6D3F] text-white p-2 sm:px-3 sm:py-2 rounded-full hover:bg-[#725730] transition shadow-sm"
            : isDark
            ? "inline-flex items-center gap-1.5 bg-[#FFB800] text-black p-2 sm:px-3 sm:py-2 rounded-xl border border-black hover:bg-amber-400 transition shadow-sm"
            : isLuxury
            ? "inline-flex items-center gap-1.5 bg-[#FFE600] text-black p-2 sm:px-3 sm:py-2 rounded-xl border border-black hover:bg-amber-300 transition shadow-sm"
            : isCyberpunk
            ? "inline-flex items-center gap-1.5 bg-[#CCFF00] text-black p-2 sm:px-3 sm:py-2 rounded-xl border border-black hover:bg-lime-400 transition shadow-sm font-mono"
            : isRetro
            ? "inline-flex items-center gap-1.5 bg-[#C84B31] text-white p-2 rounded-xl border-4 border-black hover:bg-[#b03f29] transition shadow-[2px_2px_0px_0px_#000] font-serif"
            : "neo-pill-btn bg-[#FFB800] text-black border-2 border-black p-2 sm:px-3 sm:py-2 rounded-xl flex items-center gap-1.5 hover:bg-amber-400 transition shadow-[2px_2px_0px_0px_#000]"}
          title={t('my_cart', 'Mon Panier')}
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4 text-black" />
            {totalCartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white font-mono text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="hidden sm:inline text-xs font-black uppercase">
            {t('cart', 'Panier')} {totalCartCount > 0 ? `(${totalCartCount})` : ''}
          </span>
        </button>
        <LanguageSelector />
      </div>

      {/* Header Banner */}
      <div className={bannerClass} style={bannerStyle}>
        <div className="max-w-3xl mx-auto flex items-center gap-4 pt-2">
          {merchant.logo_url ? (
            <img
              src={merchant.logo_url}
              alt={merchant.business_name}
              className={logoClass}
            />
          ) : (
            <div className={isMinimalist
              ? "w-16 h-16 rounded-full bg-white border border-[#E3DEC3] flex items-center justify-center font-black text-3xl shrink-0"
              : isDark
              ? "w-16 h-16 rounded-xl bg-[#1E1E1E] border border-[#2D2D2D] flex items-center justify-center font-black text-3xl shrink-0 text-white"
              : isLuxury
              ? "w-16 h-16 rounded-xl bg-neutral-900 border border-white/20 flex items-center justify-center font-serif text-[#FFE600] font-black text-3xl shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
              : isCyberpunk
              ? "w-16 h-16 rounded-xl bg-[#1E1E1E] border border-[#CCFF00]/20 flex items-center justify-center font-mono text-[#CCFF00] font-black text-3xl shrink-0"
              : isRetro
              ? "w-16 h-16 rounded-2xl bg-white border-4 border-[#C84B31] flex items-center justify-center font-serif text-[#C84B31] font-black text-3xl shrink-0 shadow-[4px_4px_0px_0px_rgba(200,75,49,0.25)]"
              : "w-16 h-16 rounded-xl bg-white border-4 border-black flex items-center justify-center font-black text-3xl shadow-[4px_4px_0px_0px_#000] shrink-0"
            }>
              {merchant.business_name?.[0] || 'R'}
            </div>
          )}

          <div className="space-y-1.5 flex-1 min-w-0">
            <h1 className={isMinimalist 
              ? "text-2xl sm:text-3xl font-bold tracking-tight leading-tight truncate text-[#2C2520]" 
              : isLuxury
              ? "text-2xl sm:text-3xl font-bold font-serif tracking-widest leading-tight truncate text-[#FFE600] uppercase"
              : isCyberpunk
              ? "text-2xl sm:text-3xl font-black font-mono tracking-widest leading-tight truncate text-[#CCFF00] uppercase"
              : isRetro
              ? "text-2xl sm:text-3xl font-black font-serif tracking-widest leading-tight truncate text-[#C84B31] uppercase"
              : "text-2xl sm:text-3xl font-black tracking-tight leading-tight truncate"
            }>{merchant.business_name}</h1>
            
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {merchant.google_maps_url ? (
                <a
                  href={merchant.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={btnLinkClass}
                  title={t('open_google_maps', 'Ouvrir dans Google Maps')}
                >
                  <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span className="truncate max-w-[180px] sm:max-w-[240px]">
                    {[merchant.city, merchant.country].filter(Boolean).join(', ') || t('view_on_maps', 'Itinéraire Maps')}
                  </span>
                  <ExternalLink className="w-3 h-3 text-neutral-400 shrink-0" />
                </a>
              ) : (
                (merchant.city || merchant.country) && (
                  <p className="text-xs sm:text-sm font-bold flex items-center gap-1.5 opacity-90">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{[merchant.city, merchant.country].filter(Boolean).join(', ')}</span>
                  </p>
                )
              )}

              {merchant.instagram_url && (
                <a
                  href={merchant.instagram_url.startsWith('http') ? merchant.instagram_url : `https://instagram.com/${merchant.instagram_url.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={btnLinkClass}
                  title="Instagram"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                  <span>Instagram</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400 shrink-0" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      {isRetro && <div style={checkerboardStyle} className="border-y-2 border-black relative z-10 shrink-0" />}

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* ── Banner Commande en Ligne & Livraison ── */}
          <div className={
            isMinimalist
              ? "bg-[#FAF6F0] border border-[#E3DEC3] p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 font-serif"
              : isDark
              ? "bg-[#202020] border border-[#333] p-4 sm:p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-white"
              : isLuxury
              ? "bg-[#181818] border border-[#FFE600]/30 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-[#FFE600] font-serif"
              : isCyberpunk
              ? "bg-[#141414] border-2 border-[#CCFF00] p-4 sm:p-5 rounded-xl shadow-[0_0_15px_rgba(204,255,0,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-[#CCFF00] font-mono"
              : isRetro
              ? "bg-white border-4 border-[#C84B31] p-4 sm:p-5 rounded-3xl shadow-[4px_4px_0px_0px_rgba(200,75,49,0.3)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-[#C84B31] font-serif"
              : "neo-box p-4 sm:p-5 bg-white border-3 sm:border-4 border-black rounded-2xl sm:rounded-3xl shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
          }>
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full border border-black flex items-center gap-1 shadow-[1px_1px_0px_0px_#000] ${
                  merchant.orders_paused 
                    ? 'bg-red-500 text-white' 
                    : 'bg-[#00F59B] text-black'
                }`}>
                  {merchant.orders_paused ? '⏸️ Commandes suspendues' : '🛵 Commandes & Livraison'}
                </span>

                {Number(merchant.min_order_amount) > 0 && (
                  <span className="text-[10px] sm:text-xs font-black text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-300">
                    {t('min_order_short', 'Panier min')} : {formatPrice(Number(merchant.min_order_amount), merchant?.currency, language)}
                  </span>
                )}

                {Number(merchant.delivery_fee) > 0 ? (
                  <span className="text-[10px] sm:text-xs font-black text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-300">
                    {t('delivery_fee_short', 'Livraison')} : {formatPrice(Number(merchant.delivery_fee), merchant?.currency, language)}
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300">
                    {t('free_delivery', 'Livraison Gratuite')}
                  </span>
                )}
              </div>

              <p className="text-xs font-bold opacity-80 leading-relaxed">
                {merchant.orders_paused 
                  ? t('orders_paused_hint', 'Le restaurant ne prend pas de commandes pour le moment.')
                  : t('order_online_hint', 'Composez votre panier et commandez en livraison ou à emporter en quelques clics.')}
              </p>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className={
                isMinimalist ? "w-full sm:w-auto bg-[#2C2520] text-white px-4 py-2.5 rounded-xl text-xs font-bold shrink-0" :
                isDark ? "w-full sm:w-auto bg-[#FFB800] text-black px-4 py-2.5 rounded-xl text-xs font-bold shrink-0" :
                isLuxury ? "w-full sm:w-auto bg-[#FFE600] text-black px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 font-sans" :
                isCyberpunk ? "w-full sm:w-auto bg-[#CCFF00] text-black px-4 py-2.5 rounded-xl text-xs font-black shrink-0 font-mono" :
                isRetro ? "w-full sm:w-auto bg-[#C84B31] text-white px-4 py-2.5 rounded-2xl border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000] shrink-0" :
                "w-full sm:w-auto neo-pill-btn bg-[#FFB800] hover:bg-amber-400 text-black px-4 py-2.5 text-xs font-black flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000] shrink-0"
              }
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{totalCartCount > 0 ? `${t('checkout_btn', 'Voir Panier')} (${totalCartCount})` : t('open_cart', 'Voir Mon Panier')}</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className={`w-5 h-5 absolute left-4 top-4 ${
              isMinimalist ? 'text-[#8C6D3F]' : 
              isDark ? 'text-neutral-400' : 
              isRetro ? 'text-[#C84B31]' :
              isNature ? 'text-[#5F8D58]' :
              isCyberpunk ? 'text-[#CCFF00]' :
              isLuxury ? 'text-[#FFE600]' :
              'text-black'
            }`} />
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
              className={searchInputClass}
            />
          </div>

          {/* VIEW CONTROLLER */}
          {!isSearching && activeCategory === null && (
            /* --- HOME VIEW: CATEGORIES --- */
            <div className={(isLuxury || isCyberpunk || isRetro) ? "grid grid-cols-1 gap-6 max-w-2xl mx-auto w-full" : "grid grid-cols-1 sm:grid-cols-2 gap-6"}>
              {categories.map((cat, index) => {
                const colorClass = NEO_COLORS[index % NEO_COLORS.length];
                const itemsCount = menuItems.filter(i => i.category_id === cat.id).length;
                const hasImage = Boolean(cat.image_url && cat.image_url.trim().length > 0);
                
                if (isLuxury) {
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 min-h-[170px] sm:min-h-[190px] h-48 sm:h-56 flex items-end p-6 transition-all duration-300 hover:border-[#FFE600] w-full text-left shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                    >
                      {hasImage ? (
                        <div className="absolute inset-0 z-0">
                          <div 
                            className="bg-cover bg-center w-full h-full opacity-55 group-hover:opacity-75 transition-all duration-700 group-hover:scale-105"
                            style={{ backgroundImage: `url(${cat.image_url})` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent"></div>
                        </div>
                      ) : (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FFE600]/5 to-transparent rounded-bl-full pointer-events-none" />
                      )}
                      
                      <div className="relative z-10 w-full flex justify-between items-end">
                        <div>
                          <p className="text-[10px] tracking-widest text-[#FFE600]/80 font-mono uppercase mb-1">
                            {`COLLECTION ${index + 1 < 10 ? `0${index + 1}` : index + 1}`}
                          </p>
                          <h3 className="text-2xl sm:text-3xl font-bold text-[#FFE600] font-serif">
                            {getLocalizedName(cat)}
                          </h3>
                          <p className="text-[10px] tracking-wider text-neutral-300 font-mono uppercase mt-1">
                            {language === 'ar' 
                              ? `${itemsCount} ${itemsCount > 1 ? t('items', 'أطباق') : t('item', 'طبق')}`
                              : `${itemsCount} ${itemsCount > 1 ? t('items', 'articles') : t('item', 'article')}`}
                          </p>
                        </div>
                        <div className="h-11 w-11 rounded-full bg-neutral-800/80 flex items-center justify-center border border-white/10 group-hover:bg-[#FFE600] group-hover:text-black transition-colors shrink-0">
                          <ArrowLeft className="w-5 h-5 rotate-180" />
                        </div>
                      </div>
                    </button>
                  );
                }

                if (isCyberpunk) {
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#121212] min-h-[170px] sm:min-h-[190px] h-48 sm:h-56 flex items-end p-6 transition-all duration-300 hover:border-[#CCFF00] w-full text-left shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                    >
                      {hasImage ? (
                        <div className="absolute inset-0 z-0">
                          <div 
                            className="bg-cover bg-center w-full h-full opacity-50 group-hover:opacity-75 transition-all duration-700 group-hover:scale-105"
                            style={{ backgroundImage: `url(${cat.image_url})` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-transparent"></div>
                        </div>
                      ) : (
                        <div className="absolute top-0 right-0 p-3 opacity-20 text-[10px] font-mono text-[#CCFF00]">
                          SYS://CAT_NODE_{index + 1}
                        </div>
                      )}
                      
                      <div className="relative z-10 w-full flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-mono text-[#CCFF00] uppercase tracking-widest mb-1.5">
                            {`// CATEGORY 0${index + 1}`}
                          </p>
                          <h3 className="text-xl sm:text-2xl font-black text-white font-mono uppercase tracking-wider">
                            {getLocalizedName(cat)}
                          </h3>
                          <p className="text-[10px] tracking-wider text-neutral-300 font-mono uppercase mt-1">
                            {language === 'ar' 
                              ? `${itemsCount} ${itemsCount > 1 ? t('items', 'أطباق') : t('item', 'طبق')}`
                              : `${itemsCount} ${itemsCount > 1 ? t('items', 'articles') : t('item', 'article')}`}
                          </p>
                        </div>
                        <div className="h-11 w-11 rounded-full bg-neutral-800/80 flex items-center justify-center border border-white/10 group-hover:bg-[#CCFF00] group-hover:text-black transition-colors shrink-0">
                          <ArrowLeft className="w-5 h-5 rotate-180" />
                        </div>
                      </div>
                    </button>
                  );
                }

                if (isRetro) {
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`group relative overflow-hidden rounded-3xl border-4 border-[#C84B31] bg-white flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] shadow-[6px_6px_0px_0px_rgba(200,75,49,0.3)] w-full text-center ${
                        hasImage ? 'h-56 sm:h-64' : 'p-6'
                      }`}
                    >
                      <div style={checkerboardStyle} className="border-b-2 border-[#C84B31]" />
                      
                      {hasImage ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-4">
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-[0_4px_12px_rgba(0,0,0,0.25)] overflow-hidden bg-neutral-100 flex items-center justify-center relative">
                            <img 
                              src={cat.image_url!} 
                              alt={getLocalizedName(cat)} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute bottom-0 right-0 bg-[#F4F1EA] border-2 border-[#C84B31] text-[10px] font-black text-[#C84B31] font-mono rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                              {index + 1}
                            </div>
                          </div>
                          <h3 className="text-lg sm:text-xl font-black text-[#C84B31] font-serif uppercase tracking-widest mt-3 drop-shadow-[0_1px_1px_rgba(200,75,49,0.15)] leading-tight px-4">
                            {getLocalizedName(cat)}
                          </h3>
                        </div>
                      ) : (
                        <div className="py-4 flex items-center justify-between px-4 w-full">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-[#C84B31] text-white font-mono font-black text-xs flex items-center justify-center shadow-sm">
                              #{index + 1}
                            </span>
                            <h3 className="text-xl font-black text-[#C84B31] font-serif uppercase tracking-wider text-left">
                              {getLocalizedName(cat)}
                            </h3>
                          </div>
                          <span className="bg-[#F4F1EA] text-[#C84B31] border-2 border-[#C84B31] px-3 py-1 rounded-xl text-xs font-bold font-mono">
                            {itemsCount} {itemsCount > 1 ? t('items', 'articles') : t('item', 'article')}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                }

                if (isMinimalist) {
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className="group relative overflow-hidden rounded-2xl border border-[#E3DEC3] bg-white min-h-[160px] flex flex-col justify-between transition-all duration-300 hover:shadow-lg w-full text-left"
                    >
                      {hasImage ? (
                        <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-[#FAF6F0]">
                          <img
                            src={cat.image_url!}
                            alt={getLocalizedName(cat)}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                        </div>
                      ) : (
                        <div className="absolute top-0 right-0 w-28 h-28 bg-[#FAF6F0] rounded-bl-full pointer-events-none" />
                      )}
                      <div className="p-5 relative z-10 w-full flex justify-between items-end">
                        <div>
                          <h3 className="font-bold text-xl uppercase tracking-tight text-[#2C2520] font-serif leading-snug">
                            {getLocalizedName(cat)}
                          </h3>
                          <p className="font-bold text-xs text-[#8C6D3F] mt-1 font-mono">
                            {language === 'ar' 
                              ? `${itemsCount} ${itemsCount > 1 ? t('items', 'أطباق') : t('item', 'طبق')}`
                              : `${itemsCount} ${itemsCount > 1 ? t('items', 'articles') : t('item', 'article')}`}
                          </p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-[#FAF6F0] border border-[#E3DEC3] text-[#8C6D3F] shrink-0 flex items-center justify-center group-hover:bg-[#2C2520] group-hover:text-white transition-colors">
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </div>
                      </div>
                    </button>
                  );
                }

                if (isDark) {
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className="group relative overflow-hidden rounded-2xl border border-[#2D2D2D] bg-[#1E1E1E] min-h-[160px] flex flex-col justify-between transition-all duration-300 hover:border-[#FFB800] w-full text-left shadow-lg"
                    >
                      {hasImage ? (
                        <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-neutral-900">
                          <img
                            src={cat.image_url!}
                            alt={getLocalizedName(cat)}
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-all duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] via-[#1E1E1E]/80 to-transparent" />
                        </div>
                      ) : (
                        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#FFB800]/10 to-transparent rounded-bl-full pointer-events-none" />
                      )}
                      <div className="p-5 relative z-10 w-full flex justify-between items-end">
                        <div>
                          <h3 className="font-bold text-xl uppercase tracking-tight text-white leading-snug">
                            {getLocalizedName(cat)}
                          </h3>
                          <p className="font-bold text-xs text-[#FFB800] mt-1 font-mono">
                            {language === 'ar' 
                              ? `${itemsCount} ${itemsCount > 1 ? t('items', 'أطباق') : t('item', 'طبق')}`
                              : `${itemsCount} ${itemsCount > 1 ? t('items', 'articles') : t('item', 'article')}`}
                          </p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-[#2D2D2D] border border-[#3D3D3D] text-white shrink-0 flex items-center justify-center group-hover:bg-[#FFB800] group-hover:text-black transition-colors">
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </div>
                      </div>
                    </button>
                  );
                }

                if (isNature) {
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className="group relative overflow-hidden rounded-3xl border border-[#D1E2CD] bg-white min-h-[160px] flex flex-col justify-between transition-all duration-300 hover:border-[#5F8D58] hover:shadow-lg w-full text-left"
                    >
                      {hasImage ? (
                        <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-[#E6EFE4]">
                          <img
                            src={cat.image_url!}
                            alt={getLocalizedName(cat)}
                            className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
                        </div>
                      ) : (
                        <div className="absolute top-0 right-0 w-28 h-28 bg-[#E6EFE4] rounded-bl-full pointer-events-none" />
                      )}
                      <div className="p-6 relative z-10 w-full flex justify-between items-end">
                        <div>
                          <h3 className="font-bold text-xl uppercase tracking-tight text-[#2D3F2E] leading-snug">
                            {getLocalizedName(cat)}
                          </h3>
                          <p className="font-bold text-xs text-[#5F8D58] bg-[#E6EFE4] inline-block px-3 py-0.5 rounded-full mt-1.5 font-mono">
                            {language === 'ar' 
                              ? `${itemsCount} ${itemsCount > 1 ? t('items', 'أطباق') : t('item', 'طبق')}`
                              : `${itemsCount} ${itemsCount > 1 ? t('items', 'articles') : t('item', 'article')}`}
                          </p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-[#E6EFE4] text-[#5F8D58] shrink-0 flex items-center justify-center group-hover:bg-[#5F8D58] group-hover:text-white transition-colors">
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </div>
                      </div>
                    </button>
                  );
                }

                // Default: Néo-Brutalist
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full group relative overflow-hidden rounded-2xl border-4 border-black ${colorClass} min-h-[170px] flex flex-col justify-between transition-all duration-300 shadow-[6px_6px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none text-left`}
                  >
                    <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:16px_16px]"></div>
                    {hasImage && (
                      <div className="relative w-full h-40 sm:h-48 border-b-4 border-black overflow-hidden bg-white">
                        <img
                          src={cat.image_url!}
                          alt={getLocalizedName(cat)}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-5 sm:p-6 relative z-10 w-full flex-1 flex flex-col justify-between">
                      <h3 className="font-black text-xl sm:text-2xl uppercase tracking-tight text-black leading-snug break-words mb-3">
                        {getLocalizedName(cat)}
                      </h3>
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-xs sm:text-sm text-black bg-white/90 px-3 py-1 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000]">
                          {language === 'ar' 
                            ? `${itemsCount} ${itemsCount > 1 ? t('items', 'أطباق') : t('item', 'طبق')}`
                            : `${itemsCount} ${itemsCount > 1 ? t('items', 'articles') : t('item', 'article')}`}
                        </span>
                        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white shrink-0 flex items-center justify-center border-3 border-black group-hover:bg-black group-hover:text-white transition-all shadow-[2px_2px_0px_0px_#000]">
                          <ArrowLeft className="w-5 h-5 rotate-180" />
                        </div>
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

          {(isSearching || activeCategory !== null) && (
            /* --- CATEGORY DETAIL OR SEARCH RESULTS --- */
            <div className="space-y-6">
              {!isSearching && (() => {
                const currentCat = categories.find((c) => c.id === activeCategory);
                const hasCatImage = Boolean(currentCat?.image_url && currentCat.image_url.trim().length > 0);

                return (
                  <div className="space-y-4">
                    <div className={`flex items-center justify-between pb-3 ${
                      isMinimalist ? 'border-b border-[#E3DEC3]' : 
                      isDark ? 'border-b border-[#2D2D2D]' : 
                      isRetro ? 'border-b-2 border-dashed border-[#3A3530]' : 
                      isNature ? 'border-b border-[#C3D7BE]' : 
                      isCyberpunk ? 'border-b border-white/10' : 
                      isLuxury ? 'border-b border-white/10' :
                      'border-b-4 border-black'
                    }`}>
                      <button 
                        onClick={() => setActiveCategory(null)}
                        className={isMinimalist
                          ? "flex items-center gap-2 font-bold uppercase text-xs text-[#2C2520] hover:opacity-85"
                          : isDark
                          ? "flex items-center gap-2 font-bold uppercase text-xs text-neutral-400 hover:text-white"
                          : isRetro
                          ? "flex items-center gap-2 font-bold uppercase text-xs text-[#3A3530] hover:text-[#C84B31] font-mono"
                          : isNature
                          ? "flex items-center gap-2 font-bold uppercase text-xs text-[#5F8D58] hover:opacity-80"
                          : isCyberpunk
                          ? "flex items-center gap-2 font-bold uppercase text-xs text-neutral-400 hover:text-[#CCFF00] font-mono transition-colors"
                          : isLuxury
                          ? "flex items-center gap-2 font-bold uppercase text-neutral-400 hover:text-[#FFE600] font-mono transition-colors"
                          : "flex items-center gap-2 font-black uppercase text-sm hover:underline"
                        }
                      >
                        <ArrowLeft className="w-5 h-5" />
                        {t('back_to_categories', 'Retour aux catégories')}
                      </button>
                      <h2 className={isMinimalist
                        ? "font-bold text-lg sm:text-xl uppercase text-[#8C6D3F]"
                        : isDark
                        ? "font-bold text-lg sm:text-xl uppercase text-white"
                        : isRetro
                        ? "font-bold text-lg sm:text-xl uppercase text-[#C84B31] font-mono"
                        : isNature
                        ? "font-bold text-lg sm:text-xl uppercase text-[#5F8D58]"
                        : isCyberpunk
                        ? "font-mono font-bold text-lg sm:text-xl uppercase text-[#CCFF00] tracking-wider"
                        : isLuxury
                        ? "font-serif font-bold text-lg sm:text-xl uppercase text-[#FFE600] tracking-wider"
                        : "font-black text-xl sm:text-2xl uppercase bg-[#FFB800] px-3 py-1 border-2 border-black -rotate-2"
                      } style={isBrutalist ? { backgroundColor: themeColor } : undefined}>
                        {getLocalizedName(currentCat || {})}
                      </h2>
                    </div>

                    {/* Selected Category Photo Banner */}
                    {hasCatImage && currentCat && (
                      <div className={
                        isLuxury ? "relative w-full h-44 sm:h-56 rounded-2xl overflow-hidden border border-white/10 shadow-2xl" :
                        isCyberpunk ? "relative w-full h-44 sm:h-56 rounded-xl overflow-hidden border border-[#CCFF00]/40 shadow-[0_0_20px_rgba(204,255,0,0.15)]" :
                        isRetro ? "relative w-full h-44 sm:h-56 rounded-3xl overflow-hidden border-4 border-[#C84B31] shadow-[6px_6px_0px_0px_rgba(200,75,49,0.3)] bg-white" :
                        isMinimalist ? "relative w-full h-40 sm:h-52 rounded-2xl overflow-hidden border border-[#E3DEC3] shadow-md bg-[#FAF6F0]" :
                        isDark ? "relative w-full h-44 sm:h-56 rounded-2xl overflow-hidden border border-[#2D2D2D] shadow-2xl bg-[#1E1E1E]" :
                        isNature ? "relative w-full h-44 sm:h-56 rounded-3xl overflow-hidden border border-[#D1E2CD] shadow-md bg-[#E6EFE4]" :
                        "relative w-full h-44 sm:h-56 rounded-2xl overflow-hidden border-4 border-black shadow-[6px_6px_0px_0px_#000] bg-white"
                      }>
                        {isRetro && <div style={checkerboardStyle} className="border-b-2 border-[#C84B31] relative z-10" />}
                        <img
                          src={currentCat.image_url!}
                          alt={getLocalizedName(currentCat)}
                          className="w-full h-full object-cover"
                        />
                        <div className={
                          isMinimalist ? "absolute inset-0 bg-gradient-to-t from-white/90 via-white/30 to-transparent" :
                          isNature ? "absolute inset-0 bg-gradient-to-t from-[#E6EFE4]/90 via-transparent to-transparent" :
                          "absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
                        } />
                        <div className="absolute bottom-4 left-5 right-5 z-10 flex justify-between items-end">
                          <div>
                            <p className={
                              isCyberpunk ? "text-[10px] font-mono text-[#CCFF00] uppercase tracking-widest mb-1" :
                              isLuxury ? "text-[10px] tracking-widest text-[#FFE600]/80 font-mono uppercase mb-1" :
                              "text-[10px] uppercase font-mono opacity-80 mb-1"
                            }>
                              {isCyberpunk ? "// CATEGORY ACTIVE" : isLuxury ? "COLLECTION" : "CATÉGORIE"}
                            </p>
                            <h3 className={
                              isMinimalist ? "text-2xl sm:text-3xl font-serif font-bold text-[#2C2520] leading-tight" :
                              isRetro ? "text-2xl sm:text-3xl font-serif font-black text-white leading-tight drop-shadow-md" :
                              isLuxury ? "text-2xl sm:text-3xl font-serif font-bold text-[#FFE600] leading-tight" :
                              isCyberpunk ? "text-2xl sm:text-3xl font-mono font-black text-white uppercase leading-tight" :
                              isNature ? "text-2xl sm:text-3xl font-bold text-[#2D3F2E] leading-tight" :
                              isDark ? "text-2xl sm:text-3xl font-bold text-white leading-tight" :
                              "text-2xl sm:text-3xl font-black text-white uppercase leading-tight drop-shadow-[2px_2px_0px_#000]"
                            }>
                              {getLocalizedName(currentCat)}
                            </h3>
                          </div>
                          <span className={
                            isMinimalist ? "bg-[#FAF6F0] text-[#8C6D3F] border border-[#E3DEC3] px-3 py-1 rounded-full text-xs font-mono font-bold" :
                            isCyberpunk ? "bg-black/80 text-[#CCFF00] border border-[#CCFF00]/40 px-3 py-1 rounded-lg text-xs font-mono font-bold" :
                            isLuxury ? "bg-black/80 text-[#FFE600] border border-[#FFE600]/30 px-3 py-1 rounded-full text-xs font-mono font-bold" :
                            isRetro ? "bg-[#F4F1EA] text-[#C84B31] border-2 border-[#C84B31] px-3 py-1 rounded-xl text-xs font-mono font-bold" :
                            isNature ? "bg-[#5F8D58] text-white px-3 py-1 rounded-full text-xs font-mono font-bold" :
                            isDark ? "bg-[#2D2D2D] text-[#FFB800] border border-[#3D3D3D] px-3 py-1 rounded-xl text-xs font-mono font-bold" :
                            "bg-white text-black border-2 border-black px-3 py-1 rounded-lg text-xs font-mono font-black shadow-[2px_2px_0px_0px_#000]"
                          }>
                            {filteredItems.length} {filteredItems.length > 1 ? t('items', 'articles') : t('item', 'article')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {isSearching && (
                <h2 className={isMinimalist
                  ? "font-bold text-lg uppercase mb-4 text-[#2C2520]"
                  : isDark
                  ? "font-bold text-lg uppercase mb-4 text-white"
                  : isRetro
                  ? "font-bold text-base uppercase mb-4 text-[#3A3530] font-mono"
                  : isNature
                  ? "font-bold text-lg uppercase mb-4 text-[#2D3F2E]"
                  : isCyberpunk
                  ? "font-bold text-base uppercase mb-4 text-[#CCFF00] font-mono"
                  : isLuxury
                  ? "font-serif font-bold text-lg uppercase mb-4 text-[#FFE600]"
                  : "font-black text-xl uppercase mb-4"
                }>
                  {t('search_results', 'Résultats pour')} "{searchQuery}"
                </h2>
              )}

              {filteredItems.length === 0 ? (
                <div className={isMinimalist
                  ? "p-12 text-center space-y-4 bg-white border border-[#E3DEC3] rounded-2xl"
                  : isDark
                  ? "p-12 text-center space-y-4 bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl"
                  : isRetro
                  ? "p-12 text-center space-y-4 bg-white border-4 border-[#C84B31] rounded-3xl font-serif text-[#C84B31] shadow-[4px_4px_0px_0px_rgba(200,75,49,0.2)]"
                  : isNature
                  ? "p-12 text-center space-y-4 bg-white border border-[#C3D7BE] rounded-3xl"
                  : isCyberpunk
                  ? "p-12 text-center space-y-4 bg-[#161616] border border-white/10 rounded-xl font-mono text-[#CCFF00]"
                  : isLuxury
                  ? "p-12 text-center space-y-4 bg-[#1F1F1F] border border-white/10 rounded-2xl font-serif text-[#FFE600]"
                  : "neo-box p-12 text-center space-y-4 bg-white border-dashed border-4 border-black"
                }>
                  <Utensils className="w-12 h-12 text-neutral-400 mx-auto" />
                  <p className="font-bold text-base tracking-wider">{t('no_dish_found', 'Aucun plat correspondant.')}</p>
                </div>
              ) : (
                <div className={isLuxury ? "grid grid-cols-1 sm:grid-cols-2 gap-6" : "grid gap-6"}>
                  {filteredItems.map((item) => {
                    const isAvail = item.is_available;
                    const qtyInCart = getItemQuantityInCart(item.id);

                    if (isRetro) {
                      const hasImage = Boolean(item.image_url && item.image_url.trim().length > 0);
                      return (
                        <article
                          key={item.id}
                          onClick={() => isAvail && openItemModal(item)}
                          className={`group relative bg-white rounded-3xl overflow-hidden border-4 border-[#C84B31] hover:scale-[1.01] transition-all duration-300 flex flex-col shadow-[6px_6px_0px_0px_rgba(200,75,49,0.2)] ${
                            isAvail ? 'cursor-pointer' : 'opacity-50 grayscale'
                          }`}
                        >
                          <div style={checkerboardStyle} className="border-b-2 border-black" />
                          {hasImage && (
                            <div className="relative w-full aspect-video sm:aspect-[21/9] overflow-hidden bg-neutral-100">
                              <img
                                src={item.image_url!}
                                alt={getLocalizedName(item)}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 border-b-2 border-black"
                              />
                              
                              {item.is_featured && (
                                <div className="absolute top-4 left-4 bg-white border-2 border-[#C84B31] px-3 py-1 rounded-full flex items-center gap-1.5 z-10 shadow-md">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#C84B31]" />
                                  <span className="font-serif text-[9px] text-[#C84B31] font-bold uppercase tracking-wider">
                                    {t('popular', 'Populaire')}
                                  </span>
                                </div>
                              )}

                              <div className="absolute top-4 right-4 bg-[#C84B31] text-white px-3 py-1.5 rounded-xl font-mono text-xs font-black shadow-md border-2 border-white rotate-6 hover:rotate-0 transition-transform">
                                {formatPrice(item.price, merchant?.currency, language)}
                              </div>
                            </div>
                          )}
                          <div className="p-6 flex flex-col flex-1 bg-white">
                            <div className="flex justify-between items-start gap-4 mb-2">
                              <div>
                                {!hasImage && item.is_featured && (
                                  <div className="inline-flex items-center gap-1.5 bg-white border-2 border-[#C84B31] px-2.5 py-0.5 rounded-full mb-2 shadow-xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#C84B31]" />
                                    <span className="font-serif text-[9px] text-[#C84B31] font-bold uppercase tracking-wider">
                                      {t('popular', 'Populaire')}
                                    </span>
                                  </div>
                                )}
                                <h3 className="font-serif text-lg sm:text-xl font-black text-[#C84B31] uppercase tracking-wider leading-tight">
                                  {getLocalizedName(item)}
                                </h3>
                              </div>
                              {!hasImage && (
                                <div className="bg-[#C84B31] text-white px-3 py-1.5 rounded-xl font-mono text-xs font-black shadow-md border-2 border-black shrink-0">
                                  {formatPrice(item.price, merchant?.currency, language)}
                                </div>
                              )}
                            </div>
                            <p className="text-neutral-700 text-xs sm:text-sm font-medium leading-relaxed mb-4 font-serif">
                              {getLocalizedDesc(item)}
                            </p>
                            
                            {isAvail ? (
                              <div className="mt-auto">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(item, 1);
                                  }}
                                  className="bg-[#C84B31] hover:bg-[#b03f29] text-white font-black font-serif text-xs tracking-widest py-3 rounded-2xl w-full flex items-center justify-center gap-2 transition-all duration-300 border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>{qtyInCart > 0 ? `${t('add_to_order', 'Ajouter')} (${qtyInCart})` : t('add_to_order', 'Ajouter')}</span>
                                </button>
                              </div>
                            ) : (
                              <div className="mt-auto">
                                <span className="bg-red-50 text-red-600 px-2.5 py-1.5 rounded-xl border-2 border-red-200 font-bold text-[10px] uppercase block text-center font-serif">
                                  {t('out_of_stock', 'Rupture de stock')}
                                </span>
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    }

                    if (isCyberpunk) {
                      const hasImage = Boolean(item.image_url && item.image_url.trim().length > 0);
                      return (
                        <article
                          key={item.id}
                          onClick={() => isAvail && openItemModal(item)}
                          className={`group relative bg-[#161616] rounded-xl overflow-hidden border border-white/10 hover:border-[#CCFF00] transition-all duration-300 flex flex-col shadow-2xl ${
                            isAvail ? 'cursor-pointer' : 'opacity-50 grayscale'
                          }`}
                        >
                          {hasImage && (
                            <div className="relative w-full aspect-video sm:aspect-[21/9] overflow-hidden bg-neutral-900">
                              <img
                                src={item.image_url!}
                                alt={getLocalizedName(item)}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                              
                              {item.is_featured && (
                                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-[#CCFF00]/30 px-3 py-1 rounded-full flex items-center gap-1.5 z-10">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
                                  <span className="font-mono text-[9px] text-[#CCFF00] uppercase tracking-wider">
                                    {t('popular', 'Populaire')}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="p-6 flex flex-col flex-1 bg-[#161616]">
                            {!hasImage && item.is_featured && (
                              <div className="inline-flex items-center gap-1.5 bg-black border border-[#CCFF00]/40 px-2.5 py-0.5 rounded-full mb-2 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
                                <span className="font-mono text-[9px] text-[#CCFF00] uppercase tracking-wider">
                                  {t('popular', 'Populaire')}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-start gap-4 mb-2">
                              <h3 className="font-mono text-lg font-black text-white uppercase tracking-wider leading-tight">
                                {getLocalizedName(item)}
                              </h3>
                              <span className="font-mono text-base font-black text-[#CCFF00] shrink-0">
                                {formatPrice(item.price, merchant?.currency, language)}
                              </span>
                            </div>
                            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-4 font-mono">
                              {getLocalizedDesc(item)}
                            </p>
                            
                            {isAvail ? (
                              <div className="mt-auto">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(item, 1);
                                  }}
                                  className="bg-[#CCFF00] hover:bg-[#b0dc00] text-black font-black font-mono text-xs tracking-wider py-3 rounded-lg w-full flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_10px_rgba(204,255,0,0.2)]"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>{qtyInCart > 0 ? `${t('add_to_order', 'AJOUTER')} [${qtyInCart}]` : t('add_to_order', 'AJOUTER +')}</span>
                                </button>
                              </div>
                            ) : (
                              <div className="mt-auto">
                                <span className="bg-red-950/50 text-red-400 px-2.5 py-1.5 rounded border border-red-900 font-bold text-[10px] uppercase block text-center font-mono">
                                  {t('out_of_stock', 'Rupture de stock')}
                                </span>
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    }

                    if (isLuxury) {
                      const hasImage = Boolean(item.image_url && item.image_url.trim().length > 0);
                      return (
                        <article
                          key={item.id}
                          onClick={() => isAvail && openItemModal(item)}
                          className={`group relative bg-[#1F1F1F] rounded-2xl overflow-hidden border border-white/10 hover:border-[#FFE600] transition-all duration-300 flex flex-col shadow-2xl ${
                            isAvail ? 'cursor-pointer' : 'opacity-50 grayscale'
                          }`}
                        >
                          {hasImage && (
                            <div className="relative w-full aspect-[4/3] overflow-hidden bg-neutral-900">
                              <img
                                src={item.image_url!}
                                alt={getLocalizedName(item)}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-90"></div>
                              
                              {item.is_featured && (
                                <div className="absolute top-4 left-4 bg-neutral-950/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5 z-10">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFE600]" />
                                  <span className="font-mono text-[9px] text-white uppercase tracking-wider">
                                    {t('popular', 'Populaire')}
                                  </span>
                                </div>
                              )}

                              <div className="absolute bottom-0 right-0 bg-[#FFE600] text-black px-4 py-2.5 rounded-tl-xl font-mono text-sm font-bold z-10">
                                {formatPrice(item.price, merchant?.currency, language)}
                              </div>
                            </div>
                          )}
                          <div className="p-5 flex flex-col flex-1 bg-[#1F1F1F]">
                            <div className="flex justify-between items-start gap-4 mb-2">
                              <div>
                                {!hasImage && item.is_featured && (
                                  <div className="inline-flex items-center gap-1.5 bg-neutral-950 border border-white/10 px-2.5 py-0.5 rounded-full mb-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFE600]" />
                                    <span className="font-mono text-[9px] text-[#FFE600] uppercase tracking-wider">
                                      {t('popular', 'Populaire')}
                                    </span>
                                  </div>
                                )}
                                <h3 className="font-serif text-lg font-bold text-[#FFE600] leading-tight">
                                  {getLocalizedName(item)}
                                </h3>
                              </div>
                              {!hasImage && (
                                <div className="bg-[#FFE600] text-black px-3 py-1.5 rounded-xl font-mono text-xs font-bold shrink-0">
                                  {formatPrice(item.price, merchant?.currency, language)}
                                </div>
                              )}
                            </div>
                            <p className="text-neutral-400 text-xs leading-relaxed line-clamp-3 mb-4">
                              {getLocalizedDesc(item)}
                            </p>
                            
                            {isAvail ? (
                              <div className="mt-auto pt-2 flex items-center justify-between border-t border-white/10">
                                <span className="text-[10px] text-neutral-400 font-mono uppercase">
                                  {qtyInCart > 0 ? `${qtyInCart} in cart` : ''}
                                </span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(item, 1);
                                  }}
                                  className="bg-[#FFE600] hover:bg-yellow-400 text-black font-bold text-xs px-4 py-2 rounded-full flex items-center gap-1.5 transition-all duration-300 shadow-[0_0_12px_rgba(255,230,0,0.25)] ml-auto"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>{qtyInCart > 0 ? `${t('add_to_order', 'Ajouter')} (${qtyInCart})` : t('add_to_order', 'Ajouter')}</span>
                                </button>
                              </div>
                            ) : (
                              <div className="mt-auto">
                                <span className="bg-red-950/50 text-red-400 px-2.5 py-1 rounded border border-red-900 font-bold text-[10px] uppercase block text-center">
                                  {t('out_of_stock', 'Rupture de stock')}
                                </span>
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    }
                    
                    const dishCardClass = isMinimalist
                      ? `p-4 bg-white border border-[#E3DEC3] rounded-2xl flex items-center justify-between gap-4 shadow-sm transition-all duration-200 ${isAvail ? 'cursor-pointer hover:shadow-md' : 'opacity-50 grayscale'}`
                      : isDark
                      ? `p-4 bg-[#1E1E1E] border border-[#2D2D2D] rounded-2xl flex items-center justify-between gap-4 transition-all duration-200 ${isAvail ? 'cursor-pointer hover:bg-[#222]' : 'opacity-50 grayscale'}`
                      : isNature
                      ? `p-5 bg-white border border-[#D1E2CD] rounded-3xl flex items-center justify-between gap-4 transition-all duration-300 ${isAvail ? 'cursor-pointer hover:shadow-lg hover:border-[#A9C8A3]' : 'opacity-50 grayscale'}`
                      : `neo-box p-4 bg-white border-4 border-black flex items-center justify-between gap-4 transition-all duration-200 ${isAvail ? 'cursor-pointer hover:-translate-y-1 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000]' : 'opacity-50 grayscale'}`;

                    const dishImgClass = isMinimalist
                      ? "w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border border-[#E3DEC3] shrink-0"
                      : isDark
                      ? "w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-[#2D2D2D] shrink-0 bg-[#121212]"
                      : isNature
                      ? "w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-[#C3D7BE] shrink-0"
                      : "w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border-4 border-black shrink-0 shadow-[4px_4px_0px_0px_#000]";

                    const dishTitleClass = isMinimalist
                      ? "font-bold text-base sm:text-lg text-[#2C2520] tracking-tight leading-tight"
                      : isDark
                      ? "font-bold text-base sm:text-lg text-white tracking-tight leading-tight"
                      : isNature
                      ? "font-bold text-base sm:text-lg text-[#2D3F2E] tracking-tight leading-tight"
                      : "font-black text-lg sm:text-xl uppercase tracking-tight leading-tight";

                    const dishDescClass = isMinimalist
                      ? "text-neutral-500 text-xs font-medium line-clamp-2"
                      : isDark
                      ? "text-neutral-400 text-xs font-bold line-clamp-2"
                      : isNature
                      ? "text-[#556F57] text-xs font-medium line-clamp-2"
                      : "text-neutral-600 text-xs sm:text-sm font-bold line-clamp-2";

                    const dishPriceClass = isMinimalist
                      ? "bg-[#FAF6F0] text-[#8C6D3F] px-2.5 py-0.5 rounded border border-[#E3DEC3] font-bold text-xs"
                      : isDark
                      ? "bg-[#2D2D2D] text-[#FFB800] px-2.5 py-0.5 rounded border border-[#3D3D3D] font-black text-xs"
                      : isNature
                      ? "bg-[#E6EFE4] text-[#2D3F2E] px-3 py-1 rounded-full font-bold text-xs"
                      : "bg-[#00F59B] px-3 py-1 rounded-md border-2 border-black font-black text-sm shadow-[2px_2px_0px_0px_#000] inline-block";

                    return (
                      <div
                        key={item.id}
                        onClick={() => isAvail && openItemModal(item)}
                        className={dishCardClass}
                      >
                        <div className="flex items-center justify-between gap-4 w-full text-left">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <h3 className={dishTitleClass}>
                              {getLocalizedName(item)}
                            </h3>
                            <p className={dishDescClass}>
                              {getLocalizedDesc(item)}
                            </p>
                            <div className="pt-2 flex items-center gap-2 flex-wrap">
                              <span className={dishPriceClass}>
                                {formatPrice(item.price, merchant?.currency, language)}
                              </span>

                              {isAvail ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(item, 1);
                                  }}
                                  className={
                                    isMinimalist
                                      ? "p-1.5 px-3 rounded-full border border-[#8C6D3F] text-[#8C6D3F] hover:bg-[#FAF6F0] flex items-center gap-1 text-xs font-bold font-serif"
                                      : isDark
                                      ? "p-1.5 px-3 rounded-xl border border-[#FFB800] text-[#FFB800] hover:bg-[#2D2D2D] flex items-center gap-1 text-xs font-bold"
                                      : isNature
                                      ? "p-1.5 px-3 rounded-full bg-[#5F8D58] text-white hover:bg-[#4C7546] flex items-center gap-1 text-xs font-bold"
                                      : "p-1.5 px-3 rounded-lg bg-[#FFB800] border-2 border-black text-black flex items-center gap-1 text-xs font-black shadow-[2px_2px_0px_0px_#000]"
                                  }
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>{qtyInCart > 0 ? `${t('add_to_order', 'Ajouter')} (${qtyInCart})` : t('add_to_order', 'Ajouter')}</span>
                                </button>
                              ) : (
                                <span className={isMinimalist
                                  ? "bg-red-50 text-red-600 px-2.5 py-1 rounded border border-red-200 font-bold text-[10px] uppercase"
                                  : isDark
                                  ? "bg-red-950 text-red-400 px-2.5 py-1 rounded border border-red-900 font-bold text-[10px] uppercase"
                                  : isNature
                                  ? "bg-[#FDF2F2] text-red-700 px-3 py-1 rounded-full font-bold text-[10px] uppercase"
                                  : "bg-red-500 text-white px-2.5 py-1 rounded-md border-2 border-black font-black text-[11px] uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]"
                                }>
                                  {t('out_of_stock', 'Rupture de stock')}
                                </span>
                              )}
                            </div>
                          </div>

                          {Boolean(item.image_url && item.image_url.trim().length > 0) && (
                            <img
                              src={item.image_url!}
                              alt={getLocalizedName(item)}
                              className={dishImgClass}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Modal Détail Plat + Ajout Panier ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className={
            isMinimalist ? "bg-[#FAF6F0] w-full max-w-md border border-[#E3DEC3] rounded-3xl overflow-hidden relative flex flex-col max-h-[90vh] font-serif text-[#2C2520]" :
            isDark ? "bg-[#1E1E1E] w-full max-w-md border border-[#2D2D2D] rounded-2xl overflow-hidden relative flex flex-col max-h-[90vh] text-[#F3F4F6]" :
            isRetro ? "bg-[#FAF6F0] w-full max-w-md border-4 border-[#C84B31] rounded-3xl overflow-hidden relative flex flex-col max-h-[90vh] font-serif text-[#3A3530] shadow-[8px_8px_0px_0px_rgba(200,75,49,0.3)]" :
            isNature ? "bg-white w-full max-w-md border border-[#D1E2CD] rounded-[32px] overflow-hidden relative flex flex-col max-h-[90vh] text-[#2D3F2E]" :
            isCyberpunk ? "bg-[#161616] w-full max-w-md border border-white/10 rounded-2xl overflow-hidden relative flex flex-col max-h-[90vh] font-mono text-white shadow-2xl" :
            isLuxury ? "bg-[#1E1E1E] w-full max-w-md border border-white/10 rounded-2xl overflow-hidden relative flex flex-col max-h-[90vh] text-white shadow-2xl" :
            "bg-white w-full max-w-md border-4 border-black shadow-[8px_8px_0px_0px_#000] rounded-xl overflow-hidden relative flex flex-col max-h-[90vh]"
          }>
            <button
              onClick={() => setSelectedItem(null)}
              className={
                isMinimalist ? "absolute top-4 right-4 p-2 border border-[#E3DEC3] rounded-full bg-white text-[#2C2520] hover:bg-[#FAF6F0] transition-colors z-10" :
                isDark ? "absolute top-4 right-4 p-2 border border-[#2D2D2D] rounded-xl bg-[#2D2D2D] text-white hover:bg-[#3D3D3D] transition-colors z-10" :
                isRetro ? "absolute top-4 right-4 p-2 border-2 border-[#C84B31] rounded-xl bg-[#FAF6F0] text-[#C84B31] hover:bg-neutral-50 transition-colors z-10 shadow-[2px_2px_0px_0px_rgba(200,75,49,0.2)] font-serif" :
                isNature ? "absolute top-4 right-4 p-2 border border-[#C3D7BE] rounded-full bg-[#E6EFE4] text-[#5F8D58] hover:bg-[#C3D7BE] transition-colors z-10" :
                isCyberpunk ? "absolute top-4 right-4 p-2 border border-white/10 rounded-full bg-neutral-900 text-neutral-400 hover:text-[#CCFF00] transition-colors z-10 font-mono" :
                isLuxury ? "absolute top-4 right-4 p-2 border border-white/10 rounded-full bg-neutral-900 text-neutral-400 hover:text-white transition-colors z-10" :
                "absolute top-4 right-4 p-2 border-4 border-black rounded-full bg-[#FFB800] hover:bg-white transition-colors shadow-[4px_4px_0px_0px_#000] z-10"
              }
            >
              <X className="w-5 h-5" />
            </button>

            {selectedItem.image_url && (
              <img
                src={selectedItem.image_url}
                alt={getLocalizedName(selectedItem)}
                className={
                  isMinimalist ? "w-full h-56 object-cover border-b border-[#E3DEC3]" :
                  isDark ? "w-full h-56 object-cover border-b border-[#2D2D2D]" :
                  isRetro ? "w-full h-56 object-cover border-b-4 border-[#C84B31]" :
                  isNature ? "w-full h-56 object-cover border-b border-[#C3D7BE]" :
                  isCyberpunk ? "w-full h-56 object-cover border-b border-white/10" :
                  isLuxury ? "w-full h-56 object-cover border-b border-white/10" :
                  "w-full h-56 object-cover border-b-4 border-black"
                }
              />
            )}

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex justify-between items-start gap-4">
                <h3 className={
                  isMinimalist ? "font-bold text-2xl tracking-tight text-[#2C2520]" :
                  isDark ? "font-bold text-2xl tracking-tight text-white" :
                  isRetro ? "font-serif font-black text-2xl tracking-tight text-[#C84B31]" :
                  isNature ? "font-bold text-2xl tracking-tight text-[#2D3F2E]" :
                  isCyberpunk ? "font-mono font-bold text-2xl tracking-tight text-white" :
                  isLuxury ? "font-serif font-bold text-2xl tracking-tight text-[#FFE600]" :
                  "font-black text-2xl uppercase tracking-tight"
                }>{getLocalizedName(selectedItem)}</h3>
              </div>
              <div className={
                isMinimalist ? "inline-block bg-[#FAF6F0] text-[#8C6D3F] px-4 py-2 rounded-lg border border-[#E3DEC3] font-bold text-lg" :
                isDark ? "inline-block bg-[#2D2D2D] text-[#FFB800] px-4 py-2 rounded-xl border border-[#3D3D3D] font-black text-lg" :
                isRetro ? "inline-block bg-white text-[#C84B31] px-4 py-2 rounded-xl border-2 border-[#C84B31] font-bold text-lg shadow-[2px_2px_0px_0px_rgba(200,75,49,0.2)] font-serif" :
                isNature ? "inline-block bg-[#E6EFE4] text-[#2D3F2E] px-5 py-2 rounded-full font-bold text-lg" :
                isCyberpunk ? "inline-block bg-[#1F1F1F] text-[#CCFF00] px-4 py-2 rounded-xl border border-white/10 font-bold text-lg font-mono" :
                isLuxury ? "inline-block bg-[#1F1F1F] text-[#FFE600] px-4 py-2 rounded-xl border border-white/10 font-bold text-lg font-mono" :
                "inline-block bg-[#00F59B] px-4 py-2 rounded-xl border-4 border-black font-black text-xl shadow-[4px_4px_0px_0px_#000] -rotate-2"
              }>
                {formatPrice(selectedItem.price, merchant?.currency, language)}
              </div>
              
              <p className={
                isMinimalist ? "text-neutral-600 text-sm font-medium leading-relaxed pt-2" :
                isDark ? "text-neutral-300 text-sm font-medium leading-relaxed pt-2" :
                isRetro ? "text-neutral-700 text-sm font-medium leading-relaxed pt-2 font-serif" :
                isNature ? "text-[#556F57] text-sm font-medium leading-relaxed pt-2" :
                isCyberpunk ? "text-neutral-300 text-sm font-medium leading-relaxed pt-2 font-mono" :
                isLuxury ? "text-neutral-300 text-sm font-medium leading-relaxed pt-2" :
                "text-neutral-700 text-sm font-bold leading-relaxed pt-2"
              }>
                {getLocalizedDesc(selectedItem) || t('no_desc_available', 'Aucune description disponible pour ce produit.')}
              </p>

              {/* Quantity Stepper */}
              <div className="pt-4 flex items-center justify-between border-t border-neutral-200/20">
                <span className="font-bold text-sm tracking-wide">{t('quantity', 'Quantité')}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                    disabled={itemQuantity <= 1}
                    className="w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-lg disabled:opacity-30 transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-black text-lg min-w-[24px] text-center font-mono">
                    {itemQuantity}
                  </span>
                  <button
                    onClick={() => setItemQuantity(itemQuantity + 1)}
                    className="w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className={
              isMinimalist ? "p-6 border-t border-[#E3DEC3] bg-[#FAF6F0] flex gap-3" :
              isDark ? "p-6 border-t border-[#2D2D2D] bg-[#1E1E1E] flex gap-3" :
              isRetro ? "p-6 border-t border-[#C84B31] bg-[#F4F1EA] flex gap-3" :
              isNature ? "p-6 border-t border-[#C3D7BE] bg-[#F5F8F4] flex gap-3" :
              isCyberpunk ? "p-6 border-t border-white/10 bg-[#161616] flex gap-3" :
              isLuxury ? "p-6 border-t border-white/10 bg-[#1E1E1E] flex gap-3" :
              "p-6 border-t-4 border-black bg-neutral-50 flex gap-3"
            }>
              <button
                onClick={() => {
                  addToCart(selectedItem, itemQuantity);
                  setSelectedItem(null);
                  setItemQuantity(1);
                }}
                className={
                  isMinimalist ? "flex-1 bg-[#2C2520] text-white font-bold py-3.5 rounded-xl border border-transparent hover:bg-black transition-all flex items-center justify-center gap-2" :
                  isDark ? "flex-1 bg-[#FFB800] text-black font-bold py-3.5 rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2" :
                  isRetro ? "flex-1 bg-[#C84B31] hover:bg-[#b03f29] text-white font-black py-3.5 rounded-2xl border-2 border-black transition shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase font-serif flex items-center justify-center gap-2" :
                  isNature ? "flex-1 bg-[#5F8D58] text-white font-bold py-3.5 rounded-full hover:bg-[#4C7546] transition-all flex items-center justify-center gap-2" :
                  isCyberpunk ? "flex-1 bg-[#CCFF00] text-black font-bold py-3.5 rounded-xl hover:bg-[#b0dc00] transition-all font-mono shadow-[0_0_15px_rgba(204,255,0,0.3)] flex items-center justify-center gap-2" :
                  isLuxury ? "flex-1 bg-[#FFE600] text-black font-bold py-3.5 rounded-xl hover:bg-yellow-400 transition-all shadow-[0_0_15px_rgba(255,230,0,0.3)] flex items-center justify-center gap-2" :
                  "flex-1 bg-[#00F59B] text-black font-black uppercase tracking-wider py-4 border-4 border-black hover:bg-[#FFB800] transition-colors rounded-xl shadow-[4px_4px_0px_0px_#000] flex items-center justify-center gap-2"
                }
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{t('add_to_cart', 'Ajouter au panier')} • {formatPrice(selectedItem.price * itemQuantity, merchant?.currency, language)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Fast-Access Order Button (quand le panier est vide et pas de footer fidélité) ── */}
      {totalCartCount === 0 && !isCartOpen && merchant?.plan_tier === 'basic' && (
        <div className="fixed right-4 z-40 transition-all duration-300 bottom-[max(1.25rem,calc(env(safe-area-inset-bottom)+0.75rem))]">
          <button
            onClick={() => setIsCartOpen(true)}
            className="neo-pill-btn bg-[#FFB800] hover:bg-amber-400 text-black px-4 py-3 text-xs font-black flex items-center gap-2 shadow-[4px_4px_0px_0px_#000] border-3 border-black active:translate-x-[2px] active:translate-y-[2px]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('order_online', 'Commander')}</span>
          </button>
        </div>
      )}

      {/* ── Floating Sticky Cart Bar (Actif quand le panier n'est pas vide - remplace le footer) ── */}
      {totalCartCount > 0 && (
        <div className="fixed left-3 right-3 sm:left-4 sm:right-4 z-40 max-w-xl mx-auto transition-all duration-300 animate-bounce-short bottom-[max(1rem,calc(env(safe-area-inset-bottom)+0.5rem))]">
          <div
            onClick={() => setIsCartOpen(true)}
            className={
              isMinimalist
                ? "bg-[#FAF6F0] border border-[#E3DEC3] text-[#2C2520] p-4 rounded-2xl shadow-xl flex items-center justify-between cursor-pointer hover:shadow-2xl font-serif"
                : isDark
                ? "bg-[#242424] border border-[#3D3D3D] text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between cursor-pointer hover:border-[#FFB800]"
                : isRetro
                ? "bg-[#FAF6F0] border-4 border-[#C84B31] text-[#C84B31] p-4 rounded-3xl shadow-[6px_6px_0px_0px_#000] flex items-center justify-between cursor-pointer font-serif"
                : isNature
                ? "bg-[#E6EFE4] border border-[#C3D7BE] text-[#2D3F2E] p-4 rounded-full shadow-lg flex items-center justify-between cursor-pointer hover:border-[#5F8D58]"
                : isCyberpunk
                ? "bg-[#121212] border-2 border-[#CCFF00] text-[#CCFF00] p-4 rounded-xl shadow-[0_0_20px_rgba(204,255,0,0.25)] flex items-center justify-between cursor-pointer font-mono"
                : isLuxury
                ? "bg-[#191919] border border-[#FFE600]/40 text-[#FFE600] p-4 rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.9)] flex items-center justify-between cursor-pointer font-serif"
                : "neo-box bg-[#FFB800] border-4 border-black text-black p-4 rounded-2xl shadow-[6px_6px_0px_0px_#000] flex items-center justify-between cursor-pointer"
            }
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-red-600 text-white font-mono text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {totalCartCount}
                </span>
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-wider opacity-80">
                  {t('my_cart', 'Mon Panier')} ({totalCartCount})
                </p>
                <p className="text-base font-black tracking-tight">
                  {formatPrice(totalCartPrice, merchant?.currency, language)}
                </p>
              </div>
            </div>

            <button
              className={
                isMinimalist ? "bg-[#2C2520] text-white px-4 py-2 rounded-xl text-xs font-bold" :
                isDark ? "bg-[#FFB800] text-black px-4 py-2 rounded-xl text-xs font-bold" :
                isRetro ? "bg-[#C84B31] text-white px-4 py-2 rounded-xl border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000]" :
                isNature ? "bg-[#5F8D58] text-white px-4 py-2 rounded-full text-xs font-bold" :
                isCyberpunk ? "bg-[#CCFF00] text-black px-4 py-2 rounded-lg text-xs font-black uppercase shadow-[0_0_10px_rgba(204,255,0,0.4)]" :
                isLuxury ? "bg-[#FFE600] text-black px-4 py-2 rounded-full text-xs font-bold shadow-[0_0_10px_rgba(255,230,0,0.3)]" :
                "bg-black text-white px-4 py-2 rounded-xl text-xs font-black uppercase border-2 border-black"
              }
            >
              {t('view_cart', 'Voir le panier')}
            </button>
          </div>
        </div>
      )}

      {/* ── Modal / Drawer Panier Complet ── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md">
          <div className={
            isMinimalist ? "bg-[#FAF6F0] w-full max-w-lg border-t sm:border border-[#E3DEC3] rounded-t-3xl sm:rounded-3xl overflow-hidden relative flex flex-col max-h-[85vh] font-serif text-[#2C2520]" :
            isDark ? "bg-[#1E1E1E] w-full max-w-lg border-t sm:border border-[#2D2D2D] rounded-t-3xl sm:rounded-2xl overflow-hidden relative flex flex-col max-h-[85vh] text-[#F3F4F6]" :
            isRetro ? "bg-[#FAF6F0] w-full max-w-lg border-t-4 sm:border-4 border-[#C84B31] rounded-t-3xl sm:rounded-3xl overflow-hidden relative flex flex-col max-h-[85vh] font-serif text-[#3A3530] shadow-[8px_8px_0px_0px_rgba(200,75,49,0.3)]" :
            isNature ? "bg-white w-full max-w-lg border-t sm:border border-[#D1E2CD] rounded-t-[32px] sm:rounded-[32px] overflow-hidden relative flex flex-col max-h-[85vh] text-[#2D3F2E]" :
            isCyberpunk ? "bg-[#161616] w-full max-w-lg border-t sm:border border-white/10 rounded-t-2xl sm:rounded-2xl overflow-hidden relative flex flex-col max-h-[85vh] font-mono text-white shadow-2xl" :
            isLuxury ? "bg-[#1E1E1E] w-full max-w-lg border-t sm:border border-white/10 rounded-t-2xl sm:rounded-2xl overflow-hidden relative flex flex-col max-h-[85vh] text-white shadow-2xl" :
            "bg-white w-full max-w-lg border-t-4 sm:border-4 border-black shadow-[8px_8px_0px_0px_#000] rounded-t-2xl sm:rounded-xl overflow-hidden relative flex flex-col max-h-[85vh]"
          }>
            {/* Header */}
            <div className={`p-5 flex items-center justify-between border-b ${
              isMinimalist ? 'border-[#E3DEC3] bg-white' :
              isDark ? 'border-[#2D2D2D] bg-[#242424]' :
              isRetro ? 'border-b-4 border-[#C84B31] bg-white' :
              isNature ? 'border-[#D1E2CD] bg-[#F5F8F4]' :
              isCyberpunk ? 'border-white/10 bg-[#121212]' :
              isLuxury ? 'border-white/10 bg-[#141414]' :
              'border-b-4 border-black bg-[#FFB800]'
            }`}>
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6" />
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    {t('my_cart', 'Mon Panier')}
                  </h3>
                  <p className="text-xs opacity-70 font-bold">
                    {totalCartCount} {totalCartCount > 1 ? t('items', 'articles') : t('item', 'article')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs font-bold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    {t('clear_cart', 'Vider')}
                  </button>
                )}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-full border border-neutral-300/30 hover:bg-neutral-500/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
              {cart.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <ShoppingBag className="w-16 h-16 text-neutral-400 mx-auto opacity-40" />
                  <p className="text-base font-bold text-neutral-500">
                    {t('cart_empty', 'Votre panier est vide')}
                  </p>
                  <p className="text-xs text-neutral-400 font-bold max-w-xs mx-auto">
                    {t('cart_empty_hint', 'Sélectionnez des plats sur le menu pour commencer à composer votre commande.')}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="mt-3 neo-pill-btn bg-[#FFB800] hover:bg-amber-400 text-black px-5 py-2.5 text-xs font-black shadow-[2px_2px_0px_0px_#000]"
                  >
                    {t('browse_menu', 'Parcourir les plats')}
                  </button>
                </div>
              ) : (
                cart.map(({ item, quantity }) => {
                  const itemTotal = (item.price * quantity).toFixed(2);
                  return (
                    <div 
                      key={item.id} 
                      className={`p-3.5 rounded-2xl flex flex-col gap-3 transition-all ${
                        isMinimalist ? 'bg-white border border-[#E3DEC3]' :
                        isDark ? 'bg-[#242424] border border-[#333]' :
                        isRetro ? 'bg-white border-2 border-[#C84B31] shadow-[2px_2px_0px_0px_rgba(200,75,49,0.2)]' :
                        isNature ? 'bg-white border border-[#D1E2CD]' :
                        isCyberpunk ? 'bg-[#181818] border border-white/10' :
                        isLuxury ? 'bg-[#181818] border border-white/10' :
                        'bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000]'
                      }`}
                    >
                      {/* Top row: Image + Full Title + Unit Price + Delete Button */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {Boolean(item.image_url && item.image_url.trim().length > 0) && (
                            <img
                              src={item.image_url!}
                              alt={getLocalizedName(item)}
                              className="w-12 h-12 rounded-xl object-cover border border-neutral-500/20 shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-sm leading-snug break-words">
                              {getLocalizedName(item)}
                            </h4>
                            <p className="text-xs font-mono opacity-60 mt-0.5">
                              {formatPrice(item.price, merchant?.currency, language)}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Bottom row: Stepper (- qty +) on left + Subtotal on right */}
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-500/10">
                        <div className="flex items-center gap-2 border border-neutral-500/30 rounded-xl px-2 py-1 bg-black/5 dark:bg-black/40">
                          <button
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-neutral-500/20 active:scale-95 transition-all text-neutral-400 hover:text-white"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-sm font-bold min-w-[24px] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-neutral-500/20 active:scale-95 transition-all text-neutral-400 hover:text-white"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-black text-sm sm:text-base font-mono">
                          {formatPrice(itemTotal, merchant?.currency, language)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className={`p-5 sm:p-6 border-t pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))] shrink-0 ${
                isMinimalist ? 'border-[#E3DEC3] bg-[#FAF6F0]' :
                isDark ? 'border-[#2D2D2D] bg-[#1A1A1A]' :
                isRetro ? 'border-t-4 border-[#C84B31] bg-[#F4F1EA]' :
                isNature ? 'border-[#D1E2CD] bg-[#F5F8F4]' :
                isCyberpunk ? 'border-white/10 bg-[#101010]' :
                isLuxury ? 'border-white/10 bg-[#161616]' :
                'border-t-4 border-black bg-neutral-50'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold uppercase tracking-wider">
                    {t('total', 'Total')}
                  </span>
                  <span className="text-2xl font-black font-mono">
                    {formatPrice(totalCartPrice, merchant?.currency, language)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsOrderModalOpen(true);
                  }}
                  className="w-full mt-4 neo-pill-btn bg-[#00F59B] hover:bg-emerald-400 text-black py-4 text-xs font-black flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('order_now', 'Commander maintenant')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal de Prise de Commande & Livraison Client ── */}
      {merchant && (
        <CustomerOrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          merchant={merchant}
          cart={cart}
          totalCartPrice={totalCartPrice}
          onOrderSuccess={() => {
            setCart([]);
          }}
        />
      )}

      {/* ── Footer Sticky Navigation (Unifié & Sans superposition, masqué si le panier contient des articles) ── */}
      {merchant?.plan_tier !== 'basic' && totalCartCount === 0 && (
        <footer className={`fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 pb-[max(0.85rem,calc(env(safe-area-inset-bottom)+0.65rem))] ${
          isMinimalist
            ? "bg-[#FAF6F0]/95 backdrop-blur-xl border-t border-[#E3DEC3] text-[#2C2520] shadow-sm"
            : isDark
            ? "bg-[#1E1E1E]/95 backdrop-blur-xl border-t border-[#2D2D2D] shadow-[0_-4px_20px_rgba(0,0,0,0.5)] text-white"
            : isRetro 
            ? "bg-[#F4F1EA] border-t-4 border-[#C84B31] shadow-[0_-4px_0_0_rgba(200,75,49,1)]" 
            : isNature
            ? "bg-[#E6EFE4]/95 backdrop-blur-xl border-t border-[#C3D7BE] text-[#2D3F2E] shadow-sm"
            : isCyberpunk
            ? "bg-[#0D0D0D]/95 backdrop-blur-xl border-t border-[#CCFF00]/30 shadow-[0_-4px_20px_rgba(204,255,0,0.1)] text-[#CCFF00]"
            : isLuxury
            ? "bg-[#131313]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.8)] text-[#FFE600]"
            : "bg-white border-t-4 border-black shadow-[0_-4px_0_0_rgba(0,0,0,1)]"
        }`}>
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className={`p-2 sm:p-3 rounded-xl ${
                isMinimalist
                  ? "bg-white border border-[#E3DEC3] text-[#8C6D3F] rounded-full"
                  : isDark
                  ? "bg-[#2D2D2D] border border-[#3D3D3D] text-[#FFB800] rounded-xl"
                  : isRetro 
                  ? "bg-[#C84B31] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white rounded-xl" 
                  : isNature
                  ? "bg-[#5F8D58] text-white rounded-2xl"
                  : isCyberpunk
                  ? "bg-neutral-900 border border-[#CCFF00]/40 text-[#CCFF00] shadow-[0_0_10px_rgba(204,255,0,0.2)] rounded-xl"
                  : isLuxury
                  ? "bg-neutral-900 border border-[#FFE600]/40 text-[#FFE600] shadow-[0_0_12px_rgba(255,230,0,0.2)] rounded-xl"
                  : "bg-[#FFB800] border-3 sm:border-4 border-black shadow-[3px_3px_0px_0px_#000] text-black"
              }`}>
                <Award className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className={`text-xs sm:text-sm font-black uppercase tracking-tight ${
                  isMinimalist ? "text-[#2C2520] font-serif" :
                  isDark ? "text-white" :
                  isRetro ? "text-[#C84B31] font-serif" :
                  isNature ? "text-[#2D3F2E]" :
                  isCyberpunk ? "text-[#CCFF00] font-mono" :
                  isLuxury ? "text-[#FFE600] font-serif" :
                  "text-black"
                }`}>
                  {t('loyalty_club', 'Club Fidélité')}
                </p>
                <p className={`text-[10px] sm:text-xs font-bold hidden sm:block ${
                  isCyberpunk ? "text-neutral-400 font-mono" :
                  isLuxury || isDark ? "text-neutral-400" :
                  isNature ? "text-[#556F57]" :
                  "text-neutral-600"
                }`}>
                  {t('join_for_rewards', 'Rejoignez-nous pour obtenir des cadeaux !')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border-2 border-black bg-[#FFB800] text-black font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition"
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{t('order_online', 'Commander')}</span>
              </button>

              <Link
                href={`/wallet/${merchant?.slug || 'demo'}?scan=true`}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black uppercase tracking-wider transition-all whitespace-nowrap text-xs ${
                  isMinimalist
                    ? "bg-[#2C2520] text-white font-serif rounded-full hover:bg-black border border-[#2C2520]"
                    : isDark
                    ? "bg-[#FFB800] text-black rounded-xl hover:bg-yellow-400 border border-[#FFB800]"
                    : isRetro 
                    ? "bg-white text-[#C84B31] font-serif border-2 border-black shadow-[2px_2px_0px_0px_rgba(200,75,49,0.3)] hover:bg-neutral-50 active:translate-x-[2px] active:translate-y-[2px]" 
                    : isNature
                    ? "bg-[#5F8D58] text-white rounded-full hover:bg-[#4C7546] border border-[#4C7546]"
                    : isCyberpunk
                    ? "bg-[#CCFF00] text-black font-mono font-bold border border-[#CCFF00] rounded-xl hover:bg-[#b0dc00] shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                    : isLuxury
                    ? "bg-[#FFE600] text-black font-sans font-bold border border-[#FFE600] rounded-full hover:bg-yellow-400 shadow-[0_0_15px_rgba(255,230,0,0.3)]"
                    : "bg-[#00F59B] text-black border-2 sm:border-3 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none"
                }`}
              >
                <span>{t('join_now', 'Rejoindre')}</span>
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
