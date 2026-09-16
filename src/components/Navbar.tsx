'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/i18n';
import { Menu, X, ArrowRight, UtensilsCrossed, Wallet, Globe, Building2 } from 'lucide-react';

export default function Navbar() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#FAFAFA]/95 backdrop-blur-md border-b-2 border-black transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#FFB800] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">
            <UtensilsCrossed className="w-5 h-5 text-black" />
          </div>
          <span className="font-black text-2xl tracking-tight text-black leading-none">
            Menu<span className="bg-[#FFB800] px-1 ml-0.5 rounded border border-black text-black">Fid</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-black uppercase tracking-wider text-black">
          <Link href="/" className="hover:bg-[#FFB800] px-2.5 py-1 rounded border border-transparent hover:border-black transition">
            {t('nav_home')}
          </Link>
          <Link href="/pricing" className="hover:bg-[#FFB800] px-2.5 py-1 rounded border border-transparent hover:border-black transition">
            {t('nav_pricing')}
          </Link>
          <Link href="/installer" className="hover:bg-[#FFB800] px-2.5 py-1 rounded border border-transparent hover:border-black transition">
            {t('nav_install', 'Installer l\'App')}
          </Link>
          <Link href="/wallet" className="hover:bg-[#00F59B] px-2.5 py-1 rounded border border-transparent hover:border-black transition flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" />
            <span>{t('nav_wallet', 'Portefeuille')}</span>
          </Link>
          <Link href="/distributor" className="hover:bg-[#FFB800] px-2.5 py-1 rounded border border-transparent hover:border-black transition flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>{t('distributor_portal', 'Portail Distributeur')}</span>
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSelector />
          <Link
            href="/pro/login"
            className="neo-pill-btn-white text-xs py-2 px-4"
          >
            {t('nav_pro_space', 'Espace Pro')}
          </Link>
          <Link
            href="/pro/register"
            className="neo-pill-btn text-xs py-2 px-5"
          >
            <span>{t('nav_start', 'Commencer')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Toggle & Selector */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSelector />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] text-black"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b-2 border-black px-4 pt-4 pb-6 space-y-3">
          <nav className="flex flex-col gap-2 text-sm font-black uppercase text-black">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl border border-black bg-neutral-50 hover:bg-[#FFB800] transition"
            >
              {t('nav_home')}
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl border border-black bg-neutral-50 hover:bg-[#FFB800] transition"
            >
              {t('nav_pricing')}
            </Link>
            <Link
              href="/installer"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl border border-black bg-neutral-50 hover:bg-[#FFB800] transition"
            >
              {t('nav_install', 'Installer l\'App')}
            </Link>
            <Link
              href="/wallet"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl border border-black bg-neutral-50 hover:bg-[#00F59B] transition flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>{t('nav_wallet_client', 'Portefeuille Client')}</span>
            </Link>
            <Link
              href="/distributor"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl border border-black bg-neutral-50 hover:bg-[#FFB800] transition flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span>{t('distributor_portal', 'Portail Distributeur')}</span>
            </Link>
          </nav>

          <div className="pt-2 border-t-2 border-black flex flex-col gap-2.5">
            <Link
              href="/pro/login"
              onClick={() => setMobileMenuOpen(false)}
              className="neo-pill-btn-white text-center text-xs py-2.5"
            >
              {t('nav_pro_login', 'Connexion Pro')}
            </Link>
            <Link
              href="/pro/register"
              onClick={() => setMobileMenuOpen(false)}
              className="neo-pill-btn text-center text-xs py-2.5"
            >
              {t('nav_start', 'Commencer')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
