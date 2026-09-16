'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { ShieldCheck, Lock, Eye, Database, Mail } from 'lucide-react';

export default function PrivacyPage() {
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F59B] border-2 border-black text-black text-xs font-black shadow-[2px_2px_0px_0px_#000] mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('privacy_badge', 'Confidentialité & Protection')}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
              {t('privacy_title', 'Politique de Confidentialité')}
            </h1>
            <p className="text-neutral-600 font-bold mt-2">
              {t('privacy_subtitle', 'Votre vie privée et la sécurité de vos informations sont notre priorité absolue.')}
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-black uppercase tracking-tight bg-[#FFB800] inline-block px-2 border-2 border-black">
              {t('privacy_sec1_title', '1. Données Collectées')}
            </h2>
            <p className="font-bold text-sm leading-relaxed text-neutral-800">
              {t('privacy_sec1_desc', 'MenuFid collecte uniquement les données strictement nécessaires au fonctionnement de votre menu digital et de votre programme de fidélité : adresse email de contact, nom d\'établissement, et identifiants de cartes fidélité pour attribuer vos tampons.')}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black uppercase tracking-tight bg-[#00F59B] inline-block px-2 border-2 border-black">
              {t('privacy_sec2_title', '2. Utilisation des Données')}
            </h2>
            <p className="font-bold text-sm leading-relaxed text-neutral-800">
              {t('privacy_sec2_desc', 'Vos données ne sont JAMAIS vendues, louées ou partagées à des fins publicitaires avec des régies tierces. Elles sont utilisées exclusivement pour vous permettre d\'accéder à vos services, sécuriser votre compte et délivrer vos récompenses fidélité.')}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black uppercase tracking-tight bg-blue-300 inline-block px-2 border-2 border-black">
              {t('privacy_sec3_title', '3. Sécurité et Chiffrement')}
            </h2>
            <p className="font-bold text-sm leading-relaxed text-neutral-800">
              {t('privacy_sec3_desc', 'Toutes les communications entre votre appareil et nos serveurs sont protégées par un protocole SSL/TLS chiffré de bout en bout. Vos mots de passe sont hashés avec des algorithmes sécurisés et ne sont jamais stockés en clair.')}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black uppercase tracking-tight bg-pink-300 inline-block px-2 border-2 border-black">
              {t('privacy_sec4_title', '4. Vos Droits & Suppression')}
            </h2>
            <p className="font-bold text-sm leading-relaxed text-neutral-800">
              {t('privacy_sec4_desc', 'Vous disposez d\'un droit total d\'accès, de modification et de suppression de vos données personnelles. Vous pouvez demander la suppression définitive de votre compte ou de vos données à tout moment en écrivant à support@menufid.site.')}
            </p>
          </section>

          <div className="pt-6 border-t-2 border-black flex items-center gap-3">
            <Mail className="w-5 h-5 text-black" />
            <span className="text-xs font-black">{t('privacy_contact_dpo', 'Contact Délégué Confidentialité')} : <a href="mailto:support@menufid.site" className="underline hover:text-neutral-600">support@menufid.site</a></span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
