'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';
import { Star, MessageSquareQuote, CheckCircle2, Plus, X, Send } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface Review {
  id: string;
  restaurant_name: string;
  owner_name?: string | null;
  city?: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

export default function RestaurantReviewsSection() {
  const { t, dir } = useLanguage();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isMerchantLoggedIn, setIsMerchantLoggedIn] = useState(false);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch('/api/reviews');
        const json = await res.json();
        if (json.success && Array.isArray(json.reviews)) {
          setReviews(json.reviews);
        } else {
          setReviews([]);
        }
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsMerchantLoggedIn(!!session);
    }

    loadReviews();
    checkAuth();
  }, []);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim() || comment.length < 5) {
      showToast('Veuillez saisir un commentaire d’au moins 5 caractères.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast('Veuillez vous connecter à votre Espace Pro pour laisser un avis.', 'error');
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          rating,
          comment,
          owner_name: ownerName,
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast('Merci ! Votre avis a été publié.', 'success');
        setModalOpen(false);
        setComment('');
        // Recharger les avis
        const refresh = await fetch('/api/reviews');
        const refreshJson = await refresh.json();
        if (refreshJson.success && refreshJson.reviews) {
          setReviews(refreshJson.reviews);
        }
      } else {
        showToast(json.error || 'Erreur lors de la publication de votre avis.', 'error');
      }
    } catch {
      showToast('Erreur réseau. Veuillez réessayer.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="py-16 sm:py-24 px-4 max-w-6xl mx-auto w-full" dir={dir}>
      {/* En-tête épuré */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB800]/20 border border-[#FFB800] text-black text-xs font-black">
            <Star className="w-3.5 h-3.5 fill-[#FFB800] text-[#FFB800]" />
            <span>{t('reviews_badge', 'Avis Restaurateurs Vérifiés')}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
            {t('reviews_title', 'Ce que disent les restaurateurs')}
          </h2>
          <p className="text-neutral-600 text-xs sm:text-sm font-medium">
            {t('reviews_subtitle', 'Retours d’expérience de professionnels qui utilisent MenuFid au quotidien.')}
          </p>
        </div>

        {/* Bouton pour laisser un avis */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-black shadow-[3px_3px_0px_0px_#FFB800] transition-all self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 text-[#FFB800]" />
          <span>{t('write_review_btn', 'Laisser un avis restaurateur')}</span>
        </button>
      </div>

      {/* Grille d'avis épurée et responsive - 100% Données Réelles */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white border-2 border-black/10 animate-pulse h-48 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-4 w-24 bg-neutral-200 rounded" />
                <div className="h-3 w-full bg-neutral-200 rounded" />
                <div className="h-3 w-3/4 bg-neutral-200 rounded" />
              </div>
              <div className="h-4 w-32 bg-neutral-200 rounded" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFB800] border-2 border-black flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_#000]">
            <MessageSquareQuote className="w-6 h-6 text-black" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-black">
              {t('no_reviews_title', 'Soyez le premier restaurateur à témoigner')}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium">
              {t('no_reviews_desc', 'Vous utilisez MenuFid dans votre établissement ? Partagez votre retour d’expérience et inspirez vos confrères.')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-black shadow-[3px_3px_0px_0px_#FFB800] transition-all"
          >
            <Plus className="w-4 h-4 text-[#FFB800]" />
            <span>{t('write_first_review_btn', 'Partager mon avis vérifié')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-3xl bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between hover:translate-y-[-2px] transition-transform duration-200"
            >
              <div className="space-y-3">
                {/* Étoiles */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= rev.rating
                          ? 'fill-[#FFB800] text-[#FFB800]'
                          : 'text-neutral-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Commentaire */}
                <p className="text-xs sm:text-sm text-neutral-800 font-medium leading-relaxed italic">
                  « {rev.comment} »
                </p>
              </div>

              {/* Auteur & Restaurant */}
              <div className="pt-4 mt-4 border-t-2 border-neutral-100 flex items-center justify-between">
                <div>
                  <p className="font-black text-xs sm:text-sm text-black">
                    {rev.restaurant_name}
                  </p>
                  <p className="text-[11px] font-bold text-neutral-500">
                    {rev.owner_name ? `${rev.owner_name} • ` : ''}{rev.city || 'France'}
                  </p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Soumission d'Avis */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black rounded-3xl shadow-[10px_10px_0px_0px_#000] max-w-lg w-full p-6 sm:p-8 relative">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 text-black border-2 border-black"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl sm:text-2xl font-black text-black mb-1">
              {t('review_modal_title', 'Partagez votre avis')}
            </h3>
            <p className="text-xs text-neutral-600 font-medium mb-6">
              {t('review_modal_sub', 'Votre retour d’expérience aide d’autres restaurateurs à faire leur choix.')}
            </p>

            {isMerchantLoggedIn ? (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Sélecteur d'étoiles */}
                <div>
                  <label className="block text-xs font-black uppercase text-neutral-700 mb-1.5">
                    {t('review_rating_label', 'Votre note')}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-2xl hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rating
                              ? 'fill-[#FFB800] text-[#FFB800]'
                              : 'text-neutral-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-black text-black">
                      {rating} / 5
                    </span>
                  </div>
                </div>

                {/* Nom du gérant (optionnel) */}
                <div>
                  <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                    {t('review_owner_label', 'Votre prénom / fonction')}
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder={t('review_owner_ph', 'Ex: Karim (Gérant)')}
                    maxLength={50}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
                  />
                </div>

                {/* Commentaire */}
                <div>
                  <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                    {t('review_comment_label', 'Votre commentaire')}
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t('review_comment_ph', 'Ce que MenuFid a changé pour votre restaurant, vos commandes ou votre fidélité client...')}
                    maxLength={600}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-black text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FFB800] resize-none"
                  />
                  <div className="text-[10px] text-neutral-400 text-right mt-1">
                    {comment.length} / 600
                  </div>
                </div>

                {/* Bouton Soumettre */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#FFB800] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? t('review_submitting', 'Publication...') : t('review_submit_btn', 'Publier mon avis')}</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-black flex items-center justify-center mx-auto text-xl">
                  🔒
                </div>
                <p className="text-xs font-bold text-neutral-700 max-w-sm mx-auto">
                  {t('review_auth_required', 'Pour garantir l’authenticité des avis, vous devez être connecté à votre compte restaurateur MenuFid.')}
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Link
                    href="/login"
                    className="px-6 py-2.5 rounded-full bg-black text-white text-xs font-black shadow-[2px_2px_0px_0px_#FFB800]"
                  >
                    {t('review_login_pro', 'Se connecter à l’Espace Pro')}
                  </Link>
                  <Link
                    href="/pro/register"
                    className="px-6 py-2.5 rounded-full bg-white border-2 border-black text-black text-xs font-black shadow-[2px_2px_0px_0px_#000]"
                  >
                    {t('review_register_pro', 'Créer mon compte')}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
