'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import frDict from '@/locales/fr.json';
import enDict from '@/locales/en.json';
import arDict from '@/locales/ar.json';

export type Language = 'fr' | 'en' | 'ar';

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
];

export const translations: Record<Language, Record<string, string>> = {
  fr: frDict,
  en: enDict,
  ar: arDict,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'fr',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  dir: 'ltr',
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('menufid_lang') as Language;
      if (savedLang && translations[savedLang]) {
        setLanguageState(savedLang);
        const langObj = LANGUAGES.find((l) => l.code === savedLang);
        if (langObj) setDir(langObj.dir);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    const langObj = LANGUAGES.find((l) => l.code === lang);
    const newDir = langObj ? langObj.dir : 'ltr';
    setDir(newDir);

    if (typeof window !== 'undefined') {
      localStorage.setItem('menufid_lang', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = newDir;
    }
  };

  const t = (key: string, fallback?: string): string => {
    const dict = translations[language] || translations.fr;
    if (dict && dict[key]) {
      return dict[key];
    }
    // Fallback en français si la clé manque dans la langue cible
    if (translations.fr && translations.fr[key]) {
      return translations.fr[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
