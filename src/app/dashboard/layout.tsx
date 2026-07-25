'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles, Utensils, Award, Users, Scan,
  BarChart3, LogOut, Menu, X, Lock, Printer, User,
} from 'lucide-react';
import { useRequireAuth } from '@/hooks/useAuth';
import { hasLoyalty } from '@/types';
import { PageSpinner } from '@/components/ui/Spinner';
import { useLanguage, LANGUAGES } from '@/lib/i18n';

interface NavItem {
  key: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  unlocked: boolean;
}

function buildNavItems(tier: string): NavItem[] {
  const loyalty = hasLoyalty(tier as 'basic' | 'loyalty' | 'premium');
  return [
    { key: 'dash_nav_overview', href: '/dashboard',          Icon: BarChart3,   unlocked: true },
    { key: 'dash_nav_menu',     href: '/dashboard/menu',     Icon: Utensils,    unlocked: true },
    { key: 'dash_nav_flyers',   href: '/dashboard/flyers',    Icon: Printer,     unlocked: true },
    { key: 'dash_nav_offers',   href: '/dashboard/loyalty',  Icon: Award,       unlocked: loyalty },
    { key: 'dash_nav_crm',      href: '/dashboard/crm',      Icon: Users,       unlocked: loyalty },
    { key: 'dash_nav_scanner',  href: '/dashboard/scanner',  Icon: Scan,        unlocked: loyalty },
    { key: 'dash_nav_plugins',  href: '/dashboard/plugins',  Icon: Sparkles,    unlocked: true },
    { key: 'dash_nav_profile',  href: '/dashboard/profile',  Icon: User,        unlocked: true },
  ];
}

function Logo({ className = 'text-xl' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <Sparkles className="h-5 w-5 text-amber-700" />
      <span className="font-black bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
        MenuFid
      </span>
    </div>
  );
}

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}) {
  const { t } = useLanguage();
  const { Icon, key, href, unlocked } = item;
  const label = t(key);

  if (!unlocked) {
    return (
      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-400 cursor-not-allowed">
        <span className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </span>
        <Lock className="h-3.5 w-3.5" />
      </div>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition btn-press ${
        isActive
          ? 'bg-amber-50 border border-amber-100/50 text-amber-700'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { merchant, isLoading, logout } = useRequireAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  if (isLoading || !merchant) {
    return <PageSpinner />;
  }

  const navItems = buildNavItems(merchant.plan_tier);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header Mobile */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30">
        <Logo />
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700 outline-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-6 sticky top-0 h-screen justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Logo />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700 outline-none cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.code.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Merchant Badge Info */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="font-bold text-slate-900 text-xs truncate">{merchant.business_name}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                  PLAN {merchant.plan_tier.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                />
              ))}
            </nav>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition btn-press w-full mt-4"
          >
            <LogOut className="h-4 w-4" />
            <span>{t('dash_nav_logout')}</span>
          </button>
        </aside>

        {/* Drawer Menu Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex">
            <div className="w-4/5 max-w-xs bg-white h-full p-6 flex flex-col justify-between shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Logo />
                  <button onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      isActive={pathname === item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  ))}
                </nav>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition w-full"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('dash_nav_logout')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
