'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { 
  Smartphone, 
  Share, 
  PlusSquare, 
  MoreVertical, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  Apple, 
  Zap, 
  Bell, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';

export default function InstallerPage() {
  const { t, language } = useLanguage();
  const [deviceType, setDeviceType] = useState<'ios' | 'android'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setDeviceType('ios');
      } else {
        setDeviceType('android');
      }
    }

    const handlePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const handleInstantInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallSuccess(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black flex flex-col font-sans selection:bg-[#FFB800] selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 space-y-12">
        {/* Header Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto pt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB800] border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000]">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>{t('install_guide_badge', 'Guide d\'installation instantanée')}</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black leading-tight">
            {t('how_to_install_title', 'Comment installer MenuFid sur votre Smartphone ?')}
          </h1>

          <p className="text-sm sm:text-base font-bold text-neutral-700 leading-relaxed">
            {t('how_to_install_desc', 'Pas besoin de passer par l\'App Store ou Google Play ! Installez notre application ultra-légère en 5 secondes directement depuis votre navigateur.')}
          </p>

          {/* Bouton d'installation directe si supporté par Chrome / Android */}
          {deferredPrompt && (
            <div className="pt-2">
              <button
                onClick={handleInstantInstall}
                className="neo-pill-btn bg-[#00F59B] text-black hover:bg-[#00d888] text-base py-4 px-8 shadow-[4px_4px_0px_0px_#000] animate-bounce"
              >
                <Download className="w-5 h-5 text-black" />
                <span>{t('install_now_one_click', 'Installer en 1 Clic Maintenant')}</span>
              </button>
            </div>
          )}

          {installSuccess && (
            <div className="p-4 bg-green-100 border-2 border-black rounded-2xl flex items-center justify-center gap-2 font-black text-sm text-green-900 shadow-[3px_3px_0px_0px_#000]">
              <CheckCircle2 className="w-5 h-5 text-green-700" />
              <span>{t('app_installed_success', 'Félicitations ! L\'application a été ajoutée à votre écran d\'accueil.')}</span>
            </div>
          )}
        </div>

        {/* Device Switcher Tabs (Only Mobile: iOS & Android) */}
        <div className="flex items-center justify-center gap-3 max-w-sm mx-auto">
          <button
            onClick={() => setDeviceType('ios')}
            className={`flex-1 py-3 px-4 rounded-2xl border-3 border-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-[3px_3px_0px_0px_#000] ${
              deviceType === 'ios'
                ? 'bg-[#FFB800] text-black translate-x-0.5 translate-y-0.5 shadow-none'
                : 'bg-white text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iPhone / iOS</span>
          </button>

          <button
            onClick={() => setDeviceType('android')}
            className={`flex-1 py-3 px-4 rounded-2xl border-3 border-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-[3px_3px_0px_0px_#000] ${
              deviceType === 'android'
                ? 'bg-[#00F59B] text-black translate-x-0.5 translate-y-0.5 shadow-none'
                : 'bg-white text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android / Chrome</span>
          </button>
        </div>

        {/* Step by Step Instructions Display */}
        <div className="neo-box bg-white p-6 sm:p-10 border-4 border-black shadow-[8px_8px_0px_0px_#000] space-y-8">
          {deviceType === 'ios' && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b-2 border-black pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFB800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                  <Apple className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black uppercase">
                    {t('ios_tutorial_title', 'Installation sur iPhone / iPad (Safari)')}
                  </h2>
                  <p className="text-xs font-bold text-neutral-500">
                    {t('ios_tutorial_subtitle', 'Fonctionne sur Safari sans téléchargement App Store')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Étape 1 */}
                <div className="p-6 rounded-2xl bg-amber-50 border-2 border-black space-y-3 relative shadow-[3px_3px_0px_0px_#000] flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="w-8 h-8 rounded-full bg-black text-white font-black text-sm flex items-center justify-center">1</span>
                    <h3 className="font-black text-base text-black">{t('step1_ios_title', 'Ouvrez sur Safari')}</h3>
                    <p className="text-xs font-bold text-neutral-700 leading-relaxed">
                      {t('step1_ios_desc', 'Ouvrez menufid.site ou le lien de votre restaurant sur le navigateur Safari d\'Apple.')}
                    </p>
                  </div>
                  <div className="pt-2 text-2xl">🌐</div>
                </div>

                {/* Étape 2 */}
                <div className="p-6 rounded-2xl bg-[#FFB800]/20 border-2 border-black space-y-3 relative shadow-[3px_3px_0px_0px_#000] flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="w-8 h-8 rounded-full bg-[#FFB800] border border-black text-black font-black text-sm flex items-center justify-center">2</span>
                    <h3 className="font-black text-base text-black">{t('step2_ios_title', 'Touchez "Partager"')}</h3>
                    <p className="text-xs font-bold text-neutral-700 leading-relaxed">
                      {t('step2_ios_desc', 'En bas de votre écran Safari, appuyez sur l\'icône carrée avec la flèche vers le haut (Partager ⎋).')}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-2 text-xs font-black bg-white p-2 rounded-lg border-2 border-black w-fit shadow-[1px_1px_0px_0px_#000]">
                    <Share className="w-4 h-4 text-blue-600" />
                    <span>{t('ios_btn_share', 'Bouton Partager ⎋')}</span>
                  </div>
                </div>

                {/* Étape 3 */}
                <div className="p-6 rounded-2xl bg-green-50 border-2 border-black space-y-3 relative shadow-[3px_3px_0px_0px_#000] flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="w-8 h-8 rounded-full bg-[#00F59B] border border-black text-black font-black text-sm flex items-center justify-center">3</span>
                    <h3 className="font-black text-base text-black">{t('step3_ios_title', 'Sur l\'écran d\'accueil')}</h3>
                    <p className="text-xs font-bold text-neutral-700 leading-relaxed">
                      {t('step3_ios_desc', 'Faites défiler vers le bas et touchez "Sur l\'écran d\'accueil", puis confirmez en haut à droite sur "Ajouter".')}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-2 text-xs font-black bg-white p-2 rounded-lg border-2 border-black w-fit shadow-[1px_1px_0px_0px_#000]">
                    <PlusSquare className="w-4 h-4 text-black" />
                    <span>{t('ios_btn_add', 'Sur l\'écran d\'accueil')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {deviceType === 'android' && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b-2 border-black pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#00F59B] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                  <Smartphone className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black uppercase">
                    {t('android_tutorial_title', 'Installation sur Android (Chrome, Samsung)')}
                  </h2>
                  <p className="text-xs font-bold text-neutral-500">
                    {t('android_tutorial_subtitle', 'Installation directe 100% sans Play Store')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Étape 1 */}
                <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-black space-y-3 relative shadow-[3px_3px_0px_0px_#000] flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="w-8 h-8 rounded-full bg-black text-white font-black text-sm flex items-center justify-center">1</span>
                    <h3 className="font-black text-base text-black">{t('step1_android_title', 'Ouvrez sur Chrome')}</h3>
                    <p className="text-xs font-bold text-neutral-700 leading-relaxed">
                      {t('step1_android_desc', 'Ouvrez le site MenuFid ou la carte de fidélité de votre restaurant sur Google Chrome.')}
                    </p>
                  </div>
                  <div className="pt-2 text-2xl">⚡</div>
                </div>

                {/* Étape 2 */}
                <div className="p-6 rounded-2xl bg-[#00F59B]/20 border-2 border-black space-y-3 relative shadow-[3px_3px_0px_0px_#000] flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="w-8 h-8 rounded-full bg-[#00F59B] border border-black text-black font-black text-sm flex items-center justify-center">2</span>
                    <h3 className="font-black text-base text-black">{t('step2_android_title', 'Ouvrez le Menu ⋮')}</h3>
                    <p className="text-xs font-bold text-neutral-700 leading-relaxed">
                      {t('step2_android_desc', 'Appuyez sur les 3 petits points verticaux en haut de votre navigateur Chrome.')}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-2 text-xs font-black bg-white p-2 rounded-lg border-2 border-black w-fit shadow-[1px_1px_0px_0px_#000]">
                    <MoreVertical className="w-4 h-4 text-black" />
                    <span>{t('android_btn_menu', 'Menu ⋮')}</span>
                  </div>
                </div>

                {/* Étape 3 */}
                <div className="p-6 rounded-2xl bg-amber-50 border-2 border-black space-y-3 relative shadow-[3px_3px_0px_0px_#000] flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="w-8 h-8 rounded-full bg-[#FFB800] border border-black text-black font-black text-sm flex items-center justify-center">3</span>
                    <h3 className="font-black text-base text-black">{t('step3_android_title', 'Installer l\'application')}</h3>
                    <p className="text-xs font-bold text-neutral-700 leading-relaxed">
                      {t('step3_android_desc', 'Sélectionnez "Installer l\'application" ou "Ajouter à l\'écran d\'accueil" et validez.')}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-2 text-xs font-black bg-white p-2 rounded-lg border-2 border-black w-fit shadow-[1px_1px_0px_0px_#000]">
                    <Download className="w-4 h-4 text-black" />
                    <span>{t('android_btn_install', 'Installer l\'application')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="neo-box bg-white p-6 space-y-3 border-3 border-black shadow-[4px_4px_0px_0px_#000]">
            <div className="w-12 h-12 rounded-xl bg-[#00F59B] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <h3 className="font-black text-lg text-black uppercase">{t('benefit1_title', '0 Mémoire & 0 Téléchargement')}</h3>
            <p className="text-xs font-bold text-neutral-600 leading-relaxed">
              {t('benefit1_desc', 'Prend moins de 1 Mo d\'espace sur votre smartphone. Aucune mise à jour manuelle requise.')}
            </p>
          </div>

          <div className="neo-box bg-white p-6 space-y-3 border-3 border-black shadow-[4px_4px_0px_0px_#000]">
            <div className="w-12 h-12 rounded-xl bg-[#FFB800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
              <Bell className="w-6 h-6 text-black" />
            </div>
            <h3 className="font-black text-lg text-black uppercase">{t('benefit2_title', 'Alertes & Tampons en Direct')}</h3>
            <p className="text-xs font-bold text-neutral-600 leading-relaxed">
              {t('benefit2_desc', 'Recevez vos notifications push de fidélité, cadeaux débloqués et offres flash instantanément.')}
            </p>
          </div>

          <div className="neo-box bg-white p-6 space-y-3 border-3 border-black shadow-[4px_4px_0px_0px_#000]">
            <div className="w-12 h-12 rounded-xl bg-[#F9A8D4] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
              <ShieldCheck className="w-6 h-6 text-black" />
            </div>
            <h3 className="font-black text-lg text-black uppercase">{t('benefit3_title', 'Accès 1 Clic Permanent')}</h3>
            <p className="text-xs font-bold text-neutral-600 leading-relaxed">
              {t('benefit3_desc', 'Retrouvez tous vos restaurants et vos cartes fidélité directement sur votre écran d\'accueil.')}
            </p>
          </div>
        </div>

        {/* CTA Box */}
        <div className="neo-box bg-[#FFB800] p-8 sm:p-12 border-4 border-black text-center space-y-6 shadow-[8px_8px_0px_0px_#000]">
          <h2 className="text-2xl sm:text-4xl font-black uppercase text-black">
            {t('ready_to_start', 'Prêt à profiter de vos avantages fidélité ?')}
          </h2>
          <p className="max-w-xl mx-auto text-xs sm:text-sm font-bold text-neutral-900 leading-relaxed">
            {t('ready_desc', 'Accédez à votre portefeuille client ou scannez le QR code sur votre table de restaurant.')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/wallet"
              className="neo-pill-btn text-sm py-3.5 px-8 shadow-[4px_4px_0px_0px_#000] flex items-center gap-2"
            >
              <span>{t('open_wallet_now', 'Ouvrir mon Portefeuille')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="neo-pill-btn-white text-sm py-3.5 px-8 shadow-[4px_4px_0px_0px_#000]"
            >
              {t('back_to_home', 'Retour à l\'accueil')}
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
