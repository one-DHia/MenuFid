'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { 
  ShieldAlert, 
  MessageCircle, 
  Mail, 
  LogOut, 
  Store, 
  HelpCircle, 
  ExternalLink 
} from 'lucide-react';

export default function MerchantSuspendedPage() {
  const { t, dir } = useLanguage();
  const { merchant, logout } = useAuth();

  const businessName = merchant?.business_name || 'Votre établissement';
  const shortCode = merchant?.short_code || 'N/A';

  const waMessage = encodeURIComponent(
    `Bonjour, je vous contacte concernant la suspension de mon compte restaurant MenuFid :\n` +
    `- Établissement : ${businessName}\n` +
    `- Code : ${shortCode}\n` +
    `- ID : ${merchant?.id || ''}\n` +
    `Pouvez-vous vérifier mon statut et réactiver mon compte s'il vous plaît ?`
  );

  return (
    <div dir={dir} className="min-h-screen bg-[#FAFAFA] text-black font-sans flex flex-col justify-between selection:bg-[#FFB800] selection:text-black">
      {/* Header */}
      <header className="border-b-4 border-black bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500 border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#000]">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="font-black text-base sm:text-lg tracking-tight uppercase">
              MenuFid Pro
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <button
              onClick={logout}
              className="neo-pill-btn-white text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('logout', 'Déconnexion')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
        <div className="neo-box bg-white p-6 sm:p-10 text-center space-y-6 border-4 border-red-500 shadow-[6px_6px_0px_0px_#ef4444]">
          
          <div className="w-20 h-20 rounded-2xl bg-red-100 border-4 border-red-500 text-red-600 flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#000]">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block bg-red-500 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-black shadow-[2px_2px_0px_0px_#000]">
              {t('account_suspended_badge', 'Compte Suspendu')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
              {t('account_suspended_title', 'Accès Temporairement Restreint')}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-neutral-700 max-w-md mx-auto leading-relaxed">
              {t('account_suspended_desc', 'L\'accès à votre espace d\'administration a été suspendu par votre distributeur régional ou le service technique.')}
            </p>
          </div>

          {/* Restaurant info card */}
          <div className="bg-neutral-50 p-4 rounded-xl border-2 border-black text-left space-y-2 text-xs font-bold">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
              <span className="text-neutral-500 uppercase">{t('restaurant', 'Établissement')} :</span>
              <span className="font-black text-black">{businessName}</span>
            </div>
            <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
              <span className="text-neutral-500 uppercase">{t('restaurant_code_label', 'Code Restaurant :')}</span>
              <span className="font-mono font-black text-black">{shortCode}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500 uppercase">{t('status_label', 'Statut :')}</span>
              <span className="text-red-600 font-black uppercase">{t('suspended_by_distributor_status', '⚠️ Suspendu par le distributeur')}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <a
              href={`https://wa.me/33766518278?text=${waMessage}`}
              target="_blank"
              rel="noreferrer"
              className="neo-pill-btn bg-[#25D366] hover:bg-green-600 text-white w-full py-3.5 text-xs flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t('contact_distributor_wa', 'Contacter le Support WhatsApp')}</span>
            </a>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/pro/support"
                className="neo-pill-btn-white flex-1 py-3 text-xs flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{t('support_center', 'Centre d\'Assistance')}</span>
              </Link>
              <button
                onClick={logout}
                className="neo-pill-btn-white flex-1 py-3 text-xs flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout', 'Se Déconnecter')}</span>
              </button>
            </div>
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
