'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle, Loader2, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';

function SuccessContent() {
  const { t, dir, language } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMessage(t('err_session_not_found', "Identifiant de session de paiement introuvable."));
      return;
    }

    const verifyAndLogin = async () => {
      try {
        const res = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || t('err_verify_failed', "Impossible de vérifier le paiement Stripe."));
        }

        const fallbackName = language === 'ar' ? 'مطعمك' : (language === 'en' ? 'your establishment' : 'votre établissement');
        setRestaurantName(data.merchant?.business_name || fallbackName);
        setStatus('success');

        // Connexion automatique avec les identifiants
        if (data.credentials?.email && data.credentials?.password) {
          try {
            await supabase.auth.signInWithPassword({
              email: data.credentials.email,
              password: data.credentials.password,
            });
          } catch (loginErr) {
            console.warn('Auto-login notice:', loginErr);
          }
        }

        // Redirection vers le dashboard après 2.5 secondes
        setTimeout(() => {
          router.push('/pro/dashboard');
        }, 2500);

      } catch (err: any) {
        console.error('Erreur vérification session:', err);
        setStatus('error');
        setErrorMessage(err.message || t('err_generic_validation', "Une erreur est survenue lors de la validation."));
      }
    };

    verifyAndLogin();
  }, [sessionId, router, language, t]);

  return (
    <div dir={dir} className="min-h-screen bg-[#FAFAFA] text-black flex flex-col font-sans selection:bg-[#FFB800] selection:text-black">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md text-center">

          {/* ÉTAT 1 : VÉRIFICATION EN COURS */}
          {status === 'verifying' && (
            <div className="neo-box p-8 space-y-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] rounded-3xl">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF9E6] border-2 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#000]">
                <Loader2 className="w-8 h-8 text-[#B45309] animate-spin" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-black">
                  {t('reg_success_verifying_title', 'Confirmation de votre paiement...')}
                </h2>
                <p className="text-xs font-bold text-neutral-600">
                  {t('reg_success_verifying_desc', 'Nous validons votre transaction Stripe et activons votre restaurant. Veuillez patienter un instant.')}
                </p>
              </div>
            </div>
          )}

          {/* ÉTAT 2 : SUCCÈS & ACTIVATION DU COMPTE */}
          {status === 'success' && (
            <div className="neo-box p-8 space-y-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] rounded-3xl">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border-2 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#000]">
                <CheckCircle className="w-8 h-8 text-emerald-600 stroke-[2.5]" />
              </div>

              <div className="space-y-2">
                <span className="neo-badge-yellow inline-flex items-center gap-1 text-[10px] font-black">
                  <Sparkles className="w-3 h-3" />
                  <span>{t('reg_success_badge', 'Paiement Validé & Compte Actif')}</span>
                </span>
                <h2 className="text-2xl font-black text-black">
                  {t('reg_success_welcome_title', 'Bienvenue sur Menufid !')}
                </h2>
                <p className="text-xs font-bold text-neutral-600 leading-relaxed">
                  {t('reg_success_account_created', 'Votre compte pour {name} a été créé avec succès et votre abonnement est désormais actif.').replace('{name}', restaurantName)}
                </p>
              </div>

              <div className="p-3 bg-neutral-50 border-2 border-black rounded-xl text-xs font-bold text-neutral-700 flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                <span>{t('reg_success_redirecting', 'Redirection vers votre tableau de bord...')}</span>
              </div>

              <Link
                href="/pro/dashboard"
                className="w-full neo-pill-btn bg-black hover:bg-neutral-800 text-white text-xs py-3.5 flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000]"
              >
                <span>{t('reg_success_btn_dashboard', 'Accéder au Dashboard maintenant')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* ÉTAT 3 : ERREUR */}
          {status === 'error' && (
            <div className="neo-box p-8 space-y-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] rounded-3xl">
              <div className="w-16 h-16 rounded-2xl bg-red-100 border-2 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#000]">
                <AlertCircle className="w-8 h-8 text-red-600 stroke-[2.5]" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-black">
                  {t('reg_success_error_title', 'Validation Impossible')}
                </h2>
                <p className="text-xs font-bold text-red-600">
                  {errorMessage}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/pro/register"
                  className="w-full neo-pill-btn text-xs py-3.5 flex items-center justify-center gap-2"
                >
                  <span>{t('reg_success_btn_restart', "Recommencer l'inscription")}</span>
                </Link>
                <Link
                  href="/pro/login"
                  className="w-full neo-pill-btn-white text-xs py-3.5 flex items-center justify-center gap-2"
                >
                  <span>{t('reg_success_btn_login', 'Se connecter')}</span>
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAFA]" />}>
      <SuccessContent />
    </Suspense>
  );
}
