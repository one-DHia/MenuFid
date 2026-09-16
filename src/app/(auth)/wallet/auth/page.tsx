'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { walletService } from '@/lib/services/walletService';
import { useToast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { Wallet, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { supabase } from '@/lib/supabase';

function WalletAuthHeader() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const redirectSlug = searchParams.get('redirect');
  const [isNativeApp, setIsNativeApp] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isApp = !!(window as any).MenuFidAndroid || navigator.userAgent.includes('MenuFidWalletAndroid');
      setIsNativeApp(isApp);
    }
  }, []);

  return (
    <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-5 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-3">
        {redirectSlug ? (
          <Link
            href={`/wallet/${redirectSlug}`}
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-black bg-white hover:bg-neutral-50 px-3.5 py-2 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back_to_menu', 'Retour au Restaurant')}</span>
          </Link>
        ) : !isNativeApp ? (
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-black bg-white hover:bg-neutral-50 px-3.5 py-2 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back_to_home', 'Retour à l\'accueil')}</span>
          </Link>
        ) : null}

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#FFB800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
            <Wallet className="w-5 h-5 text-black" />
          </div>
          <span className="font-black text-lg tracking-tight">MenuFid Wallet</span>
        </div>
      </div>

      <LanguageSelector />
    </header>
  );
}

function WalletAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectSlug = searchParams.get('redirect');
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirection automatique si le client a DÉJÀ un compte localement !
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('menufid_customer_id');
      if (storedId) {
        if (redirectSlug) {
          router.push(`/wallet/${redirectSlug}`);
        } else {
          router.push('/wallet');
        }
      }
    }
  }, [router, redirectSlug]);

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const redirectUrl = window.location.origin + '/wallet/auth/callback' + (redirectSlug ? `?redirect=${redirectSlug}` : '');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      showToast(err.message || t('error_google_auth', 'Erreur d\'authentification Google'), 'error');
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast(t('error_enter_email', 'Veuillez entrer une adresse email valide'), 'error');
      return;
    }

    if (!password || password.length < 6) {
      showToast(t('password_min_length', 'Le mot de passe doit contenir au moins 6 caractères'), 'error');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        // Tentative de connexion via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (authError) {
          // Si l'utilisateur n'existe pas dans Supabase Auth, on vérifie dans la table customers
          const customer = await walletService.getOrCreateCustomer(cleanEmail);
          if (customer) {
            storeCustomerLocally(customer);
            showToast(t('success_login', 'Connexion réussie !'), 'success');
            navigateAfterLogin();
            return;
          }
          throw authError;
        }

        // Utilisateur connecté dans Supabase Auth
        const customer = await walletService.getOrCreateCustomer(cleanEmail);
        storeCustomerLocally(customer);
        showToast(t('success_login', 'Connexion réussie !'), 'success');
        navigateAfterLogin();
      } else {
        // Mode Création de compte (Sign up)
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });

        if (signUpError && !signUpError.message.includes('already registered')) {
          throw signUpError;
        }

        if (signUpData?.user) {
          try {
            // Même si confirmation requise ou non, on provisionne la carte fidélité dans customers
            const customer = await walletService.getOrCreateCustomer(cleanEmail);
            storeCustomerLocally(customer);
          } catch (custErr: any) {
            console.error('Customer profile provision failed, rolling back auth:', custErr);
            try {
              await fetch('/api/auth/rollback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: signUpData.user.id }),
              });
            } catch (rollbackErr) {
              console.error('Failed to trigger auth rollback:', rollbackErr);
            }
            throw custErr;
          }
        }

        showToast(t('success_wallet_activated', 'Compte créé avec succès !'), 'success');
        navigateAfterLogin();
      }
    } catch (err: any) {
      showToast(err.message || t('error_identification', 'Erreur lors de l\'authentification'), 'error');
    } finally {
      setLoading(false);
    }
  }

  function storeCustomerLocally(customer: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('menufid_customer_id', customer.id);
      if (customer.email) localStorage.setItem('menufid_customer_email', customer.email);
      if (customer.full_name) localStorage.setItem('menufid_customer_name', customer.full_name);
      if (customer.loyalty_code) localStorage.setItem('menufid_customer_loyalty_code', customer.loyalty_code);
      if (customer.phone) localStorage.setItem('menufid_customer_phone', customer.phone);
      // 🔒 Session permanente mobile : 10 ans (315360000s), Secure en production, SameSite=Lax
      const isProduction = window.location.protocol === 'https:';
      const secureFlag = isProduction ? '; Secure' : '';
      document.cookie = `menufid_customer_id=${customer.id}; path=/; max-age=315360000; SameSite=Lax${secureFlag}`;

      // Synchronisation avec l'application native Android
      if ((window as any).MenuFidAndroid?.onCustomerLoggedIn) {
        (window as any).MenuFidAndroid.onCustomerLoggedIn(customer.id, customer.phone || customer.email || '');
      }
    }
  }

  function navigateAfterLogin() {
    if (redirectSlug) {
      router.push(`/wallet/${redirectSlug}`);
    } else {
      router.push('/wallet');
    }
  }

  return (
    <div className="space-y-6">
      {/* Google Sign In / Sign Up Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full py-3.5 px-4 bg-white border-2 border-black text-black font-black text-sm rounded-xl shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>{t('continue_with_google', 'Continuer avec Google')}</span>
      </button>

      {/* Divider */}
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t-2 border-black"></div>
        <span className="flex-shrink mx-4 text-xs font-black text-neutral-500 uppercase tracking-wider">
          {t('or_auth', 'Ou par email')}
        </span>
        <div className="flex-grow border-t-2 border-black"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wider">
            {t('email_label', 'Adresse Email')}
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-black absolute left-3.5 top-3.5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@gmail.com"
              className="w-full neo-input pl-11 text-sm text-black"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wider">
            {t('password_label', 'Mot de passe')}
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-black absolute left-3.5 top-3.5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full neo-input pl-11 pr-11 text-sm text-black"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-black transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-neutral-500 font-bold mt-1">
            {t('secure_wallet_hint', 'Ce mot de passe sécurise l\'accès à vos tampons et récompenses.')}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="neo-pill-btn w-full py-4 px-4 text-sm flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
        >
          {loading ? (
            <Spinner size={20} className="text-white" />
          ) : (
            <>
              <span>
                {mode === 'signin'
                  ? t('sign_in_title', 'Se connecter')
                  : t('sign_up_title', 'Créer mon compte')}
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition transform" />
            </>
          )}
        </button>
      </form>

      {/* Switch Mode Prompt */}
      <div className="text-center pt-2">
        {mode === 'signin' ? (
          <p className="text-xs font-bold text-neutral-600">
            {t('dont_have_account', 'Pas encore de compte ?')}{' '}
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="text-black font-black underline hover:text-[#FFB800] transition"
            >
              {t('sign_up_title', 'Créer un compte')}
            </button>
          </p>
        ) : (
          <p className="text-xs font-bold text-neutral-600">
            {t('already_have_account', 'Déjà un compte ?')}{' '}
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-black font-black underline hover:text-[#FFB800] transition"
            >
              {t('sign_in_title', 'Se connecter')}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default function WalletAuthPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black flex flex-col selection:bg-[#FFB800] selection:text-black relative overflow-hidden font-sans">
      {/* Background Subtle Neo Pattern */}
      <div className="absolute inset-0 z-0 opacity-5 bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:24px_24px] pointer-events-none"></div>

      {/* Header avec bouton retour intelligent & sélecteur de langue */}
      <Suspense fallback={<div className="h-16" />}>
        <WalletAuthHeader />
      </Suspense>

      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 z-10 w-full">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-[#00F59B] border-2 border-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>{t('loyalty_club', 'Club Fidélité')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black uppercase">
              {t('web_client_wallet_title', 'Portefeuille Client Web')}
            </h1>
            <p className="text-neutral-600 font-bold text-xs sm:text-sm">
              {t('identify_once_subtitle', 'Identifiez-vous pour cumuler vos points et débloquer vos cadeaux')}
            </p>
          </div>

          <div className="neo-box bg-white p-6 sm:p-8 space-y-6 shadow-[6px_6px_0px_0px_#000]">
            <Suspense fallback={<div className="flex justify-center py-8"><Spinner size={28} className="text-black" /></div>}>
              <WalletAuthForm />
            </Suspense>
          </div>

          <div className="flex items-center justify-center gap-2 text-neutral-500 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-neutral-400" />
            <span>{t('secured_by_menufid', 'Sécurisé avec MenuFid Protect')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
