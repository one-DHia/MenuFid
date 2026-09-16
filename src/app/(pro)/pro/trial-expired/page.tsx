'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TrialExpiredPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/pro/suspended');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="animate-pulse font-black text-xs uppercase tracking-widest text-neutral-400">
        Chargement...
      </div>
    </div>
  );
}
