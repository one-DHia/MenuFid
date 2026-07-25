'use client';

/**
 * app/dashboard/plugins/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Gestionnaire des modules/plugins optionnels de la carte.
 * Chaque plugin activé enrichit l'affichage côté client (carte publique).
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Utensils, Award, ToggleLeft, ToggleRight, Info, ShieldCheck } from 'lucide-react';
import { db } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import type { PluginsConfig } from '@/types';

// ─── Définition des plugins disponibles ──────────────────────

type PluginKey = keyof Pick<PluginsConfig, 'allergens' | 'options' | 'featured'>;

interface PluginDefinition {
  key: PluginKey;
  label: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const PLUGINS: PluginDefinition[] = [
  {
    key: 'allergens',
    label: 'Allergènes & Régimes',
    description: 'Affichez des étiquettes (Végan, Sans Gluten, Bio, Épicé) et permettez aux clients de filtrer la carte.',
    Icon: Utensils,
  },
  {
    key: 'options',
    label: 'Choix & Suppléments',
    description: 'Personnalisation des produits : sauces, degrés de cuisson, ingrédients supplémentaires payants.',
    Icon: Sparkles,
  },
  {
    key: 'featured',
    label: 'Plats Vedettes',
    description: 'Épinglez vos meilleures ventes ou plats du jour dans une section étoilée en haut de la carte.',
    Icon: Award,
  },
];

type PluginState = Record<PluginKey, boolean>;

const DEFAULT_STATE: PluginState = {
  allergens: false,
  options: false,
  featured: false,
};

// ─── Page ─────────────────────────────────────────────────────

export default function PluginsPage() {
  const { merchantId } = useAuth();
  const { showToast } = useToast();

  const [pluginState, setPluginState] = useState<PluginState>(DEFAULT_STATE);
  const [recordId, setRecordId] = useState<string | null>(null);

  useEffect(() => { loadPlugins(); }, [merchantId]);

  async function loadPlugins() {
    if (!merchantId) return;
    try {
      const record = await db.collection('plugins_config').getFirstListItem<PluginsConfig>(
        `merchant = "${merchantId}"`
      );
      if (record) {
        setRecordId(record.id);
        setPluginState({
          allergens: record.allergens,
          options: record.options,
          featured: record.featured,
        });
      } else {
        setPluginState(DEFAULT_STATE);
      }
    } catch {
      // Pas encore de configuration — on utilise les valeurs par défaut
      setPluginState(DEFAULT_STATE);
    }
  }

  async function togglePlugin(key: PluginKey) {
    const updated: PluginState = { ...pluginState, [key]: !pluginState[key] };
    // Mise à jour optimiste de l'UI avant la requête réseau
    setPluginState(updated);

    try {
      if (recordId) {
        await db.collection('plugins_config').update(recordId, updated);
      } else {
        const created = await db.collection('plugins_config').create<PluginsConfig>({
          merchant: merchantId,
          ...updated,
        });
        setRecordId(created.id);
      }
      showToast('Configuration sauvegardée.', 'success');
    } catch {
      // Annuler le changement optimiste en cas d'erreur
      setPluginState(pluginState);
      showToast('Impossible de sauvegarder la configuration.', 'error');
    }
  }

  return (
    <div className="space-y-6">

      {/* ── En-tête ── */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Modules & Extensions
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">
            Personnalisez et activez des options avancées pour votre carte en ligne.
          </p>
        </div>
      </div>

      {/* ── Bannière d'information ── */}
      <div className="bg-amber-50/50 border border-amber-100/75 rounded-2xl p-4 flex items-start gap-3 max-w-3xl">
        <Info className="h-5 w-5 text-amber-700 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-slate-600 font-medium">
          <p className="font-bold text-amber-800 mb-1">Activation instantanée</p>
          <p>
            L&apos;activation d&apos;un module ajoute automatiquement de nouveaux champs dans l&apos;éditeur
            et met à jour l&apos;affichage de vos clients en temps réel.
          </p>
        </div>
      </div>

      {/* ── Grille des plugins ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
        {PLUGINS.map(({ key, label, description, Icon }) => {
          const isActive = pluginState[key];

          return (
            <div
              key={key}
              className={`bg-white border p-6 rounded-3xl flex flex-col justify-between gap-6 transition shadow-xs ${
                isActive ? 'border-amber-600 ring-1 ring-amber-500/10' : 'border-slate-200'
              }`}
            >
              <div className="space-y-4">
                {/* Icône + toggle */}
                <div className="flex justify-between items-start">
                  <div className="bg-amber-50 border border-amber-100 text-amber-700 p-2.5 rounded-2xl">
                    <Icon className="h-5 w-5" />
                  </div>
                  <button
                    onClick={() => togglePlugin(key)}
                    className="focus:outline-none transition btn-press"
                    aria-label={isActive ? `Désactiver ${label}` : `Activer ${label}`}
                  >
                    {isActive
                      ? <ToggleRight className="h-7 w-7 text-amber-700" />
                      : <ToggleLeft className="h-7 w-7 text-slate-400" />
                    }
                  </button>
                </div>

                {/* Texte */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{label}</h3>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-medium">
                    {description}
                  </p>
                </div>
              </div>

              {/* Pied de carte — statut */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Statut</span>
                <span className={isActive ? 'text-amber-700' : 'text-slate-400'}>
                  {isActive ? 'Activé ✓' : 'Inactif'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
