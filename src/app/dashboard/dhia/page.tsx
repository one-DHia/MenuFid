'use client';

/**
 * app/dashboard/dhia/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Espace Super-Admin Secret (/dashboard/dhia).
 * Masqué au maximum, accessible uniquement par cette route spécifique.
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Search, RefreshCw, Plus, ExternalLink, Crown, Zap } from 'lucide-react';
import { db, supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import type { Merchant, PlanTier } from '@/types';

export default function DhiaAdminPage() {
  const { merchant: currentMerchant, refreshAuth } = useAuth();
  const { showToast } = useToast();

  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Formulaire d'ajout rapide commerçant
  const [newEmail, setNewEmail] = useState('');
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPlan, setNewPlan] = useState<PlanTier>('premium');
  const [newRole, setNewRole] = useState<'merchant' | 'admin'>('admin');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadAllMerchants();
  }, []);

  async function loadAllMerchants() {
    setLoading(true);
    try {
      let items = await db.collection('users').getFullList<Merchant>({
        sort: '-created',
      }).catch(() => [] as Merchant[]);

      if (items.length === 0 && currentMerchant) {
        items = [currentMerchant];
      }

      setMerchants(items);
    } catch (err: unknown) {
      console.error(err);
      showToast('Erreur lors de la récupération des commerçants.', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Changer le plan d'abonnement d'un commerçant
  async function handleChangePlan(merchantId: string, newTier: PlanTier) {
    try {
      try {
        await supabase
          .from('profiles')
          .update({ plan_tier: newTier })
          .eq('id', merchantId);
      } catch (e) {
        console.warn('Update Supabase échoué, mise à jour locale:', e);
      }

      setMerchants((prev) =>
        prev.map((m) => (m.id === merchantId ? { ...m, plan_tier: newTier } : m))
      );

      if (currentMerchant?.id === merchantId || !merchantId) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('menufid_plan_tier', newTier);
        }
        await refreshAuth();
      }

      showToast(`Abonnement mis à jour vers : ${newTier.toUpperCase()}`, 'success');
    } catch (err: unknown) {
      console.error(err);
      showToast('Erreur lors de la modification de l\'abonnement.', 'error');
    }
  }

  // Changer le rôle d'un utilisateur (Admin / Merchant)
  async function handleChangeRole(merchantId: string, role: string) {
    try {
      try {
        await supabase
          .from('profiles')
          .update({ role })
          .eq('id', merchantId);
      } catch (e) {
        console.warn('Update Supabase role échoué, mise à jour locale:', e);
      }

      setMerchants((prev) =>
        prev.map((m) => (m.id === merchantId ? { ...m, role } : m))
      );

      if (currentMerchant?.id === merchantId) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('menufid_role', role);
        }
        await refreshAuth();
      }

      showToast(`Rôle mis à jour vers : ${role.toUpperCase()}`, 'success');
    } catch (err: unknown) {
      console.error(err);
      showToast('Erreur lors de la modification du rôle.', 'error');
    }
  }

  // Action rapide : passer mon propre compte connecté en Super-Admin Premium 360°
  async function handleBoostMyAccount(plan: PlanTier = 'premium') {
    const myId = currentMerchant?.id;

    if (typeof window !== 'undefined') {
      localStorage.setItem('menufid_plan_tier', plan);
      localStorage.setItem('menufid_role', 'admin');
    }

    try {
      if (myId) {
        await supabase
          .from('profiles')
          .update({
            plan_tier: plan,
            role: 'admin',
          })
          .eq('id', myId);
      }

      await refreshAuth();
      await loadAllMerchants();
      showToast(`🎉 Votre compte a été activé en Plan ${plan.toUpperCase()} + Super-Admin !`, 'success');
    } catch {
      showToast('Erreur lors de la mise à niveau du compte.', 'error');
    }
  }

  // Création manuelle d'un commerce par l'admin
  async function handleCreateMerchant(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim() || !newBusinessName.trim() || !newPassword.trim()) return;

    setCreating(true);
    const slug = newBusinessName.toLowerCase().replace(/[^a-z0-9]/g, '');

    try {
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: newEmail.trim(),
        password: newPassword,
      });

      if (signUpErr) throw signUpErr;

      const userId = data.user?.id || `usr-${Date.now()}`;

      await supabase.from('profiles').insert({
        id: userId,
        email: newEmail.trim(),
        business_name: newBusinessName.trim(),
        slug: slug || `shop-${Date.now()}`,
        plan_tier: newPlan,
        role: newRole,
        primary_color: '#b45309',
      });

      setNewEmail('');
      setNewBusinessName('');
      setNewPassword('');
      await loadAllMerchants();
      showToast('Nouveau compte créé avec succès !', 'success');
    } catch (err: unknown) {
      console.error(err);
      showToast('Erreur lors de la création du commerçant.', 'error');
    } finally {
      setCreating(false);
    }
  }

  const filteredMerchants = merchants.filter(
    (m) =>
      (m.business_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.slug || '').toLowerCase().includes(searchQuery.toLowerCase())
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
      {/* ── En-tête Secret ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-200/60 pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-amber-700" />
            Administration Secrète (/dashboard/dhia)
          </h1>
          <p className="text-stone-500 text-sm font-semibold mt-1">
            Espace masqué réservé au fondateur. Gestion globale des abonnements et droits.
          </p>
        </div>

        <button
          onClick={loadAllMerchants}
          className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto btn-press"
        >
          <RefreshCw className="h-4 w-4" /> Actualiser la liste
        </button>
      </div>

      {/* ── Bloc d'action rapide : Booster mon propre compte ── */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white p-6 rounded-3xl space-y-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-2xl">
            <Crown className="h-6 w-6 text-amber-300" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Accès Privilégié Dhia — Mon Compte Connecté</h2>
            <p className="text-amber-200/80 text-xs font-medium mt-0.5">
              Établissement actuel : <strong>{currentMerchant?.business_name || 'Mon commerce'}</strong> ({currentMerchant?.email})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => handleBoostMyAccount('premium')}
            className="bg-white text-amber-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md hover:bg-amber-50 transition flex items-center gap-2 btn-press"
          >
            <Zap className="h-4 w-4 text-amber-600 fill-amber-500" />
            Activer le Plan Premium 360° (Toutes les options)
          </button>

          <button
            onClick={() => handleBoostMyAccount('loyalty')}
            className="bg-amber-950/60 border border-amber-500/30 text-amber-100 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-amber-950/80 transition btn-press"
          >
            Activer le Plan Fidélité CRM
          </button>

          <button
            onClick={() => handleBoostMyAccount('basic')}
            className="bg-amber-950/40 border border-amber-500/20 text-amber-200 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-amber-950/60 transition btn-press"
          >
            Passer en Plan Basic
          </button>
        </div>
      </div>

      {/* ── Métriques Admin ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-stone-200 p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-stone-400 text-xs font-bold uppercase tracking-wider block">Total Commerçants</span>
          <span className="text-3xl font-black text-stone-900">{merchants.length}</span>
        </div>
        <div className="bg-white border border-stone-200 p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-stone-400 text-xs font-bold uppercase tracking-wider block">Formules Premium</span>
          <span className="text-3xl font-black text-amber-700">
            {merchants.filter((m) => m.plan_tier === 'premium').length}
          </span>
        </div>
        <div className="bg-white border border-stone-200 p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-stone-400 text-xs font-bold uppercase tracking-wider block">Administrateurs</span>
          <span className="text-3xl font-black text-amber-900">
            {merchants.filter((m) => m.role === 'admin').length}
          </span>
        </div>
      </div>

      {/* ── Formulaire création rapide commerçant ── */}
      <div className="bg-white border border-stone-200/85 p-6 rounded-3xl space-y-4 shadow-sm">
        <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
          <Plus className="h-5 w-5 text-amber-700" />
          Créer un nouveau compte commerçant / admin
        </h2>

        <form onSubmit={handleCreateMerchant} className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1">Nom établissement *</label>
            <input
              type="text"
              required
              placeholder="Ex: Le Bistro Gourmand"
              value={newBusinessName}
              onChange={(e) => setNewBusinessName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1">E-mail *</label>
            <input
              type="email"
              required
              placeholder="contact@bistro.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1">Mot de passe *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1">Formule Abonnement</label>
            <select
              value={newPlan}
              onChange={(e) => setNewPlan(e.target.value as PlanTier)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-700"
            >
              <option value="basic">Carte Digitale (15€/m)</option>
              <option value="loyalty">Fidélité CRM (29€/m)</option>
              <option value="premium">Premium 360° (40€/m)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1">Rôle Compte</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'merchant' | 'admin')}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-700"
            >
              <option value="merchant">Commerçant Standard</option>
              <option value="admin">Super Admin 👑</option>
            </select>
          </div>

          <div className="sm:col-span-5 flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 btn-press"
            >
              {creating ? <Spinner size={14} colorClass="border-white" /> : <Plus className="h-4 w-4" />}
              Créer le compte
            </button>
          </div>
        </form>
      </div>

      {/* ── Liste des commerçants ── */}
      <div className="bg-white border border-stone-200/85 rounded-3xl overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-700" />
            Liste des comptes enregistrés ({filteredMerchants.length})
          </h2>

          <div className="relative">
            <Search className="h-4 w-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Rechercher nom, e-mail, slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Établissement</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Rôle</th>
                <th className="py-3 px-4">Formule d&apos;Abonnement</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredMerchants.map((m) => (
                <tr key={m.id} className="hover:bg-stone-50/50 transition">
                  <td className="py-3 px-4 font-bold text-stone-900">
                    <div className="flex items-center gap-1.5">
                      <span>{m.business_name || 'Sans nom'}</span>
                      {m.role === 'admin' && <Crown className="h-3.5 w-3.5 text-amber-700" />}
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">slug: {m.slug}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-stone-600">{m.email}</td>

                  {/* Choix rôle */}
                  <td className="py-3 px-4">
                    <select
                      value={m.role || 'merchant'}
                      onChange={(e) => handleChangeRole(m.id, e.target.value)}
                      className={`font-bold text-xs py-1 px-2.5 rounded-lg focus:outline-none cursor-pointer border ${
                        m.role === 'admin'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      <option value="merchant">Commerçant</option>
                      <option value="admin">Super Admin 👑</option>
                    </select>
                  </td>

                  {/* Choix abonnement */}
                  <td className="py-3 px-4">
                    <select
                      value={m.plan_tier || 'basic'}
                      onChange={(e) => handleChangePlan(m.id, e.target.value as PlanTier)}
                      className="bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs py-1 px-2.5 rounded-lg focus:outline-none cursor-pointer"
                    >
                      <option value="basic">Carte Digitale (Basic)</option>
                      <option value="loyalty">Fidélité CRM (Loyalty)</option>
                      <option value="premium">Premium 360° (Premium)</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={`/menu/${m.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:underline"
                    >
                      <span>Carte Publique</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredMerchants.length === 0 && (
            <p className="text-center py-8 text-stone-400 text-xs font-semibold">
              Aucun commerçant trouvé avec ces critères.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
