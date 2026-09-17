'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PartnerLogosSection from '@/components/PartnerLogosSection';
import RestaurantReviewsSection from '@/components/RestaurantReviewsSection';
import { useLanguage } from '@/lib/i18n';
import { ArrowRight, Sparkles } from 'lucide-react';

const DashboardScreenMockup = dynamic(
  () => import('@/components/DashboardScreenMockup'),
  {
    ssr: true,
    loading: () => (
      <div className="w-full max-w-4xl mx-auto min-h-[360px] rounded-3xl border-4 border-black bg-white/50 animate-pulse my-8" />
    ),
  }
);

export default function HomePage() {
  const { t, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  return (
    <div dir={dir} className="min-h-screen bg-[#FAFAFA] text-black flex flex-col font-sans selection:bg-[#FFB800] selection:text-black">
      <Navbar />

      <main className="flex-1">
        
        {/* ── 1. HERO SECTION MINIMALISTE ── */}
        <section className="pt-10 sm:pt-16 pb-12 px-4 max-w-5xl mx-auto text-center">
          
          {/* Badge de lancement */}
          <div className="inline-flex items-center gap-2 neo-badge-yellow mb-5 shadow-[2px_2px_0px_0px_#000]">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>{t('hero_badge_promo', 'Offre de Lancement • Accès Gratuit')}</span>
          </div>

          {/* Titre épuré & percutant */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-black leading-tight max-w-4xl mx-auto mb-4">
            {t('hero_title', 'Menu QR. Fidélité. Revenus.')}
          </h1>

          {/* Sous-titre concis */}
          <p className="text-neutral-600 text-sm sm:text-lg max-w-xl mx-auto font-medium mb-8">
            {t('hero_subtitle', 'Digitalisez votre carte en 2 min et boostez vos visites sans application.')}
          </p>

          {/* Boutons d'action clairs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-8">
            <Link
              href="/pro/register"
              className="neo-pill-btn text-sm py-3.5 px-8 flex items-center gap-2"
            >
              <span>{t('hero_start_btn', 'Commencer Gratuitement')}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>

            <Link
              href="/pricing"
              className="neo-pill-btn-white text-sm py-3.5 px-8"
            >
              <span>{t('hero_demo_btn', 'Tarifs & Licence à Vie')}</span>
            </Link>
          </div>

          {/* 📱💻 SHOWCASE INTERACTIF ÉPURÉ */}
          <DashboardScreenMockup />

        </section>

        {/* ── 2. BANDEAU DE LOGOS DÉFILANT AUTOMATIQUE (AUTO-SCROLL MARQUEE) ── */}
        <PartnerLogosSection />

        {/* ── 3. SECTION AVIS RESTAURATEURS (SOCIAL PROOF) ── */}
        <RestaurantReviewsSection />

        {/* ── 4. CTA BANNER MINIMALISTE ── */}
        <section className="py-16 px-4 max-w-4xl mx-auto">
          <div className="neo-box p-8 sm:p-12 text-center bg-white space-y-6">
            <span className="neo-badge-yellow text-xs">{t('start_free_promo', '3 Mois Offerts pour Démarrer')}</span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black max-w-xl mx-auto">
              {t('cta_title', 'Prêt à booster votre restaurant ?')}
            </h2>
            <p className="text-neutral-600 text-xs sm:text-sm font-medium max-w-md mx-auto">
              {t('cta_desc', 'Créez votre menu en 2 minutes chrono. Accompagnement dédié.')}
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/pro/register"
                className="neo-pill-btn text-sm py-3.5 px-8 flex items-center gap-2"
              >
                <span>{t('cta_btn_create', 'Créer mon menu gratuitement')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="neo-pill-btn-white text-sm py-3.5 px-8"
              >
                <span>{t('cta_btn_pricing', 'Consulter les offres')}</span>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
