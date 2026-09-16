'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans selection:bg-[#FFB800] selection:text-black">
      <Navbar />

      <main className="flex-1 py-14 px-4 max-w-4xl mx-auto w-full relative">
        <div className="absolute top-4 right-4 z-50">
          <LanguageSelector />
        </div>

        <div className="neo-box bg-white p-8 sm:p-12 space-y-8 text-black mt-8">
          <div className="border-b-4 border-black pb-4 mb-8">
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">{t('terms_title', 'Conditions Générales')}</h1>
            <p className="text-neutral-600 font-bold mt-2">{t('terms_subtitle', 'Veuillez lire attentivement nos conditions.')}</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-black uppercase tracking-tight bg-[#FFB800] inline-block px-2 border-2 border-black">{t('terms_sec1_title', '1. Utilisation du service')}</h2>
            <p className="font-bold text-sm leading-relaxed">{t('terms_sec1_desc', 'L\'utilisation de nos services implique l\'acceptation pleine et entière des conditions générales décrites ci-dessous. Nous nous réservons le droit de modifier ces conditions à tout moment.')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black uppercase tracking-tight bg-[#00F59B] inline-block px-2 border-2 border-black">{t('terms_sec2_title', '2. Données personnelles')}</h2>
            <p className="font-bold text-sm leading-relaxed">{t('terms_sec2_desc', 'Nous collectons uniquement les données nécessaires au bon fonctionnement du service (ex: numéro de téléphone pour la fidélité). Vos données ne seront jamais revendues à des tiers.')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black uppercase tracking-tight bg-blue-300 inline-block px-2 border-2 border-black">{t('terms_sec3_title', '3. Responsabilités')}</h2>
            <p className="font-bold text-sm leading-relaxed">{t('terms_sec3_desc', 'Nous nous efforçons de maintenir un service continu, mais nous ne pouvons être tenus responsables des interruptions techniques ou des pertes de données accidentelles.')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black uppercase tracking-tight bg-pink-300 inline-block px-2 border-2 border-black">{t('terms_sec4_title', '4. Résiliation')}</h2>
            <p className="font-bold text-sm leading-relaxed">{t('terms_sec4_desc', 'Vous pouvez demander la suppression de votre compte et de vos données à tout moment en contactant notre support ou directement depuis votre Espace Pro.')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black uppercase tracking-tight bg-amber-200 inline-block px-2 border-2 border-black">{t('terms_sec5_title', '5. Licences d\'Exploitation & Modalités à Vie')}</h2>
            <p className="font-bold text-sm leading-relaxed">{t('terms_sec5_desc', 'La mention d\'une \'Licence à Vie\' ou formule à paiement unique confère un droit d\'usage non exclusif et sans redevance périodique lié strictement à la durée de vie commerciale du service MenuFid. Elle n\'emporte aucune obligation de maintenance perpétuelle en cas d\'obsolescence technologique majeure ou de modification des normes tierces.')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black uppercase tracking-tight bg-red-200 inline-block px-2 border-2 border-black">{t('terms_sec6_title', '6. Cessation d\'Activité & Faillite')}</h2>
            <p className="font-bold text-sm leading-relaxed">{t('terms_sec6_desc', 'En cas de cessation définitive d\'activité, faillite, redressement ou liquidation judiciaire de l\'éditeur de la plateforme, aucun remboursement au prorata temporis ni indemnité financière ne pourra être exigé par les titulaires de licences à vie ou d\'abonnements en cours, le service étant fourni en l\'état.')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black uppercase tracking-tight bg-emerald-200 inline-block px-2 border-2 border-black">{t('terms_sec7_title', '7. Hygiène, Allergènes & Sécurité Alimentaire')}</h2>
            <p className="font-bold text-sm leading-relaxed">{t('terms_sec7_desc', 'MenuFid agit exclusivement en tant qu\'intermédiaire technique SaaS. L\'établissement partenaire assume l\'entière et exclusive responsabilité de l\'exactitude des ingrédients, allergènes majeurs, labels alimentaires ainsi que de la fraîcheur et de la conformité sanitaire des plats proposés.')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black uppercase tracking-tight bg-purple-200 inline-block px-2 border-2 border-black">{t('terms_sec8_title', '8. Commandes, Livraison & Litiges de Transport')}</h2>
            <p className="font-bold text-sm leading-relaxed">{t('terms_sec8_desc', 'MenuFid ne réalise aucune prestation de livraison et n\'emploie aucun livreur. Les délais de livraison, l\'état des denrées lors du transport, ainsi que l\'encaissement des paiements à la porte en espèces relèvent exclusivement de la responsabilité du restaurant.')}</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
