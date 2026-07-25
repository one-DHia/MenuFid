'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'fr' | 'en' | 'es' | 'ar' | 'de' | 'it' | 'pt';

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', dir: 'ltr' },
];

export const translations: Record<Language, Record<string, string>> = {
  fr: {
    hero_title: 'Boostez le chiffre d\'affaires de votre restaurant avec la fidélité digitale',
    hero_subtitle: 'Menu QR interactif, carte de fidélité sur smartphone et offres marketing ciblées pour maximiser vos gains.',
    get_started: 'Rejoindre MenuFid',
    pricing: 'Abonnements',
    partners: 'Devenir notre Partenaire',
    about: 'À propos',
    contact: 'Contact',
    terms: 'Conditions Générales',
    login: 'Connexion',
    register: 'Créer un compte',
    basic_plan: 'Basic',
    loyalty_plan: 'Fidélité',
    premium_plan: 'Premium',
    per_month: '/mois',
    boost_revenue: 'Accroître vos revenus',
    boost_revenue_desc: 'Transformez chaque visiteur en client régulier et augmentez la valeur moyenne de vos commandes.',
  },
  en: {
    hero_title: 'Boost your restaurant revenue with digital loyalty',
    hero_subtitle: 'Interactive QR menu, smartphone loyalty card, and targeted marketing offers to maximize your profits.',
    get_started: 'Join MenuFid',
    pricing: 'Pricing',
    partners: 'Become a Partner',
    about: 'About Us',
    contact: 'Contact',
    terms: 'Terms of Service',
    login: 'Log In',
    register: 'Get Started',
    basic_plan: 'Basic',
    loyalty_plan: 'Loyalty',
    premium_plan: 'Premium',
    per_month: '/month',
    boost_revenue: 'Increase Your Profits',
    boost_revenue_desc: 'Turn every visitor into a returning customer and increase average order value.',
  },
  es: {
    hero_title: 'Aumente los ingresos de su restaurante con fidelidad digital',
    hero_subtitle: 'Menú QR interactivo, tarjeta de fidelización para smartphone y ofertas de marketing para maximizar sus ganancias.',
    get_started: 'Unirse a MenuFid',
    pricing: 'Precios',
    partners: 'Ser Socio',
    about: 'Nosotros',
    contact: 'Contacto',
    terms: 'Términos de servicio',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    basic_plan: 'Básico',
    loyalty_plan: 'Fidelidad',
    premium_plan: 'Premium',
    per_month: '/mes',
    boost_revenue: 'Aumentar sus Ganancias',
    boost_revenue_desc: 'Convierta a cada visitante en un cliente recurrente y aumente el ticket promedio.',
  },
  ar: {
    hero_title: 'زد من أرباح مطعمك ومبيعاتك مع برنامج الولاء الرقمي',
    hero_subtitle: 'قائمة طعام تفاعلية عبر رمز QR، بطاقة ولاء رقمية على الهاتف ومكافآت مخصصة لزيادة مداخيلك.',
    get_started: 'انضم إلى MenuFid',
    pricing: 'الاشتراكات',
    partners: 'كن شريكاً معنا',
    about: 'من نحن',
    contact: 'اتصل بنا',
    terms: 'الشروط والأحكام',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    basic_plan: 'الأساسي',
    loyalty_plan: 'الولاء',
    premium_plan: 'الممتاز',
    per_month: '/شهرياً',
    boost_revenue: 'مضاعفة أرباحك',
    boost_revenue_desc: 'حول كل زائر إلى زبون دائم وزد من قيمة الطلب المتوسط بفضل حلولنا الذكية.',
  },
  de: {
    hero_title: 'Steigern Sie den Umsatz Ihres Restaurants mit digitaler Kundenbindung',
    hero_subtitle: 'Interaktive QR-Speisekarte, Kundenkarte auf dem Smartphone und gezieltes Marketing zur Gewinnmaximierung.',
    get_started: 'Jetzt starten',
    pricing: 'Preise',
    partners: 'Partner werden',
    about: 'Über uns',
    contact: 'Kontakt',
    terms: 'AGB',
    login: 'Anmelden',
    register: 'Registrieren',
    basic_plan: 'Basis',
    loyalty_plan: 'Treue',
    premium_plan: 'Premium',
    per_month: '/Monat',
    boost_revenue: 'Einnahmen steigern',
    boost_revenue_desc: 'Verwandeln Sie Gäste in Stammkunden und steigern Sie den durchschnittlichen Bestellwert.',
  },
  it: {
    hero_title: 'Aumenta i ricavi del tuo ristorante con la fedeltà digitale',
    hero_subtitle: 'Menu QR interattivo, carta fedeltà su smartphone e offerte di marketing mirate per massimizzare i tuoi guadagni.',
    get_started: 'Unisciti a MenuFid',
    pricing: 'Prezzi',
    partners: 'Diventa Partner',
    about: 'Chi Siamo',
    contact: 'Contatti',
    terms: 'Termini e Condizioni',
    login: 'Accedi',
    register: 'Registrati',
    basic_plan: 'Base',
    loyalty_plan: 'Fedeltà',
    premium_plan: 'Premium',
    per_month: '/mese',
    boost_revenue: 'Aumenta i Guadagni',
    boost_revenue_desc: 'Trasforma ogni visitatore in un cliente abituale e aumenta lo scontrino medio.',
  },
  pt: {
    hero_title: 'Aumente os lucros do seu restaurante com fidelidade digital',
    hero_subtitle: 'Menu QR interativo, cartão de fidelidade no smartphone e ofertas de marketing para maximizar os seus ganhos.',
    get_started: 'Junte-se ao MenuFid',
    pricing: 'Planos',
    partners: 'Seja nosso Parceiro',
    about: 'Sobre nós',
    contact: 'Contacto',
    terms: 'Termos de Serviço',
    login: 'Entrar',
    register: 'Registar',
    basic_plan: 'Básico',
    loyalty_plan: 'Fidelidade',
    premium_plan: 'Premium',
    per_month: '/mês',
    boost_revenue: 'Aumentar os Lucros',
    boost_revenue_desc: 'Transforme visitantes em clientes habituais e aumente o valor médio de cada pedido.',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'fr',
  setLanguage: () => {},
  t: (key) => key,
  dir: 'ltr',
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    const saved = localStorage.getItem('menufid_lang') as Language;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('menufid_lang', lang);
    const currentOpt = LANGUAGES.find((l) => l.code === lang);
    document.documentElement.dir = currentOpt?.dir || 'ltr';
    document.documentElement.lang = lang;
  };

  const currentOpt = LANGUAGES.find((l) => l.code === language);
  const dir = currentOpt?.dir || 'ltr';

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['fr']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
