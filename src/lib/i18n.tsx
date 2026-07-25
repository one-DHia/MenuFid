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
    hero_title: 'Boostez le chiffre d\'affaires de votre établissement avec la fidélité digitale',
    hero_subtitle: 'Menu QR Code interactif, carte de fidélité sur smartphone Apple & Google Wallet et relances automatiques pour maximiser vos gains.',
    get_started: 'Créer mon compte restaurateur',
    pricing: 'Abonnements',
    partners: 'Devenir notre Partenaire',
    about: 'À propos de nous',
    contact: 'Contactez-nous',
    terms: 'Conditions d\'utilisation',
    login: 'Se connecter',
    register: 'Créer un compte',
    basic_plan: 'Basic (5€/mois)',
    loyalty_plan: 'Fidélité (10€/mois)',
    premium_plan: 'Premium Intégral (20€/mois)',
    per_month: '/mois',
    boost_revenue: 'Multiplier vos gains et bénéfices',
    boost_revenue_desc: 'Transformez vos visiteurs occasionnels en clients fidèles et réguliers grâce à une solution simple et rentable.',
    no_credit_card: 'Paiement Stripe 100% Sécurisé - Sans Engagement',
    digital_card: 'Carte de Fidélité Digitale',
    qr_menu: 'Menu QR Code Interactif',
    partner_title: 'Devenez Partenaire Exclusif MenuFid',
    partner_subtitle: 'Déployez la solution de fidélité numéro 1 dans votre région et percevez des commissions récurrentes.',
    partner_btn: 'Déposer ma candidature',
    bot_greeting: 'Bonjour 👋 ! Je suis l\'Assistant virtuel MenuFid. Comment puis-je vous aider à augmenter vos gains aujourd\'hui ?',
    bot_q1: 'Comment MenuFid augmente mes revenus ?',
    bot_a1: 'MenuFid transforme vos visiteurs occasionnels en clients réguliers. Vos clients enregistrent leur carte de fidélité sur leur smartphone et reviennent 2x plus souvent !',
    bot_q2: 'Combien coûtent les formules MenuFid ?',
    bot_a2: 'Nos abonnements sont simples : Basic 5€/mois, Fidélité 10€/mois et Premium 20€/mois. Sans engagement !',
    bot_q3: 'Comment fonctionne le Menu QR Code ?',
    bot_a3: 'Vos clients scannent le QR Code à table sans application. Le menu s\'affiche instantanément avec photos HD et allergènes.',
    bot_q4: 'Comment devenir Partenaire officiel ?',
    bot_a4: 'Remplissez le formulaire sur notre page Partenaires pour obtenir un secteur d\'exclusivité et distribuer MenuFid.',
  },
  en: {
    hero_title: 'Boost your establishment revenue with digital loyalty',
    hero_subtitle: 'Interactive QR Code menu, Apple & Google Wallet loyalty card, and automated retention to maximize profits.',
    get_started: 'Create Merchant Account',
    pricing: 'Pricing',
    partners: 'Become Our Partner',
    about: 'About Us',
    contact: 'Contact Us',
    terms: 'Terms of Service',
    login: 'Log In',
    register: 'Sign Up',
    basic_plan: 'Basic (€5/mo)',
    loyalty_plan: 'Loyalty (€10/mo)',
    premium_plan: 'Full Premium (€20/mo)',
    per_month: '/month',
    boost_revenue: 'Increase Your Sales & Profit',
    boost_revenue_desc: 'Turn one-time visitors into repeat loyal customers with a simple and highly profitable tool.',
    no_credit_card: '100% Secure Stripe Checkout - No Long Term Contract',
    digital_card: 'Digital Wallet Card',
    qr_menu: 'Interactive QR Menu',
    partner_title: 'Become an Exclusive MenuFid Partner',
    partner_subtitle: 'Deploy the #1 loyalty solution in your area and earn recurring monthly commissions.',
    partner_btn: 'Apply for Partnership',
    bot_greeting: 'Hello 👋! I am the MenuFid Virtual Assistant. How can I help you increase your earnings today?',
    bot_q1: 'How does MenuFid increase my revenue?',
    bot_a1: 'MenuFid converts casual visitors into regular customers. Smartphone wallet cards keep them coming back twice as often!',
    bot_q2: 'How much do MenuFid plans cost?',
    bot_a2: 'Our plans are simple: Basic €5/mo, Loyalty €10/mo, and Premium €20/mo. No commitment!',
    bot_q3: 'How does the QR Code Menu work?',
    bot_a3: 'Guests scan the table QR code without downloading any app. Your menu loads instantly with HD photos.',
    bot_q4: 'How to become an official Partner?',
    bot_a4: 'Fill out the form on our Partner page to claim an exclusive territory and distribute MenuFid.',
  },
  es: {
    hero_title: 'Aumente las ganancias de su establecimiento con fidelidad digital',
    hero_subtitle: 'Menú interactivo con código QR, tarjeta de fidelidad para teléfono inteligente y fidelización automática.',
    get_started: 'Crear cuenta de comerciante',
    pricing: 'Planes y Precios',
    partners: 'Conviértase en nuestro socio',
    about: 'Sobre nosotros',
    contact: 'Contacto',
    terms: 'Términos de servicio',
    login: 'Iniciar sesión',
    register: 'Registrarse',
    basic_plan: 'Básico (5€/mes)',
    loyalty_plan: 'Fidelidad (10€/mes)',
    premium_plan: 'Premium Integral (20€/mes)',
    per_month: '/mes',
    boost_revenue: 'Aumentar sus ingresos y rentabilidad',
    boost_revenue_desc: 'Convierta visitantes ocasionales en clientes habituales con una solución rentable y fácil de usar.',
    no_credit_card: 'Pago 100% Seguro con Stripe - Sin Compromiso',
    digital_card: 'Tarjeta Digital en el Teléfono',
    qr_menu: 'Menú Código QR Interactivo',
    partner_title: 'Conviértase en Socio Exclusivo de MenuFid',
    partner_subtitle: 'Despliegue la solución líder de fidelización en su región y reciba comisiones recurrentes.',
    partner_btn: 'Enviar mi solicitud',
    bot_greeting: '¡Hola 👋! Soy el Asistente Virtual MenuFid. ¿Cómo puedo ayudarte a aumentar tus ganancias hoy?',
    bot_q1: '¿Cómo aumenta MenuFid mis ingresos?',
    bot_a1: 'MenuFid transforma clientes ocasionales en clientes leales. Con su tarjeta digital en el teléfono, ¡regresan el doble de veces!',
    bot_q2: '¿Cuánto cuestan las tarifas de MenuFid?',
    bot_a2: 'Nuestros precios son sencillos: Básico 5€/mes, Fidelidad 10€/mes y Premium 20€/mes. ¡Sin permanencia!',
    bot_q3: '¿Cómo funciona el Menú QR?',
    bot_a3: 'Los clientes escanean el código QR sin descargar aplicaciones. El menú aparece de inmediato.',
    bot_q4: '¿Cómo ser Socio Oficial?',
    bot_a4: 'Complete el formulario en nuestra página de socios para obtener un territorio exclusivo.',
  },
  ar: {
    hero_title: 'ضاعف أرباح ومبيعات مطعمك مع برنامج الولاء الرقمي الذكي',
    hero_subtitle: 'قائمة طعام تفاعلية عبر رمز QR، بطاقة ولاء رقمية على محفظة الهاتف، وزيادة تردد الزبائن.',
    get_started: 'إنشاء حساب تاجر',
    pricing: 'خطط الاشتراكات',
    partners: 'كن شريكاً معنا',
    about: 'من نحن',
    contact: 'اتصل بنا',
    terms: 'الشروط والأحكام',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    basic_plan: 'الأساسية (5€/شهرياً)',
    loyalty_plan: 'الولاء (10€/شهرياً)',
    premium_plan: 'الاحترافية (20€/شهرياً)',
    per_month: '/شهرياً',
    boost_revenue: 'مضاعفة مداخيلك وأرباحك الصافية',
    boost_revenue_desc: 'حول الزوار العابرين إلى زبائن دائمين ومخلصين بفضل حل رقمي بسيط ومربح.',
    no_credit_card: 'دفع آمن 100% عبر Stripe - بدون أي التزام',
    digital_card: 'بطاقة الولاء الرقمية للهاتف',
    qr_menu: 'قائمة طعام رمز QR تفاعلية',
    partner_title: 'كن شريكاً حصرياً لـ MenuFid',
    partner_subtitle: 'انشر أفضل برنامج ولاء للمطاعم في منطقتك واحصل على عمولات شهرية مستمرة.',
    partner_btn: 'تقديم طلب الشراكة',
    bot_greeting: 'مرحباً بك 👋! أنا المساعد الافتراضي لـ MenuFid. كيف يمكنني مساعدتك في زيادة أرباحك اليوم؟',
    bot_q1: 'كيف يساعد MenuFid في زيادة أرباحي؟',
    bot_a1: 'يحول MenuFid الزوار العاديين إلى زبائن دائمين. يعود الزبائن مرتين أكثر بفضل بطاقة الولاء الرقمية على هواتفهم!',
    bot_q2: 'كم تبلغ تكلفة الاشتراكات؟',
    bot_a2: 'الأسعار شفافة ومناسبة للجميع: الأساسية 5€/شهرياً، الولاء 10€/شهرياً، والاحترافية 20€/شهرياً. بدون التزام!',
    bot_q3: 'كيف تعمل قائمة رمز QR؟',
    bot_a3: 'يمسح الزبائن الرمز الموجود على الطاولة دون تحميل أي تطبيق، لتظهر قائمة الطعام فوراً بصور عالية الجودة.',
    bot_q4: 'كيف أصبح شريكاً رسمياً؟',
    bot_a4: 'قم بتعبئة نموذج الشراكة على صفحتنا للحصول على منطقة حصرية وتوزيع MenuFid.',
  },
  de: {
    hero_title: 'Steigern Sie Ihren Umsatz mit digitaler Kundenbindung',
    hero_subtitle: 'Interaktives QR-Code-Menü, Smartphone-Treuekarte und automatisierte Kundenbindung für maximale Gewinne.',
    get_started: 'Konto Erstellen',
    pricing: 'Preise & Tarife',
    partners: 'Partner Werden',
    about: 'Über uns',
    contact: 'Kontakt',
    terms: 'Nutzungsbedingungen',
    login: 'Anmelden',
    register: 'Registrieren',
    basic_plan: 'Basis (5€/Monat)',
    loyalty_plan: 'Treue (10€/Monat)',
    premium_plan: 'Premium Komplett (20€/Monat)',
    per_month: '/Monat',
    boost_revenue: 'Umsatz und Gewinn Maximieren',
    boost_revenue_desc: 'Verwandeln Sie einmalige Gäste in treue Stammkunden mit einer einfachen und hochprofitablen Lösung.',
    no_credit_card: '100% Sichere Stripe-Zahlung - Ohne Mindestlaufzeit',
    digital_card: 'Digitale Treuekarte',
    qr_menu: 'Interaktives QR-Menü',
    partner_title: 'Werden Sie Exklusiver MenuFid-Partner',
    partner_subtitle: 'Bringen Sie die führende Kundenbindungslösung in Ihre Region und sichern Sie sich monatliche Provisionen.',
    partner_btn: 'Partnerschaft Beantragen',
    bot_greeting: 'Hallo 👋! Ich bin der virtuelle Assistent von MenuFid. Wie kann ich Ihnen heute helfen, Ihren Gewinn zu steigern?',
    bot_q1: 'Wie steigert MenuFid meinen Umsatz?',
    bot_a1: 'MenuFid verwandelt Gelegenheitsgäste in Stammkunden. Dank der digitalen Treuekarte kommen Kunden 2x öfter wieder!',
    bot_q2: 'Was kosten die MenuFid-Tarife?',
    bot_a2: 'Unsere Tarife sind transparent: Basis 5€/Monat, Treue 10€/Monat und Premium 20€/Monat. Ohne Bindung!',
    bot_q3: 'Wie funktioniert das QR-Menü?',
    bot_a3: 'Gäste scannen den QR-Code am Tisch ohne App-Download. Die Speisekarte wird sofort angezeigt.',
    bot_q4: 'Wie werde ich offizieller Partner?',
    bot_a4: 'Füllen Sie das Formular auf unserer Partnerseite aus, um exklusiver Vertriebspartner zu werden.',
  },
  it: {
    hero_title: 'Aumenta il fatturato del tuo locale con la fidelizzazione digitale',
    hero_subtitle: 'Menu QR Code interattivo, carta fedeltà su smartphone e fidelizzazione automatica per massimizzare i profitti.',
    get_started: 'Crea Account Ristoratore',
    pricing: 'Piani e Prezzi',
    partners: 'Diventa Nostro Partner',
    about: 'Chi Siamo',
    contact: 'Contattaci',
    terms: 'Termini di Servizio',
    login: 'Accedi',
    register: 'Registrati',
    basic_plan: 'Base (5€/mese)',
    loyalty_plan: 'Fedeltà (10€/mese)',
    premium_plan: 'Premium Integrale (20€/mese)',
    per_month: '/mese',
    boost_revenue: 'Aumentare Guadagni e Profitti',
    boost_revenue_desc: 'Trasforma i clienti occasionali in clienti abituali grazie a una soluzione semplice e altamente redditizia.',
    no_credit_card: 'Pagamento 100% Sicuro con Stripe - Senza Vincoli',
    digital_card: 'Carta Fedeltà Digitale',
    qr_menu: 'Menu QR Code Interattivo',
    partner_title: 'Diventa Partner Esclusivo MenuFid',
    partner_subtitle: 'Porta la soluzione di fidelizzazione n.1 nella tua zona e ricevi commissioni ricorrenti ogni mese.',
    partner_btn: 'Invia Candidatura',
    bot_greeting: 'Ciao 👋! Sono l\'Assistente Virtuale MenuFid. Come posso aiutarti ad aumentare i tuoi guadagni oggi?',
    bot_q1: 'In che modo MenuFid aumenta le mie entrate?',
    bot_a1: 'MenuFid trasforma i clienti di passaggio in clienti fedeli. Con la carta digitale sullo smartphone, ritornano 2 volte più spesso!',
    bot_q2: 'Quanto costano i piani MenuFid?',
    bot_a2: 'I nostri prezzi sono chiari: Base 5€/mese, Fedeltà 10€/mese e Premium 20€/mese. Senza alcun impegno!',
    bot_q3: 'Come funziona il Menu QR Code?',
    bot_a3: 'I clienti inquadrano il QR Code sul tavolo senza scaricare app. Il menu appare all\'istante.',
    bot_q4: 'Come diventare Partner Ufficiale?',
    bot_a4: 'Compila il modulo sulla nostra pagina Partner per ottenere un territorio esclusivo.',
  },
  pt: {
    hero_title: 'Aumente o faturamento do seu restaurante com fidelidade digital',
    hero_subtitle: 'Menu QR Code interativo, cartão de fidelidade no smartphone e automação de retenção para maximizar seus lucros.',
    get_started: 'Criar Conta de Comerciante',
    pricing: 'Planos e Preços',
    partners: 'Seja Nosso Parceiro',
    about: 'Sobre Nós',
    contact: 'Fale Conosco',
    terms: 'Termos de Serviço',
    login: 'Entrar',
    register: 'Cadastrar-se',
    basic_plan: 'Básico (5€/mês)',
    loyalty_plan: 'Fidelidade (10€/mês)',
    premium_plan: 'Premium Integral (20€/mês)',
    per_month: '/mês',
    boost_revenue: 'Aumentar suas Vendas e Lucros',
    boost_revenue_desc: 'Transforme visitantes ocasionais em clientes fiéis com uma ferramenta simples e altamente lucrativa.',
    no_credit_card: 'Pagamento 100% Seguro Stripe - Sem Fidelidade',
    digital_card: 'Cartão de Fidelidade Digital',
    qr_menu: 'Menu QR Code Interativo',
    partner_title: 'Torne-se Parceiro Exclusivo MenuFid',
    partner_subtitle: 'Implemente a solução de fidelização número 1 na sua região e receba comissões mensais recorrentes.',
    partner_btn: 'Enviar Candidatura',
    bot_greeting: 'Olá 👋! Sou o Assistente Virtual MenuFid. Como posso ajudar você a aumentar seus lucros hoje?',
    bot_q1: 'Como o MenuFid aumenta meu faturamento?',
    bot_a1: 'O MenuFid converte clientes casuais em clientes fiéis. Com o cartão digital no telefone, eles retornam 2x mais vezes!',
    bot_q2: 'Quanto custam os planos do MenuFid?',
    bot_a2: 'Nossos planos são transparentes: Básico 5€/mês, Fidelidade 10€/mês e Premium 20€/mês. Sem fidelização!',
    bot_q3: 'Como funciona o Menu QR Code?',
    bot_a3: 'Os clientes escaneiam o QR Code na mesa sem baixar aplicativo. O cardápio abre instantaneamente.',
    bot_q4: 'Como ser um Parceiro Oficial?',
    bot_a4: 'Preencha o formulário na página de parceiros para garantir sua região exclusiva de atuação.',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  currentLangObj: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('menufid_lang') as Language | null;
      if (savedLang && LANGUAGES.some((l) => l.code === savedLang)) {
        setLanguageState(savedLang);
      } else {
        const browserLang = navigator.language.slice(0, 2).toLowerCase() as Language;
        if (LANGUAGES.some((l) => l.code === browserLang)) {
          setLanguageState(browserLang);
        }
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('menufid_lang', lang);
      document.cookie = `menufid_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
      const selected = LANGUAGES.find((l) => l.code === lang);
      if (selected) {
        document.documentElement.dir = selected.dir;
        document.documentElement.lang = selected.code;
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const selected = LANGUAGES.find((l) => l.code === language);
      if (selected) {
        document.documentElement.dir = selected.dir;
        document.documentElement.lang = selected.code;
      }
    }
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['fr']?.[key] || key;
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentLangObj }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
