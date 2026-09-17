'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RestaurantReviewsSection from '@/components/RestaurantReviewsSection';
import { Check, Sparkles, ShieldCheck, ArrowRight, Zap, Award, QrCode, ShoppingBag, Bell, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function PricingPage() {
  const { t, language, dir } = useLanguage();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [currency, setCurrency] = useState<'EUR' | 'DZD'>('EUR');

  const lifetimePeriodLabel = currency === 'DZD'
    ? (language === 'ar' ? 'دج دفع لمرة واحدة' : (language === 'en' ? 'DZD one-time payment' : 'DA en paiement unique'))
    : (language === 'ar' ? '€ دفع لمرة واحدة' : (language === 'en' ? '€ one-time payment' : '€ en paiement unique'));

  // Tarifs dynamiques (Offre spéciale : 3 mois offerts sur Essentiel et Pro, Licence à vie 490 € / 49 000 DA)
  const prices = {
    essential: {
      monthly: currency === 'DZD' ? '1 000 DA' : '3,99 €',
      yearly: currency === 'DZD' ? '10 000 DA' : '39,90 €',
      unit: currency === 'DZD' ? 'DA' : '€',
      afterPromoNote: currency === 'DZD'
        ? t('pricing_after_promo_note_essential_dzd', '0 DA pendant 3 mois, puis 1 000 DA/mois')
        : t('pricing_after_promo_note_essential_eur', '0 € pendant 3 mois, puis 3,99 €/mois'),
    },
    pro: {
      monthly: currency === 'DZD' ? '3 900 DA' : '39 €',
      yearly: currency === 'DZD' ? '39 000 DA' : '390 €',
      unit: currency === 'DZD' ? 'DA' : '€',
      afterPromoNote: currency === 'DZD'
        ? t('pricing_after_promo_note_pro_dzd', '0 DA pendant 3 mois, puis 3 900 DA/mois')
        : t('pricing_after_promo_note_pro_eur', '0 € pendant 3 mois, puis 39 €/mois'),
    },
    lifetime: {
      amount: currency === 'DZD' ? '49 000' : '490',
      oldAmount: currency === 'DZD' ? '89 000' : '890',
      unit: currency === 'DZD' ? 'DA' : '€',
      discountBadge: t('pricing_special_offer_badge', '🔥 OFFRE SPÉCIALE'),
      periodLabel: lifetimePeriodLabel,
    }
  };

  return (
    <div dir={dir} className="min-h-screen bg-[#FAFAFA] text-black flex flex-col font-sans selection:bg-[#FFB800] selection:text-black">
      <Navbar />

      <main className="flex-1 py-12 px-4 max-w-6xl mx-auto w-full">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="neo-badge-yellow inline-flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('no_commitment_prices', 'Tarifs Clairs & Sans Surprise')}</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight">
            {t('simple_transparent', 'Simple, Transparent & Adapté.')}
          </h1>
          <p className="text-neutral-600 text-xs sm:text-sm font-bold max-w-xl mx-auto">
            {t('choose_ideal_offer', 'Choisissez la formule idéale pour digitaliser votre carte, encaisser vos commandes en ligne et fidéliser votre clientèle.')}
          </p>

          {/* Controls Bar: Sélecteur de Devise + Période de Facturation */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            
            {/* Currency Selector (EUR / DZD) */}
            <div className="inline-flex items-center bg-white border-3 border-black rounded-full p-1 shadow-[4px_4px_0px_0px_#000]">
              <button
                type="button"
                onClick={() => setCurrency('EUR')}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                  currency === 'EUR'
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000]'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <span>🇪🇺 EUR (€)</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrency('DZD')}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                  currency === 'DZD'
                    ? 'bg-[#FFB800] text-black border border-black shadow-[2px_2px_0px_0px_#000]'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <span>🇩🇿 DZD (DA)</span>
              </button>
            </div>

            {/* Billing Period Toggle (Mensuel / Annuel) */}
            <div className="inline-flex items-center bg-white border-3 border-black rounded-full p-1 shadow-[4px_4px_0px_0px_#000]">
              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000]'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                {t('billing_monthly_tab', 'Mensuel')}
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                  billingPeriod === 'yearly'
                    ? 'bg-[#00F59B] text-black border border-black shadow-[2px_2px_0px_0px_#000]'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <span>{t('billing_yearly_tab', 'Annuel')}</span>
                <span className="bg-black text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  {t('two_months_free', '2 Mois Offerts')}
                </span>
              </button>
            </div>

          </div>
        </div>

        {/* ── PRICING BENTO GRID (2 Formules Épurées) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch max-w-4xl mx-auto">
          
          {/* 1. FORMULE ESSENTIEL */}
          <div className="neo-box p-6 sm:p-7 flex flex-col justify-between bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] rounded-3xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xl sm:text-2xl text-black">{t('plan_essential_title', 'Formule ESSENTIEL')}</h3>
                <span className="neo-badge text-[10px] font-black bg-[#00F59B] text-black border border-black shadow-[2px_2px_0px_0px_#000]">
                  {t('pricing_3_months_free', '🎁 3 MOIS OFFERTS')}
                </span>
              </div>
              <p className="text-neutral-600 text-xs font-bold leading-relaxed">
                {t('plan_essential_desc', 'Votre carte digitale en ligne prête en quelques minutes.')}
              </p>
              
              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-neutral-400 line-through">
                    {billingPeriod === 'yearly' ? prices.essential.yearly : prices.essential.monthly}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full border border-emerald-300">
                    {t('pricing_3_months_free', '🎁 3 MOIS OFFERTS')}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-4xl sm:text-5xl font-black text-black" dir="ltr">
                    0
                  </span>
                  <span className="text-neutral-600 text-xs font-black">
                    {prices.essential.unit} {billingPeriod === 'yearly' ? (language === 'ar' ? '/ سنوياً' : '/ an') : (language === 'ar' ? '/ شهرياً' : '/ mois')}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-emerald-700 mt-1">
                  ✓ {prices.essential.afterPromoNote}
                </p>
              </div>

              <ul className="space-y-3 text-xs text-black font-extrabold pt-4 border-t-2 border-black">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                  <span>{t('feature_essential_1', 'Menu Digital QR Code (jusqu\'à 100 plats)')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                  <span>{t('feature_essential_2', 'Mises à jour des prix en direct 24h/24')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                  <span>{t('feature_essential_3', 'Générateur de QR Code de table prêt à imprimer')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                  <span>{t('feature_essential_4', 'Traduction automatique en direct (FR, AR, EN)')}</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t-2 border-black">
              <Link 
                href={`/pro/register?plan=starter&currency=${currency}&billing=${billingPeriod}`} 
                className="w-full neo-pill-btn-white text-xs py-3.5 flex items-center justify-center gap-2 text-center shadow-[3px_3px_0px_0px_#000]"
              >
                <span>{t('btn_activate_essential', 'Activer l\'offre Essentiel (3 Mois Offerts)')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 2. FORMULE PRO & FIDÉLITÉ (STAR PLAN - RECOMMANDÉ) */}
          <div className="neo-box-yellow p-6 sm:p-7 flex flex-col justify-between relative border-4 border-black shadow-[10px_10px_0px_0px_#000] rounded-3xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xl sm:text-2xl text-black">{t('plan_pro_title', 'Formule PRO')}</h3>
                <span className="bg-black text-[#FFB800] text-[10px] font-black uppercase px-3 py-1 rounded-full border border-black shadow-[2px_2px_0px_0px_#000]">
                  {t('pricing_3_months_free_recom', '⭐ 3 MOIS OFFERTS • RECOMMANDÉ')}
                </span>
              </div>
              <p className="text-neutral-900 text-xs font-black leading-relaxed">
                {t('pricing_desc_pro', 'La solution complète : Commandes en direct sans commission, Carte de fidélité et notifications push.')}
              </p>
              
              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-neutral-600 line-through">
                    {billingPeriod === 'yearly' ? prices.pro.yearly : prices.pro.monthly}
                  </span>
                  <span className="text-[10px] bg-black text-[#00F59B] font-black px-2 py-0.5 rounded-full border border-black">
                    {t('pricing_3_months_free', '🎁 3 MOIS OFFERTS')}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-4xl sm:text-5xl font-black text-black" dir="ltr">
                    0
                  </span>
                  <span className="text-black text-xs font-black">
                    {prices.pro.unit} {billingPeriod === 'yearly' ? (language === 'ar' ? '/ سنوياً' : '/ an') : (language === 'ar' ? '/ شهرياً' : '/ mois')}
                  </span>
                </div>
                <p className="text-[11px] font-black text-neutral-900 mt-1">
                  ✓ {prices.pro.afterPromoNote}
                </p>
              </div>

              <ul className="space-y-3 text-xs text-black font-black pt-4 border-t-2 border-black">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                  <span>{t('feature_pro_1', 'Tout ce qui est inclus dans Essentiel')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                  <span>{t('feature_pro_2', 'Plats & catégories 100% illimités')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                  <span>{t('feature_pro_3', 'Commandes en ligne & Livraison (0% commission)')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                  <span>{t('feature_pro_4', 'Carte de Fidélité interactive (Apple & Google Wallet)')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                  <span>{t('feature_pro_5', 'Portail Livreur Mobile avec GPS & encaissement')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                  <span>{t('feature_pro_6', 'Notifications Web Push & envoi direct WhatsApp')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                  <span>{t('feature_pro_7', 'Support prioritaire WhatsApp 7j/7')}</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t-2 border-black">
              <Link 
                href={`/pro/register?plan=pro&currency=${currency}&billing=${billingPeriod}`} 
                className="w-full neo-pill-btn bg-black hover:bg-neutral-800 text-white text-xs py-4 flex items-center justify-center gap-2 text-center shadow-[4px_4px_0px_0px_#000]"
              >
                <span>{t('btn_activate_pro_deal', 'Activer l\'offre PRO (3 Mois Offerts)')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* ── 3. FORMULE SPÉCIALE : LICENCE À VIE (ONE-SHOT) ── */}
        <div className="mt-10 max-w-4xl mx-auto neo-box p-6 sm:p-8 bg-gradient-to-r from-amber-50 to-orange-50 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_#000]">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-[#FF4747] text-white px-3 py-1 rounded-full border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000]">
                <span>{prices.lifetime.discountBadge}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-black">
                {t('lifetime_title', 'Licence Complète à Vie (One-Shot)')}
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm font-bold text-neutral-800 pt-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                  <span>{t('lifetime_feature_1', 'Accès PRO complet à vie (Paiement unique)')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                  <span>{t('lifetime_feature_2', 'Toutes les futures mises à jour incluses à vie')}</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
              <div className="text-left lg:text-right">
                <div className="flex items-center gap-2 lg:justify-end">
                  <span className="text-base font-bold text-neutral-400 line-through">
                    {prices.lifetime.oldAmount} {prices.lifetime.unit}
                  </span>
                  <span className="text-xs bg-[#FF4747] text-white font-black px-2 py-0.5 rounded border border-black">
                    -45%
                  </span>
                </div>
                <span className="text-3xl sm:text-4xl font-black text-black block mt-0.5" dir="ltr">
                  {prices.lifetime.amount} {prices.lifetime.unit}
                </span>
                <p className="text-[11px] font-black text-neutral-600">
                  {t('one_time_payment', 'Paiement unique • Zéro abonnement')}
                </p>
              </div>

              <Link
                href={`/pro/register?plan=lifetime&currency=${currency}&billing=lifetime`}
                className="neo-pill-btn bg-black hover:bg-neutral-800 text-white px-6 py-3.5 text-xs font-black flex items-center gap-2 shadow-[4px_4px_0px_0px_#FFB800]"
              >
                <span>{t('btn_get_lifetime_deal', 'Obtenir la Licence à Vie')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── 5. SECTION AVIS & TÉMOIGNAGES RESTAURATEURS ── */}
        <RestaurantReviewsSection />

        {/* Bottom Reassurance Banner */}
        <div className="mt-12 neo-box bg-white p-6 text-center max-w-2xl mx-auto space-y-2 border-4 border-black shadow-[4px_4px_0px_0px_#000] rounded-2xl">
          <div className="flex items-center justify-center gap-2 text-sm font-black text-black">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>{t('pricing_reassurance_title', 'Accompagnement & Déploiement Local')}</span>
          </div>
          <p className="text-xs text-neutral-600 font-bold">
            {t('pricing_reassurance_desc', 'Nos distributeurs partenaires régionaux vous accompagnent pour la saisie de votre carte, l\'impression de vos QR codes de table et la configuration de votre compte.')}
          </p>
        </div>

      </main>

      <Footer />
    </div>
  );
}
