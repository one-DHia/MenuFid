'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Check, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function PricingPage() {
  const { t } = useLanguage();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black flex flex-col font-sans selection:bg-[#FFB800] selection:text-black">
      <Navbar />

      <main className="flex-1 py-12 px-4 max-w-5xl mx-auto w-full">
        {/* Header Title */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="neo-badge-yellow mb-3 inline-flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('no_commitment_prices', 'Tarifs Sans Engagement')}</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight mt-2 mb-3">
            {t('simple_transparent', 'Simple & Transparent.')}
          </h1>
          <p className="text-neutral-600 text-xs sm:text-sm font-bold">
            {t('choose_ideal_offer', "Activez votre menu digital ou votre carte de fidélité dès aujourd'hui.")}
          </p>

          {/* Billing Period Toggle (Mensuel / Annuel) */}
          <div className="inline-flex items-center gap-2 p-1.5 mt-6 bg-white border-3 border-black rounded-full shadow-[4px_4px_0px_0px_#000]">
            <button
              type="button"
              onClick={() => setBillingPeriod('monthly')}
              className={`px-5 py-2 rounded-full text-xs font-black transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000]'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              {t('billing_monthly_tab', 'Facturation Mensuelle')}
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod('yearly')}
              className={`px-5 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                billingPeriod === 'yearly'
                  ? 'bg-[#FFB800] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              <span>{t('billing_yearly_tab', 'Facturation Annuelle')}</span>
              <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                {t('two_months_free', '2 Mois Offerts')}
              </span>
            </button>
          </div>
        </div>

        {/* ── PRICING BENTO CARDS (2 FORMULES PAYANTES) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          
          {/* 1. FORMULE STARTER (MENU QR ONLY) */}
          <div className="neo-box p-6 sm:p-8 flex flex-col justify-between bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-3xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-2xl text-black">{t('pricing_title_starter', 'Formule STARTER')}</h3>
                <span className="neo-badge text-[10px] font-black">Menu QR</span>
              </div>
              <p className="text-neutral-600 text-xs font-bold">
                {t('pricing_desc_starter', 'Pour les cafés et restaurants qui veulent simplement remplacer leur menu papier par un menu digital HD propre.')}
              </p>
              
              <div className="pt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black text-black" dir="ltr">
                    {billingPeriod === 'yearly' ? '190' : '19'}
                  </span>
                  <span className="text-neutral-600 text-xs font-black">
                    {billingPeriod === 'yearly' ? t('dzd_per_year', '€ / an') : t('dzd_per_month', '€ / mois')}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-neutral-500 mt-1">
                  {billingPeriod === 'yearly' ? t('save_4000_dzd', 'Économisez 38 € par rapport au mensuel') : t('no_price_increase', 'Sans engagement de durée')}
                </p>
              </div>

              <ul className="space-y-3 text-xs text-black font-extrabold pt-4 border-t-2 border-black">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>{t('pricing_feature_starter_1', 'Menu Digital QR Code HD Illimité')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>{t('pricing_feature_starter_2', 'Photos des plats, prix & allergènes')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>{t('pricing_feature_starter_3', 'Mises à jour du menu 24h/24 en direct')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>{t('pricing_feature_starter_4', 'Modèle de QR Code standard à imprimer')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>{t('pricing_feature_starter_5', 'Support client par email')}</span>
                </li>
                <li className="flex items-center gap-2 text-neutral-400 line-through">
                  <span>{t('pricing_feature_starter_6', 'Pas de Carte de Fidélité')}</span>
                </li>
                <li className="flex items-center gap-2 text-neutral-400 line-through">
                  <span>{t('pricing_feature_starter_7', 'Pas de Notifications clients')}</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t-2 border-black">
              <Link 
                href={`/pro/register?plan=starter&billing=${billingPeriod}`} 
                className="w-full neo-pill-btn-white text-xs py-4 flex items-center justify-center gap-2 text-center shadow-[2px_2px_0px_0px_#000]"
              >
                <span>{t('pricing_btn_starter', "Activer l'offre Starter")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 2. FORMULE PRO / FIDÉLITÉ (STAR PLAN) */}
          <div className="neo-box-yellow p-6 sm:p-8 flex flex-col justify-between relative border-4 border-black shadow-[10px_10px_0px_0px_#000] rounded-3xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-2xl text-black">{t('pricing_title_pro', 'Formule PRO')}</h3>
                <span className="bg-black text-white text-[10px] font-black uppercase px-3 py-1 rounded-full border border-black shadow-[2px_2px_0px_0px_#000]">
                  ⭐ {t('best_value', 'Recommandé')}
                </span>
              </div>
              <p className="text-neutral-900 text-xs font-black">
                {t('pricing_desc_pro', 'Pour les établissements qui veulent faire revenir les clients, booster leur chiffre d\'affaires et utiliser nos outils de fidélité.')}
              </p>
              
              <div className="pt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black text-black" dir="ltr">
                    {billingPeriod === 'yearly' ? '390' : '39'}
                  </span>
                  <span className="text-black text-xs font-black">
                    {billingPeriod === 'yearly' ? t('dzd_per_year', '€ / an') : t('dzd_per_month', '€ / mois')}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-neutral-800 mt-1">
                  {billingPeriod === 'yearly' ? t('save_8000_dzd_free', 'Économisez 78 € par rapport au mensuel (2 mois offerts)') : t('no_price_increase', 'Sans engagement de durée')}
                </p>
              </div>

              <ul className="space-y-3 text-xs text-black font-black pt-4 border-t-2 border-black">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3]" />
                  <span><strong>{t('pricing_feature_pro_1', 'Tout ce qui est inclus dans la formule Starter')}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3]" />
                  <span><strong>{t('pricing_feature_pro_2', 'Carte de Fidélité client interactive')}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3]" />
                  <span><strong>{t('pricing_feature_pro_3', 'Système de Notifications Web Push')}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3]" />
                  <span>{t('pricing_feature_pro_4', 'Générateur de QR chevalets de table & posters HD')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3]" />
                  <span>{t('pricing_feature_pro_5', 'Traduction automatique en direct (AR, FR, EN)')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3]" />
                  <span><strong>{t('pricing_feature_pro_6', 'Support prioritaire WhatsApp 7j/7')}</strong></span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t-2 border-black">
              <Link 
                href={`/pro/register?plan=pro&billing=${billingPeriod}`} 
                className="w-full neo-pill-btn bg-white hover:bg-neutral-100 text-black text-xs py-4 flex items-center justify-center gap-2 text-center shadow-[4px_4px_0px_0px_#000]"
              >
                <span>{t('pricing_btn_pro', "Activer l'offre Pro & Fidélité")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Reassurance Banner */}
        <div className="mt-12 neo-box bg-white p-6 text-center max-w-2xl mx-auto space-y-2 border-4 border-black shadow-[4px_4px_0px_0px_#000] rounded-2xl">
          <div className="flex items-center justify-center gap-2 text-sm font-black text-black">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>{t('pricing_reassurance_title', 'Activation Immédiate par votre Distributeur')}</span>
          </div>
          <p className="text-xs text-neutral-600 font-bold">
            {t('pricing_reassurance_desc', 'Votre compte sera activé et votre menu configuré immédiatement par notre partenaire distributeur local.')}
          </p>
        </div>

      </main>

      <Footer />
    </div>
  );
}
