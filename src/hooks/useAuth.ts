'use client';

/**
 * hooks/useAuth.ts
 * ─────────────────────────────────────────────────────────────
 * Hook centralisé pour l'authentification Supabase des Commerçants (Pro B2B).
 * Persistance locale et synchronisation des abonnements.
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

  const getStoredMerchant = (): Merchant | null => {
    if (typeof window === 'undefined') return null;
    const savedMerchantRaw = localStorage.getItem('menufid_merchant_profile');
    const savedId = localStorage.getItem('menufid_merchant_id');

    if (savedMerchantRaw) {
      try {
        const parsed = JSON.parse(savedMerchantRaw) as Merchant;
        if (parsed?.id) {
          const isProduction = window.location.protocol === 'https:';
          const secureFlag = isProduction ? '; Secure' : '';
          document.cookie = `menufid_merchant_id=${parsed.id}; path=/; max-age=315360000; SameSite=Lax${secureFlag}`;
        }
        return parsed;
      } catch {}
    }

    if (savedId) {
      const isProduction = window.location.protocol === 'https:';
      const secureFlag = isProduction ? '; Secure' : '';
      document.cookie = `menufid_merchant_id=${savedId}; path=/; max-age=315360000; SameSite=Lax${secureFlag}`;
      return {
        id: savedId,
        business_name: localStorage.getItem('menufid_merchant_name') || 'Mon Établissement',
        slug: localStorage.getItem('menufid_merchant_slug') || `shop-${savedId.substring(0, 6)}`,
        short_code: 'REST-01',
        plan_tier: (localStorage.getItem('menufid_plan_tier') as PlanTier) || 'loyalty',
        plan_status: 'active',
        monthly_price: 39,
        primary_color: '#10b981',
        currency: (localStorage.getItem('menufid_merchant_currency') as string) || 'EUR',
        created_at: new Date().toISOString(),
      };
    }

    return null;
  };

  const [merchant, setMerchant] = useState<Merchant | null>(getStoredMerchant);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      let profileMerchant: Merchant;
      if (data) {
        profileMerchant = data as Merchant;
        setMerchant(profileMerchant);

        if (typeof window !== 'undefined') {
          localStorage.setItem('menufid_merchant_profile', JSON.stringify(profileMerchant));
          localStorage.setItem('menufid_merchant_id', profileMerchant.id);
          localStorage.setItem('menufid_merchant_name', profileMerchant.business_name);
          localStorage.setItem('menufid_merchant_slug', profileMerchant.slug);
          localStorage.setItem('menufid_plan_tier', profileMerchant.plan_tier);
          if (profileMerchant.currency) {
            localStorage.setItem('menufid_merchant_currency', profileMerchant.currency);
          }
          const isProduction = window.location.protocol === 'https:';
          const secureFlag = isProduction ? '; Secure' : '';
          document.cookie = `menufid_merchant_id=${profileMerchant.id}; path=/; max-age=315360000; SameSite=Lax${secureFlag}`;

          const path = window.location.pathname;
          const isExempt = path === '/pro/suspended' || 
                           path === '/pro/trial-expired' || 
                           path === '/pro/deleted' || 
                           path === '/pro/support' ||
                           path === '/pro/login' ||
                           path === '/pro/register';

          if (!isExempt && path.startsWith('/pro/')) {
            const isSuspendedOrUnpaid = profileMerchant.is_suspended || 
                                       profileMerchant.plan_status === 'past_due' || 
                                       profileMerchant.plan_status === 'canceled';

            if (isSuspendedOrUnpaid) {
              router.push('/pro/suspended');
              return;
            }
          }
        }
      } else {
        // Merchant deleted by distributor / admin
        if (typeof window !== 'undefined') {
          localStorage.removeItem('menufid_merchant_profile');
          localStorage.removeItem('menufid_merchant_id');
          localStorage.removeItem('menufid_merchant_name');
          localStorage.removeItem('menufid_merchant_slug');
          localStorage.removeItem('menufid_plan_tier');
          document.cookie = 'menufid_merchant_id=; path=/; max-age=0';

          const path = window.location.pathname;
          if (path.startsWith('/pro/') && !['/pro/login', '/pro/register', '/pro/deleted'].includes(path)) {
            setMerchant(null);
            setIsLoading(false);
            router.push('/pro/deleted');
            return;
          }
        }
        setMerchant(null);
      }
    } catch {
      const local = getStoredMerchant();
      if (local) setMerchant(local);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const refreshAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user.id);
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
        await fetchProfile(session.user.id);
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

  // 🔄 Synchronisation en temps réel avec le portail distributeur
  useEffect(() => {
    if (!merchant?.id) return;

    let channel: any = null;
    try {
      const channelName = `merchant-status-${merchant.id}-${Math.random().toString(36).substring(2, 9)}`;
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'merchants',
            filter: `id=eq.${merchant.id}`
          },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('menufid_merchant_profile');
                localStorage.removeItem('menufid_merchant_id');
                localStorage.removeItem('menufid_merchant_name');
                localStorage.removeItem('menufid_merchant_slug');
                localStorage.removeItem('menufid_plan_tier');
                document.cookie = 'menufid_merchant_id=; path=/; max-age=0';
                router.replace('/pro/deleted');
              }
              setMerchant(null);
            } else if (payload.new) {
              const updated = payload.new as Merchant;
              setMerchant(updated);
              if (typeof window !== 'undefined') {
                localStorage.setItem('menufid_merchant_profile', JSON.stringify(updated));
              }
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.error('[useAuth] Realtime status sync error:', err);
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, [merchant?.id, router]);

  // 🛡️ Garde de redirection réactif selon le statut
  useEffect(() => {
    if (typeof window === 'undefined' || isLoading) return;
    const path = window.location.pathname;

    if (merchant) {
      const isSuspendedOrUnpaid = merchant.is_suspended || 
                                 merchant.plan_status === 'past_due' || 
                                 merchant.plan_status === 'canceled';

      if (isSuspendedOrUnpaid) {
        if (path.startsWith('/pro/') && path !== '/pro/suspended' && path !== '/pro/support' && path !== '/pro/login') {
          router.replace('/pro/suspended');
        }
        return;
      }

      // Si le compte est réactivé et qu'on est sur la page suspendu
      if (!isSuspendedOrUnpaid && path === '/pro/suspended') {
        router.replace('/pro/dashboard');
        return;
      }
    }
  }, [merchant, isLoading, router]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('menufid_merchant_profile');
      localStorage.removeItem('menufid_merchant_id');
      localStorage.removeItem('menufid_merchant_name');
      localStorage.removeItem('menufid_merchant_slug');
      localStorage.removeItem('menufid_plan_tier');
      document.cookie = 'menufid_merchant_id=; path=/; max-age=0';
    }
    setMerchant(null);
    router.push('/');
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
        await supabase.from('merchants').update({ plan_tier: newPlan }).eq('id', merchant.id);
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
    if (!auth.isLoading) {
      if (!auth.isLoggedIn || !auth.merchant) {
        router.push('/pro/login');
        return;
      }

      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const isExempt = path === '/pro/suspended' || 
                         path === '/pro/trial-expired' || 
                         path === '/pro/deleted' || 
                         path === '/pro/support' ||
                         path === '/pro/login' ||
                         path === '/pro/register';

        if (!isExempt) {
          const isSuspendedOrUnpaid = auth.merchant.is_suspended || 
                                     auth.merchant.plan_status === 'past_due' || 
                                     auth.merchant.plan_status === 'canceled';

          if (isSuspendedOrUnpaid) {
            router.push('/pro/suspended');
            return;
          }
        }
      }
    }
  }, [auth.isLoading, auth.isLoggedIn, auth.merchant, router]);

  return auth;
}
