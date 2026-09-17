'use client';

import React, { useState } from 'react';
import {
  QrCode,
  Users,
  Award,
  TrendingUp,
  LayoutDashboard,
  UtensilsCrossed,
  ScanLine,
  Smartphone,
  Laptop,
  Star,
  Check,
  Bell,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function DashboardScreenMockup() {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<'client' | 'pro'>('client');

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 relative px-2 sm:px-4">
      {/* Sélecteur de vue épuré (Switch Minimaliste) */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="inline-flex items-center bg-white border-2 border-black rounded-full p-1 shadow-[3px_3px_0px_0px_#000]">
          <button
            type="button"
            onClick={() => setActiveView('client')}
            className={`px-4 sm:px-6 py-2 rounded-full text-xs font-black transition-all flex items-center gap-2 ${
              activeView === 'client'
                ? 'bg-[#FFB800] text-black shadow-[2px_2px_0px_0px_#000]'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{t('view_client_phone', '1. Vue Client (Mobile & Fidélité)')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('pro')}
            className={`px-4 sm:px-6 py-2 rounded-full text-xs font-black transition-all flex items-center gap-2 ${
              activeView === 'pro'
                ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000]'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>{t('view_resto_dashboard', '2. Espace Restaurateur (Gestion)')}</span>
          </button>
        </div>
      </div>

      {/* Conteneur d'affichage épuré */}
      <div className="transition-all duration-300">
        {activeView === 'client' ? (
          /* 📱 VUE SMARTPHONE CLIENT ULTRA-ÉPURÉE */
          <div className="max-w-xs sm:max-w-sm mx-auto bg-black p-3.5 rounded-[36px] sm:rounded-[42px] border-4 border-black shadow-[8px_8px_0px_0px_#000]">
            <div className="bg-white rounded-[26px] sm:rounded-[32px] overflow-hidden border-2 border-black text-left select-none">
              
              {/* Dynamic Island / Status Bar */}
              <div className="bg-black text-white px-5 py-2.5 flex items-center justify-between text-[10px] font-bold">
                <span>12:30</span>
                <div className="w-16 h-3.5 bg-neutral-900 rounded-full border border-neutral-700 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-neutral-800" />
                </div>
                <div className="flex items-center gap-1 text-[9px]">5G 100%</div>
              </div>

              {/* Header Restaurant */}
              <div className="bg-[#FFB800] p-4 border-b-2 border-black">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-black uppercase bg-white px-2 py-0.5 rounded border border-black">
                    Menu & Fidélité
                  </span>
                  <span className="text-[10px] font-bold text-black flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full border border-black">
                    <Star className="w-3 h-3 fill-black text-black" /> 4.9
                  </span>
                </div>
                <p className="font-black text-base uppercase tracking-tight text-black">
                  Burger Gourmet & Co.
                </p>
                <p className="text-[10px] font-bold text-neutral-800">
                  Commandes directes • Fidélité Apple & Google Wallet
                </p>
              </div>

              {/* Carte Fidélité Digitale */}
              <div className="p-3.5 bg-neutral-50 border-b-2 border-black">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase flex items-center gap-1">
                    <Award className="w-3 h-3 text-black" /> Carte de Fidélité
                  </span>
                  <span className="text-[9px] font-black bg-[#00F59B] border border-black px-1.5 py-0.5 rounded">
                    4 / 10 Tampons
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <div
                      key={num}
                      className={`h-7 rounded-lg border border-black flex items-center justify-center text-[10px] font-black ${
                        num <= 4
                          ? 'bg-[#00F59B] text-black shadow-[1px_1px_0px_0px_#000]'
                          : num === 10
                          ? 'bg-[#FFB800] text-black'
                          : 'bg-white text-neutral-400'
                      }`}
                    >
                      {num <= 4 ? '✓' : num === 10 ? '🎁' : num}
                    </div>
                  ))}
                </div>
              </div>

              {/* Plats & Commande Rapide */}
              <div className="p-3.5 space-y-2.5">
                <div className="p-2.5 rounded-xl border-2 border-black bg-white flex items-center justify-between gap-2 shadow-[2px_2px_0px_0px_#000]">
                  <div>
                    <p className="font-black text-xs text-black">Burger Truffe & Cheddar</p>
                    <p className="text-[10px] font-bold text-neutral-500">16,50 €</p>
                  </div>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-full bg-black text-white text-[10px] font-black"
                  >
                    + Ajouter
                  </button>
                </div>

                <div className="p-2.5 rounded-xl border-2 border-black bg-white flex items-center justify-between gap-2 shadow-[2px_2px_0px_0px_#000]">
                  <div>
                    <p className="font-black text-xs text-black">Frites Maison & Sauce</p>
                    <p className="text-[10px] font-bold text-neutral-500">4,90 €</p>
                  </div>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-full bg-black text-white text-[10px] font-black"
                  >
                    + Ajouter
                  </button>
                </div>
              </div>

              {/* Action Bar Client */}
              <div className="p-3 bg-neutral-100 border-t-2 border-black text-center">
                <div className="w-full py-2 rounded-full bg-[#00F59B] text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  🛒 Voir mon Panier (21,40 €)
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* 💻 VUE TABLEAU DE BORD RESTAURATEUR ÉPURÉE */
          <div className="w-full border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_#000] bg-white text-black font-sans text-left">
            {/* Barre navigateur sobre */}
            <div className="bg-neutral-100 px-4 py-2.5 border-b-3 border-black flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF4747] border border-black" />
                <div className="w-3 h-3 rounded-full bg-[#FFB800] border border-black" />
                <div className="w-3 h-3 rounded-full bg-[#00F59B] border border-black" />
              </div>
              <div className="text-[11px] font-mono font-bold bg-white px-3 py-0.5 rounded-full border border-black">
                app.menufid.site/pro/dashboard
              </div>
              <span className="text-[10px] font-black bg-[#00F59B] text-black px-2 py-0.5 rounded border border-black">
                EN SERVICE
              </span>
            </div>

            {/* Contenu Dashboard */}
            <div className="p-4 sm:p-6 bg-[#FAFAFA] space-y-4">
              {/* 3 Métriques clés */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000]">
                  <div className="text-[11px] font-bold text-neutral-600">Scans QR Aujourd’hui</div>
                  <div className="text-2xl font-black text-black mt-0.5">148</div>
                  <div className="text-[10px] font-black text-emerald-700 mt-0.5 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +24% vs hier
                  </div>
                </div>

                <div className="p-3.5 bg-[#FFB800] border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000]">
                  <div className="text-[11px] font-bold text-black">Clients Fidélisés</div>
                  <div className="text-2xl font-black text-black mt-0.5">842</div>
                  <div className="text-[10px] font-black text-black mt-0.5">
                    Apple & Google Wallet
                  </div>
                </div>

                <div className="p-3.5 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000]">
                  <div className="text-[11px] font-bold text-neutral-600">Commandes Directes</div>
                  <div className="text-2xl font-black text-black mt-0.5">38</div>
                  <div className="text-[10px] font-black text-emerald-700 mt-0.5">
                    0% Commission prélevée
                  </div>
                </div>
              </div>

              {/* Live Order Simulation */}
              <div className="p-4 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border-2 border-black flex items-center justify-center font-black text-sm">
                    🔔
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-black">Commande #CMD-842</span>
                      <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.2 rounded">
                        En cuisine
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 font-medium">
                      2x Menu Gourmet • Livreur assigné : Karim
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-sm font-black text-black">36,00 €</span>
                  <span className="text-[10px] bg-[#00F59B] text-black font-black px-2.5 py-1 rounded-full border border-black">
                    Validée
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
