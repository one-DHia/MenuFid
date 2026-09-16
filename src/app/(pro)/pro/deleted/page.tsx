'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { Trash2, Home, UserPlus, ArrowRight } from 'lucide-react';

export default function MerchantDeletedPage() {
  const { t, dir } = useLanguage();

  return (
    <div dir={dir} className="min-h-screen bg-[#FAFAFA] text-black font-sans flex flex-col justify-between selection:bg-[#FFB800] selection:text-black">
      {/* Header */}
      <header className="border-b-4 border-black bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-200 border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
              <Trash2 className="w-4 h-4" />
            </div>
            <span className="font-black text-base sm:text-lg tracking-tight uppercase">
              MenuFid Pro
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
        <div className="neo-box bg-white p-6 sm:p-10 text-center space-y-6 border-4 border-black shadow-[6px_6px_0px_0px_#000]">
          
          <div className="w-20 h-20 rounded-2xl bg-neutral-100 border-4 border-black text-neutral-600 flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#000]">
            <Trash2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block bg-neutral-200 text-black text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-black shadow-[2px_2px_0px_0px_#000]">
              {t('account_deleted_badge', 'Compte Introuvable')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
              {t('account_deleted_title', 'Établissement Supprimé')}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-neutral-600 max-w-sm mx-auto leading-relaxed">
              {t('account_deleted_desc', 'Ce compte restaurant a été clôturé ou supprimé. Vos menus, cartes de fidélité et données associées ont été effacés et ne sont plus accessibles.')}
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <Link
              href="/pro/register"
              className="neo-pill-btn w-full py-3.5 text-xs flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('create_new_restaurant', 'Créer un Nouvel Établissement')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/"
              className="neo-pill-btn-white w-full py-3.5 text-xs flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>{t('back_to_home', 'Retourner à l\'Accueil')}</span>
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black bg-white py-4 text-center text-xs font-bold text-neutral-500">
        {t('system_footer_copyright', '© MenuFid • Système de Gestion et Fidélité Restaurant')}
      </footer>
    </div>
  );
}
