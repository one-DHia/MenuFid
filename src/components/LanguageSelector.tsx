'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, LANGUAGES, Language } from '@/lib/i18n';
import { Globe, ChevronDown } from 'lucide-react';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold transition border border-slate-200/60 shadow-sm"
        title="Changer de langue"
      >
        <Globe className="w-3.5 h-3.5 text-amber-700" />
        <span className="mr-0.5">{currentLang.flag}</span>
        <span className="hidden sm:inline font-medium">{currentLang.name}</span>
        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-amber-100 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
            Langue / Language
          </div>
          {LANGUAGES.map((item) => (
            <button
              key={item.code}
              onClick={() => {
                setLanguage(item.code as Language);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition hover:bg-amber-50/70 ${
                language === item.code ? 'font-bold text-amber-800 bg-amber-50/90' : 'text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{item.flag}</span>
                <span>{item.name}</span>
              </div>
              {language === item.code && <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
