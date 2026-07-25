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
    premium_plan: 'Premium Intégral',
    per_month: '/mois',
    boost_revenue: 'Accroître vos revenus',
    boost_revenue_desc: 'Transformez chaque visiteur en client régulier et augmentez la valeur moyenne de vos commandes.',
    bot_greeting: 'Bonjour 👋 ! Je suis l\'Assistant virtuel MenuFid. Comment puis-je vous aider à augmenter vos gains aujourd\'hui ?',
    bot_q1: 'Comment MenuFid augmente mes revenus ?',
    bot_a1: 'MenuFid transforme vos visiteurs en clients fidèles. Avec la carte digitale enregistrée sur leur smartphone, vos clients reviennent 2x plus souvent !',
    bot_q2: 'Combien coûtent les formules ?',
    bot_a2: 'Nos formules sont transparentes : Basic 5€/mois, Fidélité 10€/mois et Premium 20€/mois. Sans engagement !',
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
    premium_plan: 'Full Premium',
    per_month: '/month',
    boost_revenue: 'Increase Your Profits',
    boost_revenue_desc: 'Turn every visitor into a returning customer and increase average order value.',
    bot_greeting: 'Hello 👋! I am the MenuFid Virtual Assistant. How can I help you boost your earnings today?',
    bot_q1: 'How does MenuFid boost my revenue?',
    bot_a1: 'MenuFid turns one-time visitors into loyal customers. With the smartphone digital card, clients come back 2x more often!',
    bot_q2: 'How much do plans cost?',
    bot_a2: 'Our plans are simple: Basic €5/mo, Loyalty €10/mo, and Premium €20/mo. No commitment!',
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
    premium_plan: 'Premium Integral',
    per_month: '/mes',
    boost_revenue: 'Aumentar sus Ganancias',
    boost_revenue_desc: 'Convierta a cada visitante en un cliente recurrente y aumente el ticket promedio.',
    bot_greeting: '¡Hola 👋! Soy el Asistente Virtual MenuFid. ¿Cómo puedo ayudarte a aumentar tus ingresos hoy?',
    bot_q1: '¿Cómo aumenta MenuFid mis ganancias?',
    bot_a1: 'MenuFid transforma los visitantes en clientes fieles. Con la tarjeta digital en el teléfono, ¡regresan 2 veces más!',
    bot_q2: '¿Cuánto cuestan los planes?',
    bot_a2: 'Nuestros planes son claros: Básico 5€/mes, Fidelidad 10€/mes y Premium 20€/mes. ¡Sin permanencia!',
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
    premium_plan: 'الممتاز الشامل',
    per_month: '/شهرياً',
    boost_revenue: 'مضاعفة أرباحك',
    boost_revenue_desc: 'حول كل زائر إلى زبون دائم وزد من قيمة الطلب المتوسط بفضل حلولنا الذكية.',
    bot_greeting: 'مرحباً 👋! أنا المساعد الافتراضي لـ MenuFid. كيف يمكنني مساعدتك في زيادة أرباحك اليوم؟',
    bot_q1: 'كيف يزيد MenuFid من مبيعاتي؟',
    bot_a1: 'يحول MenuFid الزوار إلى زبائن دائمين. بفضل بطاقة الولاء الرقمية على الهاتف، يعود الزبائن مرتين أكثر!',
    bot_q2: 'كم تبلغ تكلفة الاشتراكات؟',
    bot_a2: 'أسعارنا شفافة ومناسبة: الأساسي 5€/شهرياً، الولاء 10€/شهرياً، والممتاز 20€/شهرياً. بدون أي التزام!',
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
    premium_plan: 'Premium Komplett',
    per_month: '/Monat',
    boost_revenue: 'Einnahmen steigern',
    boost_revenue_desc: 'Verwandeln Sie Gäste in Stammkunden und steigern Sie den durchschnittlichen Bestellwert.',
    bot_greeting: 'Hallo 👋! Ich bin der virtuelle MenuFid Assistent. Wie kann ich Ihnen heute helfen?',
    bot_q1: 'Wie steigert MenuFid meinen Umsatz?',
    bot_a1: 'MenuFid macht aus einmaligen Gästen treue Stammkunden. Mit der digitalen Karte kommen Gäste doppelt so oft wieder!',
    bot_q2: 'Was kosten die Tarife?',
    bot_a2: 'Unsere Preise sind transparent: Basis 5€/Monat, Treue 10€/Monat und Premium 20€/Monat. Ohne Mindestlaufzeit!',
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
    premium_plan: 'Premium Integrale',
    per_month: '/mese',
    boost_revenue: 'Aumenta i Guadagni',
    boost_revenue_desc: 'Trasforma ogni visitatore in un cliente abituale e aumenta lo scontrino medio.',
    bot_greeting: 'Ciao 👋! Sono l\'Assistente Virtuale MenuFid. Come posso aiutarti ad aumentare i tuoi guadagni oggi?',
    bot_q1: 'Come fa MenuFid ad aumentare le mie vendite?',
    bot_a1: 'MenuFid trasforma i clienti occasionali in clienti fedeli. Con la tessera digitale sullo smartphone, ritornano 2 volte più spesso!',
    bot_q2: 'Quanto costano i piani?',
    bot_a2: 'I nostri prezzi sono chiari: Base 5€/mese, Fedeltà 10€/mese e Premium 20€/mese. Senza vincoli!',
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
    premium_plan: 'Premium Integral',
    per_month: '/mês',
    boost_revenue: 'Aumentar os Lucros',
    boost_revenue_desc: 'Transforme visitantes em clientes habituais e aumente o valor médio de cada pedido.',
    bot_greeting: 'Olá 👋! Sou o Assistente Virtual do MenuFid. Como posso ajudá-lo a aumentar os seus lucros hoje?',
    bot_q1: 'Como é que o MenuFid aumenta as minhas vendas?',
    bot_a1: 'O MenuFid transforma visitantes em clientes fiéis. Com o cartão digital no telemóvel, os clientes voltam 2 vezes mais!',
    bot_q2: 'Quanto custam os planos?',
    bot_a2: 'Os nossos planos são simples: Básico 5€/mês, Fidelidade 10€/mês e Premium 20€/mês. Sem fidelização!',
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
