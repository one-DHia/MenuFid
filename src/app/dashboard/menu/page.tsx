'use client';

/**
 * app/dashboard/menu/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Gestionnaire de la carte digitale & export/import PDF.
 * Propose deux vues :
 *  1. Éditeur Carte (gestion des catégories et des plats avec fallback résilient anti-404)
 *  2. Vue & Export/Import PDF (affichage et lien vers le menu PDF)
 */

import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, Check, X,
  ListCollapse, UtensilsCrossed, ToggleLeft, ToggleRight,
  Star, Printer, Download, FileText,
} from 'lucide-react';
import { db } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import type { Category, MenuItem } from '@/types';

// ─── Données de démo par défaut ───────────────

const SEED_CATEGORIES: Category[] = [
  { id: 'cat-1', name: '🍔 Burgers & Plats', display_order: 1, is_active: true, merchant: 'default' },
  { id: 'cat-2', name: '🥗 Salades & Entrées', display_order: 2, is_active: true, merchant: 'default' },
  { id: 'cat-3', name: '🍰 Desserts maison',   display_order: 3, is_active: true, merchant: 'default' },
  { id: 'cat-4', name: '🥤 Boissons',          display_order: 4, is_active: true, merchant: 'default' },
];

const SEED_ITEMS: MenuItem[] = [
  { id: 'item-1', category: 'cat-1', category_id: 'cat-1', name: 'Burger Classic Double', description: 'Double steak haché façon bouchère, cheddar fondu, sauce maison', price: 14.50, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', is_available: true, is_featured: true, merchant: 'default' },
  { id: 'item-2', category: 'cat-1', category_id: 'cat-1', name: 'Poulet Croustillant Honey Mustard', description: 'Filet de poulet pané maïs, bacon croustillant, sauce moutarde miel', price: 13.90, image_url: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=400&q=80', is_available: true, is_featured: false, merchant: 'default' },
  { id: 'item-3', category: 'cat-2', category_id: 'cat-2', name: 'Salade Caesar Poulet Pané', description: 'Romaine fraîche, poulet croustillant, parmesan 24 mois, croûtons à l\'ail', price: 12.50, image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80', is_available: true, is_featured: true, merchant: 'default' },
  { id: 'item-4', category: 'cat-3', category_id: 'cat-3', name: 'Tiramisu Café Spéculoos', description: 'Recette artisanale préparée chaque matin par le chef', price: 6.50, image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80', is_available: true, is_featured: false, merchant: 'default' },
];

interface ItemFormState {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  isFeatured: boolean;
  categoryId: string;
}

const EMPTY_FORM: ItemFormState = {
  name: '', description: '', price: '', imageUrl: '', isFeatured: false, categoryId: '',
};

type ActiveTab = 'editor' | 'pdf';

export default function MenuManagerPage() {
  const { merchant, merchantId } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const [selectedCatId, setSelectedCatId] = useState('');

  // État formulaire catégorie
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<{ id: string; name: string } | null>(null);
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  // État formulaire plat
  const [itemForm, setItemForm] = useState<ItemFormState>(EMPTY_FORM);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // État import / URL PDF
  const [pdfUrlInput, setPdfUrlInput] = useState(merchant?.pdf_menu_url || '');
  const [savingPdfUrl, setSavingPdfUrl] = useState(false);

  useEffect(() => {
    if (merchant?.pdf_menu_url) {
      setPdfUrlInput(merchant.pdf_menu_url);
    }
  }, [merchant]);

  // Charger les données au montage
  useEffect(() => { loadAll(); }, [merchantId]);

  // Sélectionner la première catégorie par défaut
  useEffect(() => {
    if (categories.length > 0 && !selectedCatId) {
      setSelectedCatId(categories[0].id);
    }
  }, [categories, selectedCatId]);

  // ── Chargement résilient Anti-404 ─────────────────────────────

  async function loadAll() {
    const activeId = merchantId || 'default';
    setLoading(true);

    let fetchedCats: Category[] = [];
    let fetchedItems: MenuItem[] = [];

    // 1. Essayer PocketBase
    try {
      [fetchedCats, fetchedItems] = await Promise.all([
        db.collection('categories').getFullList<Category>({
          filter: `merchant = "${activeId}"`,
          sort: 'display_order',
        }).catch(() => []),
        db.collection('menu_items').getFullList<MenuItem>({
          filter: `merchant = "${activeId}"`,
        }).catch(() => []),
      ]);
    } catch {
      // Ignorer l'erreur PocketBase si 404
    }

    // 2. Charger depuis localStorage si disponible
    if (typeof window !== 'undefined') {
      const localCatsRaw = localStorage.getItem('menufid_categories');
      const localItemsRaw = localStorage.getItem('menufid_menu_items');

      if (localCatsRaw && fetchedCats.length === 0) {
        try { fetchedCats = JSON.parse(localCatsRaw); } catch {}
      }
      if (localItemsRaw && fetchedItems.length === 0) {
        try { fetchedItems = JSON.parse(localItemsRaw); } catch {}
      }
    }

    // 3. Fallback aux catégories de démo si tout est vide
    if (fetchedCats.length === 0) {
      fetchedCats = SEED_CATEGORIES;
      fetchedItems = SEED_ITEMS;
      if (typeof window !== 'undefined') {
        localStorage.setItem('menufid_categories', JSON.stringify(fetchedCats));
        localStorage.setItem('menufid_menu_items', JSON.stringify(fetchedItems));
      }
    }

    setCategories(fetchedCats);
    setMenuItems(fetchedItems);
    setLoading(false);
  }

  // ── Sauvegarde locale de secours ─────────────────────────────

  function saveLocalState(newCats: Category[], newItems: MenuItem[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('menufid_categories', JSON.stringify(newCats));
      localStorage.setItem('menufid_menu_items', JSON.stringify(newItems));
    }
  }

  // ── CRUD Catégories ─────────────────────────────────────────

  async function handleAddCategory(event: React.FormEvent) {
    event.preventDefault();
    if (!newCatName.trim()) return;

    const activeId = merchantId || 'default';
    let newCat: Category;

    try {
      // Tenter la création dans PocketBase
      newCat = await db.collection('categories').create<Category>({
        merchant: activeId,
        name: newCatName.trim(),
        display_order: categories.length + 1,
        is_active: true,
      });
    } catch {
      // Fallback local si PocketBase renvoie 404
      newCat = {
        id: `cat-${Date.now()}`,
        merchant: activeId,
        name: newCatName.trim(),
        display_order: categories.length + 1,
        is_active: true,
      };
    }

    const updatedCats = [...categories, newCat];
    setCategories(updatedCats);
    saveLocalState(updatedCats, menuItems);
    if (!selectedCatId) setSelectedCatId(newCat.id);
    setNewCatName('');
    showToast('Catégorie ajoutée avec succès !', 'success');
  }

  async function handleUpdateCategory() {
    if (!editingCat) return;

    try {
      await db.collection('categories').update<Category>(editingCat.id, {
        name: editingCat.name,
      }).catch(() => null);
    } catch {}

    const updatedCats = categories.map((c) =>
      c.id === editingCat.id ? { ...c, name: editingCat.name } : c
    );
    setCategories(updatedCats);
    saveLocalState(updatedCats, menuItems);
    setEditingCat(null);
    showToast('Catégorie modifiée.', 'success');
  }

  async function handleDeleteCategory() {
    if (!deletingCatId) return;

    try {
      const itemsToDelete = menuItems.filter((item) => item.category === deletingCatId || item.category_id === deletingCatId);
      await Promise.all(itemsToDelete.map((item) => db.collection('menu_items').delete(item.id).catch(() => null)));
      await db.collection('categories').delete(deletingCatId).catch(() => null);
    } catch {}

    const updatedCats = categories.filter((c) => c.id !== deletingCatId);
    const updatedItems = menuItems.filter((item) => item.category !== deletingCatId && item.category_id !== deletingCatId);

    setCategories(updatedCats);
    setMenuItems(updatedItems);
    saveLocalState(updatedCats, updatedItems);
    if (selectedCatId === deletingCatId) setSelectedCatId(updatedCats[0]?.id || '');
    setDeletingCatId(null);
    showToast('Catégorie supprimée.', 'success');
  }

  async function toggleCategoryActive(category: Category) {
    const nextState = !category.is_active;

    try {
      await db.collection('categories').update<Category>(category.id, {
        is_active: nextState,
      }).catch(() => null);
    } catch {}

    const updatedCats = categories.map((c) => (c.id === category.id ? { ...c, is_active: nextState } : c));
    setCategories(updatedCats);
    saveLocalState(updatedCats, menuItems);
  }

  // ── CRUD Plats ──────────────────────────────────────────────

  async function handleSaveItem(event: React.FormEvent) {
    event.preventDefault();
    const catId = itemForm.categoryId || selectedCatId;
    if (!itemForm.name.trim() || !itemForm.price || !catId) return;

    const activeId = merchantId || 'default';
    const priceNum = parseFloat(itemForm.price);

    const payload = {
      merchant: activeId,
      category: catId,
      category_id: catId,
      name: itemForm.name.trim(),
      description: itemForm.description.trim(),
      price: priceNum,
      image_url: itemForm.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
      is_available: true,
      is_featured: itemForm.isFeatured,
    };

    let updatedItems: MenuItem[] = [];

    if (editingItemId) {
      try {
        await db.collection('menu_items').update<MenuItem>(editingItemId, payload).catch(() => null);
      } catch {}

      updatedItems = menuItems.map((item) =>
        item.id === editingItemId ? { ...item, ...payload } : item
      );
      setEditingItemId(null);
      showToast('Plat modifié.', 'success');
    } else {
      let createdItem: MenuItem;
      try {
        createdItem = await db.collection('menu_items').create<MenuItem>(payload);
      } catch {
        createdItem = { id: `item-${Date.now()}`, ...payload };
      }

      updatedItems = [...menuItems, createdItem];
      showToast('Plat ajouté à la carte.', 'success');
    }

    setMenuItems(updatedItems);
    saveLocalState(categories, updatedItems);
    setItemForm({ ...EMPTY_FORM, categoryId: catId });
  }

  async function handleDeleteItem() {
    if (!deletingItemId) return;

    try {
      await db.collection('menu_items').delete(deletingItemId).catch(() => null);
    } catch {}

    const updatedItems = menuItems.filter((item) => item.id !== deletingItemId);
    setMenuItems(updatedItems);
    saveLocalState(categories, updatedItems);
    setDeletingItemId(null);
    showToast('Plat supprimé.', 'success');
  }

  async function toggleItemAvailability(menuItem: MenuItem) {
    const nextAvailable = !menuItem.is_available;

    try {
      await db.collection('menu_items').update<MenuItem>(menuItem.id, {
        is_available: nextAvailable,
      }).catch(() => null);
    } catch {}

    const updatedItems = menuItems.map((item) =>
      item.id === menuItem.id ? { ...item, is_available: nextAvailable } : item
    );
    setMenuItems(updatedItems);
    saveLocalState(categories, updatedItems);
  }

  function startEditItem(menuItem: MenuItem) {
    setEditingItemId(menuItem.id);
    setItemForm({
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price.toString(),
      imageUrl: menuItem.image_url,
      isFeatured: menuItem.is_featured ?? false,
      categoryId: menuItem.category || menuItem.category_id,
    });
  }

  function cancelEditItem() {
    setEditingItemId(null);
    setItemForm({ ...EMPTY_FORM, categoryId: selectedCatId });
  }

  // ── Enregistrer l'URL du fichier PDF ────────────────────────

  async function handleSavePdfUrl(e: React.FormEvent) {
    e.preventDefault();
    const activeId = merchantId;

    if (typeof window !== 'undefined') {
      localStorage.setItem('menufid_pdf_url', pdfUrlInput.trim());
    }

    if (activeId) {
      try {
        await db.collection('users').update(activeId, {
          pdf_menu_url: pdfUrlInput.trim(),
        }).catch(() => null);
      } catch {}
    }

    showToast('Lien du PDF du menu sauvegardé avec succès !', 'success');
  }

  function handlePrintPdf() {
    window.print();
  }

  const visibleItems = menuItems.filter(
    (item) => item.category === selectedCatId || item.category_id === selectedCatId
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── En-tête + onglets ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-200/60 pb-6 gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Gestion de la Carte</h1>
          <p className="text-stone-500 text-sm font-semibold mt-1">
            Gérez vos catégories, vos plats et associez votre fichier PDF original.
          </p>
        </div>

        <div className="flex bg-stone-100 border border-stone-200 p-1 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition btn-press ${
              activeTab === 'editor' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <UtensilsCrossed className="h-3.5 w-3.5" /> Éditeur Carte
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition btn-press ${
              activeTab === 'pdf' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-amber-700" /> Export & Menu PDF
          </button>
        </div>
      </div>

      {/* ═══ ONGLET ÉDITEUR ═══════════════════════════════════ */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Colonne catégories ── */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-stone-200/85 p-6 rounded-3xl space-y-5 shadow-sm">
              <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <ListCollapse className="h-5 w-5 text-amber-700" />
                Catégories
              </h2>

              {/* Formulaire ajout catégorie */}
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: 🥗 Salades"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
                <button
                  type="submit"
                  className="bg-amber-700 hover:bg-amber-600 text-white font-bold px-3 py-2 rounded-xl text-xs flex-shrink-0 transition btn-press"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </form>

              {/* Liste des catégories */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                      selectedCatId === cat.id
                        ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                        : 'bg-stone-50/50 border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {editingCat?.id === cat.id ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={editingCat.name}
                          onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                          className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1 text-xs focus:outline-none"
                          autoFocus
                        />
                        <button onClick={handleUpdateCategory} className="p-1 bg-amber-700 text-white rounded-md">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setEditingCat(null)} className="p-1 bg-stone-200 text-stone-600 rounded-md">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setSelectedCatId(cat.id)}
                          className="font-bold text-xs text-left truncate flex-grow mr-2"
                        >
                          {cat.name}
                        </button>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => toggleCategoryActive(cat)}
                            title={cat.is_active ? 'Masquer' : 'Afficher'}
                          >
                            {cat.is_active
                              ? <ToggleRight className="h-4 w-4 text-amber-700" />
                              : <ToggleLeft className="h-4 w-4 text-stone-400" />
                            }
                          </button>
                          <button onClick={() => setEditingCat({ id: cat.id, name: cat.name })}>
                            <Edit2 className="h-3.5 w-3.5 text-stone-400 hover:text-stone-800 transition" />
                          </button>
                          <button onClick={() => setDeletingCatId(cat.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-stone-400 hover:text-red-600 transition" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-center text-xs text-stone-400 py-4">Aucune catégorie pour le moment.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Colonne plats ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Formulaire ajouter / modifier plat */}
            <div className="bg-white border border-stone-200/85 p-6 rounded-3xl space-y-4 shadow-sm">
              <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-amber-700" />
                {editingItemId ? 'Modifier le plat' : 'Ajouter un plat'}
              </h2>

              <form onSubmit={handleSaveItem} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Catégorie */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-1">Catégorie *</label>
                    <select
                      value={itemForm.categoryId || selectedCatId}
                      onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Nom */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-1">Nom du plat *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Burger Classic Double"
                      value={itemForm.name}
                      onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
                    />
                  </div>

                  {/* Prix */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-1">Prix (€) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="14.50"
                      value={itemForm.price}
                      onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-1">URL image (optionnel)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={itemForm.imageUrl}
                      onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-stone-400 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Ingrédients, accompagnements..."
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                </div>

                {/* Plat vedette */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.isFeatured}
                    onChange={(e) => setItemForm({ ...itemForm, isFeatured: e.target.checked })}
                    className="rounded border-stone-300 text-amber-700 focus:ring-amber-700"
                  />
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    Mettre en avant (Badge Produit Vedette)
                  </span>
                </label>

                <div className="flex justify-end gap-2 pt-2">
                  {editingItemId && (
                    <button
                      type="button"
                      onClick={cancelEditItem}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold px-4 py-2 rounded-xl transition btn-press"
                    >
                      Annuler
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition btn-press"
                  >
                    {editingItemId ? 'Enregistrer les modifications' : 'Ajouter au menu'}
                  </button>
                </div>
              </form>
            </div>

            {/* Liste des plats de la catégorie sélectionnée */}
            <div className="bg-white border border-stone-200/85 p-6 rounded-3xl space-y-4 shadow-sm">
              <h3 className="font-bold text-stone-900 text-sm flex items-center justify-between">
                <span>Plats enregistrés ({visibleItems.length})</span>
                {selectedCatId && (
                  <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    {categories.find((c) => c.id === selectedCatId)?.name}
                  </span>
                )}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visibleItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition ${
                      item.is_available ? 'bg-stone-50/60 border-stone-200' : 'bg-stone-100/40 border-stone-200 opacity-60'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-stone-900 leading-tight">{item.name}</h4>
                        <span className="font-extrabold text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                          {item.price.toFixed(2)} €
                        </span>
                      </div>
                      <p className="text-stone-500 text-[11px] font-medium leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-200/60 pt-2.5">
                      <button
                        onClick={() => toggleItemAvailability(item)}
                        className="flex items-center text-[11px] font-semibold text-stone-500 hover:text-stone-900 transition"
                      >
                        {item.is_available
                          ? <ToggleRight className="h-4 w-4 text-amber-700 mr-1" />
                          : <ToggleLeft className="h-4 w-4 text-stone-400 mr-1" />
                        }
                        <span>{item.is_available ? 'Disponible' : 'Épuisé'}</span>
                      </button>

                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditItem(item)}
                          className="p-1.5 bg-white border border-stone-200 rounded-lg text-stone-600 hover:text-stone-900 transition btn-press"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingItemId(item.id)}
                          className="p-1.5 bg-white border border-stone-200 rounded-lg text-stone-400 hover:text-red-600 transition btn-press"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {visibleItems.length === 0 && (
                <p className="text-center py-8 text-stone-400 text-xs font-semibold">
                  Aucun plat dans cette catégorie. Ajoutez-en un ci-dessus !
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ ONGLET EXPORT & IMPORT PDF ═══════════════════════ */}
      {activeTab === 'pdf' && (
        <div className="space-y-6">
          {/* Barre d'action PDF */}
          <div className="bg-white border border-stone-200/85 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-stone-900 text-base">Export & Fichier PDF</h2>
                <p className="text-stone-500 text-xs font-semibold mt-0.5">
                  Imprimez la carte ou associez votre propre fichier PDF pour vos clients.
                </p>
              </div>
            </div>

            <button
              onClick={handlePrintPdf}
              className="w-full sm:w-auto bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md shadow-amber-100 transition flex items-center justify-center gap-2 btn-press"
            >
              <Printer className="h-4 w-4" />
              Imprimer / Enregistrer en PDF
            </button>
          </div>

          {/* FORMULAIRE IMPORT / ASSOCIER UN FICHIER PDF */}
          <div className="bg-white border border-stone-200/85 p-6 rounded-3xl space-y-4 shadow-sm no-print">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Download className="h-4 w-4 text-amber-700" />
              Associer votre propre fichier PDF de carte
            </h3>
            <p className="text-stone-500 text-xs font-medium leading-relaxed">
              Saisissez l&apos;URL de votre fichier PDF pour que vos clients puissent directement l&apos;ouvrir et le feuilleter sur leur téléphone.
            </p>
            <form onSubmit={handleSavePdfUrl} className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                placeholder="https://votre-site.com/menu.pdf"
                value={pdfUrlInput}
                onChange={(e) => setPdfUrlInput(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
              <button
                type="submit"
                disabled={savingPdfUrl}
                className="bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 flex-shrink-0 btn-press disabled:opacity-60"
              >
                {savingPdfUrl ? <Spinner size={14} colorClass="border-white" /> : <Check className="h-4 w-4" />}
                Enregistrer le PDF
              </button>
            </form>
          </div>

          {/* DOCUMENT MENU PDF (Zone imprimable) */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-8 sm:p-12 shadow-md printable-menu space-y-8 max-w-4xl mx-auto">
            {/* Header Menu PDF */}
            <div className="text-center space-y-3 border-b-2 border-amber-700/20 pb-8">
              <div className="w-16 h-16 bg-amber-700 text-white rounded-2xl mx-auto flex items-center justify-center font-black text-2xl shadow-sm">
                {(merchant?.business_name || 'M').charAt(0).toUpperCase()}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                {merchant?.business_name || 'Notre Restaurant'}
              </h1>
              <p className="text-amber-800 text-xs uppercase tracking-widest font-bold">
                LA CARTE DU RESTAURANT
              </p>
            </div>

            {/* Corps du Menu PDF par catégories */}
            <div className="space-y-10">
              {categories.filter((c) => c.is_active !== false).map((category) => {
                const catItems = menuItems.filter(
                  (item) => item.category === category.id || item.category_id === category.id
                );

                if (catItems.length === 0) return null;

                return (
                  <div key={category.id} className="pdf-category-block space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                      <h2 className="text-lg font-black text-stone-900 uppercase tracking-wide">
                        {category.name}
                      </h2>
                      <span className="text-xs text-stone-400 font-semibold">
                        {catItems.length} choix
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {catItems.map((item) => (
                        <div key={item.id} className="pdf-item-row space-y-1 border-b border-stone-100 pb-3">
                          <div className="flex justify-between items-baseline gap-2">
                            <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
                              {item.name}
                              {item.is_featured && (
                                <Star className="h-3 w-3 fill-amber-500 text-amber-500 flex-shrink-0" />
                              )}
                            </h3>
                            <span className="font-black text-sm text-amber-900 flex-shrink-0">
                              {item.price.toFixed(2)} €
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-stone-500 text-xs font-medium leading-snug">
                              {item.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {categories.length === 0 && (
                <div className="text-center py-12 text-stone-400 font-semibold text-sm">
                  Aucun plat disponible à afficher sur le PDF.
                </div>
              )}
            </div>

            {/* Footer du PDF */}
            <div className="border-t border-stone-200 pt-6 text-center text-xs text-stone-400 font-semibold space-y-1">
              <p>Merci pour votre visite chez {merchant?.business_name || 'notre établissement'} !</p>
              <p className="text-[10px] text-stone-300">Généré via MenuFid • Carte officielle</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de confirmation suppression catégorie ── */}
      <Modal
        isOpen={!!deletingCatId}
        onClose={() => setDeletingCatId(null)}
        title="Supprimer la catégorie"
      >
        <p className="text-stone-600 text-sm">
          Toutes les sous-catégories et plats associés à cette catégorie seront définitivement supprimés.
        </p>
      </Modal>

      {/* ── Modal de confirmation suppression plat ── */}
      <Modal
        isOpen={!!deletingItemId}
        onClose={() => setDeletingItemId(null)}
        title="Supprimer le plat"
      >
        <p className="text-stone-600 text-sm">
          Êtes-vous sûr de vouloir retirer ce plat de votre carte ?
        </p>
      </Modal>
    </div>
  );
}
