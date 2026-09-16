'use client';

import React from 'react';
import {
  QrCode,
  Users,
  Award,
  Zap,
  TrendingUp,
  LayoutDashboard,
  UtensilsCrossed,
  Gift,
  ScanLine,
  ChevronRight,
  Sparkles,
  Smartphone,
  Laptop,
  Check,
  Star,
  Search,
  Plus,
  Wifi,
  Battery,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function DashboardScreenMockup() {
  const { t, language } = useLanguage();

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 relative px-2 sm:px-4">
      {/* Device Badges Header */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-black text-black text-xs font-black shadow-[3px_3px_0px_0px_#000]">
          <Laptop className="w-4 h-4 text-black" />
          <span>{t('pc_screen_label', '1. Écran PC : Dashboard & Gestion Pro')}</span>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFB800] border-2 border-black text-black text-xs font-black shadow-[3px_3px_0px_0px_#000]">
          <Smartphone className="w-4 h-4 text-black" />
          <span>{t('mobile_screen_label', '2. Écran Mobile : Menu & Fidélité Client')}</span>
        </div>
      </div>

      {/* Main Dual-Screen Stage Container */}
      <div className="relative pb-12 lg:pb-0">
        
        {/* ── 1. ÉCRAN PC / LAPTOP (DASHBOARD PRO) ── */}
        <div className="w-full lg:w-[86%] border-4 border-black rounded-3xl overflow-hidden shadow-[10px_10px_0px_0px_#000] bg-white text-black font-sans text-left transition-all relative z-10">
          
          {/* Top Browser Bar */}
          <div className="bg-neutral-100 px-4 py-3 border-b-4 border-black flex items-center justify-between gap-3">
            {/* Window Traffic Dots */}
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#FF4747] border-2 border-black shadow-[1px_1px_0px_0px_#000]" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#FFB800] border-2 border-black shadow-[1px_1px_0px_0px_#000]" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#00F59B] border-2 border-black shadow-[1px_1px_0px_0px_#000]" />
            </div>

            {/* URL Omnibox */}
            <div className="flex-1 max-w-md mx-auto bg-white text-black text-xs font-mono py-1.5 px-4 rounded-full border-2 border-black flex items-center justify-between shadow-[2px_2px_0px_0px_#000]">
              <span className="font-bold truncate">app.menufid.site/dashboard</span>
              <span className="text-[10px] bg-[#00F59B] text-black font-black px-2 py-0.5 rounded-full border border-black uppercase tracking-wider shrink-0 ml-2">
                PRO LIVE
              </span>
            </div>

            {/* Restaurant Status */}
            <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1 rounded-full border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00F59B] border border-black animate-pulse" />
              <span>{t('resto_pro', 'Resto Pro')}</span>
            </div>
          </div>

          {/* PC Dashboard Interior */}
          <div className="p-4 sm:p-6 bg-[#FAFAFA] grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Mini Sidebar */}
            <div className="hidden md:flex md:col-span-3 flex-col justify-between p-4 bg-white border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000]">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 p-2.5 bg-[#FFB800] border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#000]">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t('dashboard_title', 'Tableau de bord')}</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-neutral-600 hover:text-black hover:bg-neutral-100 transition">
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>{t('digital_menu', 'Menu Digital')}</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-neutral-600 hover:text-black hover:bg-neutral-100 transition">
                  <Award className="w-4 h-4" />
                  <span>{t('loyalty_program', 'Programme Fidélité')}</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-neutral-600 hover:text-black hover:bg-neutral-100 transition">
                  <ScanLine className="w-4 h-4" />
                  <span>{t('client_scanner', 'Scanner Client')}</span>
                </div>
              </div>

              <div className="p-3.5 bg-black text-white rounded-xl border-2 border-black text-xs space-y-1 mt-4">
                <div className="flex items-center gap-1 text-[#FFB800] font-black">
                  <Sparkles className="w-3.5 h-3.5 fill-[#FFB800]" />
                  <span>{t('pro_loyalty_plan', 'Plan Pro Actif')}</span>
                </div>
                <p className="text-[10px] text-neutral-400 font-bold">{t('unlimited_clients', 'Clients & Scans illimités')}</p>
              </div>
            </div>

            {/* Main Dashboard Content */}
            <div className="md:col-span-9 space-y-4">
              
              {/* Top 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                
                {/* Metric 1 */}
                <div className="p-4 bg-white border-3 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000]">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-800 mb-1">
                    <span>{t('qr_scans_today', "Scans QR (Aujourd'hui)")}</span>
                    <QrCode className="w-4 h-4 text-black" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-black">148</div>
                  <div className="text-[10px] font-black text-emerald-800 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> {t('vs_yesterday', '+24% vs hier')}
                  </div>
                </div>

                {/* Metric 2 - Yellow Highlight */}
                <div className="p-4 bg-[#FFB800] border-3 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000]">
                  <div className="flex items-center justify-between text-xs font-bold text-black mb-1">
                    <span>{t('loyal_clients', 'Clients Fidélisés')}</span>
                    <Users className="w-4 h-4 text-black" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-black">842</div>
                  <div className="text-[10px] font-black text-black mt-1">
                    Apple & Google Wallet
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="p-4 bg-white border-3 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000]">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-800 mb-1">
                    <span>{t('stamps_distributed', 'Tampons Distribués')}</span>
                    <Gift className="w-4 h-4 text-black" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-black">1 920</div>
                  <div className="text-[10px] font-bold text-neutral-800 mt-1">
                    {t('rewards_offered', '128 récompenses offertes')}
                  </div>
                </div>
              </div>

              {/* Bottom Pro Action Widgets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Live Menu Item Preview */}
                <div className="p-4 bg-white border-3 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black bg-black text-white px-2.5 py-0.5 rounded-full uppercase">
                        {t('featured_dish', 'Plat Vedette')}
                      </span>
                      <span className="text-sm font-black text-black">16,50 €</span>
                    </div>
                    <p className="font-black text-sm text-black">{t('burger_name', 'Burger Gourmet Truffe & Cheddar')}</p>
                    <p className="text-xs text-neutral-700 mt-0.5 line-clamp-1">{t('burger_desc', 'Steak haché boucher, crème truffée, cheddar affiné.')}</p>
                  </div>
                  <div className="pt-3 mt-3 border-t-2 border-neutral-200 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-black bg-[#00F59B] border border-black px-2 py-0.5 rounded-md font-black">{t('available', 'Disponible')}</span>
                    <span className="text-neutral-800">{t('updated_1_click', 'Mis à jour en 1 clic')}</span>
                  </div>
                </div>

                {/* Scanner Express Simulation */}
                <div className="p-4 bg-white border-3 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase text-neutral-600">{t('express_scanner', 'Scanner Express')}</span>
                      <span className="text-[10px] font-black bg-[#00F59B] text-black px-2 py-0.5 rounded-full border border-black">
                        {t('instant', 'Instantané')}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 font-medium">{t('scan_wallet_to_add', 'Scannez le Wallet du client pour ajouter 1 tampon.')}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-[#FFB800] text-black border-2 border-black rounded-full py-1.5 px-3 text-center text-xs font-black shadow-[2px_2px_0px_0px_#000]">
                      {t('stamp_added', '+1 Tampon Ajouté')}
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-black bg-black text-white flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_0px_#000]">
                      ✓
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* ── 2. ÉCRAN SMARTPHONE MOBILE (MENU DIGITAL & FIDÉLITÉ CLIENT) ── */}
        <div className="mt-8 lg:mt-0 lg:absolute lg:-right-3 lg:-bottom-8 w-full max-w-[300px] mx-auto lg:mx-0 z-30 transform lg:rotate-1 hover:rotate-0 transition-transform duration-300">
          
          {/* Floating Device Tag */}
          <div className="text-center mb-2">
            <span className="bg-black text-white text-[11px] font-black uppercase px-3.5 py-1 rounded-full border-2 border-[#FFB800] shadow-[3px_3px_0px_0px_#000] tracking-wider inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00F59B] animate-ping" />
              <span>{t('client_smartphone_view', 'Vue Smartphone Client')}</span>
            </span>
          </div>

          {/* Phone Shell Frame */}
          <div className="bg-black p-3.5 rounded-[42px] border-4 border-black shadow-[10px_10px_0px_0px_#000]">
            
            {/* Phone Screen Glass */}
            <div className="bg-white rounded-[32px] overflow-hidden border-2 border-black text-left select-none">
              
              {/* Phone Status Bar (Dynamic Island style) */}
              <div className="bg-black text-white px-5 py-2.5 flex items-center justify-between text-[10px] font-bold">
                <span>9:41</span>
                {/* Dynamic Island pill */}
                <div className="w-16 h-4 bg-neutral-900 rounded-full border border-neutral-700 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-neutral-800" />
                </div>
                <div className="flex items-center gap-1.5 text-white">
                  <Wifi className="w-3 h-3" />
                  <Battery className="w-3.5 h-3.5 fill-white" />
                </div>
              </div>

              {/* Phone Header Banner */}
              <div className="bg-[#FFB800] p-4 border-b-3 border-black">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase bg-white px-2 py-0.5 rounded border border-black">
                    {t('digital_menu_tag', 'Menu & Fidélité')}
                  </span>
                  <span className="text-[10px] font-bold text-black flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full border border-black">
                    <Star className="w-3 h-3 fill-black text-black" /> 4.9
                  </span>
                </div>
                <p className="font-black text-base uppercase tracking-tight text-black">
                  {t('sample_resto_name', 'Brooklyn Burger Co.')}
                </p>
                <p className="text-[10px] font-bold text-neutral-800">
                  {t('sample_resto_sub', 'Burgers Gourmets & Frites Maison')}
                </p>
              </div>

              {/* Loyalty Stamp Card Mini */}
              <div className="p-3 bg-neutral-50 border-b-2 border-black">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase flex items-center gap-1">
                    <Award className="w-3 h-3 text-black" /> {t('loyalty_card_title', 'Carte de Fidélité')}
                  </span>
                  <span className="text-[9px] font-black bg-[#00F59B] border border-black px-1.5 py-0.2 rounded">
                    4 / 10
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <div
                      key={num}
                      className={`h-6 rounded-md border border-black flex items-center justify-center text-[9px] font-black ${
                        num <= 4
                          ? 'bg-[#00F59B] text-black shadow-[1px_1px_0px_0px_#000]'
                          : num === 10
                          ? 'bg-[#FFB800] text-black'
                          : 'bg-white text-neutral-800'
                      }`}
                    >
                      {num <= 4 ? '✓' : num === 10 ? '🎁' : num}
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories Pills Bar */}
              <div className="p-2.5 flex items-center gap-1.5 overflow-x-auto border-b-2 border-black bg-white scrollbar-none">
                <span className="text-[10px] font-black bg-black text-white px-2.5 py-1 rounded-full whitespace-nowrap">
                  🍔 Burgers (8)
                </span>
                <span className="text-[10px] font-bold bg-neutral-100 text-black px-2.5 py-1 rounded-full border border-black whitespace-nowrap">
                  🍟 Sides
                </span>
                <span className="text-[10px] font-bold bg-neutral-100 text-black px-2.5 py-1 rounded-full border border-black whitespace-nowrap">
                  🥤 Boissons
                </span>
              </div>

              {/* Mobile Dish Card 1 */}
              <div className="p-3 space-y-2.5 bg-white">
                
                <div className="p-2.5 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-lg bg-[#FFB800] border-2 border-black flex items-center justify-center font-black text-lg shrink-0">
                    🍔
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-black text-xs text-black truncate">Smash Bacon Double</p>
                      <span className="font-black text-xs text-black">12,50 €</span>
                    </div>
                    <p className="text-[10px] text-neutral-700 line-clamp-1">Bœuf grillé, bacon fumé, cheddar affiné</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border-2 border-black bg-[#E0F2FE] shadow-[2px_2px_0px_0px_#000] flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-lg bg-white border-2 border-black flex items-center justify-center font-black text-lg shrink-0">
                    🍗
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-black text-xs text-black truncate">Crispy Tenders (x6)</p>
                      <span className="font-black text-xs text-black">8,90 €</span>
                    </div>
                    <p className="text-[10px] text-neutral-800 line-clamp-1">Poulet pané croustillant + sauce miel</p>
                  </div>
                </div>

              </div>

              {/* Bottom Phone Action CTA */}
              <div className="p-3 bg-neutral-100 border-t-2 border-black flex items-center justify-between">
                <span className="text-[10px] font-black text-neutral-800 uppercase">menufid.site/menu/...</span>
                <span className="text-[10px] font-black bg-[#FFB800] text-black px-3 py-1 rounded-full border border-black shadow-[1px_1px_0px_0px_#000]">
                  {t('view_dish', 'Commander')}
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
