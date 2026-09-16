'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { UtensilsCrossed, Lock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';

export default function ProResetPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLanguage();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!password || !confirmPassword) {
      showToast(t('error_fill_all_fields', 'Veuillez remplir tous les champs'), 'error');
      return;
    }

    if (password.length < 8) {
      showToast(t('password_min_8', 'Le mot de passe doit contenir au moins 8 caractères'), 'error');
      return;
    }

    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      showToast(t('password_letter_number', 'Le mot de passe doit contenir au moins une lettre et un chiffre'), 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast(t('passwords_do_not_match', 'Les mots de passe ne correspondent pas'), 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (error) throw error;

      setSuccess(true);
      showToast(t('password_updated_success', 'Mot de passe mis à jour avec succès !'), 'success');
      
      setTimeout(() => {
        router.push('/pro/dashboard');
      }, 2000);
    } catch (err: any) {
      showToast(err.message || t('error_generic', 'Erreur lors de la mise à jour'), 'error');
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
            {t('new_password_title', 'Nouveau mot de passe')}
          </h1>
          <p className="text-neutral-600 font-bold text-xs sm:text-sm">
            {t('new_password_subtitle', 'Définissez un mot de passe sécurisé pour votre espace')}
          </p>
        </div>

        {/* Box Néobrutaliste */}
        <div className="neo-box bg-white p-8 space-y-6">
          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border-2 border-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#000]">
                <CheckCircle2 className="w-8 h-8 text-emerald-700" />
              </div>
              <h3 className="font-black text-lg text-black uppercase">
                {t('password_changed_title', 'Mot de passe modifié !')}
              </h3>
              <p className="text-xs text-neutral-600 font-bold">
                {t('redirecting_dashboard', 'Redirection vers votre tableau de bord...')}
              </p>
              <div className="pt-4">
                <Link
                  href="/pro/dashboard"
                  className="neo-pill-btn w-full py-3 text-xs inline-flex items-center justify-center gap-2"
                >
                  <span>{t('access_dashboard_now', 'Accéder au Dashboard')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wider">
                  {t('new_password_label', 'Nouveau mot de passe (min 8 car.)')}
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-black absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full neo-input pl-11 text-sm text-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wider">
                  {t('confirm_new_password_label', 'Confirmer le nouveau mot de passe')}
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-black absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full neo-input pl-11 text-sm text-black"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border-2 border-black text-[11px] text-neutral-600 font-bold space-y-1">
                <div className="flex items-center gap-1.5 text-black font-black">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t('security_requirements', 'Exigences de sécurité :')}</span>
                </div>
                <p>• {t('req_min_8', 'Minimum 8 caractères')}</p>
                <p>• {t('req_letter_number', 'Au moins 1 lettre et 1 chiffre')}</p>
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
                    <span>{t('update_password_btn', 'Enregistrer le nouveau mot de passe')}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition transform" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-4 border-t-2 border-black text-center">
            <Link href="/pro/login" className="text-neutral-700 font-black text-xs hover:underline">
              {t('cancel_back_login', 'Annuler et retourner à la connexion')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
