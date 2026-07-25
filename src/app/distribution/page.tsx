'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Globe, Award, ShieldCheck, TrendingUp, CheckCircle, Send, MapPin, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function DistributionPage() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    experience: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="py-14 px-4 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('partner_title')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            {t('partner_title')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {t('partner_page_subtitle')}
          </p>
        </section>

        {/* Section Carte du monde & Expansion */}
        <section className="px-4 max-w-5xl mx-auto mb-16">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden grid md:grid-cols-12 gap-8 items-center">
            {/* Visual Map Mockup */}
            <div className="md:col-span-6 bg-slate-950/80 p-6 rounded-2xl border border-slate-800 relative min-h-[260px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  CARTE MONDIALE DES PARTENARIATS
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  France ★ Équipée
                </span>
              </div>

              <div className="my-8 text-center space-y-2">
                <div className="inline-block p-3 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 animate-pulse">
                  <MapPin className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">Zone Active & Hub Stratégique</h3>
                <p className="text-xs text-slate-400">Expansion internationale en cours (Moyen-Orient, Europe, LatAm)</p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  France (Zone Pilote Active 🇫🇷)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                  Expansion Internationale
                </span>
              </div>
            </div>

            {/* Explanatory Content */}
            <div className="md:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('partner_map_badge')}</span>
              </div>
              <h2 className="text-2xl font-black text-white leading-tight">
                {t('partner_map_title')}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {t('partner_map_desc')}
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                  <div className="text-lg font-black text-amber-400">{t('partner_stat2_val')}</div>
                  <div className="text-[11px] text-slate-400">{t('partner_stat2_label')}</div>
                </div>
                <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                  <div className="text-lg font-black text-amber-400">{t('partner_stat1_val')}</div>
                  <div className="text-[11px] text-slate-400">{t('partner_stat1_label')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="px-4 max-w-5xl mx-auto mb-16">
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">{t('partner_card1_title')}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{t('partner_card1_desc')}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">{t('partner_card2_title')}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{t('partner_card2_desc')}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">{t('partner_card3_title')}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{t('partner_card3_desc')}</p>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="px-4 max-w-3xl mx-auto mb-20">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-900">{t('partner_form_title')}</h2>
              <p className="text-slate-500 text-xs mt-1">{t('partner_form_subtitle')}</p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-emerald-900 text-sm">{t('partner_success_msg')}</h3>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">* {t('partner_form_name')}</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">* {t('partner_form_email')}</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">* {t('partner_form_city')}</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">* {t('partner_form_phone')}</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('partner_form_exp')}</label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">* {t('partner_form_msg')}</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-900 hover:bg-amber-800 text-white font-bold py-3.5 px-4 rounded-2xl transition text-xs flex items-center justify-center gap-2 shadow-lg btn-press mt-4"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('partner_form_btn')}</span>
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
