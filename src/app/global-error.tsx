'use client';

import * as Sentry from '@sentry/nextjs';
import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError] Root exception caught:', error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 font-sans text-black m-0">
        <div className="max-w-md w-full bg-white border-4 border-black p-6 sm:p-8 rounded-2xl shadow-[6px_6px_0px_0px_#000] text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#FFB800] border-3 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#000] text-2xl font-black">
            ⚠️
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              Une erreur est survenue
            </h2>
            <p className="text-xs sm:text-sm font-bold text-neutral-600 leading-relaxed">
              Une nouvelle mise à jour a été appliquée. Veuillez recharger la page pour synchroniser l'application.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
              className="w-full py-3 px-4 bg-[#FFB800] text-black font-black text-xs uppercase border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
            >
              Recharger la page
            </button>

            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/pro/login';
                }
              }}
              className="w-full py-2.5 px-4 text-xs font-bold text-neutral-600 hover:text-black hover:underline transition"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
