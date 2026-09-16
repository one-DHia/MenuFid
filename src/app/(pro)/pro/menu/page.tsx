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
  Utensils, 
  Plus, 
  Trash2, 
  Edit2, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  FolderPlus,
  Upload,
  Download,
  X,
  Camera,
  Sparkles,
  Loader2,
  Settings,
  AlertTriangle,
  Check
} from 'lucide-react';
import { compressImage, formatBytes } from '@/lib/imageCompression';
import { uploadMerchantMedia, deleteStorageFileByUrl } from '@/lib/storageHelper';
import { getLocalizedText, parseMultilingualText, formatMultilingualString } from '@/lib/multilingual';
import { formatPrice, getCurrencySymbol, normalizeCurrency, CURRENCY_OPTIONS, CurrencyCode } from '@/lib/currency';
import type { Category, MenuItem } from '@/types';
import ProBottomNav from '@/components/ProBottomNav';

export default function ProMenuPage() {
  const { t, language } = useLanguage();
  const { merchant, isLoading } = useAuth();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>('EUR');
  const [updatingCurrency, setUpdatingCurrency] = useState(false);

  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);

  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');
  const [itemName, setItemName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [uploadingItemImage, setUploadingItemImage] = useState(false);
  const [compressionStats, setCompressionStats] = useState<{ orig: string; comp: string; ratio: number } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [tempTheme, setTempTheme] = useState('#FFB800');
  const [savingTheme, setSavingTheme] = useState(false);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [editingCatImage, setEditingCatImage] = useState('');
  const [uploadingCatImage, setUploadingCatImage] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const itemImageInputRef = React.useRef<HTMLInputElement>(null);
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const catImageInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (merchant?.primary_color) {
      setTempTheme(merchant.primary_color);
    }
    if (merchant?.currency) {
      setCurrentCurrency(normalizeCurrency(merchant.currency));
    }
  }, [merchant]);

  async function handleCurrencyChange(newCurrency: CurrencyCode) {
    if (!merchant?.id) return;
    setCurrentCurrency(newCurrency);
    setUpdatingCurrency(true);
    try {
      const { error } = await supabase
        .from('merchants')
        .update({ currency: newCurrency })
        .eq('id', merchant.id);

      if (error) throw error;

      merchant.currency = newCurrency;
      try {
        const savedMerchantRaw = localStorage.getItem('menufid_merchant_profile');
        if (savedMerchantRaw) {
          const parsed = JSON.parse(savedMerchantRaw);
          parsed.currency = newCurrency;
          localStorage.setItem('menufid_merchant_profile', JSON.stringify(parsed));
        }
      } catch {}

      showToast(t('currency_updated_success', 'Devise du restaurant mise à jour !'), 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erreur lors de la mise à jour de la devise', 'error');
    } finally {
      setUpdatingCurrency(false);
    }
  }

  useEffect(() => {
    if (merchant?.id) {
      loadData(merchant.id);
    }
  }, [merchant?.id]);

  async function loadData(merchantId: string) {
    setLoading(true);
    try {
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('display_order', { ascending: true });

      const catList = catData || [];
      setCategories(catList);
      if (catList.length > 0 && !selectedCatId) {
        setSelectedCatId(catList[0].id);
      }

      const { data: itemData } = await supabase
        .from('menu_items')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false });

      setItems(itemData || []);
    } catch (e) {
      console.error('[ProMenu] Erreur:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveTheme() {
    if (!merchant?.id) return;
    setSavingTheme(true);
    try {
      const { error } = await supabase
        .from('merchants')
        .update({ primary_color: tempTheme })
        .eq('id', merchant.id);

      if (error) throw error;

      merchant.primary_color = tempTheme;
      showToast(t('theme_saved_success', 'Thème de votre menu mis à jour avec succès !'), 'success');
      setIsThemeModalOpen(false);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erreur lors de la mise à jour du thème', 'error');
    } finally {
      setSavingTheme(false);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim() || !merchant?.id) return;
    setAddingCat(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          merchant_id: merchant.id,
          name: newCatName.trim(),
          display_order: categories.length + 1,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setCategories((prev) => [...prev, data]);
      setNewCatName('');
      if (!selectedCatId) setSelectedCatId(data.id);
      showToast(t('category_added_success', 'Catégorie ajoutée !'), 'success');
    } catch (err: any) {
      showToast(err.message || 'Erreur', 'error');
    } finally {
      setAddingCat(false);
    }
  }

  function openEditCategoryModal(cat: Category) {
    setEditingCategory(cat);
    setEditingCatName(cat.name);
    setEditingCatImage(cat.image_url || '');
  }

  async function handleCatImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !merchant?.id || !editingCategory) return;

    try {
      setUploadingCatImage(true);

      // 1. Compression (WebP, max 600x600, quality 0.85)
      const compressed = await compressImage(file, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.85,
        outputFormat: 'image/webp'
      });

      // 2. Upload to Supabase Storage
      const publicUrl = await uploadMerchantMedia({
        file: compressed.file,
        folder: 'categories',
        merchantId: merchant.id,
        oldUrl: editingCatImage || null
      });

      setEditingCatImage(publicUrl);
      showToast(t('photo_uploaded_success', 'Photo compressée et enregistrée !'), 'success');
    } catch (err: any) {
      console.error('Erreur upload photo categorie:', err);
      showToast(err.message || "Erreur lors du téléversement de la photo", 'error');
    } finally {
      setUploadingCatImage(false);
      if (catImageInputRef.current) catImageInputRef.current.value = '';
    }
  }

  async function handleUpdateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCategory || !editingCatName.trim() || !merchant?.id) return;
    
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: editingCatName.trim(),
          image_url: editingCatImage || null
        })
        .eq('id', editingCategory.id);

      if (error) {
        if (error.message?.includes('image_url')) {
          const { error: fallbackErr } = await supabase
            .from('categories')
            .update({ name: editingCatName.trim() })
            .eq('id', editingCategory.id);
          if (fallbackErr) throw fallbackErr;
          
          setCategories((prev) =>
            prev.map((c) =>
              c.id === editingCategory.id
                ? { ...c, name: editingCatName.trim() }
                : c
            )
          );
          setEditingCategory(null);
          showToast(t('category_updated_name_only', 'Nom mis à jour. Exécutez la migration SQL Supabase pour activer les photos de catégories.'), 'info');
          return;
        }
        throw error;
      }

      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: editingCatName.trim(), image_url: editingCatImage || null }
            : c
        )
      );
      setEditingCategory(null);
      showToast(t('category_updated_success', 'Catégorie mise à jour !'), 'success');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour', 'error');
    }
  }

  async function handleSaveItem(e: React.FormEvent) {
    e.preventDefault();
    if (!itemName.trim() || !itemPrice || !selectedCatId || !merchant?.id) {
      showToast(t('fill_required_fields', 'Veuillez remplir les champs obligatoires'), 'error');
      return;
    }

    const payload = {
      merchant_id: merchant.id,
      category_id: selectedCatId,
      name: itemName.trim(),
      description: itemDesc.trim() || null,
      price: parseFloat(itemPrice),
      image_url: itemImage.trim() || null,
      is_available: true,
    };

    try {
      if (editingItemId) {
        const { data, error } = await supabase
          .from('menu_items')
          .update(payload)
          .eq('id', editingItemId)
          .select()
          .single();

        if (error) throw error;
        setItems((prev) => prev.map((it) => (it.id === editingItemId ? data : it)));
        showToast(t('item_updated_success', 'Plat modifié !'), 'success');
      } else {
        const { data, error } = await supabase
          .from('menu_items')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        setItems((prev) => [data, ...prev]);
        showToast(t('item_added_success', 'Plat ajouté !'), 'success');
      }
      resetItemForm();
    } catch (err: any) {
      showToast(err.message || 'Erreur', 'error');
    }
  }

  async function toggleAvailability(item: MenuItem) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .update({ is_available: !item.is_available })
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;
      setItems((prev) => prev.map((it) => (it.id === item.id ? data : it)));
    } catch {
      showToast('Erreur', 'error');
    }
  }

  async function handleExportJson() {
    if (!merchant) return;
    const exportData = {
      categories: categories.map(c => ({
        name: c.name,
        display_order: c.display_order,
        items: items.filter(i => i.category_id === c.id).map(i => ({
          name: i.name,
          description: i.description || "",
          price: i.price,
          image_url: i.image_url || "",
          is_available: i.is_available
        }))
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `menu_${merchant.slug || 'export'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleImportJson(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !merchant?.id) return;

    try {
      setLoading(true);
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.categories || !Array.isArray(data.categories)) {
        throw new Error("Format JSON invalide: 'categories' manquant.");
      }

      // Normaliseur multilingue robuste
      const normalizeText = (val: any) => {
        if (!val) return '';
        if (typeof val === 'object') {
          const fr = val.fr || val.french || val.name_fr || '';
          const en = val.en || val.english || val.name_en || '';
          const ar = val.ar || val.arabic || val.name_ar || '';
          return formatMultilingualString(fr, en, ar);
        }
        const str = String(val).trim();
        const parsed = parseMultilingualText(str);
        return formatMultilingualString(parsed.fr, parsed.en, parsed.ar) || str;
      };

      // We'll import sequentially
      for (const cat of data.categories) {
        
        // Helper function to insert a category and its items
        const insertCategoryAndItems = async (rawCatName: string, displayOrder: number, items: any[]) => {
          if (!items || !Array.isArray(items) || items.length === 0) return;
          
          const normalizedCatName = normalizeText(rawCatName) || 'Sans nom';

          const { data: newCat, error: catError } = await supabase
            .from('categories')
            .insert({
              merchant_id: merchant.id,
              name: normalizedCatName,
              display_order: displayOrder || 0,
              is_active: true,
            })
            .select()
            .single();

          if (catError) throw catError;

          for (const item of items) {
            const rawName = item.name_fr ? {
              fr: item.name_fr || item.name,
              en: item.name_en,
              ar: item.name_ar
            } : item.name;

            const rawDesc = item.description_fr ? {
              fr: item.description_fr || item.description,
              en: item.description_en,
              ar: item.description_ar
            } : item.description;

            const normalizedItemName = normalizeText(rawName) || 'Sans nom';
            const normalizedItemDesc = normalizeText(rawDesc) || null;

            await supabase.from('menu_items').insert({
              merchant_id: merchant.id,
              category_id: newCat.id,
              name: normalizedItemName,
              description: normalizedItemDesc,
              price: item.price || 0,
              image_url: item.image_url || null,
              is_available: item.is_available !== false,
            });
          }
        };

        // If the category has direct items, insert them
        if (cat.items && Array.isArray(cat.items)) {
          await insertCategoryAndItems(cat.name, cat.display_order, cat.items);
        }

        // If the category has subcategories, insert each subcategory as a main category
        if (cat.subcategories && Array.isArray(cat.subcategories)) {
          for (const subcat of cat.subcategories) {
            await insertCategoryAndItems(
              subcat.name || `${cat.name} - Sous-catégorie`,
              cat.display_order,
              subcat.items
            );
          }
        }
      }

      showToast("Menu multilingue importé avec succès !", "success");
      await loadData(merchant.id);
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "Erreur lors de l'import JSON", "error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setLoading(false);
    }
  }

  async function handleDeleteItem(item: MenuItem) {
    try {
      if (item.image_url) {
        deleteStorageFileByUrl(item.image_url).catch(console.warn);
      }
      const { error } = await supabase.from('menu_items').delete().eq('id', item.id);
      if (error) throw error;
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      showToast(t('item_deleted_success', 'Plat supprimé'), 'success');
    } catch {
      showToast('Erreur', 'error');
    }
  }

  async function handleDeleteCategory(catId: string) {
    if (!merchant?.id) return;
    const confirmed = window.confirm(
      t('confirm_delete_category', 'Supprimer cette catégorie et tous ses plats ?')
    );
    if (!confirmed) return;

    try {
      const itemsInCat = items.filter((i) => i.category_id === catId);
      for (const item of itemsInCat) {
        if (item.image_url) {
          deleteStorageFileByUrl(item.image_url).catch(console.warn);
        }
      }

      // 1. Delete items in this category
      await supabase
        .from('menu_items')
        .delete()
        .eq('merchant_id', merchant.id)
        .eq('category_id', catId);

      // 2. Delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', catId)
        .eq('merchant_id', merchant.id);

      if (error) throw error;

      const remainingCats = categories.filter((c) => c.id !== catId);
      setCategories(remainingCats);
      setItems((prev) => prev.filter((i) => i.category_id !== catId));

      if (selectedCatId === catId) {
        setSelectedCatId(remainingCats.length > 0 ? remainingCats[0].id : '');
      }

      showToast(t('category_deleted_success', 'Catégorie supprimée'), 'success');
    } catch (err: any) {
      console.error('Error deleting category:', err);
      showToast(err.message || 'Erreur', 'error');
    }
  }

  async function toggleCategoryVisibility(cat: Category) {
    try {
      const newActive = !cat.is_active;
      const { error } = await supabase
        .from('categories')
        .update({ is_active: newActive })
        .eq('id', cat.id);

      if (error) throw error;
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, is_active: newActive } : c)));
      showToast(
        newActive 
          ? t('category_shown_success', 'Catégorie visible sur le menu client !') 
          : t('category_hidden_success', 'Catégorie masquée du menu client !'),
        'success'
      );
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erreur', 'error');
    }
  }

  async function handleClearAllMenu() {
    if (!merchant?.id) return;
    const confirmed = window.confirm(
      t('confirm_clear_menu', 'Êtes-vous sûr de vouloir supprimer TOUT le menu ? Toutes les catégories et tous les plats seront définitivement supprimés.')
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      for (const item of items) {
        if (item.image_url) {
          deleteStorageFileByUrl(item.image_url).catch(console.warn);
        }
      }

      // 1. Delete all menu items for this merchant
      const { error: itemsErr } = await supabase
        .from('menu_items')
        .delete()
        .eq('merchant_id', merchant.id);

      if (itemsErr) throw itemsErr;

      // 2. Delete all categories for this merchant
      const { error: catsErr } = await supabase
        .from('categories')
        .delete()
        .eq('merchant_id', merchant.id);

      if (catsErr) throw catsErr;

      setCategories([]);
      setItems([]);
      setSelectedCatId('');
      resetItemForm();
      showToast(t('menu_cleared_success', 'Le menu a été entièrement vidé.'), 'success');
    } catch (err: any) {
      console.error('Error clearing menu:', err);
      showToast(err.message || 'Erreur lors de la suppression du menu', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleItemImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !merchant?.id) return;

    try {
      setUploadingItemImage(true);
      setCompressionStats(null);

      // 1. Compression côté client (WebP, max 1000px, quality 0.82)
      const compressed = await compressImage(file, {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.82,
        outputFormat: 'image/webp'
      });

      setCompressionStats({
        orig: formatBytes(compressed.originalSize),
        comp: formatBytes(compressed.compressedSize),
        ratio: compressed.compressionRatio
      });

      // 2. Téléversement dans Supabase Storage avec nettoyage de l'ancienne photo
      const publicUrl = await uploadMerchantMedia({
        file: compressed.file,
        folder: 'dishes',
        merchantId: merchant.id,
        oldUrl: itemImage || null
      });

      setItemImage(publicUrl);
      showToast(t('photo_uploaded_success', 'Photo compressée et enregistrée !'), 'success');
    } catch (err: any) {
      console.error('Erreur upload photo plat:', err);
      showToast(err.message || "Erreur lors du téléversement de la photo", 'error');
    } finally {
      setUploadingItemImage(false);
      if (itemImageInputRef.current) itemImageInputRef.current.value = '';
    }
  }

  async function handleLogoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !merchant?.id) return;

    try {
      setUploadingLogo(true);

      // 1. Compression du logo (WebP, max 500x500, quality 0.85)
      const compressed = await compressImage(file, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.85,
        outputFormat: 'image/webp'
      });

      // 2. Téléversement avec suppression de l'ancien logo
      const publicUrl = await uploadMerchantMedia({
        file: compressed.file,
        folder: 'logos',
        merchantId: merchant.id,
        oldUrl: merchant.logo_url || null
      });

      // 3. Mise à jour de la table merchants
      const { error: updateErr } = await supabase
        .from('merchants')
        .update({ logo_url: publicUrl })
        .eq('id', merchant.id);

      if (updateErr) throw updateErr;

      // 4. Mettre à jour l'état local du merchant
      merchant.logo_url = publicUrl;
      showToast(t('logo_updated_success', 'Logo du restaurant mis à jour avec succès !'), 'success');
    } catch (err: any) {
      console.error('Erreur upload logo:', err);
      showToast(err.message || "Erreur lors de la mise à jour du logo", 'error');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  }

  function startEditItem(item: MenuItem) {
    setEditingItemId(item.id);
    setSelectedCatId(item.category_id);
    setItemName(item.name);
    setItemDesc(item.description || '');
    setItemPrice(item.price.toString());
    setItemImage(item.image_url || '');
    setCompressionStats(null);
  }

  function resetItemForm() {
    setEditingItemId(null);
    setItemName('');
    setItemDesc('');
    setItemPrice('');
    setItemImage('');
    setCompressionStats(null);
    if (itemImageInputRef.current) itemImageInputRef.current.value = '';
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Spinner size={36} className="text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black font-sans flex flex-col selection:bg-[#FFB800] selection:text-black pb-28 sm:pb-12">
      <header className="border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/pro/dashboard"
              className="p-2 rounded-xl text-black hover:bg-[#FFB800] border-2 border-transparent hover:border-black transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-black text-lg text-black tracking-tight">{t('menu_editor_title', 'Éditeur de Menu')}</h1>
              <p className="text-[11px] font-bold text-neutral-500 line-clamp-1">{merchant?.business_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Restaurant Logo Button */}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={logoInputRef}
              onChange={handleLogoSelected}
            />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
              className="neo-pill-btn bg-white text-black border-2 border-black text-xs py-1.5 px-3 flex items-center gap-2 hover:bg-[#FFB800] transition shadow-[2px_2px_0px_0px_#000]"
              title={t('change_restaurant_logo', 'Modifier le logo du restaurant')}
            >
              {merchant?.logo_url ? (
                <img
                  src={merchant.logo_url}
                  alt={merchant.business_name}
                  className="w-6 h-6 rounded-md object-cover border border-black shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-md bg-[#FFB800] border border-black flex items-center justify-center font-black text-[10px] shrink-0">
                  {merchant?.business_name?.[0] || 'R'}
                </div>
              )}
              <span className="hidden sm:inline font-bold text-xs">
                {uploadingLogo ? t('uploading_image', 'Envoi...') : t('change_logo', 'Logo')}
              </span>
              <Camera className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="neo-pill-btn bg-[#FFB800] text-black border-2 border-black text-xs py-1.5 px-3 flex items-center gap-1.5 hover:bg-amber-400 transition shadow-[2px_2px_0px_0px_#000]"
            >
              <span>🎨 {t('personalize_theme', 'Thèmes')}</span>
            </button>

            {/* Currency Selector */}
            <div 
              className="inline-flex items-center gap-1 bg-white border-2 border-black rounded-full px-2.5 py-1 shadow-[2px_2px_0px_0px_#000]"
              title={t('select_currency', 'Devise du menu')}
            >
              <span className="text-xs">💰</span>
              <select
                value={currentCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
                disabled={updatingCurrency}
                className="bg-transparent text-xs font-black text-black outline-hidden cursor-pointer py-0.5"
                title={t('change_currency', 'Changer la devise')}
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code} className="text-black bg-white font-bold">
                    {language === 'ar' ? opt.label.ar : language === 'en' ? opt.label.en : opt.label.fr}
                  </option>
                ))}
              </select>
            </div>

            <Link
              href="/pro/profile"
              className="neo-pill-btn bg-white text-black border-2 border-black text-xs py-1.5 px-3 flex items-center gap-1.5 hover:bg-neutral-100 transition shadow-[2px_2px_0px_0px_#000]"
              title={t('profile_settings', 'Profil & Réglages')}
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-bold">{t('profile_settings', 'Profil')}</span>
            </Link>

            <LanguageSelector />
            
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImportJson} 
            />
            
              <button
              onClick={() => fileInputRef.current?.click()}
              className="neo-pill-btn bg-white text-black border-2 border-black text-xs py-2 px-3 hidden md:flex items-center gap-1 hover:bg-neutral-100"
              title={t('import_json', 'Importer JSON')}
            >
              <Upload className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleExportJson}
              className="neo-pill-btn bg-white text-black border-2 border-black text-xs py-2 px-3 hidden md:flex items-center gap-1 hover:bg-neutral-100"
              title={t('export_json', 'Exporter JSON')}
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handleClearAllMenu}
              disabled={categories.length === 0 && items.length === 0}
              className="neo-pill-btn bg-[#FF4747] text-white border-2 border-black text-xs py-2 px-3 flex items-center gap-1.5 hover:bg-red-600 disabled:opacity-40 disabled:pointer-events-none transition shadow-[2px_2px_0px_0px_#000]"
              title={t('clear_entire_menu', 'Vider tout le menu')}
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline font-bold">{t('clear_menu', 'Vider le menu')}</span>
            </button>

            <Link
              href={`/menu/${merchant?.slug || 'shop'}`}
              target="_blank"
              className="neo-pill-btn text-xs py-2 px-4 hidden sm:flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              <span>{t('view_live_menu', 'Voir le Menu en direct')}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="neo-box p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-base text-black flex items-center gap-2">
                  <FolderPlus className="w-5 h-5" />
                  {t('menu_categories', 'Catégories du Menu')}
                </h2>
                {categories.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllMenu}
                    className="text-[11px] font-black text-red-600 hover:text-red-800 underline uppercase tracking-tight flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t('clear_menu', 'Vider le menu')}</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder={t('new_category_name', 'ex: 🍔 Burgers')}
                  className="flex-1 neo-input text-xs"
                />
                <button
                  type="submit"
                  disabled={addingCat}
                  className="neo-pill-btn-white py-2 px-4 text-xs whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('add', 'Ajouter')}</span>
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFilterCategory('all')}
                  className={`neo-category-pill text-xs ${selectedFilterCategory === 'all' ? 'active' : ''}`}
                >
                  {t('cat_all', 'Tous')} ({items.length})
                </button>

                {categories.map((cat) => (
                  <div key={cat.id} className="inline-flex items-center shadow-[2px_2px_0px_0px_#000] rounded-full overflow-hidden border-2 border-black">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCatId(cat.id);
                        setSelectedFilterCategory(cat.id);
                      }}
                      className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ${
                        selectedFilterCategory === cat.id
                          ? 'bg-[#FFB800] text-black'
                          : 'bg-white text-black hover:bg-neutral-100'
                      } ${!cat.is_active ? 'opacity-75' : ''}`}
                    >
                      <span className={!cat.is_active ? 'line-through opacity-70' : ''}>
                        {getLocalizedText(cat.name, language)}
                      </span>
                      {!cat.is_active && (
                        <span className="text-[9px] bg-red-100 text-red-700 px-1 py-0.2 rounded border border-black font-bold">
                          {t('hidden', 'Masquée')}
                        </span>
                      )}
                    </button>

                     <button
                      type="button"
                      onClick={() => toggleCategoryVisibility(cat)}
                      title={cat.is_active ? t('hide_category', 'Masquer la catégorie') : t('show_category', 'Afficher la catégorie')}
                      className={`px-2 py-1.5 border-l-2 border-black transition text-xs font-bold ${
                        cat.is_active 
                          ? 'bg-white text-neutral-600 hover:bg-neutral-100 hover:text-black' 
                          : 'bg-neutral-200 text-red-600 hover:bg-neutral-300'
                      }`}
                    >
                      {cat.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-red-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditCategoryModal(cat)}
                      title={t('edit_category', 'Modifier la catégorie')}
                      className="px-2 py-1.5 border-l-2 border-black bg-white hover:bg-neutral-100 text-neutral-600 hover:text-black transition text-xs font-bold"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      title={t('delete_category', 'Supprimer la catégorie')}
                      className="px-2 py-1.5 border-l-2 border-black bg-white hover:bg-red-500 hover:text-white text-neutral-500 transition text-xs font-bold"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="neo-box p-6 space-y-4">
              <h2 className="font-black text-base text-black flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                {editingItemId ? t('edit_item_title', 'Modifier le plat') : t('add_item_title', 'Ajouter un plat au menu')}
              </h2>

              {categories.length === 0 && (
                <div className="p-3.5 bg-amber-50 border-2 border-black rounded-xl text-xs font-bold text-amber-950 space-y-1">
                  <p className="font-black text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-800" />
                    <span>{t('no_categories_yet_title', 'Aucune catégorie créée')}</span>
                  </p>
                  <p>{t('create_category_first_desc', 'Créez d\'abord une catégorie ci-dessus (ex: 🍔 Burgers, 🥤 Boissons) pour pouvoir ajouter des plats.')}</p>
                </div>
              )}

              <form onSubmit={handleSaveItem} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-black mb-1">{t('target_category', 'Catégorie cible *')}</label>
                  <select
                    value={selectedCatId}
                    onChange={(e) => setSelectedCatId(e.target.value)}
                    className="w-full neo-input text-xs"
                    required
                    disabled={categories.length === 0}
                  >
                    <option value="">{t('select_category', 'Sélectionner une catégorie')}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {getLocalizedText(cat.name, language)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-black mb-1">{t('item_name_label', 'Nom du plat *')}</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder={t('item_name_placeholder', 'ex: Cheeseburger Double Bacon')}
                    className="w-full neo-input text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-black mb-1">
                    {t('dish_price', 'Prix du plat')} ({getCurrencySymbol(currentCurrency, language)}) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      placeholder="12.50"
                      className="w-full neo-input text-xs pr-12"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-black text-neutral-500">
                      {getCurrencySymbol(currentCurrency, language)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-black mb-1">{t('dish_desc', 'DESCRIPTION')}</label>
                  <textarea
                    value={itemDesc}
                    onChange={(e) => setItemDesc(e.target.value)}
                    placeholder={t('dish_desc_placeholder', 'Ingrédients, préparation, accompagnements...')}
                    rows={3}
                    className="w-full neo-input text-xs resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-black uppercase text-black">
                      {t('dish_photo', 'Photo du plat')}
                    </label>
                    {compressionStats && (
                      <span className="text-[10px] font-black text-green-700 bg-green-100 px-2 py-0.5 rounded border border-green-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-green-700" />
                        <span>{compressionStats.orig} ➔ {compressionStats.comp} (-{compressionStats.ratio}%)</span>
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    ref={itemImageInputRef}
                    onChange={handleItemImageSelected}
                    className="hidden"
                  />

                  {itemImage ? (
                    <div className="relative group rounded-xl border-2 border-black overflow-hidden bg-neutral-50 shadow-[2px_2px_0px_0px_#000] p-2 flex items-center gap-3">
                      <img
                        src={itemImage}
                        alt="Aperçu plat"
                        className="w-16 h-16 rounded-lg object-cover border border-black shrink-0 bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black truncate text-black">{itemName || 'Photo du plat'}</p>
                        <p className="text-[10px] text-neutral-500 font-bold">WebP optimisé (Supabase)</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            type="button"
                            onClick={() => itemImageInputRef.current?.click()}
                            disabled={uploadingItemImage}
                            className="text-[10px] font-black uppercase bg-white hover:bg-neutral-100 border border-black px-2 py-1 rounded transition"
                          >
                            {t('change_photo', 'Changer')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteStorageFileByUrl(itemImage).catch(console.warn);
                              setItemImage('');
                              setCompressionStats(null);
                            }}
                            className="text-[10px] font-black uppercase bg-red-100 hover:bg-red-200 text-red-700 border border-red-400 px-2 py-1 rounded transition"
                          >
                            {t('remove_photo', 'Supprimer')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => !uploadingItemImage && itemImageInputRef.current?.click()}
                      className={`border-2 border-dashed border-black rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
                        uploadingItemImage ? 'bg-neutral-100 opacity-60' : 'bg-white hover:bg-[#FFB800]/20'
                      }`}
                    >
                      {uploadingItemImage ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin text-black" />
                          <span className="text-xs font-black uppercase tracking-tight text-black">
                            {t('compressing_image', 'Compression et envoi...')}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-[#FFB800] border border-black flex items-center justify-center shadow-[1px_1px_0px_0px_#000]">
                            <Camera className="w-4 h-4 text-black" />
                          </div>
                          <span className="text-xs font-black uppercase text-black">
                            {t('drag_or_click_photo', 'Cliquez pour ajouter une photo')}
                          </span>
                          <span className="text-[10px] font-bold text-neutral-500">
                            {t('formats_accepted', 'WebP, JPG, PNG (Compressé automatiquement)')}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Fallback URL text input */}
                  <details className="mt-2 text-[10px]">
                    <summary className="font-bold text-neutral-500 cursor-pointer hover:text-black">
                      {t('or_manual_url', 'Ou saisir une URL d\'image manuelle...')}
                    </summary>
                    <input
                      type="url"
                      value={itemImage}
                      onChange={(e) => setItemImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full neo-input text-xs mt-1"
                    />
                  </details>
                </div>

                <div className="flex gap-2 pt-2 flex-col sm:flex-row">
                  <button
                    type="submit"
                    className="neo-pill-btn py-3 px-4 flex-1 text-xs"
                  >
                    {editingItemId ? t('save_changes', 'Enregistrer les modifications') : t('add_to_menu', 'Ajouter au Menu')}
                  </button>
                  {editingItemId && (
                    <button
                      type="button"
                      onClick={resetItemForm}
                      className="neo-pill-btn-white py-3 px-4 text-xs"
                    >
                      {t('cancel', 'Annuler')}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-black text-lg text-black">
                {t('dishes_on_menu', 'Plats au Menu')} ({items.filter(it => selectedFilterCategory === 'all' || it.category_id === selectedFilterCategory).length}{selectedFilterCategory !== 'all' ? ` / ${items.length}` : ''})
              </h2>

              {selectedFilterCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedFilterCategory('all')}
                  className="text-xs font-black text-neutral-600 hover:text-black underline uppercase"
                >
                  {t('cat_all', 'Tous les plats')}
                </button>
              )}
            </div>

            {items.filter(it => selectedFilterCategory === 'all' || it.category_id === selectedFilterCategory).length === 0 ? (
              <div className="neo-box border-dashed border-4 p-12 text-center space-y-3 bg-neutral-50">
                <Utensils className="w-10 h-10 text-neutral-400 mx-auto" />
                <p className="text-neutral-600 text-xs font-bold uppercase tracking-wider">{t('no_dishes_yet', "AUCUN PLAT CORRESPONDANT DANS CETTE CATÉGORIE")}</p>
                {selectedFilterCategory !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedFilterCategory('all')}
                    className="neo-pill-btn-white text-xs py-1.5 px-3 mt-2 inline-flex items-center gap-1"
                  >
                    <span>{t('view_all', 'Voir tous les plats')}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {items
                  .filter(it => selectedFilterCategory === 'all' || it.category_id === selectedFilterCategory)
                  .map((item) => {
                    const cat = categories.find((c) => c.id === item.category_id);
                    return (
                      <div
                        key={item.id}
                        className={`neo-box bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                          item.is_available ? '' : 'opacity-80 bg-neutral-50 border-neutral-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-14 h-14 rounded-xl object-cover border-2 border-black shrink-0 shadow-[2px_2px_0px_0px_#000]"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-neutral-100 border-2 border-black flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_0px_#000]">
                              <Utensils className="w-6 h-6 text-neutral-400" />
                            </div>
                          )}

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-black text-sm text-black uppercase tracking-tight">
                                {getLocalizedText(item.name, language)}
                              </h3>
                              {(() => {
                                const parsed = parseMultilingualText(item.name);
                                const isMulti = Boolean((parsed.fr && parsed.ar) || (parsed.fr && parsed.en) || (parsed.ar && parsed.en));
                                if (!isMulti) return null;
                                return (
                                  <div className="flex items-center gap-1">
                                    {parsed.fr && <span className="text-[8px] font-black px-1 rounded bg-blue-100 text-blue-900 border border-blue-400">FR</span>}
                                    {parsed.en && <span className="text-[8px] font-black px-1 rounded bg-amber-100 text-amber-900 border border-amber-400">EN</span>}
                                    {parsed.ar && <span className="text-[8px] font-black px-1 rounded bg-green-100 text-green-900 border border-green-400">AR</span>}
                                  </div>
                                );
                              })()}
                              {cat && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold border border-black bg-[#FFB800] text-black">
                                  {getLocalizedText(cat.name, language)}
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-neutral-600 font-medium text-xs line-clamp-1">
                                {getLocalizedText(item.description, language)}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                              <span className="font-black text-sm text-black bg-[#00F59B] px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000]">
                                {formatPrice(item.price, currentCurrency, language)}
                              </span>

                              {/* Stock status badge */}
                              {item.is_available ? (
                                <span className="text-[10px] font-black uppercase bg-green-100 text-green-800 border border-green-700 px-2 py-0.5 rounded flex items-center gap-1">
                                  <Check className="w-3 h-3 text-green-700" />
                                  <span>{t('in_stock', 'En stock')}</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-black uppercase bg-red-100 text-red-700 border border-red-600 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                                  <AlertTriangle className="w-3 h-3 text-red-600" />
                                  <span>{t('out_of_stock', 'Rupture de stock')}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons with clear Stock Toggle button */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => toggleAvailability(item)}
                            className={`py-2 px-3 rounded-xl border-2 transition shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none flex items-center gap-1.5 text-xs font-black ${
                              item.is_available
                                ? 'bg-red-50 hover:bg-red-100 border-red-600 text-red-700'
                                : 'bg-green-100 hover:bg-green-200 border-green-700 text-green-800'
                            }`}
                            title={item.is_available ? t('mark_out_of_stock', 'Marquer rupture de stock') : t('mark_in_stock', 'Remettre en stock')}
                          >
                            {item.is_available ? (
                              <>
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <span>{t('out_of_stock', 'Rupture')}</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4 text-green-700" />
                                <span>{t('in_stock', 'En stock')}</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => startEditItem(item)}
                            className="p-2 rounded-xl bg-blue-300 border-2 border-black text-black transition shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                            title={t('edit', 'Modifier')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item)}
                            className="p-2 rounded-xl bg-[#FF4747] border-2 border-black text-white transition shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                            title={t('delete', 'Supprimer')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 🎨 THEME CUSTOMIZER MODAL WITH LIVE PREVIEW */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-black w-full max-w-6xl rounded-3xl shadow-[8px_8px_0px_0px_#000] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[80vh]">
            
            {/* Left Configurator */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto border-b-4 md:border-b-0 md:border-r-4 border-black bg-white">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase text-black flex items-center gap-2">
                    <span>🎨</span> {t('theme_modal_title', 'Personnaliser le Thème')}
                  </h2>
                  <p className="text-xs text-neutral-600 font-bold mt-1">
                    {t('theme_modal_subtitle', 'Choisissez le design général et la couleur principale de votre menu digital en direct pour vos clients.')}
                  </p>
                </div>

                {/* 1. NÉO-BRUTALISTE */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black uppercase text-neutral-500 tracking-wider">{t('theme_brutalist_title', 'Modèle Néo-Brutaliste')}</h3>
                  <p className="text-xs text-neutral-600 font-bold">{t('theme_brutalist_desc', 'Thème avec des bordures épaisses, des couleurs vives et des ombres marquées.')}</p>
                  
                  <div className="flex flex-wrap gap-3">
                    {[
                      { hex: '#FFB800', name: 'Jaune Miel' },
                      { hex: '#00F59B', name: 'Vert Menthe' },
                      { hex: '#FF8A8A', name: 'Rouge Corail' },
                      { hex: '#8AE4FF', name: 'Bleu Électrique' },
                      { hex: '#E08AFF', name: 'Mauve Pastel' },
                      { hex: '#B0FF8A', name: 'Vert Prairie' }
                    ].map((col) => {
                      const isExactActive = tempTheme === col.hex;

                      return (
                        <button
                          key={col.hex}
                          onClick={() => setTempTheme(col.hex)}
                          className={`flex items-center gap-2 px-3.5 py-2 border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition ${
                            isExactActive ? 'ring-3 ring-blue-500 ring-offset-2' : ''
                          }`}
                          style={{ backgroundColor: col.hex }}
                        >
                          <span className="bg-white/95 px-1.5 py-0.5 rounded border border-black text-[9px] uppercase tracking-wide">
                            {col.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. MINIMALISTE CHIC */}
                <div className="space-y-2">
                  <button
                    onClick={() => setTempTheme('theme:minimalist')}
                    className={`w-full text-left p-4 rounded-2xl border-3 border-black flex items-center justify-between gap-4 transition shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none bg-[#FAF6F0] ${
                      tempTheme === 'theme:minimalist' ? 'ring-3 ring-blue-500 ring-offset-2' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-serif text-sm font-bold text-[#2C2520] flex items-center gap-1.5">
                        ⚜️ {t('theme_minimalist_title', 'Modèle Minimaliste Chic')}
                      </div>
                      <p className="text-[11px] text-neutral-600 font-bold">
                        {t('theme_minimalist_desc', 'Couleurs douces (beige, crème), typographie avec empattements, bordures fines et épurées.')}
                      </p>
                    </div>
                    <Check className={`w-5 h-5 text-emerald-600 shrink-0 ${tempTheme === 'theme:minimalist' ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                </div>

                {/* 3. SOMBRE PREMIUM */}
                <div className="space-y-2">
                  <button
                    onClick={() => setTempTheme('theme:dark')}
                    className={`w-full text-left p-4 rounded-2xl border-3 border-black flex items-center justify-between gap-4 transition shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none bg-[#121212] text-white ${
                      tempTheme === 'theme:dark' ? 'ring-3 ring-blue-500 ring-offset-2' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-[#FFB800] flex items-center gap-1.5">
                        🌌 {t('theme_dark_title', 'Modèle Sombre Premium')}
                      </div>
                      <p className="text-[11px] text-neutral-400 font-bold">
                        {t('theme_dark_desc', 'Arrière-plan sombre charbon, accents dorés, lumière tamisée idéale pour les établissements de prestige.')}
                      </p>
                    </div>
                    <Check className={`w-5 h-5 text-[#FFB800] shrink-0 ${tempTheme === 'theme:dark' ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                </div>

                {/* 4. RETRO DINER */}
                <div className="space-y-2">
                  <button
                    onClick={() => setTempTheme('theme:retro')}
                    className={`w-full text-left p-4 rounded-2xl border-3 border-black flex items-center justify-between gap-4 transition shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none bg-[#FAF8F5] text-[#3A3530] font-mono ${
                      tempTheme === 'theme:retro' ? 'ring-3 ring-blue-500 ring-offset-2' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-[#C84B31] flex items-center gap-1.5">
                        🍟 {t('theme_retro_title', 'Modèle Retro Diner')}
                      </div>
                      <p className="text-[11px] text-neutral-500 font-bold">
                        {t('theme_retro_desc', 'Ambiance rétro américaine, damiers discrets, rouge/crème et typographie vintage.')}
                      </p>
                    </div>
                    <Check className={`w-5 h-5 text-[#C84B31] shrink-0 ${tempTheme === 'theme:retro' ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                </div>

                {/* 5. TROPICAL NATURE */}
                <div className="space-y-2">
                  <button
                    onClick={() => setTempTheme('theme:nature')}
                    className={`w-full text-left p-4 rounded-2xl border-3 border-black flex items-center justify-between gap-4 transition shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none bg-[#F5F8F4] text-[#2D3F2E] ${
                      tempTheme === 'theme:nature' ? 'ring-3 ring-blue-500 ring-offset-2' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-[#5F8D58] flex items-center gap-1.5">
                        🌿 {t('theme_nature_title', 'Modèle Tropical & Nature')}
                      </div>
                      <p className="text-[11px] text-[#556F57] font-bold">
                        {t('theme_nature_desc', 'Tons vert forêt, détails botaniques épurés et ambiance naturelle apaisante.')}
                      </p>
                    </div>
                    <Check className={`w-5 h-5 text-[#5F8D58] shrink-0 ${tempTheme === 'theme:nature' ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                </div>

                {/* 6. CYBERPUNK TECH */}
                <div className="space-y-2">
                  <button
                    onClick={() => setTempTheme('theme:cyberpunk')}
                    className={`w-full text-left p-4 rounded-2xl border-3 border-black flex items-center justify-between gap-4 transition shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none bg-[#0D0D0D] text-[#CCFF00] font-mono border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] ${
                      tempTheme === 'theme:cyberpunk' ? 'ring-3 ring-lime-500 ring-offset-2' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-[#CCFF00] flex items-center gap-1.5">
                        👾 {t('theme_cyberpunk_title', 'Modèle Cyberpunk Tech')}
                      </div>
                      <p className="text-[11px] text-neutral-300 font-bold">
                        {t('theme_cyberpunk_desc', 'Design futuriste sombre, grille de points d\'arrière-plan, police monospacée et accents vert fluo.')}
                      </p>
                    </div>
                    <Check className={`w-5 h-5 text-[#CCFF00] shrink-0 ${tempTheme === 'theme:cyberpunk' ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                </div>

                {/* 7. LUXURY PREMIUM */}
                <div className="space-y-2">
                  <button
                    onClick={() => setTempTheme('theme:luxury')}
                    className={`w-full text-left p-4 rounded-2xl border-3 border-black flex items-center justify-between gap-4 transition shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none bg-[#131313] text-[#FFE600] border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] ${
                      tempTheme === 'theme:luxury' ? 'ring-3 ring-yellow-500 ring-offset-2' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-[#FFE600] flex items-center gap-1.5 font-serif">
                        🍳 {t('theme_luxury_title', 'Modèle Luxury Premium')}
                      </div>
                      <p className="text-[11px] text-neutral-300 font-bold">
                        {t('theme_luxury_desc', 'Ambiance haut de gamme, fond sombre texturé, titres dorés en serif et photos de plats immersives.')}
                      </p>
                    </div>
                    <Check className={`w-5 h-5 text-[#FFE600] shrink-0 ${tempTheme === 'theme:luxury' ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-6 border-t-2 border-black flex items-center justify-end gap-3 mt-6 bg-white shrink-0">
                <button
                  onClick={() => setIsThemeModalOpen(false)}
                  className="px-5 py-3 border-2 border-black rounded-xl font-bold text-xs hover:bg-neutral-100 transition shadow-[2px_2px_0px_0px_#000]"
                >
                  {t('cancel', 'Annuler')}
                </button>
                <button
                  onClick={handleSaveTheme}
                  disabled={savingTheme}
                  className="px-6 py-3 bg-[#00F59B] text-black border-2 border-black rounded-xl font-black text-xs hover:bg-emerald-400 transition shadow-[3px_3px_0px_0px_#000]"
                >
                  {savingTheme ? t('saving', 'Enregistrement...') : t('theme_btn_save', 'Appliquer le Thème')}
                </button>
              </div>
            </div>

            {/* Right Live Preview Frame */}
            <div className="w-full md:w-[40%] bg-[#F0F0F0] p-6 flex flex-col items-center justify-center relative select-none shrink-0 border-t-4 md:border-t-0 border-black">
              <span className="absolute top-3 left-4 text-[10px] font-black uppercase text-neutral-500 tracking-wider">
                {t('theme_live_preview', 'Aperçu mobile en direct')}
              </span>
              
              {/* Phone Mockup Frame */}
              <div className="w-[260px] h-[480px] rounded-[36px] border-8 border-black shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300"
                style={{
                  backgroundColor: 
                    tempTheme === 'theme:minimalist' ? '#FAF6F0' : 
                    tempTheme === 'theme:dark' ? '#121212' : 
                    tempTheme === 'theme:retro' ? '#F4F1EA' :
                    tempTheme === 'theme:nature' ? '#F5F8F4' :
                    tempTheme === 'theme:cyberpunk' ? '#0D0D0D' :
                    tempTheme === 'theme:luxury' ? '#131313' :
                    '#FAFAFA',
                  fontFamily: 
                    tempTheme === 'theme:minimalist' ? 'Georgia, serif' : 
                    tempTheme === 'theme:retro' ? 'Georgia, serif' :
                    tempTheme === 'theme:luxury' ? 'Georgia, serif' :
                    tempTheme === 'theme:cyberpunk' ? 'Courier New, monospace' :
                    'sans-serif',
                  color: 
                    tempTheme === 'theme:minimalist' ? '#2C2520' : 
                    tempTheme === 'theme:dark' ? '#F3F4F6' : 
                    tempTheme === 'theme:retro' ? '#3A3530' :
                    tempTheme === 'theme:nature' ? '#2D3F2E' :
                    tempTheme === 'theme:cyberpunk' ? '#e2e2e2' :
                    tempTheme === 'theme:luxury' ? '#e2e2e2' :
                    '#000000'
                }}
              >
                
                {/* Simulated Screen Content */}
                <div className="flex-1 flex flex-col justify-start">
                  
                  {/* Status Bar */}
                  <div className="h-5 bg-black/5 flex items-center justify-between px-5 text-[8px] font-black uppercase text-neutral-500">
                    <span>12:30</span>
                    <div className="flex items-center gap-1">
                      <span>LTE</span>
                      <div className="w-4 h-2 border border-neutral-600 rounded-sm"></div>
                    </div>
                  </div>

                  {/* Header Banner Mock */}
                  <div className="p-4 flex items-center gap-3 transition-colors duration-300"
                    style={{
                      backgroundColor: 
                        tempTheme === 'theme:minimalist' ? '#FAF6F0' : 
                        tempTheme === 'theme:dark' ? '#1E1E1E' : 
                        tempTheme === 'theme:retro' ? '#F4F1EA' :
                        tempTheme === 'theme:nature' ? '#E6EFE4' :
                        tempTheme === 'theme:cyberpunk' ? '#0D0D0D' :
                        tempTheme === 'theme:luxury' ? '#131313' :
                        tempTheme.startsWith('#') ? tempTheme : '#FFB800',
                      borderBottom: 
                        tempTheme === 'theme:minimalist' ? '1px solid #E3DEC3' : 
                        tempTheme === 'theme:dark' ? '1px solid #2D2D2D' : 
                        tempTheme === 'theme:retro' ? '4px solid #C84B31' :
                        tempTheme === 'theme:nature' ? '1px solid #C3D7BE' :
                        tempTheme === 'theme:cyberpunk' ? '1px solid rgba(255,255,255,0.1)' :
                        tempTheme === 'theme:luxury' ? '1px solid rgba(255,255,255,0.1)' :
                        '3px solid #000'
                    }}
                  >
                    {/* Logo Mock */}
                    <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_0px_#000] shrink-0"
                      style={{
                        borderRadius: 
                          tempTheme === 'theme:minimalist' ? '9999px' : 
                          tempTheme === 'theme:retro' ? '12px' :
                          tempTheme === 'theme:nature' ? '16px' :
                          '12px',
                        borderWidth: tempTheme === 'theme:minimalist' || tempTheme === 'theme:dark' || tempTheme === 'theme:nature' || tempTheme === 'theme:luxury' || tempTheme === 'theme:cyberpunk' ? '1px' : '2px',
                        borderColor: 
                          tempTheme === 'theme:minimalist' ? '#E3DEC3' : 
                          tempTheme === 'theme:dark' ? '#2D2D2D' : 
                          tempTheme === 'theme:retro' ? '#C84B31' :
                          tempTheme === 'theme:nature' ? '#A9C8A3' :
                          tempTheme === 'theme:cyberpunk' ? 'rgba(204,255,0,0.2)' :
                          tempTheme === 'theme:luxury' ? 'rgba(255,255,255,0.2)' :
                          '#000',
                        boxShadow: tempTheme === 'theme:minimalist' || tempTheme === 'theme:dark' || tempTheme === 'theme:nature' || tempTheme === 'theme:luxury' || tempTheme === 'theme:cyberpunk' ? 'none' : tempTheme === 'theme:retro' ? '3px 3px 0px 0px rgba(200,75,49,0.25)' : '2px 2px 0px 0px #000',
                        backgroundColor: tempTheme === 'theme:luxury' || tempTheme === 'theme:cyberpunk' ? '#1F1F1F' : undefined
                      }}
                    >
                      ☕
                    </div>
                    <div>
                      <h4 className="text-xs font-black truncate max-w-[120px]">{merchant?.business_name || 'Le Bistrot'}</h4>
                      <p className="text-[8px] opacity-75 font-bold">Oran, Algérie</p>
                    </div>
                  </div>

                  {/* Mock Categories Row */}
                  <div className="p-3 flex gap-2 overflow-x-hidden border-b border-black/5">
                    {[
                      { name: 'Pizzas', active: true },
                      { name: 'Burgers', active: false },
                      { name: 'Boissons', active: false }
                    ].map((cat, i) => {
                      const isCatActive = cat.active;
                      
                      const pillStyle = 
                        tempTheme === 'theme:minimalist' ? {
                          backgroundColor: isCatActive ? '#FAF6F0' : '#ffffff',
                          borderColor: isCatActive ? '#8C6D3F' : '#E3DEC3',
                          borderWidth: '1px',
                          color: isCatActive ? '#8C6D3F' : '#2C2520'
                        } : 
                        tempTheme === 'theme:dark' ? {
                          backgroundColor: isCatActive ? '#2D2D2D' : '#1A1A1A',
                          borderColor: isCatActive ? '#FFB800' : '#2D2D2D',
                          borderWidth: '1px',
                          color: isCatActive ? '#FFB800' : '#888'
                        } : 
                        tempTheme === 'theme:retro' ? {
                          backgroundColor: isCatActive ? '#C84B31' : '#ffffff',
                          borderColor: '#C84B31',
                          borderWidth: '2px',
                          color: isCatActive ? '#ffffff' : '#C84B31',
                          borderRadius: '12px'
                        } : 
                        tempTheme === 'theme:nature' ? {
                          backgroundColor: isCatActive ? '#E6EFE4' : '#ffffff',
                          borderColor: '#C3D7BE',
                          borderWidth: isCatActive ? '0px' : '1px',
                          color: '#2D3F2E',
                          borderRadius: '9999px'
                        } : 
                        tempTheme === 'theme:cyberpunk' ? {
                          backgroundColor: isCatActive ? '#CCFF00' : 'transparent',
                          borderColor: isCatActive ? '#CCFF00' : 'rgba(255,255,255,0.1)',
                          borderWidth: '1px',
                          color: isCatActive ? '#000000' : '#888',
                          borderRadius: '9999px'
                        } : 
                        tempTheme === 'theme:luxury' ? {
                          backgroundColor: isCatActive ? '#FFE600' : 'transparent',
                          borderColor: isCatActive ? '#FFE600' : 'rgba(255,255,255,0.1)',
                          borderWidth: '1px',
                          color: isCatActive ? '#000000' : '#888',
                          borderRadius: '9999px'
                        } :
                        {
                          backgroundColor: isCatActive ? tempTheme.startsWith('#') ? tempTheme : '#FFB800' : '#ffffff',
                          borderWidth: '2px',
                          borderColor: '#000000',
                          boxShadow: isCatActive ? 'none' : '1px 1px 0px 0px #000'
                        };

                      return (
                        <div
                          key={cat.name}
                          style={pillStyle}
                          className="px-2.5 py-1 text-[9px] font-black uppercase rounded-lg select-none whitespace-nowrap"
                        >
                          {cat.name}
                        </div>
                      );
                    })}
                  </div>

                  {/* Mock Item Card */}
                  <div className="p-3 space-y-3">
                    {[
                      { name: 'Pizza Margherita', desc: 'Sauce tomate bio, mozzarella.', price: formatPrice(12.50, currentCurrency, language) }
                    ].map((mockItem) => {
                      const itemCardStyle = 
                        tempTheme === 'theme:minimalist' ? {
                          backgroundColor: '#ffffff',
                          borderColor: '#E3DEC3',
                          borderWidth: '1px',
                          borderRadius: '12px'
                        } : 
                        tempTheme === 'theme:dark' ? {
                          backgroundColor: '#1E1E1E',
                          borderColor: '#2D2D2D',
                          borderWidth: '1px',
                          borderRadius: '12px'
                        } : 
                        tempTheme === 'theme:retro' ? {
                          backgroundColor: '#ffffff',
                          borderColor: '#C84B31',
                          borderWidth: '3px',
                          borderStyle: 'solid',
                          borderRadius: '16px',
                          boxShadow: '3px 3px 0px 0px rgba(200,75,49,0.25)'
                        } : 
                        tempTheme === 'theme:nature' ? {
                          backgroundColor: '#ffffff',
                          borderColor: '#D1E2CD',
                          borderWidth: '1px',
                          borderRadius: '24px'
                        } : 
                        tempTheme === 'theme:cyberpunk' ? {
                          backgroundColor: '#161616',
                          borderColor: 'rgba(255,255,255,0.1)',
                          borderWidth: '1px',
                          borderRadius: '12px',
                          boxShadow: 'none'
                        } : 
                        tempTheme === 'theme:luxury' ? {
                          backgroundColor: '#1E1E1E',
                          borderColor: 'rgba(255,255,255,0.1)',
                          borderWidth: '1px',
                          borderRadius: '16px'
                        } :
                        {
                          backgroundColor: '#ffffff',
                          borderColor: '#000000',
                          borderWidth: '2px',
                          borderRadius: '12px',
                          boxShadow: '2px 2px 0px 0px #000'
                        };

                      const priceStyle = 
                        tempTheme === 'theme:minimalist' ? { backgroundColor: '#FAF6F0', color: '#8C6D3F', borderColor: '#E3DEC3', borderWidth: '1px' } : 
                        tempTheme === 'theme:dark' ? { backgroundColor: '#2D2D2D', color: '#FFB800', borderColor: '#3D3D3D', borderWidth: '1px' } : 
                        tempTheme === 'theme:retro' ? { backgroundColor: '#C84B31', color: '#ffffff', borderColor: '#C84B31', borderWidth: '2px', borderRadius: '6px' } :
                        tempTheme === 'theme:nature' ? { backgroundColor: '#E6EFE4', color: '#2D3F2E', borderRadius: '9999px' } :
                        tempTheme === 'theme:cyberpunk' ? { backgroundColor: '#1F1F1F', color: '#CCFF00', borderColor: 'rgba(255,255,255,0.1)', borderWidth: '1px', borderRadius: '4px' } :
                        tempTheme === 'theme:luxury' ? { backgroundColor: '#FFE600', color: '#000', borderColor: 'transparent', borderWidth: '0px', borderRadius: '4px' } :
                        { backgroundColor: '#00F59B', color: '#000', borderWidth: '2px', borderColor: '#000' };

                      return (
                        <div
                          key={mockItem.name}
                          style={itemCardStyle as any}
                          className="p-3 flex items-center justify-between gap-3 text-left"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <h5 className="text-[10px] font-black uppercase truncate">{mockItem.name}</h5>
                            <p className="text-[8px] opacity-60 font-bold line-clamp-1">{mockItem.desc}</p>
                            <span
                              style={priceStyle}
                              className="inline-block px-1.5 py-0.5 text-[8px] font-black rounded animate-none"
                            >
                              {mockItem.price}
                            </span>
                          </div>
                          
                          {/* Image Placeholder */}
                          <div className="w-10 h-10 bg-neutral-200 border border-neutral-300 rounded-lg shrink-0 flex items-center justify-center text-xs">
                            🍕
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Simulated Sticky Bottom Loyalty Bar */}
                {merchant?.plan_tier !== 'basic' && (
                  <div className="p-2 border-t flex items-center justify-between"
                    style={{
                      backgroundColor: tempTheme === 'theme:minimalist' ? '#ffffff' : tempTheme === 'theme:dark' ? '#1E1E1E' : '#ffffff',
                      borderColor: tempTheme === 'theme:minimalist' ? '#E3DEC3' : tempTheme === 'theme:dark' ? '#2D2D2D' : '#000000',
                      borderWidth: tempTheme === 'theme:minimalist' || tempTheme === 'theme:dark' ? '1px' : '2px 0 0 0'
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">🏆</span>
                      <span className="text-[8px] font-black uppercase">Fidélité</span>
                    </div>
                    <div className="bg-[#00F59B] text-black border border-black px-2 py-0.5 rounded text-[8px] font-black uppercase">
                      Rejoindre
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* 📁 EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <form 
            onSubmit={handleUpdateCategory}
            className="bg-white border-4 border-black w-full max-w-md rounded-3xl shadow-[8px_8px_0px_0px_#000] overflow-hidden flex flex-col p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black uppercase text-black flex items-center gap-2">
                <span>📁</span> {t('edit_category_modal_title', 'Modifier la Catégorie')}
              </h2>
              <button 
                type="button" 
                onClick={() => setEditingCategory(null)}
                className="p-1 border-2 border-black rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Category Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-neutral-500 tracking-wider">
                  {t('category_name_label', 'Nom de la catégorie *')}
                </label>
                <input
                  type="text"
                  required
                  value={editingCatName}
                  onChange={(e) => setEditingCatName(e.target.value)}
                  placeholder={t('new_category_placeholder', 'Burgers, Boissons...')}
                  className="w-full neo-input text-sm p-3"
                />
              </div>

              {/* Category Image Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-neutral-500 tracking-wider block">
                  {t('category_image_label', 'Photo de la catégorie')}
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border-2 border-black overflow-hidden bg-neutral-50 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000] relative">
                    {editingCatImage ? (
                      <img 
                        src={editingCatImage} 
                        alt="Aperçu" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl text-neutral-400">🍽️</span>
                    )}
                    {uploadingCatImage && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-black animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={catImageInputRef}
                      onChange={handleCatImageSelected}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => catImageInputRef.current?.click()}
                        disabled={uploadingCatImage}
                        className="neo-pill-btn-white py-2 px-3 text-xs flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{t('choose_photo', 'Choisir une photo')}</span>
                      </button>
                      {editingCatImage && (
                        <button
                          type="button"
                          onClick={() => setEditingCatImage('')}
                          className="px-2.5 py-1.5 border-2 border-red-500 text-red-500 rounded-xl text-xs font-bold hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-500 font-bold leading-normal">
                      Format recommandé : WebP / JPG, max 5 Mo. Elle sera automatiquement compressée.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 border-2 border-black rounded-xl font-bold text-xs hover:bg-neutral-100 transition shadow-[2px_2px_0px_0px_#000]"
              >
                {t('cancel', 'Annuler')}
              </button>
              <button
                type="submit"
                disabled={uploadingCatImage}
                className="px-5 py-2 bg-[#00F59B] text-black border-2 border-black rounded-xl font-black text-xs hover:bg-emerald-400 transition shadow-[3px_3px_0px_0px_#000]"
              >
                {t('save', 'Enregistrer')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <ProBottomNav />
    </div>
  );
}
