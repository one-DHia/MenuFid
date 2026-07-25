'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import { TrendingUp, HeartHandshake, Award, Target } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-16 px-4 max-w-7xl mx-auto w-full">
        {/* Hero Banner */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 border border-amber-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Target className="w-4 h-4 text-amber-700" /> {t('about_hero_tag')}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-6">
            {t('about_hero_title')}
          </h1>
          <p className="text-slate-600 text-base sm:text-xl leading-relaxed max-w-3xl mx-auto">
            {t('about_hero_desc')}
          </p>
        </div>

        {/* Mission Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mb-6">
              <TrendingUp className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-3">{t('about_card1_title')}</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {t('about_card1_desc')}
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mb-6">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-3">{t('about_card2_title')}</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {t('about_card2_desc')}
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mb-6">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-3">{t('about_card3_title')}</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {t('about_card3_desc')}
            </p>
          </div>
        </div>
      </main>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
