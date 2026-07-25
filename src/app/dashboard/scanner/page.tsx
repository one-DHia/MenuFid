'use client';

/**
 * app/dashboard/scanner/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Scanner de caisse : lit le QR code de la carte fidélité d'un client,
 * affiche son profil et permet de créer/valider des visites.
 *
 * L'AudioContext est créé uniquement lors du premier clic (non au montage),
 * pour respecter la politique Autoplay des navigateurs.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Scan, Camera, ShieldAlert, Award, CheckCircle, Plus, UserCheck, X } from 'lucide-react';
import { db } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { sanitizeFilterParam } from '@/lib/security';
import type { Customer, Reward } from '@/types';

// ─── Son de succès (créé à la demande pour respecter l'Autoplay Policy) ──

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.08;
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
    // Fermer le contexte après le bip
    setTimeout(() => ctx.close(), 500);
  } catch {
    // Ignorer si AudioContext non supporté
  }
}

// ─── Page ─────────────────────────────────────────────────────

export default function ScannerPage() {
  const { merchantId } = useAuth();
  const { showToast } = useToast();

  // État caméra
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);

  // État recherche manuelle
  const [manualInput, setManualInput] = useState('');
  const [searchError, setSearchError] = useState('');

  // Profil client actif
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([]);

  // Nettoyage caméra au démontage du composant
  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  // ── Gestion caméra ────────────────────────────────────────

  async function startCamera() {
    setCameraError(null);
    setActiveCustomer(null);
    setCameraActive(true);

    // Petit délai pour que React monte le conteneur HTML
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode('qr-reader-container');
        qrScannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => onScanSuccess(decodedText),
          () => {} // Erreurs de lecture ignorées (frame par frame)
        );
      } catch {
        setCameraError('Impossible d\'accéder à la caméra. Vérifiez les autorisations dans votre navigateur.');
        setCameraActive(false);
      }
    }, 300);
  }

  async function stopCamera() {
    if (qrScannerRef.current?.isScanning) {
      try {
        await qrScannerRef.current.stop();
      } catch {
        // Ignorer les erreurs de stop (scanner déjà arrêté)
      }
    }
    qrScannerRef.current = null;
    setCameraActive(false);
  }

  function onScanSuccess(decodedText: string) {
    playBeep();
    stopCamera();
    lookupCustomer(decodedText.trim());
  }

  // ── Recherche client ──────────────────────────────────────

  const lookupCustomer = useCallback(async (identifier: string) => {
    if (!identifier || !merchantId) return;
    setSearchError('');

    const safeId = sanitizeFilterParam(identifier);
    const safeMerchantId = sanitizeFilterParam(merchantId);

    try {
      const customer = await db.collection('customers').getFirstListItem<Customer>(
        `merchant = "${safeMerchantId}" && (id = "${safeId}" || email = "${safeId.toLowerCase()}")`
      );
      if (customer) {
        setActiveCustomer(customer);
        await loadEligibleRewards(customer.points_balance);
      } else {
        setActiveCustomer(null);
        setSearchError('Client introuvable. Vérifiez l\'ID ou l\'e-mail saisi.');
      }
    } catch {
      setActiveCustomer(null);
      setSearchError('Client introuvable. Vérifiez l\'ID ou l\'e-mail saisi.');
    }
  }, [merchantId]);

  async function loadEligibleRewards(pointsBalance: number) {
    try {
      const rewards = await db.collection('rewards').getFullList<Reward>({
        filter: `merchant = "${merchantId}" && is_active = true`,
        sort: 'points_required',
      });
      // Afficher uniquement les récompenses que le client peut débloquer
      setAvailableRewards(rewards.filter((r) => pointsBalance >= r.points_required));
    } catch {
      setAvailableRewards([]);
    }
  }

  function handleManualSearch(event: React.FormEvent) {
    event.preventDefault();
    if (!manualInput.trim()) return;
    lookupCustomer(manualInput.trim());
  }

  // ── Actions sur le client ─────────────────────────────────

  /** Enregistre une visite et ajoute 10 points au client */
  async function awardVisitPoints() {
    if (!activeCustomer) return;
    const POINTS_PER_VISIT = 10;

    try {
      const newBalance = activeCustomer.points_balance + POINTS_PER_VISIT;
      const updated = await db.collection('customers').update<Customer>(activeCustomer.id, {
        points_balance: newBalance,
      });

      await db.collection('visits').create({
        merchant: merchantId,
        customer: activeCustomer.id,
        points_awarded: POINTS_PER_VISIT,
      });

      setActiveCustomer(updated);
      await loadEligibleRewards(newBalance);
      showToast(`Visite enregistrée ! +${POINTS_PER_VISIT} points ajoutés à ${activeCustomer.name}.`, 'success');
    } catch {
      showToast('Erreur lors de l\'enregistrement de la visite.', 'error');
    }
  }

  /** Distribue un cadeau et déduit les points correspondants */
  async function claimReward(reward: Reward) {
    if (!activeCustomer) return;

    try {
      const newBalance = Math.max(0, activeCustomer.points_balance - reward.points_required);
      const updated = await db.collection('customers').update<Customer>(activeCustomer.id, {
        points_balance: newBalance,
      });

      setActiveCustomer(updated);
      await loadEligibleRewards(newBalance);
      showToast(`Cadeau "${reward.title}" distribué avec succès !`, 'success');
    } catch {
      showToast('Erreur lors de la distribution du cadeau.', 'error');
    }
  }

  // ── Rendu ─────────────────────────────────────────────────

  return (
    <div className="space-y-8 max-w-4xl mx-auto">

      {/* ── En-tête ── */}
      <div>
        <h1 className="text-2xl font-black text-stone-900">Scanner de Fidélité</h1>
        <p className="text-stone-500 text-sm mt-1 font-semibold">
          Scannez les QR codes de vos clients pour valider leurs visites et distribuer des cadeaux.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Panneau scanner ── */}
        <div className="bg-white border border-stone-200/85 p-6 rounded-3xl flex flex-col items-center justify-center gap-6 min-h-[350px] shadow-sm">

          {/* Vue caméra active */}
          {cameraActive ? (
            <div className="w-full space-y-4">
              <div
                id="qr-reader-container"
                className="w-full max-w-[280px] aspect-square mx-auto border border-stone-200 rounded-2xl overflow-hidden bg-black"
              />
              <button
                onClick={stopCamera}
                className="mx-auto block bg-red-50 border border-red-100 text-red-700 text-xs font-bold py-2 px-4 rounded-xl hover:bg-red-100 transition btn-press"
              >
                Arrêter la caméra
              </button>
            </div>
          ) : (
            /* Vue d'invitation au scan */
            <div className="text-center space-y-5 py-6">
              <div className="bg-amber-50 border border-amber-100 text-amber-700 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto">
                <Camera className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Activer l&apos;appareil photo</h3>
                <p className="text-stone-500 text-xs mt-1 max-w-[280px] mx-auto leading-relaxed font-semibold">
                  Scannez le QR code affiché sur la carte fidélité mobile du client.
                </p>
              </div>
              <button
                onClick={startCamera}
                className="bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md shadow-amber-100 transition flex items-center mx-auto gap-2 btn-press"
              >
                <Scan className="h-4 w-4" />
                Démarrer le scan
              </button>
            </div>
          )}

          {/* Message d'erreur caméra */}
          {cameraError && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2 w-full max-w-[320px]">
              <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
              {cameraError}
            </div>
          )}

          {/* Saisie manuelle — fallback sans caméra */}
          <div className="w-full border-t border-stone-100 pt-6">
            <h4 className="text-stone-400 text-xs font-bold text-center mb-3 uppercase tracking-wider">
              Saisie manuelle
            </h4>
            <form onSubmit={handleManualSearch} className="flex max-w-[320px] mx-auto gap-2">
              <input
                type="text"
                placeholder="E-mail ou ID client..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
              <button
                type="submit"
                className="bg-stone-900 hover:bg-stone-800 text-white px-4 rounded-xl text-xs font-bold transition btn-press"
              >
                OK
              </button>
            </form>
            {searchError && (
              <p className="text-red-500 text-[10px] text-center mt-2 font-bold">{searchError}</p>
            )}
          </div>
        </div>

        {/* ── Panneau client actif ── */}
        <div className="bg-white border border-stone-200/85 p-6 rounded-3xl shadow-sm">
          {activeCustomer ? (
            <div className="space-y-6">

              {/* Header client */}
              <div className="flex items-start justify-between border-b border-stone-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-900 text-lg">{activeCustomer.name}</h3>
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <UserCheck className="h-3 w-3" />
                      Client Fidèle
                    </span>
                  </div>
                  <p className="text-stone-500 text-xs font-semibold">{activeCustomer.email}</p>
                </div>
                <button
                  onClick={() => setActiveCustomer(null)}
                  className="text-stone-400 hover:text-stone-800 p-1 hover:bg-stone-50 rounded-lg transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Solde et bouton visite */}
              <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-stone-400 text-[10px] font-bold uppercase tracking-wider block">
                    Solde points
                  </span>
                  <span className="text-3xl font-black text-stone-900 mt-1 block">
                    {activeCustomer.points_balance}{' '}
                    <span className="text-xs text-amber-700 font-semibold">pts</span>
                  </span>
                </div>
                <button
                  onClick={awardVisitPoints}
                  className="bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md shadow-amber-100 transition flex items-center gap-1.5 btn-press"
                >
                  <Plus className="h-4 w-4" />
                  Visite (+10 pts)
                </button>
              </div>

              {/* Cadeaux disponibles */}
              <div className="space-y-3">
                <h4 className="font-bold text-stone-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-amber-700" />
                  Cadeaux débloqués ({availableRewards.length})
                </h4>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {availableRewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex justify-between items-center"
                    >
                      <div>
                        <h5 className="font-bold text-stone-900 text-xs">{reward.title}</h5>
                        <p className="text-stone-400 text-[10px] font-semibold">
                          {reward.points_required} pts requis
                        </p>
                      </div>
                      <button
                        onClick={() => claimReward(reward)}
                        className="bg-amber-700 hover:bg-amber-600 text-white text-[10px] font-bold py-1.5 px-3 rounded-xl shadow-sm transition btn-press"
                      >
                        Distribuer
                      </button>
                    </div>
                  ))}

                  {availableRewards.length === 0 && (
                    <p className="text-stone-400 text-xs text-center py-6 leading-relaxed font-semibold">
                      Ce client n&apos;a pas encore assez de points pour débloquer un cadeau.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* État vide — attente d'un scan */
            <div className="flex flex-col items-center justify-center text-center gap-4 py-16 h-full">
              <UserCheck className="h-10 w-10 text-stone-300" />
              <div>
                <h4 className="font-bold text-stone-500 text-sm">En attente d&apos;un scan</h4>
                <p className="text-stone-400 text-xs max-w-[200px] mt-1 mx-auto leading-relaxed font-medium">
                  Scannez la carte fidélité d&apos;un client pour voir son profil ici.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
