'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, CheckCircle2 } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';

export default function AdminSetupPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to setup admin');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight">
          Initialisation Admin
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400 max-w-sm mx-auto">
          Création du tout premier compte Super-Admin. Cette page se bloquera définitivement après cette étape.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/5 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/10">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">Succès !</h3>
              <p className="text-gray-400 text-sm">
                Compte créé et sécurisé.<br/>Redirection vers la page de connexion...
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSetup}>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Email du Super-Admin
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin@menufid.site"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Mot de passe (Très sécurisé)
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
              >
                {loading ? 'Création...' : 'Créer le compte et verrouiller'}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="fixed top-4 right-4 z-50 bg-black/40 backdrop-blur-md rounded-full px-2 py-1 border border-white/10 shadow-lg">
        <LanguageSelector />
      </div>
    </div>
  );
}
