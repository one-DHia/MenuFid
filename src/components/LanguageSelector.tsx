'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, LANGUAGES, Language } from '@/lib/i18n';
import { Globe, ChevronDown, Check } from 'lucide-react';

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
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 hover:bg-amber-50/80 text-slate-800 text-xs font-bold transition border border-amber-900/10 shadow-sm hover:shadow group"
        title="Changer la langue / Switch language"
      >
        <Globe className="w-3.5 h-3.5 text-amber-800 group-hover:rotate-12 transition-transform" />
        <span className="text-base leading-none">{currentLang.flag}</span>
        <span className="hidden sm:inline text-slate-700 tracking-wide font-medium">{currentLang.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180 text-amber-800' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white/95 backdrop-blur-md border border-amber-900/10 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3.5 py-1.5 text-[10px] uppercase font-extrabold text-amber-900/60 border-b border-slate-100 flex items-center justify-between">
            <span>Langue / Language</span>
            <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md font-bold">7 Langues</span>
          </div>

          <div className="py-1 max-h-64 overflow-y-auto">
            {LANGUAGES.map((item) => (
              <button
                key={item.code}
                onClick={() => {
                  setLanguage(item.code as Language);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition ${
                  language === item.code
                    ? 'font-bold text-amber-900 bg-amber-100/60'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-amber-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{item.flag}</span>
                  <span className="tracking-tight">{item.name}</span>
                </div>
                {language === item.code && <Check className="w-3.5 h-3.5 text-amber-800" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
