'use client';

/**
 * app/dashboard/profile/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Page de Gestion du Profil Commerçant & Paramètres d'Établissement.
 * Permet d'éditer : Nom commercial, Slug URL, Couleur de marque,
 * Lien d'Avis Google Maps, Fichier PDF du Menu, et Mot de Passe.
 */

import React, { useState, useEffect } from 'react';
import { User, Building, Palette, Link as LinkIcon, FileText, Lock, Save, Check, Star, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const { merchant, refreshAuth } = useAuth();
  const { showToast } = useToast();

  const [businessName, setBusinessName] = useState(merchant?.business_name || '');
  const [slug, setSlug] = useState(merchant?.slug || '');
  const [email, setEmail] = useState(merchant?.email || '');
  const [primaryColor, setPrimaryColor] = useState(merchant?.primary_color || '#b45309');
  const [googleReviewUrl, setGoogleReviewUrl] = useState(merchant?.google_review_url || '');
  const [pdfMenuUrl, setPdfMenuUrl] = useState(merchant?.pdf_menu_url || '');

  // Formulaire mot de passe
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (merchant) {
      setBusinessName(merchant.business_name || '');
      setSlug(merchant.slug || '');
      setEmail(merchant.email || '');
      setPrimaryColor(merchant.primary_color || '#b45309');
      setGoogleReviewUrl(merchant.google_review_url || '');
      setPdfMenuUrl(merchant.pdf_menu_url || '');
    }

    // Détection de retour de paiement Stripe réussi (Fallback sans Webhook)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isSuccess = params.get('payment') === 'success';
      const tier = params.get('tier') as 'basic' | 'loyalty' | 'premium' | null;

      if (isSuccess && tier && merchant?.id) {
        localStorage.setItem('menufid_plan_tier', tier);
        supabase
          .from('profiles')
          .update({ plan_tier: tier })
          .eq('id', merchant.id)
          .then(() => {
            refreshAuth();
            showToast(`🎉 Félicitations ! Votre abonnement ${tier.toUpperCase()} est désormais activé !`, 'success');
            window.history.replaceState({}, document.title, window.location.pathname);
          });
      }
    }
  }, [merchant, refreshAuth, showToast]);

  // Sauvegarder les informations du profil
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim() || !slug.trim()) return;

    setSavingProfile(true);
    const updatedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');

    try {
      if (merchant?.id) {
        await supabase
          .from('profiles')
          .update({
            business_name: businessName.trim(),
            slug: updatedSlug,
            primary_color: primaryColor,
            google_review_url: googleReviewUrl.trim(),
            pdf_menu_url: pdfMenuUrl.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', merchant.id);
      }

      if (typeof window !== 'undefined') {
        if (pdfMenuUrl.trim()) localStorage.setItem('menufid_pdf_url', pdfMenuUrl.trim());
      }

      await refreshAuth();
      showToast('Profil et paramètres d\'établissement sauvegardés !', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la sauvegarde du profil.', 'error');
    } finally {
      setSavingProfile(false);
    }
  }

  // Changer le mot de passe via Supabase
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      showToast('Les mots de passe ne correspondent pas.', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setNewPassword('');
      setConfirmPassword('');
      showToast('Mot de passe mis à jour avec succès !', 'success');
    } catch {
      showToast('Erreur lors du changement de mot de passe.', 'error');
    } finally {
      setSavingPassword(false);
    }
  }

  // Déclencher le paiement Stripe Checkout
  async function handleSubscribeStripe(planTier: 'basic' | 'loyalty' | 'premium') {
    if (!merchant) return;

    try {
      showToast('Redirection vers la page de paiement sécurisée Stripe...', 'info');
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: merchant.id,
          email: merchant.email,
          planTier,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erreur lors de l\'initialisation de Stripe');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Impossible de se connecter à Stripe. Vérifiez votre clé API.';
      showToast(msg, 'error');
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">

      {/* ── En-tête ── */}
      <div className="border-b border-stone-200/60 pb-6">
        <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
          <User className="h-6 w-6 text-amber-700" />
          Profil & Paramètres de l&apos;Établissement
        </h1>
        <p className="text-stone-500 text-sm font-semibold mt-1">
          Gérez l&apos;identité de votre restaurant, votre charte graphique et vos abonnements Stripe.
        </p>
      </div>

      {/* ── Carte récapitulative formule & Stripe ── */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-6 sm:p-8 rounded-3xl space-y-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-700 text-white rounded-2xl flex items-center justify-center font-black text-xl">
              {(businessName || 'M').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-extrabold text-base">{businessName || 'Mon Établissement'}</h2>
              <p className="text-stone-400 text-xs font-mono">slug: /menu/{slug || 'shop'}</p>
            </div>
          </div>

          <div className="bg-amber-950/80 border border-amber-500/40 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider self-start sm:self-auto">
            Plan Actif : {merchant?.plan_tier?.toUpperCase() || 'PREMIUM'}
          </div>
        </div>

        {/* Boutons d'Abonnement Stripe Direct */}
        <div className="border-t border-stone-800 pt-5 space-y-3">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
            Changer de formule ou S&apos;abonner via Stripe Paiement Sécurisé :
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleSubscribeStripe('basic')}
              className="bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-bold py-2.5 px-3 rounded-xl transition text-center btn-press"
            >
              Basic (15€/m)
            </button>

            <button
              onClick={() => handleSubscribeStripe('loyalty')}
              className="bg-amber-950/80 hover:bg-amber-900 border border-amber-600/50 text-amber-200 text-xs font-extrabold py-2.5 px-3 rounded-xl transition text-center btn-press"
            >
              Fidélité CRM (29€/m)
            </button>

            <button
              onClick={() => handleSubscribeStripe('premium')}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-black py-2.5 px-3 rounded-xl shadow-md transition text-center btn-press"
            >
              Premium 360° (40€/m)
            </button>
          </div>
        </div>
      </div>

      {/* ── Formulaire Identité & Marque ── */}
      <form onSubmit={handleSaveProfile} className="bg-white border border-stone-200/85 p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm">
        <h2 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-3 flex items-center gap-2">
          <Building className="h-5 w-5 text-amber-700" />
          Identité & Charte Graphique
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1">Nom de l&apos;établissement *</label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1">Slug URL personnalisé (/menu/[slug]) *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1">Adresse E-mail de contact</label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full bg-stone-100 border border-stone-200 rounded-xl py-2.5 px-3.5 text-xs text-stone-500 font-semibold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1 flex items-center gap-1">
              <Palette className="h-3.5 w-3.5 text-amber-700" />
              Couleur Principale de Marque
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-xl border border-stone-200 cursor-pointer p-1"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-xs font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {/* Formulaire Intégrations */}
        <div className="pt-4 border-t border-stone-100 space-y-4">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-amber-700" />
            Intégrations & Documents
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1 flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                Lien Fiche Google Maps (Booster d&apos;Avis 5 Étoiles)
              </label>
              <input
                type="url"
                placeholder="https://g.page/r/votre-fiche-google/review"
                value={googleReviewUrl}
                onChange={(e) => setGoogleReviewUrl(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-amber-700" />
                URL du Fichier PDF du Menu Original
              </label>
              <input
                type="url"
                placeholder="https://votre-site.com/menu-restaurant.pdf"
                value={pdfMenuUrl}
                onChange={(e) => setPdfMenuUrl(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingProfile}
            className="bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition flex items-center gap-2 btn-press"
          >
            {savingProfile ? <Spinner size={14} colorClass="border-white" /> : <Save className="h-4 w-4" />}
            Enregistrer les modifications
          </button>
        </div>
      </form>

      {/* ── Formulaire Sécurité & Mot de Passe ── */}
      <form onSubmit={handleChangePassword} className="bg-white border border-stone-200/85 p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm">
        <h2 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-3 flex items-center gap-2">
          <Lock className="h-5 w-5 text-amber-700" />
          Sécurité & Mot de passe
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1">Nouveau mot de passe *</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1">Confirmer le nouveau mot de passe *</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingPassword}
            className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition flex items-center gap-2 btn-press"
          >
            {savingPassword ? <Spinner size={14} colorClass="border-white" /> : <ShieldCheck className="h-4 w-4" />}
            Changer le mot de passe
          </button>
        </div>
      </form>
    </div>
  );
}
