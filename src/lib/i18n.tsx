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
    // Nav & Common
    nav_home: 'Accueil',
    nav_pricing: 'Abonnements',
    nav_partners: 'Devenir notre Partenaire',
    nav_about: 'À propos',
    nav_contact: 'Contact',
    nav_login: 'Connexion',
    nav_register: 'Créer mon compte',
    nav_dashboard: 'Mon Espace Resto',
    nav_logout: 'Déconnexion',

    // Hero Section
    hero_title: 'Multipliez le chiffre d\'affaires de votre établissement avec la fidélité digitale',
    hero_subtitle: 'Menu QR Code interactif HD, carte de fidélité sur smartphone Apple & Google Wallet et relances automatiques pour faire revenir vos clients 2x plus souvent.',
    hero_cta_primary: 'Activer mon établissement (Dès 5€/m)',
    hero_cta_partner: 'Devenir notre Partenaire Réseau',
    badge_security: 'Paiement Stripe 100% Sécurisé - Sans aucun engagement',
    stat_clients: 'Clients Fidélisés',
    stat_revenue: '+35% de Revenus',
    stat_return: '2x Plus Récurrents',

    // Features Section
    feat_title: 'Une technologie conçue pour faire décoller la rentabilité de votre commerce',
    feat_subtitle: 'Tout ce dont vous avez besoin pour capter, fidéliser et relancer vos clients en automatique.',
    feat_qr_title: 'Menu QR Code Interactif HD',
    feat_qr_desc: 'Affichage instantané sans application, photos haute définition, filtres allergènes et mises à jour de carte en 1 clic.',
    feat_wallet_title: 'Carte de Fidélité Smartphone Wallet',
    feat_wallet_desc: 'Vos clients ajoutent leur carte de fidélité sur Apple Wallet & Google Wallet en 1 scan. Plus jamais de cartes papier perdues !',
    feat_revenue_title: 'Boost Automatique du Chiffre d\'Affaires',
    feat_revenue_desc: 'Offres promotionnelles automatiques par notification Push pour remplir votre restaurant lors des heures creuses.',
    feat_crm_title: 'Fichier Client & Marketing SMS/WhatsApp',
    feat_crm_desc: 'Collectez les coordonnées certifiées de vos clients et relancez-les lors de leurs anniversaires ou nouveautés.',

    // Pricing Page
    pricing_page_title: 'Tarifs Simples & Transparentes pour Boostez vos Gains',
    pricing_page_subtitle: 'Chaque formule est calibrée pour générer un retour sur investissement immédiat dès la première semaine.',
    plan_basic_name: 'Basic',
    plan_basic_price: '5€',
    plan_basic_desc: 'Idéal pour digitaliser votre menu et démarrer la présentation de votre carte.',
    plan_basic_feat1: 'Menu QR Code Interactif HD',
    plan_basic_feat2: 'Modifications illimitées de la carte',
    plan_basic_feat3: 'Accès au Dashboard restaurateur',
    
    plan_loyalty_name: 'Fidélité',
    plan_loyalty_price: '10€',
    plan_loyalty_desc: 'Le cœur du système pour créer votre fichier client et doubler les visites.',
    plan_loyalty_feat1: 'Tout le plan Basic inclus',
    plan_loyalty_feat2: 'Carte de fidélité Apple & Google Wallet',
    plan_loyalty_feat3: 'Collecte des coordonnées clients',
    plan_loyalty_feat4: 'Statistiques de visites en temps réel',

    plan_premium_name: 'Premium Intégral',
    plan_premium_price: '20€',
    plan_premium_desc: 'La solution ultime avec relances marketing automatiques et avis Google.',
    plan_premium_feat1: 'Tout le plan Fidélité inclus',
    plan_premium_feat2: 'Relances automatiques SMS & WhatsApp',
    plan_premium_feat3: 'Booster d\'Avis Google Maps automatisé',
    plan_premium_feat4: 'Support prioritaire 7j/7 dédié',

    btn_choose_plan: 'Souscrire via Stripe',
    popular_badge: 'Le Plus Populaire & Rentable',

    // Partner / Distribution Page
    partner_page_title: 'Devenez notre Partenaire Exclusif',
    partner_page_subtitle: 'Rejoignez notre réseau de distribution mondial et percevez des commissions récurrentes sur chaque restaurant équipé.',
    partner_form_title: 'Candidature Partenaire Exclusif',
    partner_form_name: 'Votre Nom Complet',
    partner_form_email: 'Adresse E-mail Professionnelle',
    partner_form_phone: 'Numéro de Téléphone',
    partner_form_country: 'Pays / Région d\'exclusivité souhaitée',
    partner_form_btn: 'Envoyer ma Candidature Partenaire',
    partner_success_msg: 'Votre candidature partenaire a été enregistrée avec succès. Notre équipe vous recontactera sous 24h.',

    // About Page
    about_title: 'Notre Mission : Maximiser les Gains des Commerçants',
    about_desc: 'MenuFid a été créé avec une conviction forte : offrir aux restaurateurs et commerçants indépendants la technologie de fidélisation la plus puissante du marché au prix le plus accessible.',

    // Footer
    footer_desc: 'La plateforme numéro 1 pour digitaliser votre menu et fidéliser vos clients sur smartphone.',
    footer_rights: 'Tous droits réservés.',

    // Chatbot
    bot_greeting: 'Bonjour 👋 ! Je suis l\'Assistant virtuel MenuFid. Comment puis-je vous aider à augmenter vos gains aujourd\'hui ?',
    bot_q1: 'Comment MenuFid augmente mes revenus ?',
    bot_a1: 'MenuFid transforme vos visiteurs en clients fidèles. Avec la carte digitale enregistrée sur leur smartphone, vos clients reviennent 2x plus souvent !',
    bot_q2: 'Combien coûtent les formules ?',
    bot_a2: 'Nos formules sont transparentes : Basic 5€/mois, Fidélité 10€/mois et Premium 20€/mois. Sans engagement !',
    bot_q3: 'Comment fonctionne le Menu QR Code ?',
    bot_a3: 'Vos clients scannent le QR Code à table sans application. Le menu s\'affiche instantanément avec photos HD.',
    bot_q4: 'Comment devenir Partenaire officiel ?',
    bot_a4: 'Déposez votre candidature sur notre page Partenaires pour obtenir un secteur d\'exclusivité.',
  },
  en: {
    // Nav & Common
    nav_home: 'Home',
    nav_pricing: 'Pricing',
    nav_partners: 'Become Our Partner',
    nav_about: 'About Us',
    nav_contact: 'Contact',
    nav_login: 'Log In',
    nav_register: 'Get Started',
    nav_dashboard: 'Merchant Space',
    nav_logout: 'Log Out',

    // Hero Section
    hero_title: 'Multiply your establishment revenue with digital customer loyalty',
    hero_subtitle: 'Interactive HD QR Code menu, Apple & Google Wallet smartphone loyalty card, and automated retention to make customers return 2x more often.',
    hero_cta_primary: 'Activate My Business (From €5/mo)',
    hero_cta_partner: 'Become Our Network Partner',
    badge_security: '100% Secure Stripe Checkout - No Long Term Contract',
    stat_clients: 'Loyal Customers',
    stat_revenue: '+35% Revenue Boost',
    stat_return: '2x Return Visits',

    // Features Section
    feat_title: 'Technology engineered to skyrocket your business profitability',
    feat_subtitle: 'Everything you need to capture, retain, and automatically re-engage your guests.',
    feat_qr_title: 'Interactive HD QR Code Menu',
    feat_qr_desc: 'Instant loading with no app download, high-definition photos, allergen filters, and 1-click menu updates.',
    feat_wallet_title: 'Smartphone Wallet Loyalty Card',
    feat_wallet_desc: 'Customers add their loyalty card to Apple Wallet & Google Wallet in 1 scan. No more lost paper cards!',
    feat_revenue_title: 'Automated Revenue Booster',
    feat_revenue_desc: 'Automatic promo push notifications to fill your tables during off-peak hours.',
    feat_crm_title: 'Customer Database & SMS/WhatsApp Marketing',
    feat_crm_desc: 'Collect verified customer contact details and re-engage them on birthdays or special events.',

    // Pricing Page
    pricing_page_title: 'Simple & Transparent Pricing to Boost Your Earnings',
    pricing_page_subtitle: 'Every tier is built to deliver immediate return on investment starting in week one.',
    plan_basic_name: 'Basic',
    plan_basic_price: '€5',
    plan_basic_desc: 'Ideal to digitize your menu and start displaying your dishes online.',
    plan_basic_feat1: 'Interactive HD QR Code Menu',
    plan_basic_feat2: 'Unlimited menu modifications',
    plan_basic_feat3: 'Merchant Dashboard Access',
    
    plan_loyalty_name: 'Loyalty',
    plan_loyalty_price: '€10',
    plan_loyalty_desc: 'The core system to build your customer list and double repeat visits.',
    plan_loyalty_feat1: 'All Basic features included',
    plan_loyalty_feat2: 'Apple & Google Wallet Loyalty Card',
    plan_loyalty_feat3: 'Customer data collection',
    plan_loyalty_feat4: 'Real-time visit analytics',

    plan_premium_name: 'Full Premium',
    plan_premium_price: '€20',
    plan_premium_desc: 'The ultimate growth engine with automated marketing and Google reviews.',
    plan_premium_feat1: 'All Loyalty features included',
    plan_premium_feat2: 'Automated SMS & WhatsApp campaigns',
    plan_premium_feat3: 'Automated Google Maps Review Booster',
    plan_premium_feat4: 'Dedicated 7/7 priority support',

    btn_choose_plan: 'Subscribe via Stripe',
    popular_badge: 'Most Popular & Profitable',

    // Partner / Distribution Page
    partner_page_title: 'Become Our Exclusive Partner',
    partner_page_subtitle: 'Join our worldwide distribution network and earn recurring monthly commissions for every onboarded merchant.',
    partner_form_title: 'Exclusive Partner Application',
    partner_form_name: 'Your Full Name',
    partner_form_email: 'Professional Email Address',
    partner_form_phone: 'Phone Number',
    partner_form_country: 'Target Country / Exclusive Region',
    partner_form_btn: 'Submit Partner Application',
    partner_success_msg: 'Your partner application has been recorded. Our executive team will reach out within 24h.',

    // About Page
    about_title: 'Our Mission: Maximize Merchant Profits',
    about_desc: 'MenuFid was built with a strong conviction: deliver the most powerful loyalty technology to independent business owners at the most accessible price point.',

    // Footer
    footer_desc: 'The #1 platform to digitize your menu and retain customers on their smartphones.',
    footer_rights: 'All rights reserved.',

    // Chatbot
    bot_greeting: 'Hello 👋! I am the MenuFid Virtual Assistant. How can I help you boost your earnings today?',
    bot_q1: 'How does MenuFid increase my revenue?',
    bot_a1: 'MenuFid turns casual guests into loyal regulars. Smartphone wallet cards make them return 2x more often!',
    bot_q2: 'How much do MenuFid plans cost?',
    bot_a2: 'Our pricing is simple: Basic €5/mo, Loyalty €10/mo, and Premium €20/mo. No long term contracts!',
    bot_q3: 'How does the QR Code Menu work?',
    bot_a3: 'Guests scan the table QR code without downloading any app. Your menu loads instantly with HD photos.',
    bot_q4: 'How to become an official Partner?',
    bot_a4: 'Submit your application on our Partner page to secure an exclusive distribution territory.',
  },
  es: {
    // Nav & Common
    nav_home: 'Inicio',
    nav_pricing: 'Planes',
    nav_partners: 'Ser nuestro Socio',
    nav_about: 'Nosotros',
    nav_contact: 'Contacto',
    nav_login: 'Iniciar sesión',
    nav_register: 'Comenzar',
    nav_dashboard: 'Espacio Comercio',
    nav_logout: 'Cerrar sesión',

    // Hero Section
    hero_title: 'Multiplique los ingresos de su establecimiento con fidelidad digital',
    hero_subtitle: 'Menú con Código QR interactivo HD, tarjeta de fidelidad para teléfono inteligente en Apple & Google Wallet y ofertas automáticas.',
    hero_cta_primary: 'Activar mi negocio (Desde 5€/mes)',
    hero_cta_partner: 'Ser Socio de Red',
    badge_security: 'Pago 100% Seguro con Stripe - Sin Compromiso',
    stat_clients: 'Clientes Fidelizados',
    stat_revenue: '+35% de Ingresos',
    stat_return: '2x Más Recurrentes',

    // Features Section
    feat_title: 'Tecnología diseñada para disparar la rentabilidad de su negocio',
    feat_subtitle: 'Todo lo que necesita para captar, fidelizar y reenganchar a sus clientes automáticamente.',
    feat_qr_title: 'Menú Código QR Interactivo HD',
    feat_qr_desc: 'Carga instantánea sin aplicaciones, fotos en alta definición, filtros de alérgenos y actualización en 1 clic.',
    feat_wallet_title: 'Tarjeta de Fidelidad en Teléfono Inteligente',
    feat_wallet_desc: 'Sus clientes añaden la tarjeta a Apple Wallet y Google Wallet en 1 escaneo. ¡Adiós a las tarjetas de papel!',
    feat_revenue_title: 'Impulso Automático de Ingresos',
    feat_revenue_desc: 'Notificaciones push promocionales automáticas para llenar su local en horas de menor afluencia.',
    feat_crm_title: 'Base de Datos y Marketing por SMS/WhatsApp',
    feat_crm_desc: 'Obtenga datos verificados de sus clientes y envíeles ofertas en sus cumpleaños o eventos especiales.',

    // Pricing Page
    pricing_page_title: 'Precios Simples y Transparentes para Aumentar sus Ganancias',
    pricing_page_subtitle: 'Cada plan está diseñado para generar un retorno de inversión inmediato desde la primera semana.',
    plan_basic_name: 'Básico',
    plan_basic_price: '5€',
    plan_basic_desc: 'Ideal para digitalizar su menú y comenzar a mostrar su carta en línea.',
    plan_basic_feat1: 'Menú Código QR Interactivo HD',
    plan_basic_feat2: 'Modificaciones ilimitadas de la carta',
    plan_basic_feat3: 'Acceso al panel de control de comerciante',
    
    plan_loyalty_name: 'Fidelidad',
    plan_loyalty_price: '10€',
    plan_loyalty_desc: 'El núcleo del sistema para crear su lista de clientes y duplicar las visitas.',
    plan_loyalty_feat1: 'Todas las funciones del plan Básico',
    plan_loyalty_feat2: 'Tarjeta de fidelidad en Apple y Google Wallet',
    plan_loyalty_feat3: 'Captura de datos de clientes',
    plan_loyalty_feat4: 'Estadísticas de visitas en tiempo real',

    plan_premium_name: 'Premium Integral',
    plan_premium_price: '20€',
    plan_premium_desc: 'La solución definitiva con marketing automático y reseñas en Google.',
    plan_premium_feat1: 'Todas las funciones del plan Fidelidad',
    plan_premium_feat2: 'Campañas automáticas por SMS y WhatsApp',
    plan_premium_feat3: 'Acelerador de Reseñas en Google Maps',
    plan_premium_feat4: 'Soporte prioritario 7/7 dedicado',

    btn_choose_plan: 'Suscribirse por Stripe',
    popular_badge: 'El Más Popular y Rentable',

    // Partner / Distribution Page
    partner_page_title: 'Conviértase en nuestro Socio Exclusivo',
    partner_page_subtitle: 'Únase a nuestra red global de distribución y reciba comisiones mensuales recurrentes por cada negocio activo.',
    partner_form_title: 'Solicitud de Socio Exclusivo',
    partner_form_name: 'Nombre Completo',
    partner_form_email: 'Correo Electrónico Profesional',
    partner_form_phone: 'Número de Teléfono',
    partner_form_country: 'País / Región de exclusividad deseada',
    partner_form_btn: 'Enviar Solicitud de Socio',
    partner_success_msg: 'Su solicitud ha sido registrada con éxito. Nuestro equipo le contactará en 24 horas.',

    // About Page
    about_title: 'Nuestra Misión: Maximizar las Ganancias del Comerciante',
    about_desc: 'MenuFid nació con una convicción sólida: ofrecer la tecnología de fidelización más potente a dueños de negocios independientes al precio más accesible del mercado.',

    // Footer
    footer_desc: 'La plataforma número 1 para digitalizar su menú y fidelizar a sus clientes en el teléfono móvil.',
    footer_rights: 'Todos los derechos reservados.',

    // Chatbot
    bot_greeting: '¡Hola 👋! Soy el Asistente Virtual MenuFid. ¿Cómo puedo ayudarte a aumentar tus ganancias hoy?',
    bot_q1: '¿Cómo aumenta MenuFid mis ingresos?',
    bot_a1: 'MenuFid transforma visitantes ocasionales en clientes habituales. ¡Vuelven el doble de veces gracias a la tarjeta digital!',
    bot_q2: '¿Cuánto cuestan los planes?',
    bot_a2: 'Nuestros precios son transparentes: Básico 5€/mes, Fidelidad 10€/mes y Premium 20€/mes. ¡Sin permanencia!',
    bot_q3: '¿Cómo funciona el Menú QR?',
    bot_a3: 'Los clientes escanean el código QR en la mesa sin instalar aplicaciones. El menú se abre al instante.',
    bot_q4: '¿Cómo ser Socio Oficial?',
    bot_a4: 'Envíe su solicitud en nuestra página de socios para reservar una región exclusiva.',
  },
  ar: {
    // Nav & Common
    nav_home: 'الرئيسية',
    nav_pricing: 'الاشتراكات',
    nav_partners: 'كن شريكاً معنا',
    nav_about: 'من نحن',
    nav_contact: 'اتصل بنا',
    nav_login: 'تسجيل الدخول',
    nav_register: 'إنشاء حساب',
    nav_dashboard: 'لوحة التجار',
    nav_logout: 'تسجيل الخروج',

    // Hero Section
    hero_title: 'ضاعف مداخيل وأرباح مطعمك مع برنامج الولاء الرقمي الذكي',
    hero_subtitle: 'قائمة طعام تفاعلية عبر رمز QR، بطاقة ولاء رقمية على محفظة الهاتف Apple & Google Wallet وتنبيهات إعادة جذب الزبائن.',
    hero_cta_primary: 'تفعيل حساب مطعمي (ابتداءً من 5€/شهرياً)',
    hero_cta_partner: 'الانضمام كشريك توزيع حصير',
    badge_security: 'دفع آمن 100% عبر Stripe - بدون أي التزام',
    stat_clients: 'زبائن مخلصون',
    stat_revenue: '+35% زيادة في الأرباح',
    stat_return: '2x تردد الزيارات',

    // Features Section
    feat_title: 'تقنية صممت خصيصاً لرفع سوداوية وأرباح تجارتك',
    feat_subtitle: 'كل ما تحتاجه لجمع بيانات الزبائن، والاحتفاظ بهم، وإعادتهم تلقائياً لمطعمك.',
    feat_qr_title: 'قائمة طعام رمز QR تفاعلية HD',
    feat_qr_desc: 'عرض فوري بدون تطبيق، صور عالية الجودة، تصفية المكونات، وتحديث المنيو بضغطة زر واحدة.',
    feat_wallet_title: 'بطاقة الولاء الرقمية على محفظة الهاتف',
    feat_wallet_desc: 'يضيف الزبائن بطاقة الولاء إلى Apple Wallet و Google Wallet بمسح واحد. وداعاً للبطاقات الورقية الضائعة!',
    feat_revenue_title: 'مضاعف المداخيل التلقائي',
    feat_revenue_desc: 'إشعارات ترويجية تلقائية لملء المطعم خلال أوقات الخمول.',
    feat_crm_title: 'قاعدة بيانات الزبائن والتسويق عبر SMS/WhatsApp',
    feat_crm_desc: 'اجمع بيانات زبائنك المعتمدة وأعد تذكيرهم في أعياد ميلادهم أو العروض الخاصة.',

    // Pricing Page
    pricing_page_title: 'أسعار بسيطة وشفافة لمضاعفة أرباحك',
    pricing_page_subtitle: 'كل خطة صممت لتحقيق عائد استثماري فوري يغطي التكلفة منذ الأسبوع الأول.',
    plan_basic_name: 'الأساسية',
    plan_basic_price: '5€',
    plan_basic_desc: 'مثالية لرقمنة منيو مطعمك وبدء عرضه على الإنترنت.',
    plan_basic_feat1: 'قائمة طعام رمز QR تفاعلية HD',
    plan_basic_feat2: 'تعديلات غير محدودة للقائمة',
    plan_basic_feat3: 'الوصول للوحة تحكم صاحب المطعم',
    
    plan_loyalty_name: 'الولاء',
    plan_loyalty_price: '10€',
    plan_loyalty_desc: 'القلب النابض للنظام لبناء قاعدة زبائنك ومضاعفة التردد.',
    plan_loyalty_feat1: 'جميع ميزات الخطة الأساسية',
    plan_loyalty_feat2: 'بطاقة ولاء محفظة Apple & Google',
    plan_loyalty_feat3: 'جمع بيانات وتواصل الزبائن',
    plan_loyalty_feat4: 'إحصائيات زيارات حية ومباشرة',

    plan_premium_name: 'الاحترافية الشاملة',
    plan_premium_price: '20€',
    plan_premium_desc: 'الحل النهائي المكتمل مع التسويق التلقائي وتقييمات خرائط Google.',
    plan_premium_feat1: 'جميع ميزات خطة الولاء',
    plan_premium_feat2: 'حملات تلقائية عبر SMS و WhatsApp',
    plan_premium_feat3: 'مضاعف تقييمات خرائط Google المباشر',
    plan_premium_feat4: 'دعم فني مخصص 7/7 متواصل',

    btn_choose_plan: 'الاشتراك عبر Stripe',
    popular_badge: 'الأكثر شعبية وربحية',

    // Partner / Distribution Page
    partner_page_title: 'كن شريكاً حصرياً لـ MenuFid',
    partner_page_subtitle: 'انضم لشبكة التوزيع العالمية واحصل على عمولات شهرية مستمرة لكل مطعم تقوم بتجهيزه.',
    partner_form_title: 'طلب تقديم للشراكة الحصرية',
    partner_form_name: 'الاسم الكامل',
    partner_form_email: 'البريد الإلكتروني المهني',
    partner_form_phone: 'رقم الهاتف',
    partner_form_country: 'الدولة / المنطقة المطلوبة للحصرية',
    partner_form_btn: 'إرسال طلب الشراكة',
    partner_success_msg: 'تم تسجيل طلب الشراكة بنجاح. سيتواصل معك فريقنا خلال 24 ساعة.',

    // About Page
    about_title: 'مهمتنا: تعظيم أرباح أصحاب المطاعم والتجار',
    about_desc: 'تأسست MenuFid برؤية واضحة: تزويد أصحاب التجارات المستقلة بأقوى تقنية ولاء في السوق بأنسب وأرخص سعر ممكن.',

    // Footer
    footer_desc: 'المنصة رقم 1 لرقمنة منيو المطاعم والاحتفاظ بالزبائن عبر هواتفهم الذكية.',
    footer_rights: 'جميع الحقوق محفوظة.',

    // Chatbot
    bot_greeting: 'مرحباً بك 👋! أنا المساعد الافتراضي لـ MenuFid. كيف يمكنني مساعدتك في زيادة أرباحك اليوم؟',
    bot_q1: 'كيف يساعد MenuFid في زيادة أرباحي؟',
    bot_a1: 'يحول MenuFid الزوار العاديين إلى زبائن دائمين. يعود الزبائن مرتين أكثر بفضل بطاقة الولاء الرقمية على هواتفهم!',
    bot_q2: 'كم تبلغ تكلفة الاشتراكات؟',
    bot_a2: 'الأسعار شفافة: الأساسية 5€/شهرياً، الولاء 10€/شهرياً، والاحترافية 20€/شهرياً. بدون التزام!',
    bot_q3: 'كيف تعمل قائمة رمز QR؟',
    bot_a3: 'يمسح الزبائن الرمز الموجود على الطاولة دون تحميل أي تطبيق، لتظهر قائمة الطعام فوراً.',
    bot_q4: 'كيف أصبح شريكاً رسمياً؟',
    bot_a4: 'قدم طلبك على صفحة الشركاء للحصول على منطقة حصرية.',
  },
  de: {
    // Nav & Common
    nav_home: 'Startseite',
    nav_pricing: 'Tarife',
    nav_partners: 'Partner Werden',
    nav_about: 'Über Uns',
    nav_contact: 'Kontakt',
    nav_login: 'Anmelden',
    nav_register: 'Konto Erstellen',
    nav_dashboard: 'Händler-Bereich',
    nav_logout: 'Abmelden',

    // Hero Section
    hero_title: 'Vervielfachen Sie Ihren Umsatz mit digitaler Kundenbindung',
    hero_subtitle: 'Interaktives HD QR-Code-Menü, Smartphone-Treuekarte in Apple & Google Wallet und automatische Kundenrückgewinnung.',
    hero_cta_primary: 'Mein Geschäft Aktivieren (Ab 5€/Monat)',
    hero_cta_partner: 'Netzwerk-Partner Werden',
    badge_security: '100% Sichere Stripe-Zahlung - Ohne Mindestlaufzeit',
    stat_clients: 'Treue Kunden',
    stat_revenue: '+35% Mehr Umsatz',
    stat_return: '2x Häufigere Besuche',

    // Features Section
    feat_title: 'Technologie zur Maximierung Ihrer Betriebsrücklagen',
    feat_subtitle: 'Alles, was Sie brauchen, um Gäste zu erfassen, zu binden und automatisch zurückzuholen.',
    feat_qr_title: 'Interaktives HD QR-Code-Menü',
    feat_qr_desc: 'Sofortiges Laden ohne App-Download, hochauflösende Fotos, Allergenfilter und 1-Klick-Kartenupdates.',
    feat_wallet_title: 'Smartphone Wallet Treuekarte',
    feat_wallet_desc: 'Gäste fügen die Karte mit 1 Scan zu Apple Wallet & Google Wallet hinzu. Nie wieder verlorene Papierkarten!',
    feat_revenue_title: 'Automatischer Umsatzturbo',
    feat_revenue_desc: 'Automatische Promo-Push-Benachrichtigungen zur Auslastung in Nebenzeiten.',
    feat_crm_title: 'Kundenkartei & SMS/WhatsApp-Marketing',
    feat_crm_desc: 'Sammeln Sie verifizierte Kontaktdaten und machen Sie Angebote zum Geburtstag.',

    // Pricing Page
    pricing_page_title: 'Einfache & Transparente Preise für Maximale Gewinne',
    pricing_page_subtitle: 'Jeder Tarif ist darauf ausgelegt, ab der ersten Woche einen unmittelbaren ROI zu erzielen.',
    plan_basic_name: 'Basis',
    plan_basic_price: '5€',
    plan_basic_desc: 'Ideal, um Ihre Speisekarte zu digitalisieren und online zu präsentieren.',
    plan_basic_feat1: 'Interaktives HD QR-Code-Menü',
    plan_basic_feat2: 'Unbegrenzte Speisekarten-Updates',
    plan_basic_feat3: 'Zugang zum Händler-Dashboard',
    
    plan_loyalty_name: 'Treue',
    plan_loyalty_price: '10€',
    plan_loyalty_desc: 'Das Herzstück zur Kundenkartei-Erstellung und Besuchsverdopplung.',
    plan_loyalty_feat1: 'Alle Basis-Funktionen enthalten',
    plan_loyalty_feat2: 'Apple & Google Wallet Treuekarte',
    plan_loyalty_feat3: 'Kundendaten-Erfassung',
    plan_loyalty_feat4: 'Echtzeit-Besuchsstatistiken',

    plan_premium_name: 'Premium Komplett',
    plan_premium_price: '20€',
    plan_premium_desc: 'Die ultimative Lösung mit automatischem Marketing und Google-Bewertungen.',
    plan_premium_feat1: 'Alle Treue-Funktionen enthalten',
    plan_premium_feat2: 'Automatische SMS & WhatsApp-Kampagnen',
    plan_premium_feat3: 'Automatisierter Google Maps Bewertungsbooster',
    plan_premium_feat4: 'Dedizierter 7/7 Prioritäts-Support',

    btn_choose_plan: 'Über Stripe Buchen',
    popular_badge: 'Am Beliebtesten & Profitabelsten',

    // Partner / Distribution Page
    partner_page_title: 'Werden Sie Exklusiver Partner',
    partner_page_subtitle: 'Schließen Sie sich unserem weltweiten Vertriebsnetz an und verdienen Sie monatliche Provisionen.',
    partner_form_title: 'Bewerbung Exklusiv-Partner',
    partner_form_name: 'Vollständiger Name',
    partner_form_email: 'Geschäftliche E-Mail-Adresse',
    partner_form_phone: 'Telefonnummer',
    partner_form_country: 'Gewünschtes Exklusiv-Gebiet',
    partner_form_btn: 'Partner-Bewerbung Absenden',
    partner_success_msg: 'Ihre Bewerbung wurde erfolgreich erfasst. Unser Team meldet sich innerhalb von 24h.',

    // About Page
    about_title: 'Unsere Mission: Gewinnmaximierung für Händler',
    about_desc: 'MenuFid wurde mit einer klaren Vision gegründet: Unabhängigen Gastronomen die stärkste Kundenbindungstechnologie zum günstigsten Preis zu bieten.',

    // Footer
    footer_desc: 'Die Plattform Nr. 1 zur Digitalisierung von Speisekarten und Kundenbindung auf dem Smartphone.',
    footer_rights: 'Alle Rechte vorbehalten.',

    // Chatbot
    bot_greeting: 'Hallo 👋! Ich bin der virtuelle Assistent von MenuFid. Wie kann ich Ihnen heute helfen, Ihren Gewinn zu steigern?',
    bot_q1: 'Wie steigert MenuFid meinen Umsatz?',
    bot_a1: 'MenuFid verwandelt Gelegenheitsgäste in Stammkunden. Dank der digitalen Treuekarte kommen Kunden 2x öfter wieder!',
    bot_q2: 'Was kosten die MenuFid-Tarife?',
    bot_a2: 'Unsere Tarife sind transparent: Basis 5€/Monat, Treue 10€/Monat und Premium 20€/Monat. Ohne Bindung!',
    bot_q3: 'Wie funktioniert das QR-Menü?',
    bot_a3: 'Gäste scannen den QR-Code am Tisch ohne App. Die Speisekarte wird sofort angezeigt.',
    bot_q4: 'Wie werde ich offizieller Partner?',
    bot_a4: 'Reichen Sie Ihre Bewerbung auf unserer Partnerseite ein.',
  },
  it: {
    // Nav & Common
    nav_home: 'Home',
    nav_pricing: 'Piani',
    nav_partners: 'Diventa Partner',
    nav_about: 'Chi Siamo',
    nav_contact: 'Contatti',
    nav_login: 'Accedi',
    nav_register: 'Crea Account',
    nav_dashboard: 'Area Ristoratore',
    nav_logout: 'Esci',

    // Hero Section
    hero_title: 'Moltiplica il fatturato del tuo locale con la fidelizzazione digitale',
    hero_subtitle: 'Menu QR Code interattivo HD, carta fedeltà su smartphone Apple & Google Wallet e richiami automatici per far ritornare i clienti 2 volte più spesso.',
    hero_cta_primary: 'Attiva il mio Locale (Da 5€/mese)',
    hero_cta_partner: 'Diventa Partner di Rete',
    badge_security: 'Pagamento 100% Sicuro con Stripe - Senza Vincoli',
    stat_clients: 'Clienti Fidelizzati',
    stat_revenue: '+35% di Fatturato',
    stat_return: '2x Più Ricorrenti',

    // Features Section
    feat_title: 'Tecnologia progettata per far decollare la redditività del tuo business',
    feat_subtitle: 'Tutto ciò di cui hai bisogno per acquisire, fidelizzare e richiamare i tuoi clienti in automatico.',
    feat_qr_title: 'Menu QR Code Interattivo HD',
    feat_qr_desc: 'Caricamento istantaneo senza app, foto in alta definizione, filtri allergeni e aggiornamenti menu in 1 click.',
    feat_wallet_title: 'Carta Fedeltà Smartphone Wallet',
    feat_wallet_desc: 'I clienti aggiungono la carta a Apple Wallet e Google Wallet in 1 scan. Mai più tessere cartacee perse!',
    feat_revenue_title: 'Acceleratore Automatico di Entrate',
    feat_revenue_desc: 'Notifiche push promozionali automatiche per riempire i tavoli nelle ore di minor affluenza.',
    feat_crm_title: 'Database Clienti e Marketing SMS/WhatsApp',
    feat_crm_desc: 'Raccogli i dati verificati dei clienti e invia offerte dedicate per compleanni o eventi.',

    // Pricing Page
    pricing_page_title: 'Prezzi Semplici e Trasparenti per Aumentare i Tuoi Guadagni',
    pricing_page_subtitle: 'Ogni piano è calibrato per generare un ritorno sull\'investimento immediato fin dalla prima settimana.',
    plan_basic_name: 'Base',
    plan_basic_price: '5€',
    plan_basic_desc: 'Ideale per digitalizzare il menu e iniziare a mostrare i piatti online.',
    plan_basic_feat1: 'Menu QR Code Interattivo HD',
    plan_basic_feat2: 'Modifiche illimitate al menu',
    plan_basic_feat3: 'Accesso alla Dashboard Ristoratore',
    
    plan_loyalty_name: 'Fedeltà',
    plan_loyalty_price: '10€',
    plan_loyalty_desc: 'Il cuore del sistema per creare il database clienti e raddoppiare le visite.',
    plan_loyalty_feat1: 'Tutti i vantaggi del piano Base inclusi',
    plan_loyalty_feat2: 'Carta fedeltà Apple & Google Wallet',
    plan_loyalty_feat3: 'Raccolta dati clienti',
    plan_loyalty_feat4: 'Statistiche visite in tempo reale',

    plan_premium_name: 'Premium Integrale',
    plan_premium_price: '20€',
    plan_premium_desc: 'La soluzione definitiva con marketing automatico e recensioni Google.',
    plan_premium_feat1: 'Tutti i vantaggi del piano Fedeltà inclusi',
    plan_premium_feat2: 'Campagne automatiche SMS e WhatsApp',
    plan_premium_feat3: 'Booster di Recensioni Google Maps automatizzato',
    plan_premium_feat4: 'Supporto prioritario 7/7 dedicato',

    btn_choose_plan: 'Abbonati con Stripe',
    popular_badge: 'Il Più Popolare e Redditizio',

    // Partner / Distribution Page
    partner_page_title: 'Diventa Nostro Partner Esclusivo',
    partner_page_subtitle: 'Unisciti alla nostra rete globale di distribuzione e ricevi commissioni mensili ricorrenti.',
    partner_form_title: 'Candidatura Partner Esclusivo',
    partner_form_name: 'Nome Completo',
    partner_form_email: 'Email Professionale',
    partner_form_phone: 'Numero di Telefono',
    partner_form_country: 'Paese / Area di esclusività desiderata',
    partner_form_btn: 'Invia Candidatura Partner',
    partner_success_msg: 'La tua candidatura è stata registrata con successo. Il nostro team ti contatterà entro 24 ore.',

    // About Page
    about_title: 'La Nostra Missione: Massimizzare i Guadagni dei Ristoratori',
    about_desc: 'MenuFid è nata con una convinzione forte: offrire ai ristoratori indipendenti la tecnologia di fidelizzazione più potente al prezzo più accessibile sul mercato.',

    // Footer
    footer_desc: 'La piattaforma N.1 per digitalizzare il menu e fidelizzare i clienti sullo smartphone.',
    footer_rights: 'Tutti i diritti riservati.',

    // Chatbot
    bot_greeting: 'Ciao 👋! Sono l\'Assistente Virtuale MenuFid. Come posso aiutarti ad aumentare i tuoi guadagni oggi?',
    bot_q1: 'In che modo MenuFid aumenta le mie entrate?',
    bot_a1: 'MenuFid trasforma i clienti occasionali in clienti abituali. Ritornano 2 volte più spesso grazie alla carta digitale!',
    bot_q2: 'Quanto costano i piani MenuFid?',
    bot_a2: 'I nostri prezzi sono chiari: Base 5€/mese, Fedeltà 10€/mese e Premium 20€/mese. Senza vincoli!',
    bot_q3: 'Come funziona il Menu QR Code?',
    bot_a3: 'I clienti inquadrano il QR Code sul tavolo senza scaricare app. Il menu si apre all\'istante.',
    bot_q4: 'Come diventare Partner Ufficiale?',
    bot_a4: 'Invia la candidatura nella nostra pagina Partner.',
  },
  pt: {
    // Nav & Common
    nav_home: 'Início',
    nav_pricing: 'Planos',
    nav_partners: 'Seja Nosso Parceiro',
    nav_about: 'Sobre Nós',
    nav_contact: 'Contato',
    nav_login: 'Entrar',
    nav_register: 'Criar Conta',
    nav_dashboard: 'Área do Comerciante',
    nav_logout: 'Sair',

    // Hero Section
    hero_title: 'Multiplique o faturamento do seu restaurante com fidelidade digital',
    hero_subtitle: 'Menu QR Code interativo HD, cartão de fidelidade no smartphone Apple & Google Wallet e retencão automática de clientes.',
    hero_cta_primary: 'Ativar Meu Negócio (A partir de 5€/mês)',
    hero_cta_partner: 'Seja Parceiro de Rede',
    badge_security: 'Pagamento 100% Seguro via Stripe - Sem Fidelização',
    stat_clients: 'Clientes Fidelizados',
    stat_revenue: '+35% de Faturamento',
    stat_return: '2x Mais Recorrentes',

    // Features Section
    feat_title: 'Tecnologia projetada para alavancar a lucratividade do seu negócio',
    feat_subtitle: 'Tudo o que você precisa para capturar, fidelizar e reconquistar seus clientes automaticamente.',
    feat_qr_title: 'Menu QR Code Interativo HD',
    feat_qr_desc: 'Carregamento instantâneo sem aplicativo, fotos em alta definição, filtros de alérgenos e atualização em 1 clique.',
    feat_wallet_title: 'Cartão de Fidelidade Smartphone Wallet',
    feat_wallet_desc: 'Seus clientes adicionam o cartão ao Apple Wallet & Google Wallet em 1 scan. Chega de cartões de papel perdidos!',
    feat_revenue_title: 'Acelerador Automático de Receita',
    feat_revenue_desc: 'Notificações push promocionais automáticas para lotar seu estabelecimento nos horários de menor movimento.',
    feat_crm_title: 'Base de Dados e Marketing SMS/WhatsApp',
    feat_crm_desc: 'Obtenha dados verificados dos clientes e envie ofertas especiais no aniversário deles.',

    // Pricing Page
    pricing_page_title: 'Preços Simples e Transparentes para Aumentar seus Lucros',
    pricing_page_subtitle: 'Cada plano foi projetado para gerar retorno financeiro imediato desde a primeira semana.',
    plan_basic_name: 'Básico',
    plan_basic_price: '5€',
    plan_basic_desc: 'Ideal para digitalizar seu cardápio e começar a exibir seus pratos online.',
    plan_basic_feat1: 'Menu QR Code Interativo HD',
    plan_basic_feat2: 'Modificações ilimitadas do cardápio',
    plan_basic_feat3: 'Acesso ao Painel do Comerciante',
    
    plan_loyalty_name: 'Fidelidade',
    plan_loyalty_price: '10€',
    plan_loyalty_desc: 'O coração do sistema para criar sua base de clientes e dobrar as visitas.',
    plan_loyalty_feat1: 'Todos os recursos do plano Básico incluídos',
    plan_loyalty_feat2: 'Cartão de fidelidade Apple & Google Wallet',
    plan_loyalty_feat3: 'Captura de dados dos clientes',
    plan_loyalty_feat4: 'Estatísticas de visitas em tempo real',

    plan_premium_name: 'Premium Integral',
    plan_premium_price: '20€',
    plan_premium_desc: 'A solução definitiva com automação de marketing e avaliações no Google.',
    plan_premium_feat1: 'Todos os recursos do plano Fidelidade incluídos',
    plan_premium_feat2: 'Campanhas automáticas por SMS e WhatsApp',
    plan_premium_feat3: 'Acelerador de Avaliações no Google Maps',
    plan_premium_feat4: 'Suporte prioritário 7/7 dedicado',

    btn_choose_plan: 'Assinar via Stripe',
    popular_badge: 'O Mais Popular e Lucrativo',

    // Partner / Distribution Page
    partner_page_title: 'Seja Nosso Parceiro Exclusivo',
    partner_page_subtitle: 'Junte-se à nossa rede mundial de distribuição e receba comissões mensais recorrentes.',
    partner_form_title: 'Candidatura de Parceiro Exclusivo',
    partner_form_name: 'Nome Completo',
    partner_form_email: 'E-mail Profissional',
    partner_form_phone: 'Número de Telefone',
    partner_form_country: 'País / Região de exclusividade desejada',
    partner_form_btn: 'Enviar Candidatura de Parceiro',
    partner_success_msg: 'Sua candidatura foi registrada com sucesso. Nossa equipe entrará em contato em até 24 horas.',

    // About Page
    about_title: 'Nossa Missão: Maximizar os Lucros dos Comerciantes',
    about_desc: 'O MenuFid foi criado com uma convicção forte: entregar a tecnologia de fidelização mais poderosa do mercado pelo preço mais acessível.',

    // Footer
    footer_desc: 'A plataforma N.1 para digitalizar cardápios e fidelizar clientes no smartphone.',
    footer_rights: 'Todos os direitos reservados.',

    // Chatbot
    bot_greeting: 'Olá 👋! Sou o Assistente Virtual MenuFid. Como posso ajudar você a aumentar seus lucros hoje?',
    bot_q1: 'Como o MenuFid aumenta meu faturamento?',
    bot_a1: 'O MenuFid converte clientes casuais em clientes fiéis. Eles retornam 2x mais vezes graças ao cartão digital!',
    bot_q2: 'Quanto custam os planos do MenuFid?',
    bot_a2: 'Nossos planos são simples: Básico 5€/mês, Fidelidade 10€/mês e Premium 20€/mês. Sem fidelização!',
    bot_q3: 'Como funciona o Menu QR Code?',
    bot_a3: 'Os clientes escaneiam o QR Code na mesa sem baixar aplicativo. O cardápio abre instantaneamente.',
    bot_q4: 'Como ser um Parceiro Oficial?',
    bot_a4: 'Envie sua candidatura na nossa página de parceiros.',
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
