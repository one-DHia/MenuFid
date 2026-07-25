'use client';

/**
 * hooks/useAuth.ts
 * ─────────────────────────────────────────────────────────────
 * Hook centralisé pour la gestion de l'authentification Supabase & Persistance.
 * Préserve la connexion du commerçant lors des redirections externes Stripe.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Merchant, PlanTier } from '@/types';

interface UseAuthReturn {
  merchant: Merchant | null;
  merchantId: string;
  isLoggedIn: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updatePlan: (newPlan: PlanTier) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();

  // Helper pour lire le profil local
  const getStoredMerchant = (): Merchant | null => {
    if (typeof window === 'undefined') return null;
    const savedMerchantRaw = localStorage.getItem('menufid_merchant_profile');
    const savedId = localStorage.getItem('menufid_merchant_id');
    const savedEmail = localStorage.getItem('menufid_merchant_email');
    const savedPlan = localStorage.getItem('menufid_plan_tier') as PlanTier | null;
    const savedRole = localStorage.getItem('menufid_role');

    if (savedMerchantRaw) {
      try {
        const parsed = JSON.parse(savedMerchantRaw) as Merchant;
        return {
          ...parsed,
          plan_tier: savedPlan || parsed.plan_tier || 'premium',
          role: savedRole || parsed.role || 'admin',
        };
      } catch {}
    }

    if (savedId && savedEmail) {
      return {
        id: savedId,
        email: savedEmail,
        business_name: localStorage.getItem('menufid_merchant_name') || 'Mon Établissement',
        slug: 'restaurant',
        plan_tier: savedPlan || 'premium',
        role: savedRole || 'admin',
        primary_color: '#b45309',
      };
    }

    return null;
  };

  const [merchant, setMerchant] = useState<Merchant | null>(getStoredMerchant);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string, email?: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const savedPlan = typeof window !== 'undefined' ? (localStorage.getItem('menufid_plan_tier') as PlanTier | null) : null;

      let profileMerchant: Merchant;
      if (data) {
        profileMerchant = {
          id: data.id,
          email: data.email || email || 'contact@menufid.site',
          business_name: data.business_name || 'Mon Établissement',
          slug: data.slug || 'shop',
          plan_tier: savedPlan || (data.plan_tier as PlanTier) || 'premium',
          role: data.role || 'admin',
          primary_color: data.primary_color || '#b45309',
          logo_url: data.logo_url,
          google_review_url: data.google_review_url,
          pdf_menu_url: data.pdf_menu_url,
        };
      } else {
        const local = getStoredMerchant();
        profileMerchant = local || {
          id: userId,
          email: email || 'contact@menufid.site',
          business_name: 'Mon Établissement',
          slug: `shop-${userId.slice(0, 6)}`,
          plan_tier: savedPlan || 'premium',
          role: 'admin',
          primary_color: '#b45309',
        };
      }

      setMerchant(profileMerchant);
      if (typeof window !== 'undefined') {
        localStorage.setItem('menufid_merchant_profile', JSON.stringify(profileMerchant));
        localStorage.setItem('menufid_merchant_id', profileMerchant.id);
        localStorage.setItem('menufid_merchant_email', profileMerchant.email);
        document.cookie = `menufid_merchant_id=${profileMerchant.id}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {
      const local = getStoredMerchant();
      if (local) setMerchant(local);
    } font: {
      setIsLoading(false);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email);
      } else {
        const stored = getStoredMerchant();
        if (stored) {
          setMerchant(stored);
        }
        setIsLoading(false);
      }
    } catch {
      const stored = getStoredMerchant();
      if (stored) setMerchant(stored);
      setIsLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    refreshAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email);
      } else {
        const stored = getStoredMerchant();
        if (stored) {
          setMerchant(stored);
        }
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshAuth, fetchProfile]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('menufid_merchant_profile');
      localStorage.removeItem('menufid_merchant_id');
      localStorage.removeItem('menufid_merchant_email');
      localStorage.removeItem('menufid_plan_tier');
      document.cookie = 'menufid_merchant_id=; path=/; max-age=0';
    }
    setMerchant(null);
    router.push('/login');
  };

  const updatePlan = async (newPlan: PlanTier) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('menufid_plan_tier', newPlan);
    }
    if (merchant) {
      const updated = { ...merchant, plan_tier: newPlan };
      setMerchant(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('menufid_merchant_profile', JSON.stringify(updated));
      }
      try {
        await supabase.from('profiles').update({ plan_tier: newPlan }).eq('id', merchant.id);
      } catch {}
    }
  };

  return {
    merchant,
    merchantId: merchant?.id || '',
    isLoggedIn: !!merchant,
    isLoading,
    logout,
    refreshAuth,
    updatePlan,
  };
}

export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.isLoggedIn) {
      router.push('/login');
    }
  }, [auth.isLoading, auth.isLoggedIn, router]);

  return auth;
}
