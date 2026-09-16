'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useLanguage } from '@/lib/i18n';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // Explicitement obtenir la session active
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        
        if (sessionErr) throw sessionErr;
        
        if (session?.user) {
          const userId = session.user.id;
          
          // Récupérer les informations de profil client de la table public.customers
          const { data: customer, error: customerErr } = await supabase
            .from('customers')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (customerErr) throw customerErr;

          if (customer) {
            // Enregistrement des informations client de manière persistante
            localStorage.setItem('menufid_customer_id', customer.id);
            if (customer.phone) localStorage.setItem('menufid_customer_phone', customer.phone);
            if (customer.email) localStorage.setItem('menufid_customer_email', customer.email);
            if (customer.full_name) localStorage.setItem('menufid_customer_name', customer.full_name);
            if (customer.loyalty_code) localStorage.setItem('menufid_customer_loyalty_code', customer.loyalty_code);
            
            const isProduction = window.location.protocol === 'https:';
            const secureFlag = isProduction ? '; Secure' : '';
            document.cookie = `menufid_customer_id=${customer.id}; path=/; max-age=28800; SameSite=Strict${secureFlag}`;
            
            showToast(t('success_login', 'Connexion réussie !'), 'success');
          } else {
            // Pas de client trouvé, on le crée ! C'est le cas typique du premier login Google
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            const randomStr = Array.from({length: 6}).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
            const loyaltyCode = `${randomStr.slice(0,3)}-${randomStr.slice(3)}`;

            const payload: any = {
              id: userId,
              loyalty_code: loyaltyCode,
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Client VIP',
            };

            if (session.user.email) {
              payload.email = session.user.email.toLowerCase();
            }

            const { data: newCustomer, error: createErr } = await supabase
              .from('customers')
              .insert(payload)
              .select()
              .single();

            if (!createErr && newCustomer) {
              localStorage.setItem('menufid_customer_id', newCustomer.id);
              if (newCustomer.email) localStorage.setItem('menufid_customer_email', newCustomer.email);
              if (newCustomer.full_name) localStorage.setItem('menufid_customer_name', newCustomer.full_name);
              localStorage.setItem('menufid_customer_loyalty_code', newCustomer.loyalty_code);
              const isProduction = window.location.protocol === 'https:';
              const secureFlag = isProduction ? '; Secure' : '';
              document.cookie = `menufid_customer_id=${newCustomer.id}; path=/; max-age=28800; SameSite=Strict${secureFlag}`;
              showToast(t('success_login', 'Connexion réussie !'), 'success');
            } else {
              // Fallback au cas où l'insertion échoue
              localStorage.setItem('menufid_customer_id', userId);
              if (session.user.email) localStorage.setItem('menufid_customer_email', session.user.email);
              const isProduction2 = window.location.protocol === 'https:';
              const secureFlag2 = isProduction2 ? '; Secure' : '';
              document.cookie = `menufid_customer_id=${userId}; path=/; max-age=28800; SameSite=Strict${secureFlag2}`;
            }
          }

          const redirectSlug = searchParams.get('redirect');
          if (redirectSlug) {
            router.push(`/wallet/${redirectSlug}?scan=true`);
          } else {
            router.push('/wallet');
          }
        } else {
          // Si pas de session, rediriger vers login
          router.push('/wallet/auth');
        }
      } catch (err: any) {
        console.error('OAuth Callback Error:', err);
        showToast(t('error_auth_callback', 'Erreur lors de l\'authentification sociale'), 'error');
        router.push('/wallet/auth');
      }
    }

    handleAuthCallback();
  }, [router, searchParams, showToast, t]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Spinner size={36} className="text-black" />
      <p className="font-bold text-sm text-neutral-600 uppercase tracking-wider">
        {t('authenticating', 'Authentification en cours...')}
      </p>
    </div>
  );
}

export default function WalletAuthCallbackPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black flex items-center justify-center p-4">
      <Suspense fallback={<Spinner size={36} className="text-black" />}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
