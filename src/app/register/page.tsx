'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PRICING_TIERS } from '@/lib/stripe';
import { Store, Mail, Lock, Phone, ArrowRight, Check, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get('plan') as 'basic' | 'loyalty' | 'premium' | null;

  const [step, setStep] = useState<1 | 2>(1);
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'loyalty' | 'premium'>(initialPlan || 'loyalty');
  
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Étape 1 : Inscription Marchand
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const slug = businessName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // Création du compte Supabase / Local
      let newMerchantId = `merchant-${Date.now()}`;
      try {
        const created = await db.collection('users').create<{ id?: string }>({
          email: email.toLowerCase(),
          password,
          passwordConfirm: password,
          business_name: businessName,
          slug: slug || 'restaurant',
          plan_tier: selectedPlan,
          primary_color: '#b45309',
          role: 'merchant',
          subscription_status: 'pending',
        });
        if (created?.id) newMerchantId = created.id;
      } catch {}

      setMerchantId(newMerchantId);
      localStorage.setItem('menufid_merchant_id', newMerchantId);
      localStorage.setItem('menufid_merchant_name', businessName);
      localStorage.setItem('menufid_merchant_email', email);

      // Programmer l'e-mail de relance si abandon
      fetch('/api/email/subscription-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, businessName, merchantId: newMerchantId }),
      }).catch(() => {});

      setStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la création du compte.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Étape 2 : Confirmation de l'abonnement Stripe
  const handleStep2Checkout = async (tier: 'basic' | 'loyalty' | 'premium') => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: merchantId || 'merchant-demo',
          email,
          planTier: tier,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        router.push('/dashboard/profile?payment=success');
      }
    } catch {
      router.push('/dashboard/profile?payment=success');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 py-12 px-4 max-w-4xl mx-auto w-full flex flex-col justify-center">
      {/* Stepper Header */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${step === 1 ? 'bg-amber-800 text-white shadow-md' : 'bg-slate-200 text-slate-600'}`}>
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
          <span>Créer mon Compte</span>
        </div>
        <div className="w-8 h-0.5 bg-slate-300"></div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${step === 2 ? 'bg-amber-800 text-white shadow-md' : 'bg-slate-200 text-slate-600'}`}>
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
          <span>Choisir l&apos;Abonnement</span>
        </div>
      </div>

      {step === 1 ? (
        /* STEP 1: Registration Form */
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl max-w-lg mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Créer votre Espace Marchand</h1>
            <p className="text-slate-500 text-xs sm:text-sm">Inscrivez votre établissement et commencez à augmenter vos revenus.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nom de votre Etablissement / Restaurant *</label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Le Bistro Gourmand"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-amber-800 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Adresse e-mail professionnelle *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@lebistro.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-amber-800 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone portable *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-amber-800 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mot de passe secret *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-amber-800 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-4 rounded-2xl transition shadow-lg text-sm flex items-center justify-center gap-2 btn-press"
            >
              {loading ? 'Création du compte...' : 'Continuer vers le Choix de l\'Abonnement'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Déjà inscrit ?{' '}
            <Link href="/login" className="text-amber-800 font-bold hover:underline">
              Se connecter
            </Link>
          </div>
        </div>
      ) : (
        /* STEP 2: Subscription Selection */
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-2xl w-full">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
              Étape 2 / 2 - Activation du Compte
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 mb-2">
              Sélectionnez la Formule pour {businessName}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Choisissez votre formule pour activer votre Menu QR et votre Carte de Fidélité Digitale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Basic */}
            <div
              onClick={() => setSelectedPlan('basic')}
              className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                selectedPlan === 'basic' ? 'border-amber-800 bg-amber-50/50 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-slate-900 text-lg">Basic</span>
                  {selectedPlan === 'basic' && <Check className="w-5 h-5 text-amber-800" />}
                </div>
                <div className="text-3xl font-black text-slate-900 mb-4">5€ <span className="text-xs font-medium text-slate-500">/mois</span></div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li>✓ Menu QR Code interactif</li>
                  <li>✓ Affichage allergènes</li>
                  <li>✓ Support par email</li>
                </ul>
              </div>
            </div>

            {/* Loyalty */}
            <div
              onClick={() => setSelectedPlan('loyalty')}
              className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                selectedPlan === 'loyalty' ? 'border-amber-800 bg-amber-900 text-white shadow-xl' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className="absolute -top-3 right-4 bg-amber-400 text-amber-950 font-black text-[10px] uppercase px-3 py-0.5 rounded-full shadow">
                Populaire
              </span>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-extrabold text-lg ${selectedPlan === 'loyalty' ? 'text-amber-200' : 'text-slate-900'}`}>Fidélité</span>
                  {selectedPlan === 'loyalty' && <Check className="w-5 h-5 text-amber-400" />}
                </div>
                <div className={`text-3xl font-black mb-4 ${selectedPlan === 'loyalty' ? 'text-white' : 'text-slate-900'}`}>10€ <span className="text-xs font-medium opacity-80">/mois</span></div>
                <ul className={`space-y-2 text-xs ${selectedPlan === 'loyalty' ? 'text-amber-100' : 'text-slate-600'}`}>
                  <li>✓ Tout le plan Basic</li>
                  <li>✓ Carte Fidélité Smartphone (PWA)</li>
                  <li>✓ Offres Flash par email</li>
                </ul>
              </div>
            </div>

            {/* Premium */}
            <div
              onClick={() => setSelectedPlan('premium')}
              className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                selectedPlan === 'premium' ? 'border-amber-800 bg-amber-50/50 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-slate-900 text-lg">Premium Intégral</span>
                  {selectedPlan === 'premium' && <Check className="w-5 h-5 text-amber-800" />}
                </div>
                <div className="text-3xl font-black text-slate-900 mb-4">20€ <span className="text-xs font-medium text-slate-500">/mois</span></div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li>✓ Tout le plan Fidélité</li>
                  <li>✓ Booster d&apos;avis Google 5★</li>
                  <li>✓ Support VIP 7/7</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleStep2Checkout(selectedPlan)}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 text-white font-black py-4 rounded-2xl transition shadow-xl text-base flex items-center justify-center gap-2 btn-press"
          >
            {loading ? 'Redirection Stripe...' : `Souscrire à la Formule ${selectedPlan.toUpperCase()} via Stripe`}
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Paiement sécurisé par Stripe. Sans engagement, annulation à tout moment.</span>
          </div>
        </div>
      )}
    </main>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Chargement de la page...</div>}>
        <RegisterFormContent />
      </Suspense>
      <Footer />
    </div>
  );
}
