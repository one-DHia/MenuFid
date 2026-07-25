'use client';

/**
 * app/dashboard/flyers/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Générateur de Chevalets de Table & Affiches QR Code prêt à imprimer.
 * Permet de personnaliser l'accroche, les couleurs, le format (A6, A5, A4)
 * et de télécharger/imprimer directement les visuels en PDF.
 */

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Sparkles, Layout, Palette, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type FormatType = 'a6' | 'a5' | 'a4';

export default function QrFlyerGeneratorPage() {
  const { merchant } = useAuth();

  const [headline, setHeadline] = useState('Scannez pour consulter la carte & accumuler vos points');
  const [subhead, setSubhead] = useState('Menu digital 100% interactif & Carte de fidélité mobile');
  const [accentColor, setAccentColor] = useState(merchant?.primary_color || '#b45309');
  const [format, setFormat] = useState<FormatType>('a6');

  const menuUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/menu/${merchant?.slug || ''}`
    : `https://menufid.com/menu/${merchant?.slug || ''}`;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-8">
      {/* ── En-tête no-print ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-200/60 pb-6 gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Générateur de Chevalets & Affiches QR Code
          </h1>
          <p className="text-stone-500 text-sm font-semibold mt-1">
            Imprimez en 1 clic vos supports de table et affiches pour votre établissement.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition flex items-center gap-2 self-start sm:self-auto btn-press"
        >
          <Printer className="h-4 w-4" />
          Imprimer / Enregistrer en PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Contrôles de personnalisation (no-print) ── */}
        <div className="lg:col-span-4 space-y-6 no-print">
          <div className="bg-white border border-stone-200/85 p-6 rounded-3xl space-y-5 shadow-sm">
            <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Palette className="h-5 w-5 text-amber-700" />
              Personnalisation
            </h2>

            {/* Titre d'accroche */}
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1">
                Titre principal d&apos;accroche
              </label>
              <textarea
                rows={2}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            {/* Sous-titre */}
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1">
                Sous-titre explicatif
              </label>
              <input
                type="text"
                value={subhead}
                onChange={(e) => setSubhead(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            {/* Couleur principale */}
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1">
                Couleur d&apos;accentuation
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-stone-200 cursor-pointer p-0.5"
                />
                <span className="text-xs font-mono text-stone-600 font-bold">{accentColor}</span>
              </div>
            </div>

            {/* Format du support */}
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-2">
                Format d&apos;impression
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'a6', label: 'Chevalet A6', desc: 'Table (10x15)' },
                  { id: 'a5', label: 'Affiche A5',  desc: 'Comptoir' },
                  { id: 'a4', label: 'Poster A4',   desc: 'Entrée / Vitrine' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormat(item.id as FormatType)}
                    className={`p-2.5 rounded-xl border text-center transition btn-press ${
                      format === item.id
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span className="block text-xs font-bold">{item.label}</span>
                    <span className="block text-[9px] text-stone-400 mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── PRÉVISUALISATION ET SUPPORT IMPRIMABLE (printable-menu) ── */}
        <div className="lg:col-span-8 flex justify-center">
          <div
            className={`printable-menu bg-white border border-stone-200 rounded-3xl p-8 sm:p-12 shadow-xl text-center space-y-6 flex flex-col justify-between items-center transition-all ${
              format === 'a6' ? 'max-w-xs aspect-[1/1.5]' : format === 'a5' ? 'max-w-md aspect-[1/1.4]' : 'max-w-xl aspect-[1/1.4]'
            }`}
          >
            {/* Entête du chevalet */}
            <div className="space-y-3 w-full">
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-2xl shadow-md"
                style={{ backgroundColor: accentColor }}
              >
                {(merchant?.business_name || 'M').charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {merchant?.business_name || 'Notre Restaurant'}
              </h2>
              <div
                className="h-1 w-16 mx-auto rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            </div>

            {/* Accroche */}
            <div className="space-y-2 max-w-sm">
              <p className="text-base sm:text-lg font-black text-stone-900 leading-snug">
                {headline}
              </p>
              <p className="text-xs text-stone-500 font-medium">
                {subhead}
              </p>
            </div>

            {/* QR Code central avec cadre élégant */}
            <div className="bg-stone-50 p-6 rounded-3xl border border-stone-200/80 shadow-inner flex flex-col items-center">
              <QRCodeSVG
                value={menuUrl}
                size={format === 'a6' ? 140 : format === 'a5' ? 180 : 220}
                level="H"
                includeMargin={false}
              />
              <span className="text-[10px] text-stone-400 font-mono mt-3 font-semibold">
                {menuUrl.replace('https://', '')}
              </span>
            </div>

            {/* Bas de page chevalet */}
            <div className="border-t border-stone-100 pt-4 w-full text-center space-y-1">
              <p className="text-xs font-bold text-stone-800 flex items-center justify-center gap-1">
                <Sparkles className="h-3.5 w-3.5" style={{ color: accentColor }} />
                Scannez avec l&apos;appareil photo de votre mobile
              </p>
              <p className="text-[10px] text-stone-400">Propulsé par MenuFid</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
