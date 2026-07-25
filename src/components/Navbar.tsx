'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/i18n';
import { QrCode, Menu, X, ArrowRight, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-900/10 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform border border-amber-500/30">
            <QrCode className="w-5 h-5 text-amber-200" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-slate-900 leading-none">
              Menu<span className="text-amber-800">Fid</span>
            </span>
            <span className="text-[9px] font-bold text-amber-700 uppercase tracking-widest leading-tight">
              SaaS Restauration
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-700">
          <Link href="/pricing" className="hover:text-amber-800 transition py-1">
            {t('nav_pricing')}
          </Link>
          <Link href="/distribution" className="hover:text-amber-800 transition py-1 flex items-center gap-1">
            <span>{t('nav_partners')}</span>
            <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.5 rounded-full font-black">⭐</span>
          </Link>
          <Link href="/about" className="hover:text-amber-800 transition py-1">
            {t('nav_about')}
          </Link>
          <Link href="/contact" className="hover:text-amber-800 transition py-1">
            {t('nav_contact')}
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSelector />
          <Link
            href="/login"
            className="text-xs font-bold text-slate-700 hover:text-amber-800 px-3 py-2 transition"
          >
            {t('nav_login')}
          </Link>
          <Link
            href="/register"
            className="bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-md transition flex items-center gap-1.5 btn-press"
          >
            <span>{t('nav_register')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Toggle & Selector */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSelector />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-2.5 text-sm font-bold text-slate-800">
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-amber-50 hover:text-amber-800 transition"
            >
              {t('nav_pricing')}
            </Link>
            <Link
              href="/distribution"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-amber-50 hover:text-amber-800 transition flex items-center justify-between"
            >
              <span>{t('nav_partners')}</span>
              <span className="bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-black">⭐</span>
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-amber-50 hover:text-amber-800 transition"
            >
              {t('nav_about')}
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-amber-50 hover:text-amber-800 transition"
            >
              {t('nav_contact')}
            </Link>
          </nav>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl"
            >
              {t('nav_login')}
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-800 to-amber-900 rounded-xl shadow-md"
            >
              {t('nav_register')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
