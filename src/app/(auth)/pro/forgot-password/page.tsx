'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { UtensilsCrossed, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';

export default function ProForgotPasswordPage() {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      showToast(t('error_fill_all_fields', 'Veuillez saisir votre adresse email'), 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('error_generic', 'Erreur lors de l\'envoi'));
      }

      setSubmitted(true);
      showToast(t('reset_email_sent_toast', 'Lien de réinitialisation envoyé avec succès !'), 'success');
    } catch (err: any) {
      showToast(err.message || t('error_generic', 'Erreur lors de l\'envoi'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans selection:bg-[#FFB800] selection:text-black">
      {/* Floating Language Selector */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Header Logo Brand */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-xl bg-[#FFB800] border-2 border-black flex items-center justify-center text-black shadow-[4px_4px_0px_0px_#000] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">
              <UtensilsCrossed className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-black tracking-tight text-black leading-none">
              Menu<span className="bg-[#FFB800] px-1.5 ml-0.5 rounded border-2 border-black">Fid</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black uppercase">
            {t('forgot_password_title', 'Mot de passe oublié')}
          </h1>
          <p className="text-neutral-600 font-bold text-xs sm:text-sm">
            {t('forgot_password_subtitle', 'Recevez un lien sécurisé par email pour réinitialiser votre accès')}
          </p>
        </div>

        {/* Box Néobrutaliste */}
        <div className="neo-box bg-white p-8 space-y-6">
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border-2 border-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#000]">
                <CheckCircle2 className="w-8 h-8 text-emerald-700" />
              </div>
              <h3 className="font-black text-lg text-black uppercase">
                {t('email_sent_title', 'Vérifiez votre boîte mail')}
              </h3>
              <p className="text-xs text-neutral-600 font-bold leading-relaxed">
                {t('email_sent_desc', 'Un email contenant le lien de réinitialisation a été envoyé à')} <span className="text-black font-black">{email}</span>. {t('check_spam_notice', 'Pensez à vérifier vos courriers indésirables.')}
              </p>
              <div className="pt-4">
                <Link
                  href="/pro/login"
                  className="neo-pill-btn-white w-full py-3 text-xs inline-flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('back_to_login', 'Retour à la connexion')}</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wider">
                  {t('email_pro_label', 'Email professionnel de votre restaurant')}
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-black absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@restaurant.com"
                    className="w-full neo-input pl-11 text-sm text-black"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="neo-pill-btn w-full py-4 text-sm flex justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? (
                  <Spinner size={20} className="text-black" />
                ) : (
                  <>
                    <span>{t('send_reset_link_btn', 'Envoyer le lien de réinitialisation')}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition transform" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-4 border-t-2 border-black text-center">
            <Link href="/pro/login" className="text-neutral-700 font-black text-xs hover:underline inline-flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('remembered_password', 'Je me souviens de mon mot de passe')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
