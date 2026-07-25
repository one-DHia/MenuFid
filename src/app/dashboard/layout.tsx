'use client';

/**
 * app/dashboard/layout.tsx
 * ─────────────────────────────────────────────────────────────
 * Layout principal du dashboard commerçant.
 * Gère la sidebar desktop et le menu mobile.
 * Protège toutes les routes /dashboard/* via useRequireAuth.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles, Utensils, Award, Users, Scan,
  BarChart3, LogOut, Menu, X, Lock, Printer, ShieldCheck, User,
} from 'lucide-react';
import { useRequireAuth } from '@/hooks/useAuth';
import { hasLoyalty } from '@/types';
import { PageSpinner } from '@/components/ui/Spinner';

// ─── Définition des liens de navigation ─────────────────────

interface NavItem {
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  /** true si le plan de l'utilisateur donne accès */
  unlocked: boolean;
}

function buildNavItems(tier: string, role?: string): NavItem[] {
  const loyalty = hasLoyalty(tier as 'basic' | 'loyalty' | 'premium');
  const items: NavItem[] = [
    { label: 'Vue générale',        href: '/dashboard',          Icon: BarChart3,   unlocked: true },
    { label: 'Carte Digitale QR',   href: '/dashboard/menu',     Icon: Utensils,    unlocked: true },
    { label: 'Chevalets & QR',      href: '/dashboard/flyers',    Icon: Printer,     unlocked: true },
    { label: 'Offres & Cadeaux',    href: '/dashboard/loyalty',  Icon: Award,       unlocked: loyalty },
    { label: 'Fichier Clients',     href: '/dashboard/crm',      Icon: Users,       unlocked: loyalty },
    { label: 'Scanner de Caisse',   href: '/dashboard/scanner',  Icon: Scan,        unlocked: loyalty },
    { label: 'Modules & Plugins',   href: '/dashboard/plugins',  Icon: Sparkles,    unlocked: true },
    { label: 'Profil Établissement',href: '/dashboard/profile',  Icon: User,        unlocked: true },
  ];

  return items;
}

// ─── Composant logo ──────────────────────────────────────────

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

// ─── Lien de navigation ───────────────────────────────────────

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}) {
  const { Icon, label, href, unlocked } = item;

  // Item verrouillé — désactivé visuellement
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

// ─── Layout principal ─────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { merchant, isLoading, logout } = useRequireAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Afficher un spinner pendant la vérification de session
  if (isLoading) return <PageSpinner />;

  const navItems = buildNavItems(merchant?.plan_tier ?? 'basic', merchant?.role);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row">

      {/* ── Sidebar desktop ── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/80 bg-white p-6 flex-shrink-0 justify-between">
        <div className="space-y-6">
          <Logo />

          {/* Profil commerçant */}
          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-2">
            <h3 className="font-bold text-sm truncate text-slate-900">
              {merchant?.business_name || 'Mon Établissement'}
            </h3>
            <div className="flex items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100/80 text-amber-900 border border-amber-200/70 px-2.5 py-0.5 rounded-full inline-block">
                {merchant?.plan_tier === 'premium'
                  ? 'Plan Premium 360°'
                  : merchant?.plan_tier === 'loyalty'
                  ? 'Plan Fidélité CRM'
                  : 'Plan Carte Digitale'}
              </span>
            </div>
            {merchant?.slug && (
              <Link
                href={`/menu/${merchant.slug}`}
                target="_blank"
                className="text-[11px] font-semibold text-amber-700 hover:underline block pt-1"
              >
                Voir ma carte publique ↗
              </Link>
            )}
          </div>

          {/* Navigation */}
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

        {/* Déconnexion */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50/50 transition w-full text-left btn-press"
        >
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </button>
      </aside>

      {/* ── Header mobile ── */}
      <header className="md:hidden flex items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3 sticky top-0 z-50 shadow-sm">
        <Logo className="text-lg" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-slate-600 hover:text-slate-900 transition"
          aria-label="Ouvrir le menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* ── Menu mobile overlay ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white/95 flex flex-col p-6 pt-20 gap-6 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
            <h3 className="font-bold text-slate-900">{merchant?.business_name || 'Mon Établissement'}</h3>
            <span className="text-[10px] bg-amber-100/80 text-amber-900 border border-amber-200/70 px-2 py-0.5 rounded-full uppercase inline-block font-bold">
              {merchant?.plan_tier === 'premium'
                ? 'Plan Premium 360°'
                : merchant?.plan_tier === 'loyalty'
                ? 'Plan Fidélité CRM'
                : 'Plan Carte Digitale'}
            </span>
          </div>

          <nav className="flex-grow space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </nav>

          <button
            onClick={logout}
            className="flex items-center gap-3 p-3 text-slate-500 hover:text-red-600 transition btn-press"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-bold text-sm">Déconnexion</span>
          </button>
        </div>
      )}

      {/* ── Zone de contenu principale ── */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
