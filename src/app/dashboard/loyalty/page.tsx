'use client';

/**
 * app/dashboard/loyalty/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Configuration des offres de fidélité (cadeaux).
 * Le commerçant définit ici les récompenses que ses clients débloquent.
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Award, Gift, ToggleLeft, ToggleRight } from 'lucide-react';
import { db } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { Modal, ConfirmActions } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import type { Reward } from '@/types';

// ─── Formulaire ───────────────────────────────────────────────

interface RewardForm {
  title: string;
  points: string;
  description: string;
}

const EMPTY_FORM: RewardForm = { title: '', points: '', description: '' };

// ─── Page ─────────────────────────────────────────────────────

export default function LoyaltyPage() {
  const { merchantId } = useAuth();
  const { showToast } = useToast();

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<RewardForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { loadRewards(); }, [merchantId]);

  async function loadRewards() {
    if (!merchantId) return;
    setLoading(true);
    try {
      const items = await db.collection('rewards').getFullList<Reward>({
        filter: `merchant = "${merchantId}"`,
        sort: 'points_required',
      });
      setRewards(items);
    } catch {
      showToast('Erreur lors du chargement des cadeaux.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.points) return;

    const payload = {
      merchant: merchantId,
      title: form.title.trim(),
      points_required: parseInt(form.points, 10),
      description: form.description.trim(),
    };

    try {
      if (editingId) {
        const updated = await db.collection('rewards').update<Reward>(editingId, payload);
        setRewards((prev) => prev.map((r) => (r.id === editingId ? updated : r)));
        setEditingId(null);
        showToast('Cadeau modifié.', 'success');
      } else {
        const created = await db.collection('rewards').create<Reward>({
          ...payload,
          is_active: true,
        });
        setRewards((prev) => [...prev, created]);
        showToast('Cadeau ajouté !', 'success');
      }
      setForm(EMPTY_FORM);
    } catch {
      showToast('Impossible d\'enregistrer le cadeau.', 'error');
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    try {
      await db.collection('rewards').delete(deletingId);
      setRewards((prev) => prev.filter((r) => r.id !== deletingId));
      showToast('Cadeau supprimé.', 'success');
    } catch {
      showToast('Impossible de supprimer ce cadeau.', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleActive(reward: Reward) {
    try {
      const updated = await db.collection('rewards').update<Reward>(reward.id, {
        is_active: !reward.is_active,
      });
      setRewards((prev) => prev.map((r) => (r.id === reward.id ? updated : r)));
    } catch {
      showToast('Impossible de modifier le statut.', 'error');
    }
  }

  function startEdit(reward: Reward) {
    setEditingId(reward.id);
    setForm({
      title: reward.title,
      points: reward.points_required.toString(),
      description: reward.description,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  return (
    <div className="space-y-8">

      {/* ── En-tête ── */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Offres de Fidélité</h1>
        <p className="text-slate-500 text-sm mt-1 font-semibold">
          Configurez les cadeaux que vos clients débloquent en accumulant des points de visite.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Formulaire ajout/édition ── */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200/85 p-6 rounded-3xl space-y-4 shadow-sm">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Gift className="h-5 w-5 text-amber-700" />
              <span>{editingId ? 'Modifier le cadeau' : 'Ajouter un cadeau'}</span>
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Titre */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Titre du cadeau *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Café de bienvenue"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              {/* Points requis */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Points requis *</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="Ex: 30"
                  value={form.points}
                  onChange={(e) => setForm({ ...form, points: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description (Conditions)</label>
                <textarea
                  rows={3}
                  placeholder="Conditions ou détails d'utilisation..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition btn-press"
                  >
                    Annuler
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-amber-100 transition flex items-center gap-1.5 btn-press"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {editingId ? 'Sauvegarder' : 'Ajouter le cadeau'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Liste des cadeaux ── */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200/85 p-6 rounded-3xl shadow-sm">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-6">
              <Award className="h-5 w-5 text-amber-700" />
              Cadeaux configurés ({rewards.length})
            </h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner size={28} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className={`p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between gap-4 transition ${
                      reward.is_active ? '' : 'opacity-50'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                          {reward.title}
                        </h3>
                        <span className="bg-amber-50 text-amber-800 border border-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                          {reward.points_required} pts
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] font-medium leading-relaxed">
                        {reward.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/50 pt-3">
                      <button
                        onClick={() => toggleActive(reward)}
                        className="flex items-center text-xs text-slate-500 hover:text-slate-800 font-semibold transition btn-press"
                      >
                        {reward.is_active
                          ? <ToggleRight className="h-5 w-5 text-amber-700 mr-1.5" />
                          : <ToggleLeft className="h-5 w-5 text-slate-400 mr-1.5" />
                        }
                        {reward.is_active ? 'Actif' : 'Désactivé'}
                      </button>

                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(reward)}
                          className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 rounded-xl transition btn-press"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(reward.id)}
                          className="p-1.5 bg-white hover:bg-red-50 border border-slate-200 text-slate-400 hover:text-red-600 rounded-xl transition btn-press"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && rewards.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                Aucun cadeau configuré. Commencez par en ajouter un !
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal de confirmation ── */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Supprimer le cadeau"
      >
        <p className="text-slate-600 text-sm">
          Ce cadeau sera définitivement supprimé et ne sera plus visible par vos clients.
        </p>
        <ConfirmActions
          onCancel={() => setDeletingId(null)}
          onConfirm={handleDelete}
          confirmLabel="Supprimer"
          confirmVariant="red"
        />
      </Modal>
    </div>
  );
}
