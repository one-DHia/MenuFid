'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import { PRICING_TIERS } from '@/lib/stripe';
import { Check, Sparkles, Zap, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function PricingPage() {
  const { t } = useLanguage();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectPlan = async (tierKey: 'basic' | 'loyalty' | 'premium') => {
    setLoadingTier(tierKey);
    setErrorMsg('');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: 'merchant-public',
          email: 'contact@menufid.site',
          planTier: tierKey,
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setErrorMsg(data.error || 'Veuillez configurer votre clé STRIPE_SECRET_KEY sur Vercel.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Impossible d\'ouvrir la page de paiement Stripe.';
      setErrorMsg(msg);
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-16 px-4 max-w-7xl mx-auto w-full">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-900 border border-amber-300/60 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-700" /> Tarifs Simples & Transparentes
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Investissez pour <span className="text-amber-800 underline decoration-amber-500/40">multiplier vos gains</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Chaque formule est conçue pour maximiser la rentabilité de votre établissement dès le premier mois. Sans engagement, sans frais d&apos;installation.
          </p>
          {errorMsg && (
            <div className="mt-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-stretch">
          {/* Basic Plan */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md flex flex-col justify-between hover:shadow-xl transition-shadow relative">
            <div>
              <div className="text-amber-800 font-extrabold text-lg mb-2">Basic</div>
              <p className="text-slate-500 text-xs mb-6">Idéal pour digitaliser votre carte en 2 minutes.</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-slate-900">5€</span>
                <span className="text-slate-500 text-sm font-semibold">/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                {PRICING_TIERS.basic.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <Check className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handleSelectPlan('basic')}
              disabled={loadingTier === 'basic'}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-2xl transition text-sm flex items-center justify-center gap-2 shadow-md btn-press"
            >
              {loadingTier === 'basic' ? 'Ouverture...' : 'Choisir la Formule Basic'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Loyalty Plan (Featured) */}
          <div className="bg-gradient-to-b from-amber-900 via-amber-800 to-amber-950 text-white rounded-3xl p-8 border-2 border-amber-500 shadow-2xl flex flex-col justify-between relative transform md:-translate-y-2">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-amber-300">
              ⚡ Plus Populaire - Recommandé
            </div>
            <div>
              <div className="text-amber-300 font-black text-xl mb-2 mt-2 flex items-center justify-between">
                <span>Fidélité</span>
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <p className="text-amber-100/80 text-xs mb-6">Boostez la récurrence de vos clients existants.</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black text-white">10€</span>
                <span className="text-amber-200 text-sm font-semibold">/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                {PRICING_TIERS.loyalty.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-amber-50 font-medium">
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handleSelectPlan('loyalty')}
              disabled={loadingTier === 'loyalty'}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-black py-4 px-4 rounded-2xl transition text-sm flex items-center justify-center gap-2 shadow-xl btn-press"
            >
              {loadingTier === 'loyalty' ? 'Ouverture...' : 'Souscrire pour 10€/mois'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md flex flex-col justify-between hover:shadow-xl transition-shadow relative">
            <div>
              <div className="text-amber-900 font-extrabold text-lg mb-2">Premium Intégral</div>
              <p className="text-slate-500 text-xs mb-6">Solution ultime pour maximiser vos avis Google & vos gains.</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-slate-900">20€</span>
                <span className="text-slate-500 text-sm font-semibold">/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                {PRICING_TIERS.premium.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <Check className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handleSelectPlan('premium')}
              disabled={loadingTier === 'premium'}
              className="w-full bg-amber-900 hover:bg-amber-800 text-white font-bold py-3.5 px-4 rounded-2xl transition text-sm flex items-center justify-center gap-2 shadow-md btn-press"
            >
              {loadingTier === 'premium' ? 'Ouverture...' : 'Activer la Formule Premium'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Guarantee Banner */}
        <div className="bg-amber-100/60 rounded-3xl p-8 border border-amber-200/80 flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto mb-16">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-800 text-amber-100 flex items-center justify-center flex-shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Garantie 0 Risque & Annulation en 1 Clic</h4>
              <p className="text-slate-600 text-xs">Abonnement sans engagement de durée. Annulez à tout moment depuis votre profil.</p>
            </div>
          </div>
          <Link
            href="/contact"
            className="whitespace-nowrap bg-white hover:bg-slate-50 text-slate-800 font-bold px-5 py-3 rounded-2xl text-xs border border-slate-300 shadow-sm transition"
          >
            Une question ? Contactez-nous
          </Link>
        </div>
      </main>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
