'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Utensils, 
  Scan, 
  QrCode, 
  Settings 
} from 'lucide-react';

export default function ProBottomNav() {
  const pathname = usePathname();
  const { merchant } = useAuth();
  const { t, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);

  useEffect(() => {
    if (!merchant?.id) return;

    // Fetch initial pending orders count
    const fetchPendingCount = async () => {
      try {
        const { count, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('merchant_id', merchant.id)
          .eq('order_status', 'pending');

        if (!error && count !== null) {
          setPendingOrdersCount(count);
        }
      } catch (err) {
        console.error('[ProBottomNav] Error fetching pending count:', err);
      }
    };

    fetchPendingCount();

    // Listen for realtime orders updates
    const channel = supabase
      .channel(`pro-bottom-nav-orders-${merchant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `merchant_id=eq.${merchant.id}`,
        },
        () => {
          fetchPendingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [merchant?.id]);

  const isStarter = merchant?.plan_tier === 'basic';

  const navItems = [
    {
      href: '/pro/dashboard',
      label: t('nav_bottom_dashboard', 'Accueil'),
      icon: LayoutDashboard,
      isActive: pathname === '/pro/dashboard' || pathname === '/pro',
      badge: null,
    },
    {
      href: '/pro/orders',
      label: t('nav_bottom_orders', 'Commandes'),
      icon: ShoppingBag,
      isActive: pathname.startsWith('/pro/orders'),
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
    },
    {
      href: '/pro/menu',
      label: t('nav_bottom_menu', 'Menu'),
      icon: Utensils,
      isActive: pathname.startsWith('/pro/menu'),
      badge: null,
    },
    {
      href: isStarter ? '/pro/qr' : '/pro/scanner',
      label: isStarter ? t('nav_bottom_qr', 'Mon QR') : t('nav_bottom_scanner', 'Scanner'),
      icon: isStarter ? QrCode : Scan,
      isActive: pathname.startsWith('/pro/scanner') || pathname.startsWith('/pro/qr'),
      badge: null,
    },
    {
      href: '/pro/profile',
      label: t('nav_bottom_profile', 'Profil'),
      icon: Settings,
      isActive: pathname.startsWith('/pro/profile'),
      badge: null,
    },
  ];

  return (
    <nav 
      aria-label="Navigation mobile pro"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-3 border-black sm:hidden pb-[calc(env(safe-area-inset-bottom,0px)+4px)] pt-1.5 px-2 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]"
      dir={dir}
    >
      <div className="grid grid-cols-5 items-center justify-around gap-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[50px] py-1 px-1 rounded-xl transition-all duration-150 relative active:scale-95 ${
                active 
                  ? 'bg-[#FFB800] text-black font-black shadow-[2px_2px_0px_0px_#000] border-2 border-black' 
                  : 'text-neutral-700 hover:text-black font-bold border-2 border-transparent'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.6]' : 'stroke-[2]'}`} />
                {item.badge !== null && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border border-white shadow-sm animate-pulse">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight leading-none mt-1 truncate max-w-[62px] ${
                active ? 'font-black' : 'font-semibold'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
