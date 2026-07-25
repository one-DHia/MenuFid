'use client';

/**
 * app/pricing/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Page Grille Tarifaire Complète 100% Multilingue (Basic 5€, Fidélité 10€, Premium 20€).
 */

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import { Check, Sparkles, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
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
        setErrorMsg(data.error || 'Configuration Stripe en cours...');
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
            <Sparkles className="w-4 h-4 text-amber-700" /> {t('pricing_page_title')}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            {t('hero_title')}
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            {t('pricing_page_subtitle')}
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
              <div className="text-amber-800 font-extrabold text-lg mb-2">{t('plan_basic_name')}</div>
              <p className="text-slate-500 text-xs mb-6">{t('plan_basic_desc')}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-slate-900">{t('plan_basic_price')}</span>
                <span className="text-slate-500 text-sm font-semibold">{t('per_month')}</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                  <Check className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span>{t('plan_basic_feat1')}</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                  <Check className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span>{t('plan_basic_feat2')}</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                  <Check className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span>{t('plan_basic_feat3')}</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSelectPlan('basic')}
              disabled={loadingTier === 'basic'}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-2xl transition text-sm flex items-center justify-center gap-2 shadow-md btn-press"
            >
              {loadingTier === 'basic' ? '...' : t('btn_choose_plan')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Loyalty Plan (Featured) */}
          <div className="bg-gradient-to-b from-amber-900 via-amber-800 to-amber-950 text-white rounded-3xl p-8 border-2 border-amber-500 shadow-2xl flex flex-col justify-between relative transform md:-translate-y-2">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-amber-300">
              ⚡ {t('popular_badge')}
            </div>
            <div>
              <div className="text-amber-300 font-black text-xl mb-2 mt-2 flex items-center justify-between">
                <span>{t('plan_loyalty_name')}</span>
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <p className="text-amber-100/80 text-xs mb-6">{t('plan_loyalty_desc')}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black text-white">{t('plan_loyalty_price')}</span>
                <span className="text-amber-200 text-sm font-semibold">{t('per_month')}</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2.5 text-xs text-amber-50 font-medium">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{t('plan_loyalty_feat1')}</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-amber-50 font-medium">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{t('plan_loyalty_feat2')}</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-amber-50 font-medium">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{t('plan_loyalty_feat3')}</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-amber-50 font-medium">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{t('plan_loyalty_feat4')}</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSelectPlan('loyalty')}
              disabled={loadingTier === 'loyalty'}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-black py-4 px-4 rounded-2xl transition text-sm flex items-center justify-center gap-2 shadow-xl btn-press"
            >
              {loadingTier === 'loyalty' ? '...' : t('btn_choose_plan')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md flex flex-col justify-between hover:shadow-xl transition-shadow relative">
            <div>
              <div className="text-amber-900 font-extrabold text-lg mb-2">{t('plan_premium_name')}</div>
              <p className="text-slate-500 text-xs mb-6">{t('plan_premium_desc')}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-slate-900">{t('plan_premium_price')}</span>
                <span className="text-slate-500 text-sm font-semibold">{t('per_month')}</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                  <Check className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span>{t('plan_premium_feat1')}</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                  <Check className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span>{t('plan_premium_feat2')}</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                  <Check className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span>{t('plan_premium_feat3')}</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                  <Check className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span>{t('plan_premium_feat4')}</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSelectPlan('premium')}
              disabled={loadingTier === 'premium'}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-2xl transition text-sm flex items-center justify-center gap-2 shadow-md btn-press"
            >
              {loadingTier === 'premium' ? '...' : t('btn_choose_plan')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Security Banner */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center max-w-2xl mx-auto flex items-center justify-center gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-700 flex-shrink-0" />
          <span className="text-xs font-bold text-slate-700">{t('no_credit_card')}</span>
        </div>
      </main>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
