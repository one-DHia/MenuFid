'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, LANGUAGES, Language } from '@/lib/i18n';
import { Globe, ChevronDown, Check } from 'lucide-react';

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-bold transition border border-stone-200/80 shadow-xs btn-press"
        aria-label={t('change_language', 'Changer de langue')}
      >
        <span className="text-sm leading-none">{currentLang.flag}</span>
        <span className="uppercase font-black tracking-wider text-[11px]">{currentLang.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-stone-200 shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1 text-[10px] font-black uppercase text-stone-400 tracking-wider border-b border-stone-100 mb-1">
            {t('select_language', 'Choisir la langue')}
          </div>
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code as Language);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition text-left ${
                  isSelected
                    ? 'bg-amber-50 text-amber-900 font-black'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base leading-none">{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-800" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
