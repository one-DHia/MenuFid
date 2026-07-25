'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import { TrendingUp, Users, HeartHandshake, Award, Target, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-16 px-4 max-w-7xl mx-auto w-full">
        {/* Hero Banner */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 border border-amber-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Target className="w-4 h-4 text-amber-700" /> Notre Mission Principale
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Multiplier les <span className="text-amber-800 underline decoration-amber-500/40">Gains & Revenus</span> des Restaurateurs & Commerçants
          </h1>
          <p className="text-slate-600 text-base sm:text-xl leading-relaxed max-w-3xl mx-auto">
            Chez <strong className="text-amber-900">MenuFid</strong>, notre objectif absolu est d&apos;aider chaque propriétaire d&apos;établissement à maximiser son chiffre d&apos;affaires grâce à la puissance du menu interactif et de la fidélisation digitale sur smartphone.
          </p>
        </div>

        {/* Mission Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mb-6">
              <TrendingUp className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-3">Croissance du Chiffre d&apos;Affaires</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              En rendant la prise de commande plus fluide et en fidélisant chaque client avec des récompenses ciblées, nous aidons les restaurateurs à augmenter leur ticket moyen de +25%.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mb-6">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-3">Fidélisation Automatisée</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Plus besoin de cartes en papier oubliées ou perdues. Le client conserve sa carte fidélité directement dans son smartphone et revient naturellement dans votre restaurant.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mb-6">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-3">Avis Google 5 Étoiles</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Notre booster d&apos;avis intégré redirige vos clients satisfaits directement vers votre fiche Google Maps pour propulser votre référencement local.
            </p>
          </div>
        </div>

        {/* Story & Vision Section */}
        <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-slate-900 text-white rounded-3xl p-8 sm:p-14 shadow-2xl border border-amber-800/40 mb-16">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5" /> L&apos;Histoire MenuFid
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Une technologie conçue sur le terrain pour les restaurateurs
            </h2>
            <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed">
              Face à l&apos;augmentation des coûts et à la concurrence croissante, les restaurateurs ont besoin d&apos;outils simples, puissants et immédiatement rentables. Nous avons développé MenuFid pour supprimer toute complexité technique et offrir une solution complète à partir de seulement 5€ par mois.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-black px-6 py-3.5 rounded-2xl transition shadow-lg text-sm flex items-center gap-2"
              >
                Créer un compte Marchand
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-2xl transition text-sm border border-white/20"
              >
                Découvrir nos offres
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
