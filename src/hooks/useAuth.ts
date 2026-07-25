'use client';

/**
 * hooks/useAuth.ts
 * ─────────────────────────────────────────────────────────────
 * Hook centralisé pour la gestion de l'authentification Supabase & Persistance.
 * Gère la session utilisateur, le profil commerçant et les rôles via Supabase.
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

  const [merchant, setMerchant] = useState<Merchant | null>(() => {
    if (typeof window === 'undefined') return null;
    const savedPlan = localStorage.getItem('menufid_plan_tier') as PlanTier | null;
    const savedRole = localStorage.getItem('menufid_role');
    const savedMerchantRaw = localStorage.getItem('menufid_merchant_profile');

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
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const savedPlan = typeof window !== 'undefined' ? (localStorage.getItem('menufid_plan_tier') as PlanTier | null) : null;
      const savedRole = typeof window !== 'undefined' ? localStorage.getItem('menufid_role') : null;

      let profileMerchant: Merchant;

      if (data && !error) {
        profileMerchant = {
          id: data.id,
          email: data.email || email || 'contact@menufid.com',
          business_name: data.business_name || 'Mon Établissement',
          slug: data.slug || 'shop',
          plan_tier: savedPlan || (data.plan_tier as PlanTier) || 'premium',
          role: savedRole || data.role || 'admin',
          primary_color: data.primary_color || '#b45309',
          logo_url: data.logo_url,
          google_review_url: data.google_review_url,
          pdf_menu_url: data.pdf_menu_url,
        };
      } else {
        profileMerchant = {
          id: userId,
          email: email || 'contact@menufid.com',
          business_name: 'Mon Établissement',
          slug: `shop-${userId.slice(0, 6)}`,
          plan_tier: savedPlan || 'premium',
          role: savedRole || 'admin',
          primary_color: '#b45309',
        };
      }

      setMerchant(profileMerchant);
      if (typeof window !== 'undefined') {
        localStorage.setItem('menufid_merchant_profile', JSON.stringify(profileMerchant));
      }
    } catch {
      // Conservation du profil existant
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchProfile(session.user.id, session.user.email);
    } else {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    refreshAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email);
      } else if (typeof window !== 'undefined' && !localStorage.getItem('menufid_merchant_profile')) {
        setMerchant(null);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshAuth, fetchProfile]);

  async function updatePlan(newPlan: PlanTier) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('menufid_plan_tier', newPlan);
    }

    setMerchant((prev) => (prev ? { ...prev, plan_tier: newPlan } : null));

    if (merchant?.id) {
      try {
        await supabase
          .from('profiles')
          .update({ plan_tier: newPlan })
          .eq('id', merchant.id);
      } catch {}
    }
  }

  async function logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('menufid_plan_tier');
      localStorage.removeItem('menufid_role');
      localStorage.removeItem('menufid_merchant_profile');
    }
    await supabase.auth.signOut().catch(() => null);
    setMerchant(null);
    router.push('/login');
  }

  return {
    merchant,
    merchantId: merchant?.id ?? '',
    isLoggedIn: !!merchant,
    isLoading,
    logout,
    refreshAuth,
    updatePlan,
  };
}

export function useRequireAuth(): UseAuthReturn {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.isLoggedIn) {
      router.push('/login');
    }
  }, [auth.isLoading, auth.isLoggedIn, router]);

  return auth;
}
