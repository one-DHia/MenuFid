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
            <div className="inline-flex items-center gap-2 bg-amber-100/90 text-amber-900 border border-amber-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-6 shadow-sm animate-bounce">
              <Sparkles className="w-4 h-4 text-amber-700 fill-amber-700" />
              <span>Solution SaaS N°1 Restauration & Gains</span>
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
                <span>Démarrer Maintenant (Dès 5€/mois)</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/pricing"
                className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-800 font-bold text-base px-8 py-4 rounded-2xl border border-slate-300 shadow-sm transition flex items-center justify-center gap-2"
              >
                <span>{t('pricing')}</span>
              </Link>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0 font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-1">{t('boost_revenue')}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{t('boost_revenue_desc')}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0 font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-1">Fidélité Smartphone</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">Carte virtuelle installée en 1 clic sans télécharger d&apos;application.</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0 font-bold">
                  <Star className="w-5 h-5 text-amber-700 fill-amber-700" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-1">Avis Google 5★</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">Booster automatique pour propulser votre fiche Google Maps.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REVENUE IMPACT SECTION */}
        <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 text-center space-y-8">
            <span className="text-amber-400 font-extrabold text-xs uppercase tracking-widest bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/20">
              Impact Direct sur vos Profits
            </span>
            <h2 className="text-3xl sm:text-5xl font-black max-w-3xl mx-auto leading-tight">
              Pourquoi les restaurateurs choisissent MenuFid
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
              <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-left">
                <div className="text-4xl font-black text-amber-400 mb-2">+25%</div>
                <div className="font-bold text-lg mb-2">Chiffre d&apos;Affaires</div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Grâce aux suggestions du menu digital et à la commande incitative.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-left">
                <div className="text-4xl font-black text-amber-400 mb-2">2x</div>
                <div className="font-bold text-lg mb-2">Visites Clients</div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Le programme de fidélité et les promotions ciblées font revenir vos clients 2 fois plus souvent.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-left">
                <div className="text-4xl font-black text-amber-400 mb-2">5 Min</div>
                <div className="font-bold text-lg mb-2">Mise en Place</div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Aucun matériel complexe à acheter. Fonctionne sur tous les smartphones et toutes les tables.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-20 px-4 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black">Prêt à développer votre établissement ?</h2>
            <p className="text-amber-100 text-base sm:text-lg max-w-2xl mx-auto">
              Rejoignez les centaines de restaurateurs qui font confiance à MenuFid pour booster leurs gains.
            </p>
            <div className="pt-4">
              <Link
                href="/register"
                className="bg-white text-amber-950 font-black text-lg px-10 py-5 rounded-2xl shadow-2xl hover:bg-amber-100 transition inline-flex items-center gap-2"
              >
                Créer un Compte Marchand (Dès 5€/mois)
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
