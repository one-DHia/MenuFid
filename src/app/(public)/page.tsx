'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PartnerLogosSection from '@/components/PartnerLogosSection';
import { useLanguage } from '@/lib/i18n';

const DashboardScreenMockup = dynamic(
  () => import('@/components/DashboardScreenMockup'),
  {
    ssr: true,
    loading: () => (
      <div className="w-full max-w-6xl mx-auto min-h-[420px] rounded-3xl border-4 border-black bg-white/50 animate-pulse my-12" />
    ),
  }
);
import {
  QrCode,
  Smartphone,
  Star,
  ArrowRight,
  TrendingUp,
  Zap,
  CheckCircle2,
  Gift,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const { t, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black flex flex-col font-sans selection:bg-[#FFB800] selection:text-black">
      <Navbar />

      <main className="flex-1">
        
        {/* ── 1. HERO SECTION ── */}
        <section className="pt-12 sm:pt-20 pb-16 px-4 max-w-6xl mx-auto text-center">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 neo-badge-yellow mb-6">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>{t('hero_badge', 'SaaS Restauration & Fidélité')}</span>
          </div>

          {/* Ultra-punchy 3-word title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-black leading-tight max-w-4xl mx-auto mb-5">
            {t('hero_title', 'Menu QR. Fidélité. Revenus.')}
          </h1>

          {/* 1-line concise subtitle */}
          <p className="text-neutral-700 text-sm sm:text-lg max-w-xl mx-auto font-medium mb-8">
            {t('hero_subtitle', 'Digitalisez votre carte en 2 min et boostez vos visites sans application.')}
          </p>

          {/* Pill action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-12">
            <Link
              href="/pro/register"
              className="neo-pill-btn text-sm py-3.5 px-8 flex items-center gap-2"
            >
              <span>{t('hero_start_btn', 'Commencer')}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>

            <Link
              href="/pricing"
              className="neo-pill-btn-white text-sm py-3.5 px-8"
            >
              <span>{t('hero_demo_btn', 'Démo & Tarifs')}</span>
            </Link>
          </div>

          {/* ── METRICS TICKER / KPI BAR ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            
            <div className="neo-box p-4 text-center">
              <div className="text-2xl sm:text-3xl font-black text-black">+35%</div>
              <div className="text-[11px] font-extrabold uppercase text-neutral-600 tracking-wider mt-0.5">{t('metric_revenue', "Chiffre d'Affaires")}</div>
            </div>

            <div className="neo-box p-4 text-center">
              <div className="text-2xl sm:text-3xl font-black text-black">0.1s</div>
              <div className="text-[11px] font-extrabold uppercase text-neutral-600 tracking-wider mt-0.5">{t('metric_scan', "Scan Instantané")}</div>
            </div>

            <div className="neo-box-yellow p-4 text-center">
              <div className="text-2xl sm:text-3xl font-black text-black">2x</div>
              <div className="text-[11px] font-extrabold uppercase text-black tracking-wider mt-0.5">{t('metric_visits', "Visites Clients")}</div>
            </div>

            <div className="neo-box p-4 text-center">
              <div className="text-2xl sm:text-3xl font-black text-black">4.9 ★</div>
              <div className="text-[11px] font-extrabold uppercase text-neutral-600 tracking-wider mt-0.5">{t('metric_reviews', "Avis Google Maps")}</div>
            </div>

          </div>

          {/* 🖥️ PC DASHBOARD MOCKUP */}
          <DashboardScreenMockup />

        </section>


        {/* ── 2. PARTNER LOGOS SECTION (Jusqu'à 7 restaurants réels MenuFid) ── */}
        <PartnerLogosSection />


        {/* ── 3. FINAL ULTRA-CLEAN CTA BANNER ── */}
        <section className="py-16 px-4 max-w-4xl mx-auto">
          <div className="neo-box p-8 sm:p-12 text-center bg-white space-y-6">
            <span className="neo-badge-yellow text-xs">{t('no_commitment', 'Sans Engagement')}</span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black max-w-xl mx-auto">
              {t('cta_title', 'Prêt à booster votre restaurant ?')}
            </h2>
            <p className="text-neutral-600 text-xs sm:text-sm font-medium max-w-md mx-auto">
              {t('cta_desc', 'Configuration en 2 minutes chrono. Support dédié 7j/7.')}
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/pro/register"
                className="neo-pill-btn text-sm py-3.5 px-8 flex items-center gap-2"
              >
                <span>{t('cta_btn_create', 'Créer mon compte')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="neo-pill-btn-white text-sm py-3.5 px-8"
              >
                <span>{t('cta_btn_pricing', 'Consulter les tarifs')}</span>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
