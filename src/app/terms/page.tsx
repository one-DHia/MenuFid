'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-14 px-4 max-w-4xl mx-auto w-full">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mb-2">Conditions Générales d&apos;Utilisation (CGU / CGV)</h1>
          <p className="text-slate-500 text-xs">Dernière mise à jour : Juillet 2026</p>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Objet du Service</h2>
            <p>
              MenuFid fournit une plateforme SaaS de digitalisation de menus pour restaurants (Menu QR Code) et de gestion de programmes de fidélité digitaux sur smartphone.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Abonnements et Tarifications</h2>
            <p>
              Les abonnements sont proposés sous forme de forfaits mensuels sans engagement (Basic à 5€/mois, Fidélité à 10€/mois, Premium à 20€/mois). Le paiement s&apos;effectue de manière sécurisée via Stripe. Tout mois entamé reste dû. L&apos;utilisateur peut résilier son abonnement à tout moment depuis son espace profil.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Protection des Données (RGPD)</h2>
            <p>
              Les données récoltées auprès des clients finaux (nom, e-mail, téléphone) restent la propriété exclusive du commerçant. MenuFid s&apos;engage à ne revendre aucune donnée à des tiers et à assurer leur hébergement sécurisé.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Contact & Support</h2>
            <p>
              Pour toute question d&apos;ordre juridique ou technique, notre équipe est joignable à l&apos;adresse : <strong>contact@menufid.site</strong>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
