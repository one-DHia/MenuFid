'use client';

import React from 'react';
import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/i18n';
import { UtensilsCrossed, ShieldCheck, Heart, MessageCircle } from 'lucide-react';
import { InstagramIcon } from '@/components/icons/InstagramIcon';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white text-black text-xs border-t-2 border-black py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        
        {/* Col 1 - Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFB800] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span className="font-black text-xl text-black tracking-tight">
              Menu<span className="bg-[#FFB800] px-1 ml-0.5 rounded border border-black">Fid</span>
            </span>
          </div>
          <p className="text-neutral-600 text-xs font-medium">
            {t('footer_desc', 'Menu QR Code & Fidélité Smartphone pour restaurants.')}
          </p>
          
          <div className="flex items-center gap-2 pt-1">
            <a
              href="https://wa.me/33766518278"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-[#25D366] text-white border-2 border-black hover:opacity-90 shadow-[2px_2px_0px_0px_#000] transition flex items-center justify-center"
              title="WhatsApp Business (+33 7 66 51 82 78)"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            <a
              href="https://www.instagram.com/menu.fid?igsi=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white border-2 border-black hover:opacity-90 shadow-[2px_2px_0px_0px_#000] transition flex items-center justify-center"
              title="Instagram @menu.fid"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
          </div>

          <LanguageSelector />
        </div>

        {/* Col 2 - Navigation */}
        <div className="space-y-2.5">
          <p className="font-black text-black uppercase text-xs tracking-wider">{t('footer_nav', 'Navigation')}</p>
          <ul className="space-y-2 text-neutral-700 font-bold">
            <li><Link href="/" className="hover:text-black hover:underline">{t('nav_home', 'Accueil')}</Link></li>
            <li><Link href="/pricing" className="hover:text-black hover:underline">{t('nav_pricing', 'Tarifs')}</Link></li>
            <li><Link href="/wallet" className="hover:text-black hover:underline">{t('nav_wallet_client', 'Portefeuille Client')}</Link></li>
            <li><Link href="/distribution" className="hover:text-black hover:underline">{t('nav_distributor_space', 'Espace Partenaires')}</Link></li>
          </ul>
        </div>

        {/* Col 3 - Espace Pro */}
        <div className="space-y-2.5">
          <p className="font-black text-black uppercase text-xs tracking-wider">{t('footer_pro_space', 'Espace Pro')}</p>
          <ul className="space-y-2 text-neutral-700 font-bold">
            <li><Link href="/pro/register" className="hover:text-black hover:underline">{t('footer_create_account', 'Créer un compte')}</Link></li>
            <li><Link href="/pro/login" className="hover:text-black hover:underline">{t('footer_login_pro', 'Connexion Établissement')}</Link></li>
            <li><Link href="/pro/dashboard" className="hover:text-black hover:underline">{t('footer_dashboard', 'Dashboard Resto')}</Link></li>
          </ul>
        </div>

        {/* Col 4 - Légal & Sécurité */}
        <div className="space-y-2.5">
          <p className="font-black text-black uppercase text-xs tracking-wider">{t('footer_security', 'Sécurité & Légal')}</p>
          <ul className="space-y-2 text-neutral-700 font-bold">
            <li><Link href="/terms" className="hover:text-black hover:underline">{t('footer_terms', 'Conditions d\'Utilisation')}</Link></li>
            <li><Link href="/privacy" className="hover:text-black hover:underline">{t('footer_privacy', 'Politique de Confidentialité')}</Link></li>
            <li className="flex items-center gap-1.5 text-neutral-600">
              <ShieldCheck className="w-3.5 h-3.5 text-black" />
              <span>{t('footer_data_protection', 'Protection des Données')} 🔒</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-6xl mx-auto pt-6 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between text-neutral-600 text-xs font-bold gap-3">
        <div>© {new Date().getFullYear()} MenuFid. {t('footer_copyright', 'Tous droits réservés.')}</div>
        <div className="flex items-center gap-2">
          <span className="neo-badge text-[10px]">SaaS v2.0</span>
        </div>
      </div>
    </footer>
  );
}
