'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { 
  Award, 
  Trash2, 
  Edit2, 
  ArrowLeft, 
  Gift, 
  ToggleLeft,
  ToggleRight,
  Plus
} from 'lucide-react';
import type { Reward } from '@/types';
import ProFeatureLock from '@/components/ProFeatureLock';

export default function ProLoyaltyPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();
  const { merchant, isLoading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !merchant) {
      router.replace('/pro/login');
    }
  }, [mounted, isLoading, merchant, router]);

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Reward
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [stampsRequired, setStampsRequired] = useState('10');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (merchant?.id && merchant?.plan_tier !== 'basic') {
      loadRewards(merchant.id);
    }
  }, [merchant?.id, merchant?.plan_tier]);

  async function loadRewards(merchantId: string) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('stamps_required', { ascending: true });

      if (error) throw error;
      setRewards(data || []);
    } catch (e) {
      console.error('[ProLoyalty] Erreur:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveReward(e: React.FormEvent) {
    e.preventDefault();
    if (merchant?.plan_tier === 'basic') {
      showToast(t('feature_locked_title', 'Fonctionnalité réservée à la Formule PRO'), 'error');
      return;
    }
    if (!title.trim() || !stampsRequired || !merchant?.id) {
      showToast(t('fill_required_fields', 'Veuillez remplir les champs obligatoires'), 'error');
      return;
    }

    const payload = {
      merchant_id: merchant.id,
      title: title.trim(),
      description: desc.trim() || null,
      stamps_required: parseInt(stampsRequired, 10),
      is_active: true,
    };

    try {
      if (editingId) {
        const { data, error } = await supabase
          .from('rewards')
          .update(payload)
          .eq('id', editingId)
          .select()
          .single();

        if (error) throw error;
        setRewards((prev) => prev.map((r) => (r.id === editingId ? data : r)));
        showToast(t('reward_updated', 'Cadeau modifié !'), 'success');
      } else {
        const { data, error } = await supabase
          .from('rewards')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        setRewards((prev) => [...prev, data]);
        showToast(t('reward_added', 'Nouveau cadeau ajouté !'), 'success');
      }

      resetForm();
    } catch (err: any) {
      showToast(err.message || 'Erreur', 'error');
    }
  }

  async function toggleRewardActive(reward: Reward) {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .update({ is_active: !reward.is_active })
        .eq('id', reward.id)
        .select()
        .single();

      if (error) throw error;
      setRewards((prev) => prev.map((r) => (r.id === reward.id ? data : r)));
    } catch {
      showToast('Erreur', 'error');
    }
  }

  async function handleDeleteReward(id: string) {
    try {
      const { error } = await supabase.from('rewards').delete().eq('id', id);
      if (error) throw error;
      setRewards((prev) => prev.filter((r) => r.id !== id));
      showToast(t('reward_deleted', 'Cadeau supprimé'), 'success');
    } catch {
      showToast('Erreur', 'error');
    }
  }

  function startEdit(reward: Reward) {
    setEditingId(reward.id);
    setTitle(reward.title);
    setDesc(reward.description || '');
    setStampsRequired(reward.stamps_required.toString());
  }

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setDesc('');
    setStampsRequired('10');
  }

  if (!mounted || isLoading || !merchant) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Spinner size={36} className="text-black" />
      </div>
    );
  }

  if (merchant.plan_tier === 'basic') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
        <header className="bg-white border-b-4 border-black p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link
              href="/pro/dashboard"
              className="inline-flex items-center gap-2 text-xs font-black text-black hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('back_to_dashboard_btn', 'Retour au tableau de bord')}</span>
            </Link>
            <LanguageSelector />
          </div>
        </header>
        <ProFeatureLock
          featureName={t('loyalty_module_title', 'Programme de Fidélité Client')}
          featureDesc={t('loyalty_locked_desc', "La gestion de votre programme de fidélité, le catalogue de cadeaux et les tampons clients sont réservés aux établissements abonnés à la formule PRO.")}
          icon={<Award className="w-10 h-10 text-black" />}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black font-sans flex flex-col selection:bg-[#FFB800] selection:text-black">
      <header className="border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/pro/dashboard"
              className="p-2 rounded-xl text-black hover:bg-[#FFB800] border-2 border-transparent hover:border-black transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-black text-lg text-black tracking-tight">{t('loyalty_program', 'Programme de Fidélité')}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="neo-box p-6 space-y-4">
              <h2 className="font-black text-base text-black flex items-center gap-2">
                <Gift className="w-5 h-5" />
                {editingId ? t('edit_reward', 'Modifier la récompense') : t('add_gift', 'Ajouter un cadeau')}
              </h2>

              <form onSubmit={handleSaveReward} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-black mb-1">{t('gift_title', '* TITRE DU CADEAU')}</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('gift_title_placeholder', '🍰 ex: Dessert offert')}
                    className="w-full neo-input text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-black mb-1">{t('stamps_required', '* TAMPONS REQUIS')}</label>
                  <div className="flex items-center gap-2">
                    {[5, 10, 15, 20].map((pts) => (
                      <button
                        key={pts}
                        type="button"
                        onClick={() => setStampsRequired(pts.toString())}
                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition ${
                          stampsRequired === pts.toString()
                            ? 'bg-[#FFB800] border-black text-black shadow-[2px_2px_0px_0px_#000]'
                            : 'bg-white border-black text-black hover:bg-neutral-100'
                        }`}
                      >
                        {pts} pts
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={stampsRequired}
                    onChange={(e) => setStampsRequired(e.target.value)}
                    placeholder="10"
                    className="w-full neo-input text-xs mt-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-black mb-1">{t('gift_desc_label', 'DESCRIPTION / CONDITIONS')}</label>
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder={t('gift_desc_placeholder', '...ex: Valable pour tout repas consommé sur place')}
                    rows={3}
                    className="w-full neo-input text-xs resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2 flex-col sm:flex-row">
                  <button
                    type="submit"
                    className="neo-pill-btn py-3 px-4 flex-1 text-xs"
                  >
                    {editingId ? t('save_changes', 'Enregistrer les modifications') : t('add_the_gift', 'Ajouter le cadeau')}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="neo-pill-btn-white py-3 px-4 text-xs"
                    >
                      {t('cancel', 'Annuler')}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-black text-lg text-black flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span>{t('rewards_catalog', 'Catalogue des Récompenses')} ({rewards.length})</span>
            </h2>

            {rewards.length === 0 ? (
              <div className="neo-box border-dashed border-4 p-12 text-center space-y-3 bg-neutral-50">
                <Gift className="w-10 h-10 text-neutral-400 mx-auto" />
                <p className="text-neutral-600 text-xs font-bold uppercase tracking-wider">{t('no_rewards_yet', '.AUCUNE RÉCOMPENSE CONFIGURÉE POUR LE MOMENT')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className={`neo-box bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      reward.is_active ? '' : 'opacity-60 grayscale'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-pink-300 border-2 border-black text-black flex items-center justify-center font-black text-sm shrink-0 shadow-[2px_2px_0px_0px_#000]">
                        {reward.stamps_required} 🎫
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-black text-sm text-black uppercase tracking-tight">{reward.title}</h3>
                        {reward.description && (
                          <p className="text-neutral-600 font-medium text-xs">{reward.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => toggleRewardActive(reward)}
                        className={`p-2 rounded-xl border-2 transition shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none ${
                          reward.is_active
                            ? 'bg-white border-black text-black'
                            : 'bg-neutral-200 border-black text-neutral-500'
                        }`}
                        title={reward.is_active ? t('deactivate', 'Désactiver') : t('activate', 'Activer')}
                      >
                        {reward.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => startEdit(reward)}
                        className="p-2 rounded-xl bg-blue-300 border-2 border-black text-black transition shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className="p-2 rounded-xl bg-[#FF4747] border-2 border-black text-white transition shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
