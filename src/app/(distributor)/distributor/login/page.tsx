'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { ArrowLeft } from 'lucide-react';

export default function DistributorLoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        setErrorMsg(error?.message || t('distributor_login_error_invalid', 'Identifiants incorrects ou mot de passe invalide.'));
        setLoading(false);
        return;
      }

      // Check if user is actually a distributor
      const { data: distData, error: distError } = await supabase
        .from('distributors')
        .select('id')
        .eq('user_id', data.user.id)
        .single();

      if (distError || !distData) {
        // Not a distributor
        await supabase.auth.signOut();
        setErrorMsg(t('distributor_login_error_not_distributor', 'Accès non autorisé : Vous n\'êtes pas un distributeur agréé.'));
        setLoading(false);
        return;
      }

      // Success
      router.push('/distributor');
    } catch (err) {
      setErrorMsg(t('distributor_login_error_invalid', 'Erreur lors de la connexion.'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] text-black p-4 relative font-sans selection:bg-[#FFB800] selection:text-black">
      
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

      <div className="w-full max-w-md bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-8 sm:mt-0">
        <div className="text-center mb-8 space-y-2">
          <Link href="/" className="inline-block">
            <div className="font-black text-2xl tracking-tight">
              MENU<span className="text-[#FFB800]">FID</span> <span className="bg-black text-white px-2 py-0.5 rounded text-sm ml-1">{t('distributor_uppercase', 'DISTRIBUTEUR')}</span>
            </div>
          </Link>
          <h2 className="text-lg font-black uppercase tracking-tight text-neutral-800">
            {t('distributor_login_title', 'Connexion Distributeur')}
          </h2>
        </div>
        
        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-3.5 rounded-xl border-2 border-red-500 font-bold mb-4 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-black text-xs uppercase mb-1.5">{t('email', 'Email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FFB800] font-bold text-sm"
              placeholder="partenaire@menufid.site"
            />
          </div>
          <div>
            <label className="block font-black text-xs uppercase mb-1.5">{t('password', 'Mot de passe')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FFB800] font-bold text-sm"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFB800] text-black font-black py-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 text-sm uppercase tracking-wider mt-2"
          >
            {loading ? t('distributor_submitting', 'Connexion en cours...') : t('distributor_login_btn', 'Se connecter à la Console')}
          </button>
        </form>
      </div>
    </div>
  );
}
