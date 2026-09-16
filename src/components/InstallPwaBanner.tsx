'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Download, X, Share } from 'lucide-react';

export default function InstallPwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // Assume standalone initially to prevent flash
  const { t } = useLanguage();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('menufid_pwa_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }

      // Check if iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIos(isIosDevice);

      // Check if already in standalone mode (PWA installed)
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('menufid_pwa_dismissed', 'true');
    }
  };

  // Do not show if dismissed, if already installed, or if neither (deferredPrompt nor iOS) is available
  if (isDismissed || isStandalone || (!deferredPrompt && !isIos)) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] p-2.5 sm:p-4 pt-[calc(0.5rem+env(safe-area-inset-top,10px))] animate-in slide-in-from-top duration-300">
      <div className="max-w-md mx-auto bg-[#FFB800] border-3 sm:border-4 border-black p-3 sm:p-4 shadow-[4px_4px_0px_0px_#000] relative flex items-center justify-between gap-2.5 sm:gap-3 rounded-xl">
        
        {/* Close button */}
        <button 
          onClick={handleDismiss}
          className="absolute -top-2.5 -right-2.5 w-7 h-7 sm:w-8 sm:h-8 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-red-100 transition shadow-[2px_2px_0px_0px_#000] z-10"
          title={t('later_btn', 'Plus tard')}
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
        </button>

        <div className="flex flex-1 items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border-2 border-black rounded-xl flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
            <Download className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm uppercase tracking-tight text-black leading-tight">
                {t('install_app_title', 'Installer l\'Application')}
              </h3>
              <a href="/installer" className="text-[10px] font-black underline text-black/80 hover:text-black">
                {t('see_guide', 'Tuto ➔')}
              </a>
            </div>
            {isIos && !deferredPrompt ? (
              <p className="text-[10px] sm:text-xs font-bold text-black/90 leading-tight mt-1 flex items-center flex-wrap gap-1">
                {t('install_ios_instruction', 'Appuyez sur l\'icône Partager puis sur \'Sur l\'écran d\'accueil\'.')}
                <Share className="inline w-3 h-3" />
              </p>
            ) : (
              <p className="text-[10px] sm:text-xs font-bold text-black/90 leading-tight mt-1">
                {t('install_app_desc', 'Ajoutez Menufid à votre écran d\'accueil pour un accès rapide.')}
              </p>
            )}
          </div>
        </div>

        {(!isIos || deferredPrompt) && (
          <button
            onClick={handleInstallClick}
            className="shrink-0 bg-black text-white px-3 sm:px-4 py-2 font-black text-xs uppercase shadow-[2px_2px_0px_0px_#fff] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition border-2 border-black"
          >
            {t('install_btn', 'Installer')}
          </button>
        )}
      </div>
    </div>
  );
}
