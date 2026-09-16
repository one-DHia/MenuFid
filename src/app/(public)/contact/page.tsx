'use client';

import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MessageCircle, Sparkles, Clock, ShieldCheck } from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { useLanguage } from '@/lib/i18n';

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans selection:bg-[#FFB800] selection:text-black">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto py-16 sm:py-24 px-4 sm:px-6 w-full">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="neo-badge mb-3">{t('contact_badge', 'Support & Partenariats')}</span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black mt-2">
            {t('contact_title_prefix', 'Contactez')} Menu<span className="bg-[#FFB800] px-1 ml-0.5 rounded border border-black">Fid</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 font-bold mt-3">
            {t('contact_desc', "Une question technique, une démonstration ou un besoin d'accompagnement ? Notre équipe vous répond 7j/7.")}
          </p>
        </div>
        
        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: WhatsApp Business */}
          <div className="neo-box bg-white p-6 flex flex-col justify-between space-y-4 border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-3xl">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black uppercase text-black">WhatsApp Business</h2>
              <p className="text-xs text-neutral-600 font-bold">
                {t('whatsapp_desc', 'Assistance directe, création de compte et support technique en temps réel.')}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-700 bg-emerald-50 border border-black rounded-lg px-2 py-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{t('whatsapp_response', 'Réponse en < 15 min')}</span>
              </div>
            </div>
            
            <a 
              href="https://wa.me/33766518278" 
              target="_blank" 
              rel="noreferrer"
              className="neo-pill-btn bg-[#25D366] hover:bg-green-600 text-white justify-center text-xs py-3.5 shadow-[3px_3px_0px_0px_#000]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>+33 7 66 51 82 78</span>
            </a>
          </div>

          {/* Card 2: Instagram */}
          <div className="neo-box bg-white p-6 flex flex-col justify-between space-y-4 border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-3xl">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                <InstagramIcon className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black uppercase text-black">{t('instagram_title', 'Instagram Officiel')}</h2>
              <p className="text-xs text-neutral-600 font-bold">
                {t('instagram_desc', 'Actualités, nouveautés des restaurants partenaires, démos et messages directs.')}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] font-black text-pink-700 bg-pink-50 border border-black rounded-lg px-2 py-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>@menu.fid</span>
              </div>
            </div>
            
            <a 
              href="https://www.instagram.com/menu.fid?igsi=ZDNlZDc0MzIxNw==" 
              target="_blank" 
              rel="noreferrer"
              className="neo-pill-btn bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white justify-center text-xs py-3.5 shadow-[3px_3px_0px_0px_#000]"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>{t('instagram_follow', 'Suivre @menu.fid')}</span>
            </a>
          </div>

          {/* Card 3: Email Support */}
          <div className="neo-box bg-white p-6 flex flex-col justify-between space-y-4 border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-3xl">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFB800] text-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black uppercase text-black">{t('email_title', 'Email Support')}</h2>
              <p className="text-xs text-neutral-600 font-bold">
                {t('email_desc', 'Pour toute demande institutionnelle, partenariat ou facturation.')}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] font-black text-neutral-700 bg-neutral-100 border border-black rounded-lg px-2 py-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>support@menufid.site</span>
              </div>
            </div>
            
            <a 
              href="mailto:support@menufid.site" 
              className="neo-pill-btn-white justify-center text-xs py-3.5 shadow-[3px_3px_0px_0px_#000]"
            >
              <Mail className="w-4 h-4" />
              <span>{t('email_btn', 'Envoyer un email')}</span>
            </a>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
