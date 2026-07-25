'use client';

import React from 'react';
import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/i18n';
import { QrCode } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Col 1 */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-800 text-amber-200 flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4" />
            </div>
            <span className="font-black text-lg text-white tracking-tight">MenuFid</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            {t('footer_desc')}
          </p>
          <LanguageSelector />
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-4">Navigation</h4>
          <ul className="space-y-2.5">
            <li><Link href="/pricing" className="hover:text-amber-400 transition">{t('nav_pricing')}</Link></li>
            <li><Link href="/distribution" className="hover:text-amber-400 transition">{t('nav_partners')}</Link></li>
            <li><Link href="/about" className="hover:text-amber-400 transition">{t('nav_about')}</Link></li>
            <li><Link href="/contact" className="hover:text-amber-400 transition">{t('nav_contact')}</Link></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-4">{t('nav_dashboard')}</h4>
          <ul className="space-y-2.5">
            <li><Link href="/register" className="hover:text-amber-400 transition">{t('nav_register')}</Link></li>
            <li><Link href="/login" className="hover:text-amber-400 transition">{t('nav_login')}</Link></li>
            <li><Link href="/dashboard" className="hover:text-amber-400 transition">{t('nav_dashboard')}</Link></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-4">Légal</h4>
          <ul className="space-y-2.5">
            <li><Link href="/terms" className="hover:text-amber-400 transition">{t('terms')}</Link></li>
            <li><span className="text-slate-500">Conformité RGPD 🇪🇺</span></li>
            <li><span className="text-slate-500">Stripe Checkout 🔒</span></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
        <div>© {new Date().getFullYear()} MenuFid SaaS. {t('footer_rights')}</div>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:underline">{t('terms')}</Link>
          <Link href="/contact" className="hover:underline">{t('nav_contact')}</Link>
        </div>
      </div>
    </footer>
  );
}
