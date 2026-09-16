'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthListener() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('[AuthListener] Password recovery event detected, redirecting to /pro/reset-password');
        window.location.href = '/pro/reset-password';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
