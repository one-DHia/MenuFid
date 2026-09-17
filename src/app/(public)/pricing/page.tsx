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

  const freemiumPeriodLabel = currency === 'DZD'
    ? (language === 'ar' ? 'دج / مدى الحياة' : (language === 'en' ? 'DZD / lifetime' : 'DA / à vie'))
    : (language === 'ar' ? '€ / مدى الحياة' : (language === 'en' ? '€ / lifetime' : '€ / à vie'));

  // Tarifs dynamiques en fonction de la devise et de la périodicité (Offre spéciale lancement: abonnements 100% gratuits, licence -50%)
  const prices = {
    freemium: {
      monthly: '0',
      yearly: '0',
      periodLabel: freemiumPeriodLabel,
    },
    starter: {
      monthly: '0',
      yearly: '0',
      oldMonthly: currency === 'DZD' ? '1 900 DA' : '19 €',
      oldYearly: currency === 'DZD' ? '19 000 DA' : '190 €',
      unit: currency === 'DZD' ? 'DA' : '€',
      saveLabel: currency === 'DZD' ? `${t('pricing_free_launch_notice', 'Offert pour le lancement')} (0 DA)` : `${t('pricing_free_launch_notice', 'Offert pour le lancement')} (0 €)`,
    },
    pro: {
      monthly: '0',
      yearly: '0',
      oldMonthly: currency === 'DZD' ? '3 900 DA' : '39 €',
      oldYearly: currency === 'DZD' ? '39 000 DA' : '390 €',
      unit: currency === 'DZD' ? 'DA' : '€',
      saveLabel: currency === 'DZD' ? `${t('pricing_free_launch_notice', 'Offert pour le lancement')} (0 DA)` : `${t('pricing_free_launch_notice', 'Offert pour le lancement')} (0 €)`,
    },
    lifetime: {
      amount: currency === 'DZD' ? '24 500' : '245',
      oldAmount: currency === 'DZD' ? '49 000' : '490',
      unit: currency === 'DZD' ? 'DA' : '€',
      discountBadge: t('pricing_lifetime_discount_badge', '-50% OFFRE SPÉCIALE'),
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

        {/* ── PRICING BENTO GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
          
          {/* 1. FORMULE DÉCOUVERTE / FREEMIUM (0 € / 0 DA) */}
          <div className="neo-box p-6 flex flex-col justify-between bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-3xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xl sm:text-2xl text-black">{t('plan_freemium_title', 'Freemium')}</h3>
                <span className="neo-badge text-[10px] font-black bg-neutral-100">{t('free', 'Gratuit')}</span>
              </div>
              <p className="text-neutral-600 text-xs font-bold leading-relaxed">
                {t('plan_freemium_desc', 'Pour tester MenuFid avec une carte digitale en ligne propre sans engagement financier.')}
              </p>
              
              <div className="pt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-black" dir="ltr">
                    0
                  </span>
                  <span className="text-neutral-600 text-xs font-black">
                    {currency === 'DZD' ? 'DA / à vie' : '€ / à vie'}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-neutral-500 mt-1">
                  {t('freemium_no_card', 'Sans carte bancaire requise')}
                </p>
              </div>

              <ul className="space-y-3 text-xs text-black font-bold pt-4 border-t-2 border-black">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                  <span>{t('feature_digital_menu', 'Menu Digital QR Code en ligne')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                  <span>{t('feature_up_to_dishes', 'Jusqu\'à 20 plats avec photos')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                  <span>{t('feature_qr_standard', 'QR Code de base à imprimer')}</span>
                </li>
                <li className="flex items-center gap-2 text-neutral-400 line-through">
                  <span>{t('feature_no_orders', 'Pas de Commande directe')}</span>
                </li>
                <li className="flex items-center gap-2 text-neutral-400 line-through">
                  <span>{t('feature_no_loyalty', 'Pas de Carte de Fidélité')}</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t-2 border-black">
              <Link 
                href={`/pro/register?plan=freemium&currency=${currency}`} 
                className="w-full neo-pill-btn-white text-xs py-3.5 flex items-center justify-center gap-2 text-center shadow-[2px_2px_0px_0px_#000]"
              >
                <span>{t('btn_activate_freemium', 'Commencer Gratuitement')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 2. FORMULE STARTER (MENU QR HD ILLIMITÉ) */}
          <div className="neo-box p-6 flex flex-col justify-between bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-3xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xl sm:text-2xl text-black">{t('pricing_title_starter', 'Formule STARTER')}</h3>
                <span className="neo-badge text-[10px] font-black bg-[#00F59B] text-black">{t('pricing_launch_badge', 'OFFERT LANCEMENT')}</span>
              </div>
              <p className="text-neutral-600 text-xs font-bold leading-relaxed">
                {t('pricing_desc_starter', 'Pour les cafés et restaurants qui veulent un menu digital complet, illimité et actualisé 24h/24.')}
              </p>
              
              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-neutral-400 line-through">
                    {billingPeriod === 'yearly' ? prices.starter.oldYearly : prices.starter.oldMonthly}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full border border-emerald-300">
                    {t('pricing_100_free', '100% GRATUIT')}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-4xl sm:text-5xl font-black text-black" dir="ltr">
                    0
                  </span>
                  <span className="text-neutral-600 text-xs font-black">
                    {prices.starter.unit} {billingPeriod === 'yearly' ? (language === 'ar' ? '/ سنوياً' : '/ an') : (language === 'ar' ? '/ شهرياً' : '/ mois')}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-emerald-700 mt-1">
                  ✓ {prices.starter.saveLabel}
                </p>
              </div>

              <ul className="space-y-3 text-xs text-black font-extrabold pt-4 border-t-2 border-black">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                  <span>{t('pricing_feature_starter_1', 'Menu Digital QR Code HD Illimité')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                  <span>{t('pricing_feature_starter_2', 'Photos HD, catégories & allergènes')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                  <span>{t('pricing_feature_starter_3', 'Mises à jour des prix 24h/24 en direct')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                  <span>{t('pricing_feature_starter_4', 'Générateur de QR code de table HD')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                  <span>{t('pricing_feature_starter_5', 'Support technique par email')}</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t-2 border-black">
              <Link 
                href={`/pro/register?plan=starter&currency=${currency}&billing=${billingPeriod}`} 
                className="w-full neo-pill-btn-white text-xs py-3.5 flex items-center justify-center gap-2 text-center shadow-[2px_2px_0px_0px_#000]"
              >
                <span>{t('pricing_btn_starter_free', "Activer l'offre Starter (Gratuit)")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 3. FORMULE PRO & FIDÉLITÉ (STAR PLAN - RECOMMANDÉ) */}
          <div className="neo-box-yellow p-6 sm:p-7 flex flex-col justify-between relative border-4 border-black shadow-[10px_10px_0px_0px_#000] rounded-3xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xl sm:text-2xl text-black">{t('pricing_title_pro', 'Formule PRO')}</h3>
                <span className="bg-black text-[#FFB800] text-[10px] font-black uppercase px-3 py-1 rounded-full border border-black shadow-[2px_2px_0px_0px_#000]">
                  ⭐ {t('pricing_launch_badge', 'Offert Lancement')}
                </span>
              </div>
              <p className="text-neutral-900 text-xs font-black leading-relaxed">
                {t('pricing_desc_pro', 'La solution complète : Commandes en direct sans commission, Carte de fidélité et notifications push.')}
              </p>
              
              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-neutral-600 line-through">
                    {billingPeriod === 'yearly' ? prices.pro.oldYearly : prices.pro.oldMonthly}
                  </span>
                  <span className="text-[10px] bg-black text-[#00F59B] font-black px-2 py-0.5 rounded-full border border-black">
                    {currency === 'DZD' ? (language === 'ar' ? 'وصول مجاني 0 دج' : (language === 'en' ? 'FREE ACCESS 0 DZD' : 'ACCÈS LIBRE 0 DA')) : t('pricing_free_access', 'ACCÈS LIBRE 0 €')}
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
                  ✓ {t('pro_free_launch', 'Toutes les fonctionnalités PRO offertes sans carte bancaire')}
                </p>
              </div>

              <ul className="space-y-3 text-xs text-black font-black pt-4 border-t-2 border-black">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                  <span><strong>{t('feature_pro_everything_starter', 'Tout ce qui est inclus dans Starter')}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-black stroke-[2.5] shrink-0" />
                  <span><strong>{t('feature_online_orders', 'Commandes en ligne & Livraison (0% com)')}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-black stroke-[2.5] shrink-0" />
                  <span><strong>{t('pricing_feature_pro_2', 'Carte de Fidélité client interactive')}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-black stroke-[2.5] shrink-0" />
                  <span><strong>{t('pricing_feature_pro_3', 'Notifications Web Push')}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-black stroke-[2.5] shrink-0" />
                  <span>{t('pricing_feature_pro_5', 'Traduction automatique (FR, AR, EN)')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-black stroke-[2.5] shrink-0" />
                  <span><strong>{t('pricing_feature_pro_6', 'Support prioritaire WhatsApp 7j/7')}</strong></span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t-2 border-black">
              <Link 
                href={`/pro/register?plan=pro&currency=${currency}&billing=${billingPeriod}`} 
                className="w-full neo-pill-btn bg-black hover:bg-neutral-800 text-white text-xs py-4 flex items-center justify-center gap-2 text-center shadow-[4px_4px_0px_0px_#000]"
              >
                <span>{t('pricing_btn_pro_free', "Activer l'offre PRO & Fidélité (Gratuit)")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* ── 4. FORMULE SPÉCIALE : LICENCE À VIE (ONE-SHOT -50%) ── */}
        <div className="mt-10 max-w-4xl mx-auto neo-box p-6 sm:p-8 bg-gradient-to-r from-amber-50 to-orange-50 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_#000]">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-[#FF4747] text-white px-3 py-1 rounded-full border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000]">
                <span>🔥 {prices.lifetime.discountBadge}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-black">
                {t('lifetime_title', 'Licence Complète à Vie (One-Shot)')}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-neutral-700 leading-relaxed">
                {t('lifetime_desc', 'Un paiement unique, aucun prélèvement mensuel ou annuel. Accédez à l\'ensemble des fonctionnalités PRO (Menu HD, Commandes, Livraison, Fidélité) avec mises à jour à vie et accompagnement distributeur.')}
              </p>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
              <div className="text-left lg:text-right">
                <div className="flex items-center gap-2 lg:justify-end">
                  <span className="text-base font-bold text-neutral-400 line-through">
                    {prices.lifetime.oldAmount} {prices.lifetime.unit}
                  </span>
                  <span className="text-xs bg-[#FF4747] text-white font-black px-2 py-0.5 rounded border border-black">
                    -50%
                  </span>
                </div>
                <span className="text-3xl sm:text-4xl font-black text-black block mt-0.5" dir="ltr">
                  {prices.lifetime.amount} {prices.lifetime.unit}
                </span>
                <p className="text-[11px] font-black text-neutral-600">
                  {t('one_time_payment', 'Paiement unique • Sans abonnement')}
                </p>
              </div>

              <Link
                href={`/pro/register?plan=lifetime&currency=${currency}&billing=lifetime`}
                className="neo-pill-btn bg-black hover:bg-neutral-800 text-white px-6 py-3.5 text-xs font-black flex items-center gap-2 shadow-[4px_4px_0px_0px_#FFB800]"
              >
                <span>{t('btn_get_lifetime_discount', 'Obtenir la Licence à Vie (-50%)')}</span>
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
