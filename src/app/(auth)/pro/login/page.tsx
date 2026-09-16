'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { UtensilsCrossed, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';

export default function ProLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      showToast(t('error_fill_all_fields', 'Veuillez remplir tous les champs'), 'error');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        showToast(t('success_login', 'Connexion réussie !'), 'success');

        const userId = data.session.user.id;
        const isProduction = window.location.protocol === 'https:';
        const secureFlag = isProduction ? '; Secure' : '';
        document.cookie = `menufid_merchant_id=${userId}; path=/; max-age=315360000; SameSite=Lax${secureFlag}`;
        localStorage.setItem('menufid_merchant_id', userId);

        const { data: merchData } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (merchData) {
          localStorage.setItem('menufid_merchant_profile', JSON.stringify(merchData));
          localStorage.setItem('menufid_merchant_name', merchData.business_name || '');
          localStorage.setItem('menufid_merchant_slug', merchData.slug || '');
          localStorage.setItem('menufid_plan_tier', merchData.plan_tier || 'loyalty');

          const isSuspendedOrUnpaid = merchData.is_suspended || 
                                     merchData.plan_status === 'past_due' || 
                                     merchData.plan_status === 'canceled';

          if (isSuspendedOrUnpaid) {
            router.push('/pro/suspended');
            return;
          }
        }

        router.push('/pro/dashboard');
      }
    } catch (err: any) {
      showToast(err.message || t('error_invalid_credentials', 'Identifiants invalides'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4 selection:bg-[#FFB800] selection:text-black relative font-sans">
      
      {/* Top Controls: Back to Home & Language Selector */}
      <div className="absolute top-[max(1rem,calc(env(safe-area-inset-top)+0.5rem))] left-4 z-50">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-black bg-white hover:bg-neutral-50 px-3.5 py-2 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back_to_home', 'Retour à l\'accueil')}</span>
        </Link>
      </div>

      <div className="absolute top-[max(1rem,calc(env(safe-area-inset-top)+0.5rem))] right-4 z-50">
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
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black uppercase">{t('pro_login_title', 'Espace Restaurateur')}</h1>
          <p className="text-neutral-600 font-bold text-xs sm:text-sm">{t('pro_login_subtitle', 'Connectez-vous à votre tableau de bord SaaS')}</p>
        </div>

        {/* Form Box (Néobrutaliste) */}
        <div className="neo-box bg-white p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wider">{t('email_pro_label', 'Email professionnel')}</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-black absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="restaurateur@menufid.com"
                  className="w-full neo-input pl-11 text-sm text-black"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black text-black uppercase tracking-wider">{t('password_label', 'Mot de passe')}</label>
                <Link href="/pro/forgot-password" className="text-[11px] font-bold text-neutral-600 hover:text-black hover:underline">
                  {t('forgot_password_q', 'Mot de passe oublié ?')}
                </Link>
              </div>
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

            <button
              type="submit"
              disabled={loading}
              className="neo-pill-btn w-full py-4 text-sm flex justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <Spinner size={20} className="text-black" />
              ) : (
                <>
                  <span>{t('connect_dashboard_btn', 'Se connecter au Dashboard Pro')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t-2 border-black text-center">
            <p className="text-neutral-600 text-xs font-bold">
              {t('no_pro_account', "Vous n'avez pas encore de compte pro ?")} {' '}
              <Link href="/pro/register" className="text-blue-600 font-black hover:underline block mt-1 uppercase">
                {t('create_pro_account', 'Créer un compte restaurateur')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
