'use client';

/**
 * app/login/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Page de connexion commerçant.
 * Redirige vers /dashboard après succès.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, Mail, ChevronRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.session) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('menufid_merchant_profile', JSON.stringify({
            id: data.session.user.id,
            email: data.session.user.email,
            business_name: 'Mon Établissement',
            slug: `shop-${data.session.user.id.slice(0, 6)}`,
            plan_tier: 'premium',
            role: 'admin',
          }));
        }
        router.push('/dashboard');
      }
    } catch {
      setError('Identifiants invalides. Veuillez réessayer.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50/20 via-stone-50 to-stone-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 glass p-8 sm:p-10 rounded-3xl border border-stone-200/80 shadow-md">

        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center">
            <span className="flex items-center gap-2 bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent text-3xl font-black tracking-tight select-none">
              <Sparkles className="h-8 w-8 text-amber-700 animate-pulse" />
              MenuFid
            </span>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-stone-900">
            Connexion commerçant
          </h1>
          <p className="mt-2 text-sm text-stone-500 font-medium">
            Ou{' '}
            <Link href="/register" className="font-semibold text-amber-700 hover:text-amber-600 transition">
              créez votre compte gratuitement
            </Link>
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire */}
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1">Adresse e-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                <input
                  type="email"
                  required
                  placeholder="commercant@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 w-full bg-white border border-stone-200 rounded-xl py-3 px-4 text-sm placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-700 transition"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-stone-500">Mot de passe</label>
                <a href="#" className="text-xs text-amber-700 hover:underline">Mot de passe oublié ?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 w-full bg-white border border-stone-200 rounded-xl py-3 px-4 text-sm placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-700 transition"
                />
              </div>
            </div>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-700 hover:bg-amber-600 text-white py-3.5 px-4 rounded-xl font-bold text-xs shadow-md shadow-amber-100 transition flex justify-center items-center gap-2 btn-press disabled:opacity-60"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Se connecter
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
