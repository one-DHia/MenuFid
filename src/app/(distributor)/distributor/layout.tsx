'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';

export default function AdminDistributorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-[#FFB800] selection:text-black">
      <header className="bg-black text-white p-4 border-b-4 border-black flex justify-between items-center">
        <div className="font-black text-xl tracking-tight">MENU<span className="text-[#FFB800]">FID</span> {t('distributor_uppercase', 'DISTRIBUTEUR')}</div>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <div className="text-xs font-bold text-neutral-400">{t('secure_access', 'Accès Sécurisé')}</div>
        </div>
      </header>
      {children}
    </div>
  );
}
