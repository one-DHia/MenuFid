'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import { useLanguage } from '@/lib/i18n';
import { Globe, Award, CheckCircle, Send, Sparkles, Building, Phone, Mail, User, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PartnerDistributionPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    country: 'France',
    experience: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'nouibetdhia@gmail.com',
          subject: `🤝 Nouvelle Demande de Partenariat MenuFid - ${formData.name}`,
          html: `
            <h2>Demande de Partenariat MenuFid</h2>
            <p><strong>Nom :</strong> ${formData.name}</p>
            <p><strong>Email :</strong> ${formData.email}</p>
            <p><strong>Téléphone :</strong> ${formData.phone}</p>
            <p><strong>Ville / Pays :</strong> ${formData.city}, ${formData.country}</p>
            <p><strong>Expérience :</strong> ${formData.experience}</p>
            <p><strong>Message :</strong> ${formData.message}</p>
          `,
        }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-14 px-4 max-w-7xl mx-auto w-full">
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 border border-amber-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Globe className="w-4 h-4 text-amber-700" /> Réseau de Partenaires Internationaux
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Devenez notre <span className="text-amber-800 underline decoration-amber-500/40">Partenaire Officiel</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Rejoignez l&apos;aventure MenuFid ! Déployez notre solution de digitalisation et de fidélité auprès des restaurateurs de votre région et bénéficiez de revenus récurrents élevés.
          </p>
        </div>

        {/* ULTRA-HD WORLD MAP GRAPHIC SECTION */}
        <div className="bg-gradient-to-b from-slate-950 via-amber-950 to-slate-950 rounded-3xl p-6 sm:p-12 text-white shadow-2xl border border-amber-800/40 mb-16 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Left Narrative Box */}
            <div className="lg:w-5/12 space-y-6">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase">
                <Sparkles className="w-3.5 h-3.5" /> Zone Active & Hub Stratégique
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                La France 🇫🇷 comme cœur de réseau, en expansion vers le monde
              </h2>
              <p className="text-amber-100/80 text-xs sm:text-sm leading-relaxed">
                MenuFid équipe activement les restaurants et établissements à travers toute la <strong className="text-amber-400 font-bold">France</strong>. En tant que Partenaire régional privilégié, vous devenez l&apos;interlocuteur exclusif de votre département pour accompagner la transformation digitale de la restauration.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-amber-500/20">
                  <div className="text-2xl sm:text-3xl font-black text-amber-400">100%</div>
                  <div className="text-[11px] text-amber-200/90 font-medium">Revenus Récurrents</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-amber-500/20">
                  <div className="text-2xl sm:text-3xl font-black text-amber-400">Exclusivité</div>
                  <div className="text-[11px] text-amber-200/90 font-medium">Secteur Réservé</div>
                </div>
              </div>
            </div>

            {/* Right REALISTIC HIGH-DEFINITION VECTOR WORLD MAP (SVG) */}
            <div className="lg:w-7/12 w-full flex flex-col items-center justify-center">
              <div className="relative w-full bg-slate-900/90 p-4 sm:p-6 rounded-3xl border border-amber-500/30 shadow-2xl backdrop-blur-md overflow-hidden">
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-amber-400" /> Carte Mondiale des Partenariats
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    France ⭐ Équipée
                  </span>
                </div>

                {/* DETAILED VECTOR WORLD MAP SVG */}
                <svg viewBox="0 0 1000 500" className="w-full h-auto drop-shadow-2xl">
                  {/* Grid Lines for Professional Map Styling */}
                  <defs>
                    <linearGradient id="franceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#d97706" />
                      <stop offset="100%" stopColor="#78350f" />
                    </linearGradient>
                    <radialGradient id="glowGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Latitude / Longitude Subtle Lines */}
                  <line x1="0" y1="125" x2="1000" y2="125" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
                  <line x1="0" y1="250" x2="1000" y2="250" stroke="#334155" strokeWidth="0.5" opacity="0.4" />
                  <line x1="0" y1="375" x2="1000" y2="375" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
                  <line x1="500" y1="0" x2="500" y2="500" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />

                  {/* CONTINENTS VECTOR PATHS (DETAILED REALISTIC MAP) */}
                  {/* North America */}
                  <path
                    d="M 120 90 L 150 80 L 220 70 L 290 85 L 310 120 L 280 160 L 260 210 L 240 240 L 210 230 L 180 180 L 140 150 L 100 120 Z"
                    fill="#1e293b" stroke="#334155" strokeWidth="1"
                  />
                  {/* South America */}
                  <path
                    d="M 270 260 L 310 270 L 340 310 L 330 380 L 300 440 L 270 410 L 260 340 L 250 290 Z"
                    fill="#1e293b" stroke="#334155" strokeWidth="1"
                  />
                  {/* Europe (except France) */}
                  <path
                    d="M 480 80 L 520 70 L 580 85 L 560 140 L 530 160 L 510 140 L 490 120 Z"
                    fill="#334155" stroke="#475569" strokeWidth="1" opacity="0.8"
                  />
                  {/* United Kingdom */}
                  <path d="M 465 100 L 475 95 L 478 110 L 468 115 Z" fill="#334155" stroke="#475569" strokeWidth="0.8" />
                  {/* Africa */}
                  <path
                    d="M 470 180 L 540 180 L 590 220 L 580 300 L 540 380 L 500 360 L 470 280 L 460 220 Z"
                    fill="#1e293b" stroke="#334155" strokeWidth="1"
                  />
                  {/* Asia */}
                  <path
                    d="M 580 70 L 720 50 L 850 80 L 880 150 L 820 220 L 740 250 L 680 200 L 620 180 L 580 120 Z"
                    fill="#1e293b" stroke="#334155" strokeWidth="1"
                  />
                  {/* Australia */}
                  <path
                    d="M 780 340 L 860 330 L 880 380 L 830 420 L 770 390 Z"
                    fill="#1e293b" stroke="#334155" strokeWidth="1"
                  />

                  {/* FRANCE - HIGHLIGHTED IN RICH BRONZE BROWN & GOLD (#78350f / #b45309 / #f59e0b) */}
                  <g className="cursor-pointer group">
                    {/* Outer Glowing Pulsing Beacon Ring */}
                    <circle cx="485" cy="130" r="35" fill="url(#glowGlow)" className="animate-ping opacity-75" />
                    
                    {/* Detailed France Polygon Hexagon */}
                    <polygon
                      points="475,120 495,118 502,130 495,145 478,142 472,130"
                      fill="url(#franceGrad)"
                      stroke="#fef3c7"
                      strokeWidth="2.5"
                      className="filter drop-shadow-[0_0_12px_rgba(245,158,11,0.9)] transition-all duration-300 group-hover:scale-110"
                    />

                    {/* Pin Pointer Marker */}
                    <g transform="translate(485, 130)">
                      <circle cx="0" cy="0" r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="0" cy="0" r="2.5" fill="#78350f" />
                    </g>
                  </g>
                </svg>

                {/* Map Footer Info */}
                <div className="mt-4 flex flex-wrap items-center justify-between text-xs pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-amber-700 to-amber-500 border border-amber-300"></span>
                    <span className="text-amber-200 font-bold">France (Zone Pilote Active 🇫🇷)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-700"></span>
                    <span className="text-slate-400">Expansion Internationale</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mb-6 font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-2">Commissions Récurrentes</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Percevez une marge attractive et récurrente sur chaque restaurant abonné dans votre secteur d&apos;exclusivité.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mb-6 font-bold">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-2">Support & Kit Marketing Dédié</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Recevez vos présentations commerciales, flyers de démonstration, autocollants QR Code et formation sur mesure.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mb-6 font-bold">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-2">Exclusivité Régionale</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Soyez le référent officiel MenuFid dans votre ville ou région avec un statut de partenaire privilégié.
            </p>
          </div>
        </div>

        {/* Partner Application Form Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-amber-900/10 shadow-xl max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              Postuler pour devenir Partenaire
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Remplissez le formulaire ci-dessous. Notre équipe commerciale vous recontactera sous 24h.
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-lg">Demande reçue avec succès !</h3>
              <p className="text-slate-600 text-xs">
                Merci pour votre intérêt. Un responsable Partenariat MenuFid va examiner votre profil et vous contacter très rapidement.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Nom complet *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Dhia Nouibet"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-amber-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Adresse e-mail *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="partenaire@exemple.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-amber-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Téléphone *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="06 12 34 56 78"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-amber-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Ville & Pays *</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Paris, France"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-amber-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Expérience professionnelle / Activité</label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="Ex: Agence marketing, commercial CHR, agence web..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-amber-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Présentation de votre projet *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Décrivez votre secteur d'activité, votre réseau de restaurants et vos motivations..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-amber-800 outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-4 rounded-2xl transition shadow-lg text-sm flex items-center justify-center gap-2 btn-press"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer ma candidature Partenaire'}
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
