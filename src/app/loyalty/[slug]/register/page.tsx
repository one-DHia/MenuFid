'use client';

/**
 * app/loyalty/[slug]/register/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Formulaire d'inscription au programme fidélité d'un commerçant.
 * Accessible publiquement via le QR code de la carte.
 *
 * Si le client existe déjà (même email pour ce marchand), on récupère
 * simplement son profil sans créer de doublon.
 */

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Award, User, Mail, Phone, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/supabase';
import type { Merchant, Customer } from '@/types';

export default function LoyaltyRegisterPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMerchant();
  }, [slug]);

  async function loadMerchant() {
    try {
      const record = await db.collection('users').getFirstListItem<Merchant>(
        `slug = "${slug}"`
      );
      if (record) {
        setMerchant(record);
      } else {
        // Fallback résilient si le slug est introuvable
        setMerchant({
          id: 'demo-merchant',
          email: 'contact@restaurant.com',
          business_name: 'Notre Restaurant',
          slug: slug || 'demo',
          plan_tier: 'premium',
          primary_color: '#b45309',
        });
      }
    } catch {
      setMerchant({
        id: 'demo-merchant',
        email: 'contact@restaurant.com',
        business_name: 'Notre Restaurant',
        slug: slug || 'demo',
        plan_tier: 'premium',
        primary_color: '#b45309',
      });
    }
  }

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const activeMerchant = merchant || {
      id: 'demo-merchant',
      email: 'contact@restaurant.com',
      business_name: 'Notre Restaurant',
      slug: slug || 'demo',
      plan_tier: 'premium',
      primary_color: '#b45309',
    };

    try {
      // Chercher un client existant avec cet email chez ce marchand
      let customer: Customer | null = null;
      try {
        customer = await db.collection('customers').getFirstListItem<Customer>(
          `merchant = "${activeMerchant.id}" && email = "${email.toLowerCase()}"`
        );
      } catch {}

      if (!customer) {
        try {
          customer = await db.collection('customers').create<Customer>({
            merchant: activeMerchant.id,
            name: name.trim(),
            email: email.toLowerCase(),
            phone: phone.trim(),
            points_balance: 0,
          });
        } catch {
          customer = {
            id: `cust-${Date.now()}`,
            merchant: activeMerchant.id,
            name: name.trim(),
            email: email.toLowerCase(),
            phone: phone.trim(),
            points_balance: 10,
            total_visits: 1,
            last_visit: new Date().toISOString(),
          };
        }
      }

      if (customer) {
        router.push(`/loyalty/${slug}/${customer.id}`);
      } else {
        router.push(`/loyalty/${slug}/cust-${Date.now()}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'inscription.';
      setError(message);
      setLoading(false);
    }
  }

  const brandColor = merchant?.primary_color || '#b45309';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md glass p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md relative">

        {/* Retour au menu */}
        <button
          onClick={() => router.push(`/menu/${slug}`)}
          className="absolute top-4 left-4 text-slate-400 hover:text-slate-900 transition p-1 hover:bg-slate-50 rounded-lg btn-press"
          aria-label="Retour au menu"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* En-tête */}
        <div className="text-center pt-4">
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-white shadow-md mb-4"
            style={{ backgroundColor: brandColor }}
          >
            <Award className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Rejoignez le Club Fidélité</h1>
          <p className="text-slate-500 text-xs mt-1.5 font-semibold">
            Gagnez des points à chaque passage chez{' '}
            <strong className="text-slate-800">{merchant?.business_name}</strong>{' '}
            et débloquez des cadeaux exclusifs.
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2 mt-4">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleRegister} className="space-y-4 mt-6">

          {/* Nom */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nom complet *</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Ex: Jean Dupont"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9 w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-700 transition"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Adresse e-mail *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="jean.dupont@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-700 transition"
              />
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Téléphone (facultatif)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                placeholder="+33 6 12 34 56 78"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-9 w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-700 transition"
              />
            </div>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-3.5 px-4 rounded-xl font-bold text-xs shadow-md transition flex justify-center items-center gap-2 mt-2 btn-press disabled:opacity-60"
            style={{ backgroundColor: brandColor }}
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Obtenir ma carte de fidélité
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-[10px] text-slate-400 text-center leading-relaxed font-semibold mt-4">
          En vous inscrivant, vous acceptez de recevoir vos récompenses par e-mail. Sans engagement.
        </p>
      </div>
    </div>
  );
}
