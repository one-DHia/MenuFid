'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Globe, Award, TrendingUp, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import WorldMap from '@/components/WorldMap';

export default function DistributionPage() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    experience: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black flex flex-col font-sans selection:bg-[#FFB800] selection:text-black">
      <Navbar />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="py-14 px-4 max-w-5xl mx-auto text-center">
          <span className="neo-badge-yellow mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('partner_network', 'Réseau Partenaires')}</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-black mb-3 tracking-tight mt-2">
            {t('become_distributor_title', 'Devenez Distributeur Officiel.')}
          </h1>
          <p className="text-neutral-600 text-xs sm:text-sm font-medium max-w-xl mx-auto">
            {t('become_distributor_desc', 'Développez MenuFid dans votre ville et touchez des commissions récurrentes.')}
          </p>
        </section>

        {/* Section Carte du monde & Expansion */}
        <section className="px-4 max-w-5xl mx-auto mb-12">
          <div className="neo-box p-4 bg-white overflow-hidden">
            <WorldMap />
          </div>
        </section>

        {/* Benefits Bento Grid */}
        <section className="px-4 max-w-5xl mx-auto mb-16">
          <div className="grid sm:grid-cols-3 gap-6">
            
            <div className="neo-box neo-box-hover p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center border-2 border-black">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-black text-black text-base">{t('exclusive_territory', 'Territoire Exclusif')}</h3>
                <p className="text-neutral-600 text-xs font-medium">{t('exclusive_territory_desc', 'Développez votre secteur géographique en exclusivité.')}</p>
              </div>
            </div>

            <div className="neo-box-yellow neo-box-hover p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-black text-[#FFB800] flex items-center justify-center border-2 border-black">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-black text-black text-base">{t('recurring_revenue', 'Revenus Récurrents')}</h3>
                <p className="text-black text-xs font-bold">{t('recurring_revenue_desc', "Touchez jusqu'à 30% de commission mensuelle sur chaque restaurant.")}</p>
              </div>
            </div>

            <div className="neo-box neo-box-hover p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center border-2 border-black">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-black text-black text-base">{t('tools_support', 'Outils & Support')}</h3>
                <p className="text-neutral-600 text-xs font-medium">{t('tools_support_desc', 'Dashboard partenaire dédié et supports commerciaux fournis.')}</p>
              </div>
            </div>

          </div>
        </section>

        {/* Formulaire de Candidature Bento */}
        <section className="px-4 max-w-2xl mx-auto mb-20">
          <div className="neo-box p-8 sm:p-10 bg-white">
            <h2 className="text-2xl font-black text-black mb-2 text-center">{t('apply_in_1_min', 'Postuler en 1 minute')}</h2>
            <p className="text-neutral-600 text-xs font-medium text-center mb-6">{t('apply_response_time', 'Notre équipe vous recontacte sous 24h.')}</p>

            {submitted ? (
              <div className="p-6 bg-[#00F59B] border-2 border-black rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-black mx-auto" />
                <h3 className="font-black text-base text-black">{t('application_sent', 'Candidature Envoyée !')}</h3>
                <p className="text-xs font-bold text-black">{t('application_sent_desc', 'Nous examinerons votre profil dans les plus brefs délais.')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-black mb-1">{t('form_fullname', 'Nom complet')}</label>
                    <input
                      type="text"
                      required
                      placeholder={t('form_fullname_placeholder', 'Jean Dupont')}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 bg-neutral-50 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-[#FFB800]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-black mb-1">{t('form_email', 'E-mail')}</label>
                    <input
                      type="email"
                      required
                      placeholder={t('form_email_placeholder', 'jean@exemple.com')}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 bg-neutral-50 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-[#FFB800]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-black mb-1">{t('form_phone', 'Téléphone')}</label>
                    <input
                      type="tel"
                      required
                      placeholder={t('form_phone_placeholder', '+33 6 00 00 00 00')}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-3 bg-neutral-50 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-[#FFB800]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-black mb-1">{t('form_city', 'Ville / Région')}</label>
                    <input
                      type="text"
                      required
                      placeholder={t('form_city_placeholder', 'Lyon, Paris, Marseille...')}
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-3 bg-neutral-50 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-[#FFB800]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">{t('form_message', 'Message (optionnel)')}</label>
                  <textarea
                    rows={3}
                    placeholder={t('form_message_placeholder', 'Parlez-nous de votre expérience terrain...')}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-3 bg-neutral-50 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-[#FFB800]/20 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full neo-pill-btn text-xs py-3.5 justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('form_submit', 'Envoyer ma candidature')}</span>
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
