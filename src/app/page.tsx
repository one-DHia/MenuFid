'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import { useLanguage } from '@/lib/i18n';
import {
  QrCode,
  Award,
  Star,
  TrendingUp,
  Smartphone,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
} from 'lucide-react';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 sm:pt-20 pb-20 px-4 overflow-hidden bg-gradient-to-b from-amber-50/50 via-slate-50 to-white">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            {/* Badge Banner */}
            <div className="inline-flex items-center gap-2 bg-amber-100/90 text-amber-900 border border-amber-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-700 fill-amber-700" />
              <span>{t('badge_security')}</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight max-w-5xl mx-auto leading-[1.1] mb-6">
              {t('hero_title')}
            </h1>

            <p className="text-slate-600 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
              {t('hero_subtitle')}
            </p>

            {/* Main CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-gradient-to-r from-amber-800 via-amber-900 to-amber-950 hover:from-amber-700 hover:to-amber-900 text-white font-black text-base px-8 py-4 rounded-2xl shadow-xl hover:shadow-amber-900/20 transition-all flex items-center justify-center gap-2 btn-press"
              >
                <span>{t('hero_cta_primary')}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/distribution"
                className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-800 font-bold text-base px-8 py-4 rounded-2xl border border-slate-300 shadow-sm transition flex items-center justify-center gap-2"
              >
                <Globe className="w-5 h-5 text-amber-800" />
                <span>{t('hero_cta_partner')}</span>
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0 font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-1">{t('stat_revenue')}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{t('boost_revenue_desc')}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0 font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-1">{t('digital_card')}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{t('feat_wallet_desc')}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0 font-bold">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-1">{t('qr_menu')}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{t('feat_qr_desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-20 px-4 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
                {t('feat_title')}
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                {t('feat_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 hover:shadow-lg transition">
                <div className="w-12 h-12 rounded-2xl bg-amber-800 text-white flex items-center justify-center mb-6 font-bold">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 mb-2">{t('feat_qr_title')}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{t('feat_qr_desc')}</p>
              </div>

              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 hover:shadow-lg transition">
                <div className="w-12 h-12 rounded-2xl bg-amber-800 text-white flex items-center justify-center mb-6 font-bold">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 mb-2">{t('feat_wallet_title')}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{t('feat_wallet_desc')}</p>
              </div>

              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 hover:shadow-lg transition">
                <div className="w-12 h-12 rounded-2xl bg-amber-800 text-white flex items-center justify-center mb-6 font-bold">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 mb-2">{t('feat_revenue_title')}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{t('feat_revenue_desc')}</p>
              </div>

              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 hover:shadow-lg transition">
                <div className="w-12 h-12 rounded-2xl bg-amber-800 text-white flex items-center justify-center mb-6 font-bold">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 mb-2">{t('feat_crm_title')}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{t('feat_crm_desc')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
