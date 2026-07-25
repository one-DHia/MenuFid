'use client';

/**
 * components/CustomerMenu.tsx
 * ─────────────────────────────────────────────────────────────
 * Composant de présentation publique de la carte digitale.
 * Multilingue (FR, EN, ES, DE, IT, AR avec mode RTL), filtres de régimes alimentaires,
 * Booster d'Avis Google 5 Étoiles & Visionneuse de Menu PDF.
 * Chargement ultra résilient (PocketBase + LocalStorage Sync + Demo Fallback).
 */

import React, { useState, useEffect } from 'react';
import {
  Globe, Search, Star, Clock, AlertTriangle, Plus, Minus,
  ShoppingBag, Check, X, ArrowLeft, Heart, Award, Volume2, ShieldCheck,
  FileText, Printer, ChevronRight
} from 'lucide-react';
import { db } from '@/lib/supabase';
import { DIETARY_TAGS } from '@/types';
import type { Merchant, Category, MenuItem, PluginsConfig, MenuTheme, CartItem } from '@/types';

// ─── Langues supportées ────────────────────────────────────────

export type Language = 'fr' | 'en' | 'es' | 'de' | 'it' | 'ar';

export interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'fr', label: 'Français',  flag: '🇫🇷' },
  { code: 'en', label: 'English',   flag: '🇬🇧' },
  { code: 'es', label: 'Español',   flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch',   flag: '🇩🇪' },
  { code: 'it', label: 'Italiano',  flag: '🇮🇹' },
  { code: 'ar', label: 'العربية',   flag: '🇸🇦' },
];

const DEFAULT_THEME: MenuTheme = {
  templateId: 'minimalist',
  primaryColor: '#b45309',
  backgroundColor: '#fdfbf7',
  textColor: '#1c1917',
  fontFamily: 'serif',
  cardStyle: 'bordered',
};

// ─── Données par défaut si la base est vide ──────────────────────

const SEED_CATEGORIES: Category[] = [
  { id: 'cat-1', name: '🍔 Burgers & Plats', display_order: 1, is_active: true, merchant: 'default' },
  { id: 'cat-2', name: '🥗 Salades & Entrées', display_order: 2, is_active: true, merchant: 'default' },
  { id: 'cat-3', name: '🍰 Desserts maison',   display_order: 3, is_active: true, merchant: 'default' },
  { id: 'cat-4', name: '🥤 Boissons & Cocktails', display_order: 4, is_active: true, merchant: 'default' },
];

const SEED_ITEMS: MenuItem[] = [
  { id: 'item-1', category: 'cat-1', category_id: 'cat-1', name: 'Burger Classic Double', description: 'Double steak haché façon bouchère, cheddar fondu, sauce maison, frites fraîches', price: 16.50, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', is_available: true, is_featured: true, merchant: 'default' },
  { id: 'item-2', category: 'cat-1', category_id: 'cat-1', name: 'Poulet Croustillant Panko', description: 'Filet de poulet pané panko croustillant, coleslaw, cornichons doux, sauce spicy mayo', price: 15.00, image_url: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=400&q=80', is_available: true, is_featured: true, merchant: 'default' },
  { id: 'item-3', category: 'cat-2', category_id: 'cat-2', name: 'Salade César Croustillante', description: 'Romaine croquante, suprême de poulet croustillant, copeaux de parmesan, croûtons à l\'ail, sauce César', price: 14.00, image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80', is_available: true, is_featured: false, merchant: 'default' },
  { id: 'item-4', category: 'cat-3', category_id: 'cat-3', name: 'Fondant Chocolat Intense', description: 'Cœur coulant au chocolat noir 72%, servi chaud avec une boule de glace vanille de Madagascar', price: 7.50, image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80', is_available: true, is_featured: true, merchant: 'default' },
  { id: 'item-5', category: 'cat-4', category_id: 'cat-4', name: 'Virgin Mojito Fraise', description: 'Menthe fraîche, fraises écrasées, jus de citron vert, sirop de canne, eau gazeuse', price: 6.50, image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80', is_available: true, is_featured: false, merchant: 'default' },
];

export interface CustomerMenuProps {
  slug?: string;
  hostname?: string;
}

// ─── Helpers de couleurs ──────────────────────────────────────

function isDarkBg(bg: string): boolean {
  if (bg.startsWith('#')) {
    const hex = bg.slice(1);
    const r = parseInt(hex.slice(0, 2), 16) || 0;
    const g = parseInt(hex.slice(2, 4), 16) || 0;
    const b = parseInt(hex.slice(4, 6), 16) || 0;
    return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
  }
  return false;
}

function surfaceColor(bg: string): string {
  return isDarkBg(bg) ? '#1c1c1e' : '#ffffff';
}

function surfaceAltColor(bg: string): string {
  return isDarkBg(bg) ? '#2c2c2e' : '#f5f5f4';
}

// ─── Chargement des données ───────────────────────────────────

async function fetchMenuData(identifier?: string) {
  let merchant: Merchant | null = null;

  if (identifier) {
    try {
      merchant = await db
        .collection('users')
        .getFirstListItem<Merchant>(`slug = "${identifier}"`)
        .catch(() => null);
    } catch {}
  }

  if (!merchant && typeof window !== 'undefined') {
    const saved = localStorage.getItem('menufid_merchant_profile');
    if (saved) {
      try { merchant = JSON.parse(saved); } catch {}
    }
  }

  if (!merchant) {
    merchant = {
      id: 'demo',
      email: 'demo@menufid.com',
      business_name: 'Notre Restaurant',
      slug: identifier || 'demo',
      plan_tier: 'premium',
      primary_color: '#b45309',
    };
  }

  const filter = `merchant = "${merchant.id}"`;

  let [rawCats, rawItems, pluginsRec, themeRec] = await Promise.all([
    db.collection('categories').getFullList<Category>({ filter, sort: 'display_order' }).catch(() => [] as Category[]),
    db.collection('menu_items').getFullList<MenuItem>({ filter }).catch(() => [] as MenuItem[]),
    db.collection('plugins_config').getFirstListItem<PluginsConfig>(filter).catch(() => null),
    db.collection('themes').getFirstListItem<Record<string, unknown>>(filter).catch(() => null),
  ]);

  // Si PocketBase n'a pas renvoyé de catégories, vérifier le LocalStorage
  if (rawCats.length === 0 && typeof window !== 'undefined') {
    try {
      const savedCats = localStorage.getItem('menufid_categories');
      const savedItems = localStorage.getItem('menufid_menu_items');
      if (savedCats) rawCats = JSON.parse(savedCats);
      if (savedItems) rawItems = JSON.parse(savedItems);
    } catch {}
  }

  // Si toujours vide, charger les données de démo
  if (rawCats.length === 0) {
    rawCats = SEED_CATEGORIES;
    rawItems = SEED_ITEMS;
  }

  // Vérifier s'il y a une URL PDF stockée dans LocalStorage
  if (typeof window !== 'undefined' && !merchant.pdf_menu_url) {
    const localPdf = localStorage.getItem('menufid_pdf_url');
    if (localPdf) {
      merchant.pdf_menu_url = localPdf;
    }
  }

  const categories = rawCats.filter((c) => c.is_active !== false);

  const theme: MenuTheme = themeRec ? {
    templateId: (themeRec.template_id as MenuTheme['templateId']) ?? 'minimalist',
    primaryColor: (themeRec.primary_color as string) ?? '#b45309',
    backgroundColor: (themeRec.background_color as string) ?? '#fdfbf7',
    textColor: (themeRec.text_color as string) ?? '#1c1917',
    fontFamily: (themeRec.font_family as MenuTheme['fontFamily']) ?? 'serif',
    cardStyle: (themeRec.card_style as MenuTheme['cardStyle']) ?? 'bordered',
  } : DEFAULT_THEME;

  return { merchant, categories, items: rawItems, plugins: pluginsRec, theme };
}

// ─── Composant principal ──────────────────────────────────────

export default function CustomerMenu({ slug, hostname }: CustomerMenuProps) {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [theme, setTheme] = useState<MenuTheme>(DEFAULT_THEME);
  const [plugins, setPlugins] = useState<Omit<PluginsConfig, 'id' | 'merchant'>>({
    allergens: true, options: true, featured: true,
  });
  const [loading, setLoading] = useState(true);

  // Vue & Filtres
  const [currentLang, setCurrentLang] = useState<Language>('fr');
  const [viewMode, setViewMode] = useState<'interactive' | 'pdf'>('interactive');
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [allergenFilter, setAllergenFilter] = useState<string | null>(null);

  // Modal détail plat
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [itemQuantity, setItemQuantity] = useState(1);

  // Panier
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchMenuData(slug || hostname?.split('.')[0]);
      setMerchant(data.merchant);
      setCategories(data.categories);
      setMenuItems(data.items);
      setTheme(data.theme);
      if (data.plugins) {
        setPlugins({
          allergens: data.plugins.allergens,
          options: data.plugins.options,
          featured: data.plugins.featured,
        });
      }
      if (data.categories.length > 0) {
        setActiveCategory(data.categories[0].id);
      }
      setLoading(false);
    })();
  }, [slug, hostname]);

  function getFilteredItems(categoryId: string): MenuItem[] {
    let items = menuItems.filter(
      (item) => item.category === categoryId || item.category_id === categoryId
    );

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }

    if (allergenFilter) {
      items = items.filter((item) => item.allergens?.includes(allergenFilter));
    }

    return items;
  }

  const featuredItems = menuItems.filter((item) => item.is_featured && item.is_available);

  function openItemModal(item: MenuItem) {
    if (!item.is_available) return;
    setSelectedItem(item);
    setSelectedExtras([]);
    setItemQuantity(1);
  }

  function toggleExtra(title: string) {
    setSelectedExtras((prev) =>
      prev.includes(title) ? prev.filter((x) => x !== title) : [...prev, title]
    );
  }

  function handleAddToCart() {
    if (!selectedItem) return;
    const extraCost = (selectedItem.options ?? [])
      .filter((opt) => selectedExtras.includes(opt.title))
      .reduce((sum, opt) => sum + opt.price, 0);

    const cartItem: CartItem = {
      id: `${selectedItem.id}-${Date.now()}`,
      item: selectedItem,
      selectedExtras: [...selectedExtras],
      quantity: itemQuantity,
      priceTotal: (selectedItem.price + extraCost) * itemQuantity,
    };

    setCart((prev) => [...prev, cartItem]);
    setSelectedItem(null);
  }

  const cartCount = cart.reduce((sum, x) => sum + x.quantity, 0);
  const cartTotal = cart.reduce((sum, x) => sum + x.priceTotal, 0);

  const brandColor = theme.primaryColor;
  const fontFamily = theme.fontFamily === 'serif' ? 'serif'
    : theme.fontFamily === 'mono' ? 'monospace' : 'sans-serif';

  const modalExtrasCost = selectedItem
    ? (selectedItem.options ?? [])
        .filter((opt) => selectedExtras.includes(opt.title))
        .reduce((sum, opt) => sum + opt.price, 0)
    : 0;
  const modalTotal = selectedItem ? (selectedItem.price + modalExtrasCost) * itemQuantity : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-amber-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-between relative pb-28 transition-colors duration-300"
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor, fontFamily }}
      dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div>
        {/* ── Header établissement ── */}
        <header
          className="relative border-b p-6 pt-12 text-center overflow-hidden shadow-sm"
          style={{ backgroundColor: surfaceColor(theme.backgroundColor), borderColor: `${brandColor}15` }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-50/15 via-transparent to-transparent" />
          <div className="relative max-w-lg mx-auto space-y-4">

            {/* Sélecteur Multilingue & PDF */}
            <div className="flex justify-between items-center no-print">
              <div className="flex items-center gap-1 bg-stone-100/80 border border-stone-200/60 px-2 py-1 rounded-xl text-xs font-bold">
                <Globe className="h-3.5 w-3.5 text-stone-500" />
                <select
                  value={currentLang}
                  onChange={(e) => setCurrentLang(e.target.value as Language)}
                  className="bg-transparent text-stone-800 text-xs font-bold focus:outline-none cursor-pointer"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                {merchant?.pdf_menu_url && (
                  <button
                    onClick={() => setViewMode(viewMode === 'interactive' ? 'pdf' : 'interactive')}
                    className="text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/70 px-2.5 py-1 rounded-xl transition flex items-center gap-1 btn-press"
                  >
                    <FileText className="h-3 w-3" />
                    <span>{viewMode === 'interactive' ? 'Menu PDF' : 'Carte Intermédiaire'}</span>
                  </button>
                )}
                <button
                  onClick={() => window.print()}
                  className="text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/70 px-2.5 py-1 rounded-xl transition flex items-center gap-1 btn-press"
                  title="Télécharger / Imprimer la carte en PDF"
                >
                  <Printer className="h-3 w-3" />
                  <span>Imprimer</span>
                </button>
              </div>
            </div>

            <div
              className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-black shadow-md transition hover:scale-105"
              style={{ backgroundColor: brandColor }}
            >
              {(merchant?.business_name ?? 'M').charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.textColor }}>
                {merchant?.business_name ?? 'Notre Établissement'}
              </h1>
              <p className="text-stone-400 text-xs font-semibold flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 mr-1" />
                Service de Table
              </p>
            </div>
          </div>
        </header>

        {/* ── Mode Visionneuse PDF ── */}
        {viewMode === 'pdf' && merchant?.pdf_menu_url && (
          <div className="max-w-lg mx-auto p-4 space-y-4">
            <div className="flex justify-between items-center bg-white border border-stone-200 p-3 rounded-2xl">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-amber-700" /> Document PDF de la Carte
              </span>
              <a
                href={merchant.pdf_menu_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-amber-700 hover:underline"
              >
                Ouvrir en plein écran ↗
              </a>
            </div>
            <iframe
              src={merchant.pdf_menu_url}
              className="w-full h-[75vh] rounded-3xl border border-stone-200 shadow-md bg-white"
              title="Menu PDF"
            />
          </div>
        )}

        {/* ── Mode Carte Interactive ── */}
        {viewMode === 'interactive' && (
          <>
            {/* ── Barre de recherche ── */}
            <div
              className="py-3 px-4 sticky top-0 z-40 shadow-xs border-b transition-colors duration-300"
              style={{ backgroundColor: surfaceColor(theme.backgroundColor), borderColor: `${brandColor}15` }}
            >
              <div
                className="max-w-lg mx-auto relative flex items-center border rounded-2xl px-3.5 py-2.5"
                style={{ backgroundColor: surfaceAltColor(theme.backgroundColor), borderColor: `${brandColor}20` }}
              >
                <Search className="h-4 w-4 text-stone-400 mr-2.5 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Rechercher un plat, une boisson..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs placeholder-stone-400 focus:outline-none"
                  style={{ color: theme.textColor }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-stone-400 hover:text-stone-700">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* ── Section Suggestions du Chef ── */}
            {featuredItems.length > 0 && !searchQuery && (
              <div
                className="border-b py-6 px-4 transition-colors duration-300"
                style={{ backgroundColor: `${brandColor}08`, borderBottomColor: `${brandColor}15` }}
              >
                <div className="max-w-lg mx-auto space-y-3">
                  <h2
                    className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5"
                    style={{ color: theme.textColor }}
                  >
                    <Star className="h-4 w-4 animate-pulse" style={{ color: brandColor, fill: brandColor }} />
                    Suggestions du Chef
                  </h2>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
                    {featuredItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => openItemModal(item)}
                        className="flex-shrink-0 w-64 border rounded-3xl p-3 shadow-xs snap-start flex gap-3 items-center cursor-pointer active:scale-98 transition duration-200"
                        style={{ backgroundColor: surfaceColor(theme.backgroundColor), borderColor: `${brandColor}20` }}
                      >
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                          />
                        )}
                        <div className="space-y-1 text-left flex-grow overflow-hidden">
                          <h3 className="font-bold text-xs truncate" style={{ color: theme.textColor }}>{item.name}</h3>
                          <p className="text-stone-400 text-[10px] line-clamp-1 font-medium">{item.description}</p>
                          <span className="font-extrabold text-xs" style={{ color: brandColor }}>
                            {item.price.toFixed(2)} €
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Onglets catégories ── */}
            <div
              className="sticky top-[53px] z-40 backdrop-blur-md border-b overflow-x-auto whitespace-nowrap px-4 py-3 scrollbar-none"
              style={{
                backgroundColor: isDarkBg(theme.backgroundColor) ? 'rgba(28,28,30,0.85)' : 'rgba(253,251,247,0.85)',
                borderColor: `${brandColor}15`,
              }}
            >
              <div className="flex gap-2 max-w-lg mx-auto">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setActiveCategory(cat.id); setAllergenFilter(null); }}
                      className={`text-xs px-4 py-2 rounded-full font-bold transition btn-press border ${
                        isActive ? 'text-white shadow-sm' : 'hover:opacity-90'
                      }`}
                      style={isActive
                        ? { backgroundColor: brandColor, borderColor: brandColor }
                        : { backgroundColor: surfaceAltColor(theme.backgroundColor), borderColor: `${brandColor}15`, color: theme.textColor }
                      }
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Filtres de Régimes Alimentaires ── */}
            {!searchQuery && (
              <div
                className="border-b px-4 py-2.5 overflow-x-auto whitespace-nowrap scrollbar-none"
                style={{ backgroundColor: surfaceColor(theme.backgroundColor), borderColor: `${brandColor}10` }}
              >
                <div className="flex gap-1.5 max-w-lg mx-auto items-center">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mr-1">Régime / Filtre:</span>
                  <button
                    onClick={() => setAllergenFilter(null)}
                    className={`text-[10px] px-3 py-1 rounded-full font-bold border transition ${
                      allergenFilter === null ? 'font-extrabold' : 'hover:opacity-95'
                    }`}
                    style={allergenFilter === null
                      ? { backgroundColor: `${brandColor}15`, borderColor: brandColor, color: brandColor }
                      : {
                          backgroundColor: surfaceAltColor(theme.backgroundColor),
                          borderColor: 'transparent',
                          color: isDarkBg(theme.backgroundColor) ? '#a1a1aa' : '#78716c',
                        }
                    }
                  >
                    Tous
                  </button>
                  {DIETARY_TAGS.map((tag) => {
                    const isActive = allergenFilter === tag.label;
                    return (
                      <button
                        key={tag.id}
                        onClick={() => setAllergenFilter(isActive ? null : tag.label)}
                        className={`text-[10px] px-3 py-1 rounded-full font-bold border transition ${isActive ? 'font-extrabold' : 'hover:opacity-95'}`}
                        style={isActive
                          ? { backgroundColor: `${brandColor}15`, borderColor: brandColor, color: brandColor }
                          : {
                              backgroundColor: surfaceAltColor(theme.backgroundColor),
                              borderColor: 'transparent',
                              color: isDarkBg(theme.backgroundColor) ? '#a1a1aa' : '#78716c',
                            }
                        }
                      >
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Liste des plats par catégories ── */}
            <main className="max-w-lg mx-auto p-4 space-y-8">
              {categories.map((category) => {
                const items = getFilteredItems(category.id);

                if (items.length === 0) return null;

                return (
                  <section key={category.id} className="space-y-4">
                    <h2 className="text-base font-extrabold border-b pb-2 flex items-center justify-between" style={{ color: theme.textColor, borderColor: `${brandColor}20` }}>
                      <span>{category.name}</span>
                      <span className="text-xs font-semibold text-stone-400 font-mono">{items.length} choix</span>
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => openItemModal(item)}
                          className={`p-4 rounded-3xl border shadow-xs transition duration-200 flex gap-4 items-center ${
                            item.is_available ? 'cursor-pointer active:scale-98' : 'opacity-50 cursor-not-allowed'
                          }`}
                          style={{
                            backgroundColor: surfaceColor(theme.backgroundColor),
                            borderColor: `${brandColor}15`,
                          }}
                        >
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                            />
                          )}

                          <div className="space-y-1.5 text-left flex-grow overflow-hidden">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-sm" style={{ color: theme.textColor }}>
                                {item.name}
                              </h3>
                              {item.is_featured && (
                                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 flex-shrink-0" />
                              )}
                            </div>

                            <p className="text-stone-400 text-xs line-clamp-2 font-medium leading-relaxed">
                              {item.description}
                            </p>

                            <div className="flex items-center justify-between pt-1">
                              <span className="font-extrabold text-sm" style={{ color: brandColor }}>
                                {item.price.toFixed(2)} €
                              </span>

                              {item.is_available ? (
                                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-xl flex items-center gap-1">
                                   Commander +
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
                                  Épuisé
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}

              {categories.length === 0 && (
                <div className="text-center py-16 text-stone-400 text-sm font-semibold">
                  Aucun plat disponible pour le moment.
                </div>
              )}
            </main>
          </>
        )}
      </div>

      {/* ── Modal Détail Plat ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom"
            style={{ backgroundColor: surfaceColor(theme.backgroundColor), color: theme.textColor }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{selectedItem.name}</h3>
                <span className="font-extrabold text-lg" style={{ color: brandColor }}>
                  {selectedItem.price.toFixed(2)} €
                </span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedItem.image_url && (
              <img
                src={selectedItem.image_url}
                alt={selectedItem.name}
                className="w-full h-48 rounded-2xl object-cover shadow-sm"
              />
            )}

            <p className="text-stone-500 text-sm leading-relaxed">{selectedItem.description}</p>

            {/* Options extras */}
            {selectedItem.options && selectedItem.options.length > 0 && (
              <div className="space-y-3 border-t pt-4" style={{ borderColor: `${brandColor}15` }}>
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400">Options & Suppléments</h4>
                <div className="space-y-2">
                  {selectedItem.options.map((opt) => {
                    const isChecked = selectedExtras.includes(opt.title);
                    return (
                      <label
                        key={opt.title}
                        onClick={() => toggleExtra(opt.title)}
                        className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                          isChecked ? 'border-amber-700 bg-amber-50/50' : 'border-stone-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-amber-700 focus:ring-amber-700"
                          />
                          <span className="text-xs font-bold">{opt.title}</span>
                        </div>
                        <span className="text-xs font-extrabold text-amber-800">
                          +{opt.price.toFixed(2)} €
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantité & Ajout Panier */}
            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: `${brandColor}15` }}>
              <div className="flex items-center gap-3 bg-stone-100 p-1.5 rounded-2xl">
                <button
                  onClick={() => setItemQuantity((q) => Math.max(1, q - 1))}
                  className="p-1.5 bg-white rounded-xl text-stone-700 shadow-xs"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-bold text-sm px-2">{itemQuantity}</span>
                <button
                  onClick={() => setItemQuantity((q) => q + 1)}
                  className="p-1.5 bg-white rounded-xl text-stone-700 shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md transition flex items-center gap-2 btn-press"
              >
                <ShoppingBag className="h-4 w-4" />
                Ajouter ({modalTotal.toFixed(2)} €)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer Sticky Panier & Club Fidélité ── */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 p-4 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Club Fidélité</p>
              <p className="text-[11px] text-stone-400 font-medium">Rejoignez-nous pour obtenir des cadeaux !</p>
            </div>
          </div>

          <a
            href={`/loyalty/${merchant?.slug || 'demo'}/register`}
            className="bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 btn-press flex-shrink-0"
          >
            <span>Rejoindre</span>
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </footer>
    </div>
  );
}
