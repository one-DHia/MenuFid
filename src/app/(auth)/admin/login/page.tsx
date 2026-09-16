'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/i18n';

export default function AdminLoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Verify if user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('id, role')
        .eq('id', data.user.id)
        .single();

      if (adminError || !adminData) {
        await supabase.auth.signOut();
        throw new Error('Access denied. You are not an administrator.');
      }

      // Request 2FA code via backend API
      const res = await fetch('/api/admin/send-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id, email }),
      });

      if (!res.ok) throw new Error('Failed to send 2FA code');

      setStep(2);
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMsg = err.message || 'Invalid credentials';
      if (errorMsg === '{}' || typeof errorMsg !== 'string') {
        errorMsg = 'Invalid credentials or unauthorized (Check console)';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Session expired');

      const res = await fetch('/api/admin/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ code: otp }),
      });

      if (!res.ok) throw new Error('Invalid or expired code');
      
      // Set 2FA verified flag
      localStorage.setItem('admin_2fa_verified', 'true');
      router.push('/admin');
    } catch (err: any) {
      console.error('Verify error:', err);
      let errorMsg = err.message || 'Verification failed';
      if (errorMsg === '{}' || typeof errorMsg !== 'string') {
        errorMsg = 'Invalid code or verification failed (Check console)';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Top Controls: Back to Home & Language Selector */}
      <div className="fixed top-4 left-4 z-50">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-md transition-all shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back_to_home', 'Retour à l\'accueil')}</span>
        </Link>
      </div>

      <div className="fixed top-4 right-4 z-50 bg-black/40 backdrop-blur-md rounded-full px-2 py-1 border border-white/10 shadow-lg">
        <LanguageSelector />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight">
          Super Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Secure Access Required
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/5 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/10">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Email address
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
                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="admin@menufid.site"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Secure Login'}
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerify2FA}>
              <div className="text-center">
                <KeyRound className="mx-auto h-12 w-12 text-emerald-400 mb-4" />
                <h3 className="text-lg font-medium text-white">2-Step Verification</h3>
                <p className="text-sm text-gray-400 mt-1">
                  A verification code has been sent to <br />
                  <span className="text-white font-medium">{email}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 text-center">
                  Enter 6-digit code
                </label>
                <div className="mt-2 flex justify-center">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="block w-3/4 text-center text-2xl tracking-[0.5em] py-3 border border-white/10 rounded-xl bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="000000"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Enter Portal'}
                {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
