'use client';

import React from 'react';
import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/i18n';
import { QrCode, Heart } from 'lucide-react';

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
            La solution SaaS tout-en-un pour booster les gains et le chiffre d&apos;affaires des restaurateurs grâce au menu QR et à la fidélité digitale.
          </p>
          <LanguageSelector />
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-4">Plateforme</h4>
          <ul className="space-y-2.5">
            <li><Link href="/pricing" className="hover:text-amber-400 transition">{t('pricing')}</Link></li>
            <li><Link href="/distribution" className="hover:text-amber-400 transition">{t('partners')}</Link></li>
            <li><Link href="/about" className="hover:text-amber-400 transition">{t('about')}</Link></li>
            <li><Link href="/contact" className="hover:text-amber-400 transition">{t('contact')}</Link></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-4">Espace Marchand</h4>
          <ul className="space-y-2.5">
            <li><Link href="/register" className="hover:text-amber-400 transition">{t('register')}</Link></li>
            <li><Link href="/login" className="hover:text-amber-400 transition">{t('login')}</Link></li>
            <li><Link href="/dashboard" className="hover:text-amber-400 transition">Tableau de bord</Link></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-4">Informations Légales</h4>
          <ul className="space-y-2.5">
            <li><Link href="/terms" className="hover:text-amber-400 transition">{t('terms')}</Link></li>
            <li><span className="text-slate-500">Conformité RGPD 🇪🇺</span></li>
            <li><span className="text-slate-500">Sécurité Paiements Stripe 🔒</span></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
        <div>© {new Date().getFullYear()} MenuFid. Tous droits réservés.</div>
        <div className="flex items-center gap-1">
          <span>Développé pour la réussite des commerçants</span>
          <Heart className="w-3 h-3 text-amber-500 fill-amber-500" />
        </div>
      </div>
    </footer>
  );
}
