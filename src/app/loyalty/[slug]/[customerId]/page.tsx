'use client';

/**
 * app/loyalty/[slug]/[customerId]/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Carte fidélité numérique du client.
 * Affiche son solde de points, un QR code dynamique, et les récompenses.
 *
 * Le solde est mis à jour en temps réel via polling léger toutes les 8s
 * (pour refléter les points ajoutés par le commerçant au scanner).
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Award, ArrowLeft, Smartphone, Sparkles, Star } from 'lucide-react';
import { db } from '@/lib/supabase';
import type { Merchant, Customer, Reward } from '@/types';

// ─── Intervalle de polling (ms) ───────────────────────────────
const POLL_INTERVAL = 8000;

// ─── Page ─────────────────────────────────────────────────────

export default function CustomerLoyaltyCardPage() {
  const router = useRouter();
  const { slug, customerId } = useParams<{ slug: string; customerId: string }>();

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadAll();
    // Démarrer le polling pour les mises à jour de points en direct
    pollingRef.current = setInterval(refreshCustomer, POLL_INTERVAL);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [slug, customerId]);

  async function loadAll() {
    try {
      const merchantRecord = await db.collection('users').getFirstListItem<Merchant>(
        `slug = "${slug}"`
      );
      if (merchantRecord) {
        setMerchant(merchantRecord);

        const [customerRecord, rewardList] = await Promise.all([
          db.collection('customers').getOne<Customer>(customerId),
          db.collection('rewards').getFullList<Reward>({
            filter: `merchant = "${merchantRecord.id}" && is_active = true`,
            sort: 'points_required',
          }),
        ]);

        setCustomer(customerRecord);
        setRewards(rewardList);
      }
    } catch (err) {
      console.error('[LoyaltyCard] Erreur de chargement:', err);
    }
  }

  /** Rafraîchit uniquement le solde client (optimisation réseau) */
  async function refreshCustomer() {
    if (!customerId) return;
    try {
      const updated = await db.collection('customers').getOne<Customer>(customerId);
      setCustomer(updated);
    } catch {
      // Silencieux en cas d'erreur réseau temporaire
    }
  }

  // ── Calcul de la progression ───────────────────────────────

  const activeRewards = rewards.filter((r) => r.is_active);
  const currentPoints = customer?.points_balance ?? 0;

  // Prochain cadeau non encore atteint
  const nextReward = activeRewards.find((r) => currentPoints < r.points_required)
    ?? activeRewards[activeRewards.length - 1];

  const targetPoints = nextReward?.points_required ?? 100;
  const progressPercent = Math.min(100, (currentPoints / targetPoints) * 100);

  const brandColor = merchant?.primary_color ?? '#b45309';

  // ── Gestion des boutons Wallet (UI uniquement pour l'instant) ──

  function handleAddToWallet(platform: 'apple' | 'google') {
    // TODO: Intégrer l'API PassKit via /api/wallet lorsque les clés sont configurées
    // Voir src/lib/wallet.ts pour la logique de génération
    const platformName = platform === 'apple' ? 'Apple Wallet' : 'Google Wallet';
    window.alert(`Intégration ${platformName} à configurer. Voir src/lib/wallet.ts.`);
  }

  // ── Rendu ──────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">

        {/* Retour au menu */}
        <button
          onClick={() => router.push(`/menu/${slug}`)}
          className="flex items-center text-xs text-slate-400 hover:text-slate-800 transition font-bold btn-press"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour au menu
        </button>

        {/* ── Carte numérique ── */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 space-y-8 shadow-md">
          {/* Halo décoratif */}
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-10 pointer-events-none"
            style={{ backgroundColor: brandColor }}
          />

          {/* Entête de la carte */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg text-white" style={{ backgroundColor: brandColor }}>
                <Award className="h-4 w-4" />
              </div>
              <span className="font-bold text-[10px] tracking-wide uppercase text-slate-400">
                Carte de fidélité
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono font-semibold">
              {customer?.id.substring(0, 8)}...
            </span>
          </div>

          {/* Solde de points */}
          <div className="space-y-2">
            <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">
              Mon solde
            </span>
            <div className="flex items-baseline justify-between">
              <h2 className="text-4xl font-black text-slate-900">{currentPoints} pts</h2>
              {nextReward && (
                <span className="text-xs text-slate-400 font-semibold">
                  Cadeau à {targetPoints} pts
                </span>
              )}
            </div>

            {/* Barre de progression */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%`, backgroundColor: brandColor }}
              />
            </div>
          </div>

          {/* QR code dynamique */}
          <div className="bg-slate-50 p-4 rounded-2xl w-44 h-44 mx-auto flex items-center justify-center shadow-sm border border-slate-100">
            {customer ? (
              <QRCodeSVG value={customer.id} size={144} level="L" includeMargin={false} />
            ) : (
              <div className="text-slate-400 text-xs font-semibold">Génération...</div>
            )}
          </div>

          {/* Pied de carte */}
          <div className="border-t border-slate-100 pt-4 flex justify-between items-end">
            <div>
              <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-bold">
                Titulaire
              </span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{customer?.name}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-bold">
                Établissement
              </span>
              <span className="font-bold text-sm mt-0.5 block" style={{ color: brandColor }}>
                {merchant?.business_name}
              </span>
            </div>
          </div>
        </div>

        {/* ── Boutons Wallet ── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAddToWallet('apple')}
            className="flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-bold text-white shadow-sm transition btn-press"
          >
            <Smartphone className="h-4 w-4 text-slate-300" />
            Apple Wallet
          </button>
          <button
            onClick={() => handleAddToWallet('google')}
            className="flex items-center justify-center gap-2 py-3.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition btn-press"
          >
            <Smartphone className="h-4 w-4 text-stone-400" />
            Google Wallet
          </button>
        </div>

        {/* ── Booster d'Avis Google 5 Étoiles ── */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 p-5 rounded-3xl space-y-3 shadow-xs text-center">
          <div className="flex justify-center items-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400 animate-pulse" />
            ))}
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-xs">Vous aimez {merchant?.business_name} ?</h4>
            <p className="text-slate-500 text-[11px] font-medium mt-0.5">
              Laissez-nous un avis 5 étoiles sur Google pour soutenir notre établissement !
            </p>
          </div>
          <a
            href={merchant?.google_review_url || `https://www.google.com/search?q=${encodeURIComponent(merchant?.business_name || '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-amber-700 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl shadow-xs transition btn-press"
          >
            <Star className="h-3.5 w-3.5 fill-white" />
            Laisser un avis 5 étoiles sur Google
          </a>
        </div>

        {/* ── Liste des récompenses ── */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            Cadeaux disponibles
          </h3>

          <div className="space-y-3">
            {activeRewards.map((reward) => {
              const hasEnough = currentPoints >= reward.points_required;
              return (
                <div
                  key={reward.id}
                  className={`p-3.5 border rounded-2xl flex justify-between items-center transition ${
                    hasEnough
                      ? 'bg-slate-50 border-amber-200'
                      : 'bg-white border-slate-100 opacity-60'
                  }`}
                >
                  <div className="space-y-0.5 max-w-[240px]">
                    <h4 className="font-bold text-xs text-slate-900 leading-tight">{reward.title}</h4>
                    <p className="text-[10px] text-stone-400 font-semibold line-clamp-1">{reward.description}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {hasEnough ? (
                      <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-100 px-2.5 py-0.5 rounded-full font-bold">
                        Disponible ✓
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">
                        -{reward.points_required - currentPoints} pts
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {activeRewards.length === 0 && (
              <p className="text-slate-400 text-xs text-center py-6 leading-relaxed font-semibold">
                Aucun cadeau disponible chez ce commerçant pour le moment.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
