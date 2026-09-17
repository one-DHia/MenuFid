'use client';

import React, { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';

export default function ProError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ProError] Captured route error:', error);
    Sentry.captureException(error);
  }, [error]);

  const handleHardReload = () => {
    if (typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      }
      window.location.reload();
    }
  };

  const handleResetSession = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('menufid_merchant_profile');
      localStorage.removeItem('menufid_merchant_id');
      document.cookie = 'menufid_merchant_id=; path=/; max-age=0';
      window.location.href = '/pro/login';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 font-sans text-black">
      <div className="max-w-md w-full bg-white border-4 border-black p-6 sm:p-8 rounded-2xl shadow-[6px_6px_0px_0px_#000] text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[#FFB800] border-3 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#000]">
          <AlertTriangle className="w-8 h-8 text-black" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
            Une mise à jour est disponible
          </h2>
          <p className="text-xs sm:text-sm font-bold text-neutral-600 leading-relaxed">
            Une nouvelle version de MenuFid a été déployée. Si la page ne se charge pas automatiquement, veuillez rafraîchir le cache de votre navigateur.
          </p>
          {error?.message && (
            <div className="bg-neutral-100 border-2 border-black p-2.5 rounded-lg text-left text-[11px] font-mono text-neutral-800 break-words max-h-24 overflow-y-auto">
              {error.message}
            </div>
          )}
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 bg-[#FFB800] text-black font-black text-xs uppercase border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Réessayer</span>
          </button>

          <button
            onClick={handleHardReload}
            className="w-full py-3 px-4 bg-white text-black font-black text-xs uppercase border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] hover:bg-neutral-100 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Vider le cache et recharger</span>
          </button>

          <button
            onClick={handleResetSession}
            className="w-full py-2.5 px-4 text-xs font-bold text-neutral-600 hover:text-black hover:underline transition flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Se reconnecter</span>
          </button>
        </div>
      </div>
    </div>
  );
}
