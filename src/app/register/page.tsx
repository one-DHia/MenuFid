'use client';

/**
 * app/register/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Inscription d'un nouveau commerçant.
 * Crée le compte Supabase puis redirige vers /dashboard.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Sparkles, Utensils, Award, ChevronRight, Lock, Mail, Store, AlertCircle } from 'lucide-react';
import type { PlanTier } from '@/types';

// ─── Plans disponibles ────────────────────────────────────────

interface PlanOption {
  tier: PlanTier;
  label: string;
  price: string;
  Icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const PLANS: PlanOption[] = [
  { tier: 'basic',   label: 'Plan Menu',     price: '15€ / mois', Icon: Utensils },
  { tier: 'loyalty', label: 'Plan Fidélité', price: '29€ / mois', Icon: Award },
  { tier: 'premium', label: 'Plan Premium',  price: '40€ / mois', Icon: Sparkles, badge: 'Populaire' },
];

// ─── Page ─────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [slug, setSlug] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /** Auto-génère le slug URL depuis le nom du commerce */
  function handleBusinessNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setBusinessName(value);
    setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  }

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      const userId = data.user?.id || `usr-${Date.now()}`;
      const finalSlug = slug.trim() || `shop-${Date.now()}`;

      // Tenter d'insérer dans la table profiles
      try {
        await supabase.from('profiles').insert({
          id: userId,
          email,
          business_name: businessName.trim(),
          slug: finalSlug,
          plan_tier: selectedPlan,
        });
      } catch {}

      if (typeof window !== 'undefined') {
        localStorage.setItem('menufid_plan_tier', selectedPlan);
        localStorage.setItem('menufid_merchant_profile', JSON.stringify({
          id: userId,
          email,
          business_name: businessName.trim(),
          slug: finalSlug,
          plan_tier: selectedPlan,
          role: 'merchant',
        }));
      }

      router.push('/dashboard');
    } catch {
      setError('Impossible de créer le compte. L\'adresse e-mail est peut-être déjà utilisée.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50/20 via-stone-50 to-stone-50 py-12 px-4">
      <div className="max-w-xl w-full space-y-8 glass p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-md">

        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center">
            <span className="flex items-center gap-2 bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent text-3xl font-black tracking-tight select-none">
              <Sparkles className="h-8 w-8 text-amber-700 animate-pulse" />
              MenuFid
            </span>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
            Créez votre compte commerçant
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Ou{' '}
            <Link href="/login" className="font-semibold text-amber-700 hover:text-amber-600 transition">
              connectez-vous à votre espace existant
            </Link>
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire */}
        <form className="space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">

            {/* Nom du commerce */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Nom de votre commerce *
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Le Petit Bistro"
                  value={businessName}
                  onChange={handleBusinessNameChange}
                  className="pl-9 w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-700 transition"
                />
              </div>
            </div>

            {/* Slug URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Identifiant URL *
              </label>
              <div className="flex rounded-xl bg-white border border-slate-200 focus-within:ring-1 focus-within:ring-amber-700">
                <span className="inline-flex items-center px-3 rounded-l-xl border-r border-slate-100 text-slate-400 text-xs font-medium select-none whitespace-nowrap">
                  menufid.com/menu/
                </span>
                <input
                  type="text"
                  required
                  placeholder="le-petit-bistro"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                  className="w-full bg-transparent border-0 py-3 px-3 text-sm placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Adresse e-mail professionnelle *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="commercant@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-700 transition"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Mot de passe *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-700 transition"
                />
              </div>
            </div>

            {/* Sélection du plan */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-3">
                Sélectionnez votre formule
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {PLANS.map(({ tier, label, price, Icon, badge }) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setSelectedPlan(tier)}
                    className={`p-4 rounded-2xl border flex flex-col text-left relative transition btn-press ${
                      selectedPlan === tier
                        ? 'border-amber-700 bg-amber-50 text-slate-900'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {badge && (
                      <span className="absolute top-2 right-2 bg-amber-700 text-[8px] font-bold text-white px-1.5 py-0.5 rounded">
                        {badge}
                      </span>
                    )}
                    <Icon className={`h-5 w-5 mb-2 ${selectedPlan === tier ? 'text-amber-800' : 'text-slate-400'}`} />
                    <span className="font-bold text-xs text-slate-800">{label}</span>
                    <span className="text-[10px] text-slate-500 mt-1 font-semibold">{price}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-700 hover:bg-amber-600 text-white py-3.5 px-4 rounded-xl font-bold text-xs shadow-md shadow-amber-100 transition flex justify-center items-center gap-2 btn-press disabled:opacity-60"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Créer mon espace
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
