'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { 
  ArrowLeft, 
  LifeBuoy, 
  Mail, 
  Phone, 
  MessageCircle, 
  Send, 
  HelpCircle, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  QrCode, 
  Award, 
  Utensils 
} from 'lucide-react';

export default function ProSupportPage() {
  const { t, language } = useLanguage();
  const { merchant } = useAuth();
  const { showToast } = useToast();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const emailTo = 'support@menufid.site';
    const sub = encodeURIComponent(`[Support MenuFid Pro] ${subject || 'Demande d\'assistance'} - ${merchant?.business_name || 'Restaurant'}`);
    const body = encodeURIComponent(
      `Bonjour l'équipe support MenuFid,\n\n` +
      `${message}\n\n` +
      `---\n` +
      `Restaurant : ${merchant?.business_name || 'N/A'}\n` +
      `ID Marchand : ${merchant?.id || 'N/A'}\n` +
      `Slug : ${merchant?.slug || 'N/A'}\n`
    );

    window.open(`mailto:${emailTo}?subject=${sub}&body=${body}`, '_blank');
    setSubmitted(true);
    showToast(t('support_sent_success', 'Votre message a été transmis à l\'équipe support !'), 'success');
  };

  const FAQS = [
    {
      q: t('faq_q1', 'Comment ajouter un tampon à un client ?'),
      a: t('faq_a1', 'Rendez-vous dans la section "Scanner Caissier", scannez le QR code de fidélité affiché sur le téléphone du client (ou saisissez son code secret), puis cliquez sur "+1 Tampon".')
    },
    {
      q: t('faq_q2', 'Comment imprimer mes chevalets de table ?'),
      a: t('faq_a2', 'Dans l\'onglet "Générateur QR", personnalisez les couleurs et le logo, puis cliquez sur "Télécharger Chevalet PNG (Haute Définition)" pour l\'imprimer au format A5 ou A6.')
    },
    {
      q: t('faq_q3', 'Comment changer les prix ou les plats de mon menu ?'),
      a: t('faq_a3', 'Dans "Éditeur de Menu", vous pouvez ajouter, modifier ou désactiver des plats en temps réel. Les modifications sont immédiatement visibles par vos clients sans avoir à réimprimer les QR codes.')
    },
    {
      q: t('faq_q4', 'Mes clients doivent-ils installer une application ?'),
      a: t('faq_a4', 'Non ! MenuFid fonctionne directement dans le navigateur mobile. Les clients peuvent également installer la carte en 1 clic sur leur écran d\'accueil via la technologie PWA.')
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black font-sans flex flex-col selection:bg-[#FFB800] selection:text-black">
      {/* Header */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/pro/dashboard"
              className="p-2 rounded-xl text-black hover:bg-[#FFB800] border-2 border-transparent hover:border-black transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FFB800] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <h1 className="font-black text-lg sm:text-xl tracking-tight uppercase">
                {t('support_center_title', 'Centre d\'Assistance & Support Pro')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Banner Hero */}
        <div className="neo-box-yellow p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              {t('support_available_7j7', 'Assistance Dédiée 7j/7')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              {t('support_hero_title', 'Une question ou un besoin d\'accompagnement ?')}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-neutral-900">
              {t('support_hero_desc', 'Notre équipe technique et votre partenaire distributeur régional sont disponibles pour vous aider à maximiser votre chiffre d\'affaires.')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a
              href="https://wa.me/33766518278"
              target="_blank"
              rel="noreferrer"
              className="neo-pill-btn bg-[#25D366] hover:bg-green-600 text-white border-black text-xs py-3.5 px-6 flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Business Direct</span>
            </a>
            <a
              href="mailto:support@menufid.site"
              className="neo-pill-btn-white text-xs py-3.5 px-6 flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Email Support</span>
            </a>
          </div>
        </div>

        {/* Contact Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="neo-box bg-white p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
              <MessageCircle className="w-5 h-5 text-emerald-700" />
            </div>
            <h3 className="font-black text-sm uppercase">{t('whatsapp_channel', 'WhatsApp Dédié')}</h3>
            <p className="text-xs text-neutral-600 font-bold">
              {t('whatsapp_desc', 'Réponse rapide de 09h à 22h pour toute urgence de service ou de configuration.')}
            </p>
            <a 
              href="https://wa.me/33766518278" 
              target="_blank" 
              rel="noreferrer" 
              className="inline-block text-xs font-black text-emerald-700 hover:underline pt-1"
            >
              {t('open_whatsapp', 'Discuter sur WhatsApp (+33 7 66 51 82 78) ➔')}
            </a>
          </div>

          <div className="neo-box bg-white p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
              <Mail className="w-5 h-5 text-blue-700" />
            </div>
            <h3 className="font-black text-sm uppercase">{t('email_channel', 'Email Support')}</h3>
            <p className="text-xs text-neutral-600 font-bold">
              {t('email_desc', 'Écrivez-nous pour toute question relative à votre facturation ou évolution de menu.')}
            </p>
            <a 
              href="mailto:support@menufid.site" 
              className="inline-block text-xs font-black text-blue-700 hover:underline pt-1"
            >
              support@menufid.site ➔
            </a>
          </div>

          <div className="neo-box bg-white p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
              <Clock className="w-5 h-5 text-amber-800" />
            </div>
            <h3 className="font-black text-sm uppercase">{t('hours_channel', 'Horaires d\'Assistance')}</h3>
            <p className="text-xs text-neutral-600 font-bold">
              {t('hours_desc', '7j / 7 de 09h00 à 23h00 (heure locale). Assistance continue pour les soirs de service.')}
            </p>
            <span className="inline-block text-xs font-black text-black pt-1">
              🟢 {t('team_online', 'Équipe en ligne')}
            </span>
          </div>
        </div>

        {/* Message Form & FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-6 neo-box bg-white p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-black text-lg text-black uppercase tracking-tight flex items-center gap-2">
                <Send className="w-5 h-5 text-black" />
                <span>{t('send_ticket_title', 'Envoyer un Message au Support')}</span>
              </h3>
              <p className="text-xs text-neutral-600 font-bold mt-1">
                {t('send_ticket_desc', 'Nous répondrons directement sur l\'adresse email de votre restaurant.')}
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border-2 border-black rounded-2xl text-center space-y-3 shadow-[4px_4px_0px_0px_#000]">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-black text-sm text-black uppercase">{t('ticket_submitted_title', 'Message envoyé avec succès')}</h4>
                <p className="text-xs text-neutral-600 font-bold">
                  {t('ticket_submitted_desc', 'Notre équipe a bien reçu votre demande et vous répondra dans les plus brefs délais.')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setSubject('');
                    setMessage('');
                  }}
                  className="neo-pill-btn text-xs py-2 px-4"
                >
                  <span>{t('new_message', 'Envoyer un autre message')}</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    {t('subject_label', 'Objet de votre demande *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t('subject_placeholder', 'ex: Question sur les chevalets de table, ajout d\'options...')}
                    className="w-full neo-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    {t('message_label', 'Votre message détaillé *')}
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('message_placeholder', 'Expliquez votre situation ou votre question avec précision...')}
                    className="w-full neo-input text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="neo-pill-btn w-full py-4 text-xs font-black justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('submit_ticket_btn', 'Transmettre ma demande')}</span>
                </button>
              </form>
            )}
          </div>

          {/* FAQs */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-black" />
              <h3 className="font-black text-lg text-black uppercase tracking-tight">
                {t('faq_title', 'Questions Fréquentes (FAQ)')}
              </h3>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, index) => (
                <div key={index} className="neo-box bg-white p-4 space-y-2">
                  <h4 className="font-black text-xs sm:text-sm text-black flex items-start gap-2">
                    <span className="text-[#FFB800] text-base">●</span>
                    <span>{faq.q}</span>
                  </h4>
                  <p className="text-xs text-neutral-600 font-bold leading-relaxed pl-4">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
