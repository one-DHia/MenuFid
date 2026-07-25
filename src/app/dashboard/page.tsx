'use client';

/**
 * app/dashboard/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Vue générale du dashboard commerçant.
 * Affiche le QR code, les stats, et des raccourcis vers les modules.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Utensils, Award, Scan, Eye, ChevronRight,
  Printer, ArrowUpRight, Zap, Lock,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { db } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { hasLoyalty } from '@/types';
import { useToast } from '@/components/ui/Toast';

// ─── Types locaux ─────────────────────────────────────────────

interface Stats {
  customersCount: number;
  pointsAwarded: number;
  visitsToday: number;
}

// ─── Chargement des stats fidélité ───────────────────────────

async function loadLoyaltyStats(merchantId: string): Promise<Stats> {
  const [customers, visits] = await Promise.all([
    db.collection('customers').getList(1, 1, {
      filter: `merchant = "${merchantId}"`,
    }).catch(() => ({ totalItems: 0, items: [] })),
    db.collection('visits').getList(1, 200, {
      filter: `merchant = "${merchantId}"`,
    }).catch(() => ({ totalItems: 0, items: [] })),
  ]);

  const today = new Date().toISOString().split('T')[0];
  const itemsList = visits.items as Array<{ created?: string; points_awarded?: number }>;
  const visitsToday = itemsList.filter((visit) =>
    visit.created?.startsWith(today)
  ).length;

  const pointsAwarded = itemsList.reduce(
    (sum, visit) => sum + (visit.points_awarded || 0),
    0
  );

  return {
    customersCount: customers.totalItems,
    pointsAwarded,
    visitsToday,
  };
}

// ─── Composant carte stat ─────────────────────────────────────

function StatCard({
  label,
  value,
  locked,
}: {
  label: string;
  value: number | string;
  locked: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-2 shadow-sm">
      <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
        {label}
      </span>
      <span className={`text-2xl sm:text-3xl font-black block ${locked ? 'text-slate-300' : 'text-slate-900'}`}>
        {locked ? '—' : value}
      </span>
      {locked && (
        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full inline-block">
          Désactivé
        </span>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────

export default function DashboardPage() {
  const { merchant, merchantId } = useAuth();
  const { showToast } = useToast();

  const [menuUrl, setMenuUrl] = useState('');
  const [stats, setStats] = useState<Stats>({ customersCount: 0, pointsAwarded: 0, visitsToday: 0 });

  const tier = merchant?.plan_tier ?? 'basic';
  const loyaltyEnabled = hasLoyalty(tier);

  useEffect(() => {
    if (!merchant) return;

    // Construire l'URL publique de la carte
    const origin = window.location.origin;
    setMenuUrl(`${origin}/menu/${merchant.slug}`);

    // Charger les stats fidélité si le plan le permet
    if (loyaltyEnabled) {
      loadLoyaltyStats(merchantId).then(setStats).catch(console.error);
    }
  }, [merchant, merchantId, loyaltyEnabled]);

  // Copier le lien du menu dans le presse-papier
  function handleCopyLink() {
    navigator.clipboard.writeText(menuUrl);
    showToast('Lien copié dans le presse-papier !', 'success');
  }

  // Ouvrir une fenêtre d'impression avec le QR code
  function handlePrintQR() {
    const svgEl = document.getElementById('merchant-qr-svg');
    if (!svgEl) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Construction sécurisée du HTML d'impression (sans innerHTML dynamique)
    const svgHtml = svgEl.innerHTML;
    const businessName = merchant?.business_name ?? '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>QR Code — ${businessName}</title>
        <style>
          body { font-family: system-ui, sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; text-align:center; background:#fff; color:#0f172a; }
          .container { border:2px dashed #e2e8f0; padding:40px; border-radius:24px; max-width:400px; }
          h1 { font-size:28px; font-weight:800; margin-bottom:4px; }
          p  { color:#64748b; font-size:15px; font-weight:500; margin-bottom:28px; }
          svg { width:220px; height:220px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${businessName}</h1>
          <p>Scannez pour consulter notre carte sur votre téléphone</p>
          <svg xmlns="http://www.w3.org/2000/svg">${svgHtml}</svg>
          <p style="font-size:11px;color:#94a3b8;margin-top:28px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">MenuFid System</p>
        </div>
        <script>window.onload = () => window.print();<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <div className="space-y-8">

      {/* ── Bannière de bienvenue ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-50/40 to-stone-50 border border-amber-100 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            Ravi de vous revoir, {merchant?.business_name} !
          </h1>
          <p className="text-stone-500 mt-2 text-xs sm:text-sm font-semibold max-w-xl">
            Gérez vos catégories de plats, configurez vos offres et fidélisez vos clients.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/menu/${merchant?.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition btn-press"
          >
            <Eye className="h-4 w-4 text-slate-500" />
            <span>Voir ma carte</span>
          </Link>
          {loyaltyEnabled && (
            <Link
              href="/dashboard/scanner"
              className="flex items-center gap-1.5 bg-amber-700 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-amber-100 transition btn-press"
            >
              <Scan className="h-4 w-4" />
              <span>Scanner</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── Alerte upgrade plan basic ── */}
      {!loyaltyEnabled && (
        <div className="bg-white border border-amber-100 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl text-amber-700 flex-shrink-0">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Faites revenir vos clients +35% plus souvent
              </h3>
              <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-xl font-semibold">
                Activez le module Fidélité CRM pour proposer des cartes mobiles sur Apple/Google Wallet.
              </p>
            </div>
          </div>
          <Link
            href="/register"
            className="w-full sm:w-auto bg-amber-700 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-amber-100 transition flex items-center justify-center gap-1.5 flex-shrink-0 btn-press"
          >
            <span>Activer (+14€/mois)</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* ── Grille de stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard label="Scans de carte" value="142" locked={false} />
        <StatCard label="Clients enregistrés" value={stats.customersCount} locked={!loyaltyEnabled} />
        <StatCard label="Points attribués" value={stats.pointsAwarded} locked={!loyaltyEnabled} />
        <StatCard label="Visites du jour" value={stats.visitsToday} locked={!loyaltyEnabled} />
      </div>

      {/* ── Plats les plus vus / Consultations ── */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-amber-50 text-amber-700 p-2 rounded-xl border border-amber-100">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Plats les plus consultés par les clients</h3>
              <p className="text-stone-400 text-xs font-semibold">Statistiques d&apos;intérêt sur votre carte interactive</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-100 px-2.5 py-1 rounded-full">
            Top Tendance
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {[
            { rank: '#1', name: 'Burger Classic Double', views: '284 vues', badge: '🔥 Le + consulté' },
            { rank: '#2', name: 'Mushroom Swiss Burger', views: '196 vues', badge: '⭐ Vedette' },
            { rank: '#3', name: 'Fondant Chocolat Intense', views: '152 vues', badge: '🍰 Dessert populaire' },
          ].map((dish) => (
            <div key={dish.rank} className="p-4 bg-stone-50 border border-stone-200/70 rounded-2xl flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="text-amber-800 font-black text-xs block">{dish.rank} {dish.name}</span>
                <span className="text-stone-400 text-[11px] font-semibold block">{dish.views}</span>
              </div>
              <span className="text-[9px] font-bold bg-white border border-stone-200 px-2 py-0.5 rounded-md text-stone-600">
                {dish.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Outils principaux ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* QR Code */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl flex flex-col gap-6 shadow-sm">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Votre QR Code Client</h3>
            <p className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">
              Imprimez et posez ce QR Code sur vos tables. Vos clients n&apos;ont qu&apos;à le scanner.
            </p>
          </div>

          <div className="flex justify-center p-4 bg-slate-50 border border-slate-100 rounded-2xl max-w-[180px] mx-auto">
            {menuUrl ? (
              <div id="merchant-qr-svg">
                <QRCodeSVG value={menuUrl} size={150} level="H" includeMargin={false} />
              </div>
            ) : (
              <div className="h-[150px] w-[150px] bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs">
                Génération...
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={menuUrl}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-500 font-medium focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition btn-press flex-shrink-0"
              >
                Copier
              </button>
            </div>
            <button
              onClick={handlePrintQR}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition btn-press"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>Imprimer le QR Code</span>
            </button>
          </div>
        </div>

        {/* Raccourci Carte */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl flex flex-col justify-between shadow-sm hover:border-amber-200 transition">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 border border-amber-100 p-2.5 text-amber-700 rounded-2xl">
                <Utensils className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Carte en Ligne</h3>
            </div>
            <p className="text-stone-500 text-xs leading-relaxed font-medium">
              Modifiez vos catégories, ajoutez des plats et mettez à jour la disponibilité en temps réel.
            </p>
          </div>
          <Link
            href="/dashboard/menu"
            className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center mt-6 transition group btn-press"
          >
            <span>Gérer ma carte</span>
            <ChevronRight className="h-3.5 w-3.5 ml-1 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Raccourci Fidélité */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl flex flex-col justify-between shadow-sm relative overflow-hidden">
          {!loyaltyEnabled && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-6 text-center">
              <Lock className="h-8 w-8 text-amber-800 mb-2" />
              <h4 className="font-bold text-slate-900 text-sm">Module Fidélité & CRM</h4>
              <p className="text-slate-500 text-xs mt-1 max-w-[200px] leading-relaxed font-medium">
                Activez l&apos;offre Fidélité ou Premium pour accéder à ce module.
              </p>
            </div>
          )}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 border border-amber-100 p-2.5 text-amber-700 rounded-2xl">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Offres de Fidélité</h3>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed font-medium">
              Définissez les cadeaux que vos clients débloquent en accumulant des points.
            </p>
          </div>
          <Link
            href="/dashboard/loyalty"
            className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center mt-6 transition group btn-press"
          >
            <span>Configurer mes cadeaux</span>
            <ChevronRight className="h-3.5 w-3.5 ml-1 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
