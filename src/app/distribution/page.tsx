'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import { Globe, Award, CheckCircle, Send, Sparkles, Building, Phone, Mail, User, MapPin } from 'lucide-react';

export default function PartnerDistributionPage() {
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
            <h2>Demande de Partenariat / Distribution MenuFid</h2>
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
            Rejoignez l&apos;aventure MenuFid ! Distribuez notre solution auprès des restaurants et commerces de votre région et générez des revenus récurrents élevés.
          </p>
        </div>

        {/* World Map Section - France Highlighted in Bronze Brown */}
        <div className="bg-gradient-to-b from-slate-900 via-amber-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-amber-800/40 mb-16 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Left Info Text */}
            <div className="lg:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase">
                <Sparkles className="w-3.5 h-3.5" /> Zone de Couverture Active
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                La France comme cœur de réseau, prêt pour le monde entier
              </h2>
              <p className="text-amber-100/80 text-sm leading-relaxed">
                Notre réseau de partenaires s&apos;étend rapidement. La <strong className="text-amber-400">France 🇫🇷</strong> est notre zone pilote hautement active avec des centaines de restaurants équipés. Nous recrutons des partenaires régionaux motivés pour consolider et étendre notre présence.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-amber-500/20">
                  <div className="text-3xl font-black text-amber-400">100%</div>
                  <div className="text-xs text-amber-200/90 font-medium">Revenus Récurrents</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-amber-500/20">
                  <div className="text-3xl font-black text-amber-400">24/7</div>
                  <div className="text-xs text-amber-200/90 font-medium">Accompagnement VIP</div>
                </div>
              </div>
            </div>

            {/* Right Interactive World Map Graphic (SVG) */}
            <div className="lg:w-1/2 w-full flex flex-col items-center justify-center">
              <div className="relative w-full max-w-md bg-slate-950/80 p-6 rounded-3xl border border-amber-500/30 shadow-2xl backdrop-blur-sm">
                <div className="text-center mb-4">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                    Carte de Couverture Partenaires
                  </span>
                </div>
                {/* SVG Stylized World Map with France Highlighted in Bronze */}
                <svg viewBox="0 0 800 450" className="w-full h-auto drop-shadow-lg">
                  {/* World Continents Background (Neutre) */}
                  {/* Amérique du Nord */}
                  <path d="M120 80 Q160 60 220 90 T240 180 T150 220 Z" fill="#334155" opacity="0.4" />
                  {/* Amérique du Sud */}
                  <path d="M220 230 Q260 250 250 340 T190 380 T200 280 Z" fill="#334155" opacity="0.4" />
                  {/* Afrique */}
                  <path d="M420 180 Q480 180 500 260 T450 360 T390 260 Z" fill="#334155" opacity="0.4" />
                  {/* Asie & Europe neutre */}
                  <path d="M480 80 Q620 50 720 120 T680 240 T540 180 Z" fill="#334155" opacity="0.4" />
                  {/* Australie */}
                  <path d="M660 300 Q720 300 710 370 T630 360 Z" fill="#334155" opacity="0.4" />

                  {/* FRANCE - HIGHLIGHTED IN BRONZE BROWN (#b45309 / #f59e0b) WITH PULSING RING */}
                  <g className="cursor-pointer group">
                    {/* Pulsing Aura Circle around France */}
                    <circle cx="430" cy="115" r="28" fill="#b45309" opacity="0.3" className="animate-ping" />
                    <circle cx="430" cy="115" r="18" fill="#78350f" stroke="#f59e0b" strokeWidth="3" />
                    <circle cx="430" cy="115" r="7" fill="#fbbf24" />
                    {/* France Hexagon Path */}
                    <path
                      d="M422 105 L438 105 L444 116 L436 126 L422 124 L418 114 Z"
                      fill="#b45309"
                      stroke="#fef3c7"
                      strokeWidth="2"
                    />
                  </g>
                </svg>

                {/* Map Legend */}
                <div className="mt-4 flex items-center justify-center gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-400 border border-white"></span>
                    <span className="text-amber-200 font-bold">France (Actif ⭐)</span>
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
