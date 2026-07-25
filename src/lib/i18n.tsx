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
    nav_about: 'À propos de nous',
    nav_contact: 'Contactez-nous',
    nav_login: 'Se connecter',
    nav_register: 'Créer un compte',
    nav_dashboard: 'Mon Espace Resto',
    nav_logout: 'Déconnexion',

    // Hero Section Landing
    hero_title: 'Multipliez le chiffre d\'affaires de votre établissement avec la fidélité digitale',
    hero_subtitle: 'Menu QR Code interactif HD, carte de fidélité sur smartphone Apple & Google Wallet et relances automatiques pour faire revenir vos clients 2x plus souvent.',
    hero_cta_primary: 'Activer mon établissement (Dès 5€/mois)',
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

    // Pricing Page & Cards
    pricing_page_title: 'Tarifs Simples & Transparentes pour Booster vos Gains',
    pricing_page_subtitle: 'Chaque formule est calibrée pour générer un retour sur investissement immédiat dès la première semaine.',
    plan_basic_name: 'Basic',
    plan_basic_price: '5€',
    plan_basic_desc: 'Idéal pour digitaliser votre carte en 2 minutes.',
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
    popular_badge: 'Plus Populaire & Rentable',
    no_credit_card: 'Paiement Stripe 100% Sécurisé - Résiliation en 1 Clic',

    // Partner / Distribution Page
    partner_page_title: 'Réseau de Partenaires Internationaux',
    partner_page_subtitle: 'Rejoignez notre réseau de distribution mondial et percevez des commissions récurrentes sur chaque restaurant équipé.',
    partner_title: 'Devenez notre Partenaire Officiel',
    partner_map_badge: 'Zone Active & Hub Stratégique',
    partner_map_title: 'La France 🇫🇷 comme cœur de réseau, en expansion vers le monde',
    partner_map_desc: 'MenuFid équipe activement les restaurants et établissements à travers toute la France. En tant que Partenaire régional privilégié, vous devenez l\'interlocuteur exclusif de votre secteur.',
    partner_stat1_val: '100%',
    partner_stat1_label: 'Revenus Récurrents',
    partner_stat2_val: 'Exclusivité',
    partner_stat2_label: 'Secteur Réservé',

    partner_card1_title: 'Exclusivité Régionale',
    partner_card1_desc: 'Soyez le référent officiel MenuFid dans votre ville ou région avec un statut privilégié.',
    partner_card2_title: 'Support & Kit Marketing Dédié',
    partner_card2_desc: 'Recevez vos présentations commerciales, flyers de démonstration, autocollants QR Code et formation sur mesure.',
    partner_card3_title: 'Commissions Récurrentes',
    partner_card3_desc: 'Percevez une marge attractive et récurrente sur chaque restaurant abonné dans votre secteur d\'exclusivité.',

    partner_form_title: 'Postuler pour devenir Partenaire',
    partner_form_subtitle: 'Remplissez le formulaire ci-dessous. Notre équipe commerciale vous recontactera sous 24h.',
    partner_form_name: 'Nom complet',
    partner_form_email: 'Adresse e-mail',
    partner_form_phone: 'Téléphone',
    partner_form_city: 'Ville & Pays',
    partner_form_exp: 'Expérience professionnelle / Activité',
    partner_form_msg: 'Présentation de votre projet',
    partner_form_btn: 'Envoyer ma candidature Partenaire',
    partner_success_msg: 'Votre candidature partenaire a été enregistrée avec succès. Notre équipe vous recontactera sous 24h.',

    // Contact Page
    contact_title: 'Triton avec notre équipe',
    contact_subtitle: 'Notre équipe support et commerciale est à votre disposition 7j/7 pour répondre à toutes vos questions.',
    contact_card_email: 'Email Direct',
    contact_card_phone: 'Support 7j/7',
    contact_card_location: 'Siège Social',
    contact_location_val: 'Paris, France 🇫🇷',
    contact_form_name: 'Nom & Prénom',
    contact_form_email: 'Votre Adresse E-mail',
    contact_form_subject: 'Sujet du message',
    contact_form_message: 'Votre message',
    contact_btn_send: 'Envoyer le Message',
    contact_success_msg: 'Votre message a bien été envoyé. Notre équipe vous répondra en moins de 2 heures.',

    // Terms Page
    terms_title: 'Conditions Générales d\'Utilisation & Vente',
    terms_subtitle: 'Consultez les termes régissant l\'utilisation de la plateforme MenuFid et la protection des données.',

    // Login & Register Pages
    login_title: 'Connexion Espace Marchand',
    login_subtitle: 'Accédez à votre tableau de bord restaurateur pour gérer votre menu et vos clients.',
    login_email: 'Adresse E-mail',
    login_password: 'Mot de passe',
    login_btn: 'Se Connecter au Dashboard',
    login_no_account: 'Pas encore de compte ?',
    login_create_account: 'Créer un compte',

    register_step1_badge: '1 Créer mon Compte',
    register_step2_badge: '2 Choisir l\'Abonnement',
    register_title: 'Créer votre Espace Marchand',
    register_subtitle: 'Inscrivez votre établissement et commencez à augmenter vos revenus.',
    register_business_name: 'Nom de votre Établissement / Restaurant',
    register_email: 'Adresse e-mail professionnelle',
    register_phone: 'Téléphone portable',
    register_password: 'Mot de passe secret',
    register_next_btn: 'Continuer vers le Choix de l\'Abonnement',
    register_already_account: 'Déjà inscrit ?',

    // Dashboard Layout & Pages
    dash_welcome: 'Ravi de vous revoir',
    dash_welcome_sub: 'Gérez vos catégories de plats, configurez vos offres et fidélisez vos clients.',
    dash_scanner_btn: 'Scanner',
    dash_view_card_btn: 'Voir ma carte',
    dash_stat_visits: 'Visites du jour',
    dash_stat_points: 'Points attribués',
    dash_stat_clients: 'Clients enregistrés',
    dash_stat_scans: 'Scans de carte',
    dash_top_dishes: 'Plats les plus consultés par les clients',
    dash_top_sub: 'Statistiques d\'intérêt sur votre carte interactive',
    dash_loyalty_offers: 'Offres de Fidélité',
    dash_loyalty_sub: 'Définissez les cadeaux que vos clients débloquent en accumulant des points.',
    dash_loyalty_btn: 'Configurer mes cadeaux',
    dash_online_card: 'Carte en Ligne',
    dash_online_sub: 'Modifiez vos catégories, ajoutez des plats et mettez à jour la disponibilité en temps réel.',
    dash_online_btn: 'Gérer ma carte',
    dash_qr_client: 'Votre QR Code Client',
    dash_qr_sub: 'Imprimez et posez ce QR Code sur vos tables. Vos clients n\'ont qu\'à le scanner.',
    dash_qr_copy: 'Copier',
    dash_qr_print: 'Imprimer le QR Code',

    // Dashboard Sidebar Navigation
    dash_nav_overview: 'Vue générale',
    dash_nav_menu: 'Carte Digitale QR',
    dash_nav_flyers: 'Chevalets & QR',
    dash_nav_offers: 'Offres & Cadeaux',
    dash_nav_crm: 'Fichier Clients',
    dash_nav_scanner: 'Scanner de Caisse',
    dash_nav_plugins: 'Modules & Plugins',
    dash_nav_profile: 'Profil Établissement',
    dash_nav_logout: 'Déconnexion',

    // Footer
    footer_desc: 'La plateforme numéro 1 pour digitaliser votre menu et fidéliser vos clients sur smartphone.',
    footer_rights: 'Tous droits réservés.',

    // Chatbot Widget
    bot_greeting: 'Bonjour 👋 ! Je suis l\'Assistant virtuel MenuFid. Comment puis-je vous aider à augmenter vos gains aujourd\'hui ?',
    bot_q1: 'Comment MenuFid augmente mes revenus ?',
    bot_a1: 'MenuFid transforme vos visiteurs occasionnels en clients réguliers. Avec la carte digitale enregistrée sur leur smartphone, vos clients reviennent 2x plus souvent !',
    bot_q2: 'Combien coûtent les formules MenuFid ?',
    bot_a2: 'Nos abonnements sont simples : Basic 5€/mois, Fidélité 10€/mois et Premium 20€/mois. Sans aucun engagement !',
    bot_q3: 'Comment fonctionne le Menu QR Code ?',
    bot_a3: 'Vos clients scannent le QR Code à table sans installer d\'application. Le menu s\'affiche instantanément avec photos HD et filtres d\'allergènes.',
    bot_q4: 'Comment devenir Partenaire officiel ?',
    bot_a4: 'Remplissez le formulaire sur notre page Partenaires pour obtenir un secteur d\'exclusivité et distribuer MenuFid avec commission récurrente.',
  },
  en: {
    // Nav & Common
    nav_home: 'Home',
    nav_pricing: 'Pricing & Plans',
    nav_partners: 'Become Our Partner',
    nav_about: 'About Us',
    nav_contact: 'Contact Us',
    nav_login: 'Log In',
    nav_register: 'Get Started',
    nav_dashboard: 'Merchant Space',
    nav_logout: 'Log Out',

    // Hero Section Landing
    hero_title: 'Maximize your establishment revenue with smart digital loyalty',
    hero_subtitle: 'Interactive HD QR Code menu, Apple & Google Wallet smartphone loyalty card, and automated marketing to double customer return visits.',
    hero_cta_primary: 'Activate My Business (From €5/mo)',
    hero_cta_partner: 'Become Our Network Partner',
    badge_security: '100% Secure Stripe Checkout - No Commitment',
    stat_clients: 'Loyal Customers',
    stat_revenue: '+35% Revenue Boost',
    stat_return: '2x Return Visits',

    // Features Section
    feat_title: 'Technology built to skyrocket your business profitability',
    feat_subtitle: 'Everything you need to capture, retain, and automatically re-engage your guests.',
    feat_qr_title: 'Interactive HD QR Code Menu',
    feat_qr_desc: 'Instant loading without app download, high-definition photos, allergen filters, and 1-click menu updates.',
    feat_wallet_title: 'Smartphone Wallet Loyalty Card',
    feat_wallet_desc: 'Customers add their loyalty card to Apple Wallet & Google Wallet in 1 scan. Never lose paper cards again!',
    feat_revenue_title: 'Automated Revenue Booster',
    feat_revenue_desc: 'Automatic promotional push notifications to fill your restaurant during off-peak hours.',
    feat_crm_title: 'Customer Database & SMS/WhatsApp Marketing',
    feat_crm_desc: 'Collect verified customer contact details and re-engage them on birthdays or special events.',

    // Pricing Page & Cards
    pricing_page_title: 'Simple & Transparent Pricing to Boost Your Earnings',
    pricing_page_subtitle: 'Every plan is engineered to deliver immediate return on investment starting in week one.',
    plan_basic_name: 'Basic',
    plan_basic_price: '€5',
    plan_basic_desc: 'Ideal to digitize your menu and start displaying your dishes online in 2 minutes.',
    plan_basic_feat1: 'Interactive HD QR Code Menu',
    plan_basic_feat2: 'Unlimited menu modifications',
    plan_basic_feat3: 'Merchant Dashboard Access',
    
    plan_loyalty_name: 'Loyalty',
    plan_loyalty_price: '€10',
    plan_loyalty_desc: 'The core engine to build your customer list and double repeat visits.',
    plan_loyalty_feat1: 'All Basic features included',
    plan_loyalty_feat2: 'Apple & Google Wallet Loyalty Card',
    plan_loyalty_feat3: 'Customer data collection',
    plan_loyalty_feat4: 'Real-time visit analytics',

    plan_premium_name: 'Full Premium',
    plan_premium_price: '€20',
    plan_premium_desc: 'The ultimate growth solution with automated marketing and Google reviews.',
    plan_premium_feat1: 'All Loyalty features included',
    plan_premium_feat2: 'Automated SMS & WhatsApp campaigns',
    plan_premium_feat3: 'Automated Google Maps Review Booster',
    plan_premium_feat4: 'Dedicated 7/7 priority support',

    btn_choose_plan: 'Subscribe via Stripe',
    popular_badge: 'Most Popular & Profitable',
    no_credit_card: '100% Secure Stripe Payment - Cancel Anytime in 1 Click',

    // Partner / Distribution Page
    partner_page_title: 'Global Partner Network',
    partner_page_subtitle: 'Join our worldwide distribution network and earn recurring monthly commissions for every onboarded merchant.',
    partner_title: 'Become Our Official Partner',
    partner_map_badge: 'Active Zone & Strategic Hub',
    partner_map_title: 'France 🇫🇷 as network heart, expanding worldwide',
    partner_map_desc: 'MenuFid actively equips restaurants across France. As a privileged regional partner, you become the exclusive contact for your territory.',
    partner_stat1_val: '100%',
    partner_stat1_label: 'Recurring Revenue',
    partner_stat2_val: 'Exclusivity',
    partner_stat2_label: 'Reserved Territory',

    partner_card1_title: 'Regional Exclusivity',
    partner_card1_desc: 'Be the official MenuFid partner in your city or region with a privileged status.',
    partner_card2_title: 'Support & Dedicated Marketing Kit',
    partner_card2_desc: 'Receive sales presentations, demo flyers, QR Code stickers, and custom training.',
    partner_card3_title: 'Recurring Commissions',
    partner_card3_desc: 'Earn an attractive recurring margin on every subscribed restaurant in your exclusive territory.',

    partner_form_title: 'Apply to Become a Partner',
    partner_form_subtitle: 'Fill out the form below. Our sales team will reach out within 24h.',
    partner_form_name: 'Full Name',
    partner_form_email: 'Email Address',
    partner_form_phone: 'Phone Number',
    partner_form_city: 'City & Country',
    partner_form_exp: 'Professional Experience / Activity',
    partner_form_msg: 'Project Presentation',
    partner_form_btn: 'Submit Partner Application',
    partner_success_msg: 'Your partner application has been recorded. Our team will reach out within 24h.',

    // Contact Page
    contact_title: 'Contact Our Team',
    contact_subtitle: 'Our sales and support team is available 7/7 to answer all your inquiries.',
    contact_card_email: 'Direct Email',
    contact_card_phone: 'Support 7/7',
    contact_card_location: 'Headquarters',
    contact_location_val: 'Paris, France 🇫🇷',
    contact_form_name: 'Full Name',
    contact_form_email: 'Email Address',
    contact_form_subject: 'Subject',
    contact_form_message: 'Your Message',
    contact_btn_send: 'Send Message',
    contact_success_msg: 'Your message has been sent successfully. We will reply within 2 hours.',

    // Terms Page
    terms_title: 'Terms of Service & General Sales Conditions',
    terms_subtitle: 'Review the terms governing the MenuFid platform and data protection.',

    // Login & Register Pages
    login_title: 'Merchant Space Login',
    login_subtitle: 'Access your restaurant dashboard to manage your menu and loyalty customers.',
    login_email: 'Email Address',
    login_password: 'Password',
    login_btn: 'Sign In to Dashboard',
    login_no_account: 'Don\'t have an account yet?',
    login_create_account: 'Sign Up',

    register_step1_badge: '1 Create Account',
    register_step2_badge: '2 Select Plan',
    register_title: 'Create Your Merchant Account',
    register_subtitle: 'Register your business and start increasing your revenue.',
    register_business_name: 'Establishment / Restaurant Name',
    register_email: 'Business Email Address',
    register_phone: 'Mobile Phone',
    register_password: 'Secret Password',
    register_next_btn: 'Proceed to Subscription Choice',
    register_already_account: 'Already registered?',

    // Dashboard Layout & Pages
    dash_welcome: 'Welcome back',
    dash_welcome_sub: 'Manage your dish categories, configure offers, and build customer loyalty.',
    dash_scanner_btn: 'Scanner',
    dash_view_card_btn: 'View My Menu',
    dash_stat_visits: 'Today\'s Visits',
    dash_stat_points: 'Awarded Points',
    dash_stat_clients: 'Registered Customers',
    dash_stat_scans: 'Card Scans',
    dash_top_dishes: 'Top Viewed Dishes by Customers',
    dash_top_sub: 'Interest analytics on your interactive menu',
    dash_loyalty_offers: 'Loyalty Offers',
    dash_loyalty_sub: 'Set rewards your customers unlock as they accumulate points.',
    dash_loyalty_btn: 'Configure Rewards',
    dash_online_card: 'Online Menu',
    dash_online_sub: 'Edit categories, add dishes, and update availability in real time.',
    dash_online_btn: 'Manage My Menu',
    dash_qr_client: 'Your Customer QR Code',
    dash_qr_sub: 'Print and place this QR Code on your tables. Guests just scan it.',
    dash_qr_copy: 'Copy Link',
    dash_qr_print: 'Print QR Code',

    // Dashboard Sidebar Navigation
    dash_nav_overview: 'Overview',
    dash_nav_menu: 'Digital QR Menu',
    dash_nav_flyers: 'Table Stands & QR',
    dash_nav_offers: 'Offers & Rewards',
    dash_nav_crm: 'Customer Directory',
    dash_nav_scanner: 'Register Scanner',
    dash_nav_plugins: 'Modules & Plugins',
    dash_nav_profile: 'Establishment Profile',
    dash_nav_logout: 'Log Out',

    // Footer
    footer_desc: 'The #1 platform to digitize your menu and retain customers on their smartphones.',
    footer_rights: 'All rights reserved.',

    // Chatbot Widget
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
    nav_pricing: 'Planes y Precios',
    nav_partners: 'Ser nuestro Socio',
    nav_about: 'Sobre Nosotros',
    nav_contact: 'Contacto',
    nav_login: 'Iniciar sesión',
    nav_register: 'Comenzar Ahora',
    nav_dashboard: 'Espacio Comercio',
    nav_logout: 'Cerrar sesión',

    // Hero Section Landing
    hero_title: 'Multiplique la facturación de su establecimiento con fidelidad digital',
    hero_subtitle: 'Menú con Código QR interactivo HD, tarjeta de fidelidad para teléfono inteligente en Apple & Google Wallet y promociones automáticas.',
    hero_cta_primary: 'Activar Mi Negocio (Desde 5€/mes)',
    hero_cta_partner: 'Ser Socio de Nuestra Red',
    badge_security: 'Pago 100% Seguro con Stripe - Sin Permanencia',
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

    // Pricing Page & Cards
    pricing_page_title: 'Precios Simples y Transparentes para Aumentar sus Ganancias',
    pricing_page_subtitle: 'Cada plan está diseñado para generar un retorno de inversión inmediato desde la primera semana.',
    plan_basic_name: 'Básico',
    plan_basic_price: '5€',
    plan_basic_desc: 'Ideal para digitalizar su menú y mostrar su carta en línea en 2 minutos.',
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
    no_credit_card: 'Pago 100% Seguro con Stripe - Cancelación en 1 Clic',

    // Partner / Distribution Page
    partner_page_title: 'Red Global de Socios',
    partner_page_subtitle: 'Únase a nuestra red mundial de distribución y reciba comisiones mensuales recurrentes por cada negocio activo.',
    partner_title: 'Conviértase en nuestro Socio Oficial',
    partner_map_badge: 'Zona Activa y Centro Estratégico',
    partner_map_title: 'Francia 🇫🇷 como centro de red, en expansión mundial',
    partner_map_desc: 'MenuFid equipa restaurantes en toda Francia. Como socio regional privilegiado, usted se convierte en el contacto exclusivo de su territorio.',
    partner_stat1_val: '100%',
    partner_stat1_label: 'Ingresos Recurrentes',
    partner_stat2_val: 'Exclusividad',
    partner_stat2_label: 'Territorio Reservado',

    partner_card1_title: 'Exclusividad Regional',
    partner_card1_desc: 'Sea el socio oficial de MenuFid en su ciudad o región con un estatus privilegiado.',
    partner_card2_title: 'Soporte y Kit de Marketing Dedicado',
    partner_card2_desc: 'Reciba presentaciones comerciales, folletos de demostración, pegatinas QR y formación personalizada.',
    partner_card3_title: 'Comisiones Recurrentes',
    partner_card3_desc: 'Obtenga un margen recurrente atractivo por cada restaurante suscrito en su territorio exclusivo.',

    partner_form_title: 'Postular para ser Socio',
    partner_form_subtitle: 'Complete el formulario. Nuestro equipo comercial le contactará en 24 horas.',
    partner_form_name: 'Nombre Completo',
    partner_form_email: 'Correo Electrónico',
    partner_form_phone: 'Teléfono',
    partner_form_city: 'Ciudad y País',
    partner_form_exp: 'Experiencia profesional / Actividad',
    partner_form_msg: 'Presentación de su proyecto',
    partner_form_btn: 'Enviar Solicitud de Socio',
    partner_success_msg: 'Su solicitud ha sido registrada con éxito. Nuestro equipo le contactará en 24 horas.',

    // Contact Page
    contact_title: 'Contacte con Nuestro Equipo',
    contact_subtitle: 'Nuestro equipo de soporte y ventas está a su disposición 7 días a la semana.',
    contact_card_email: 'Email Directo',
    contact_card_phone: 'Soporte 7/7',
    contact_card_location: 'Sede Central',
    contact_location_val: 'París, Francia 🇫🇷',
    contact_form_name: 'Nombre y Apellidos',
    contact_form_email: 'Correo Electrónico',
    contact_form_subject: 'Asunto',
    contact_form_message: 'Mensaje',
    contact_btn_send: 'Enviar Mensaje',
    contact_success_msg: 'Su mensaje ha sido enviado correctamente. Le responderemos en menos de 2 horas.',

    // Terms Page
    terms_title: 'Términos Generales de Uso y Venta',
    terms_subtitle: 'Consulte las condiciones que rigen el uso de la plataforma MenuFid y la protección de datos.',

    // Login & Register Pages
    login_title: 'Acceso para Comerciantes',
    login_subtitle: 'Acceda a su panel de control para gestionar su menú y sus clientes leales.',
    login_email: 'Correo Electrónico',
    login_password: 'Contraseña',
    login_btn: 'Entrar al Panel de Control',
    login_no_account: '¿Aún no tiene cuenta?',
    login_create_account: 'Registrarse',

    register_step1_badge: '1 Crear Mi Cuenta',
    register_step2_badge: '2 Elegir el Plan',
    register_title: 'Crear Su Cuenta de Comerciante',
    register_subtitle: 'Registre su negocio y comience a aumentar sus ingresos.',
    register_business_name: 'Nombre del Establecimiento / Restaurante',
    register_email: 'Correo electrónico profesional',
    register_phone: 'Teléfono móvil',
    register_password: 'Contraseña secreta',
    register_next_btn: 'Continuar a Selección de Plan',
    register_already_account: '¿Ya está registrado?',

    // Dashboard Layout & Pages
    dash_welcome: 'Bienvenido de nuevo',
    dash_welcome_sub: 'Gestione sus categorías de platos, configure ofertas y fidelice a sus clientes.',
    dash_scanner_btn: 'Escanear',
    dash_view_card_btn: 'Ver mi menú',
    dash_stat_visits: 'Visitas de hoy',
    dash_stat_points: 'Puntos otorgados',
    dash_stat_clients: 'Clientes registrados',
    dash_stat_scans: 'Escaneos de tarjeta',
    dash_top_dishes: 'Platos más vistos por los clientes',
    dash_top_sub: 'Estadísticas de interés en su menú interactivo',
    dash_loyalty_offers: 'Ofertas de Fidelidad',
    dash_loyalty_sub: 'Defina los regalos que desbloquean sus clientes al acumular puntos.',
    dash_loyalty_btn: 'Configurar regalos',
    dash_online_card: 'Menú en Línea',
    dash_online_sub: 'Modifique categorías, añada platos y actualice la disponibilidad en tiempo real.',
    dash_online_btn: 'Gestionar mi menú',
    dash_qr_client: 'Su Código QR de Cliente',
    dash_qr_sub: 'Imprima y coloque este código QR en sus mesas. Sus clientes solo tienen que escanearlo.',
    dash_qr_copy: 'Copiar enlace',
    dash_qr_print: 'Imprimir Código QR',

    // Dashboard Sidebar Navigation
    dash_nav_overview: 'Vista general',
    dash_nav_menu: 'Menú Digital QR',
    dash_nav_flyers: 'Caballetes y QR',
    dash_nav_offers: 'Ofertas y Regalos',
    dash_nav_crm: 'Fichero de Clientes',
    dash_nav_scanner: 'Escáner de Caja',
    dash_nav_plugins: 'Módulos y Plugins',
    dash_nav_profile: 'Perfil del Negocio',
    dash_nav_logout: 'Cerrar sesión',

    // Footer
    footer_desc: 'La plataforma número 1 para digitalizar su menú y fidelizar a sus clientes en el teléfono móvil.',
    footer_rights: 'Todos los derechos reservados.',

    // Chatbot Widget
    bot_greeting: '¡Hola 👋! Soy el Asistente Virtual MenuFid. ¿Cómo puedo ayudarte a aumentar tus ganancias hoy?',
    bot_q1: '¿Cómo aumenta MenuFid mis ingresos?',
    bot_a1: 'MenuFid transforma visitantes ocasionales en clientes habituales. ¡Vuelven el doble de veces gracias a la tarjeta digital!',
    bot_q2: '¿Cuánto cuestan los planes MenuFid?',
    bot_a2: 'Nuestros precios son transparentes: Básico 5€/mes, Fidelidad 10€/mes y Premium 20€/mes. ¡Sin permanencia!',
    bot_q3: '¿Cómo funciona el Menú QR?',
    bot_a3: 'Los clientes escanean el código QR en la mesa sin instalar aplicaciones. El menú se abre al instante.',
    bot_q4: '¿Cómo ser Socio Oficial?',
    bot_a4: 'Envíe su solicitud en nuestra página de socios para reservar una región exclusiva.',
  },
  ar: {
    // Navigation & Global Header
    nav_home: 'الرئيسية',
    nav_pricing: 'خطط الاشتراكات',
    nav_partners: 'كن شريكاً معنا',
    nav_about: 'من نحن',
    nav_contact: 'اتصل بنا',
    nav_login: 'تسجيل الدخول',
    nav_register: 'إنشاء حساب جديد',
    nav_dashboard: 'لوحة التجار',
    nav_logout: 'تسجيل الخروج',

    // Hero Section Landing
    hero_title: 'ضاعف مداخيل وأرباح مطعمك مع برنامج الولاء الرقمي الذكي',
    hero_subtitle: 'قائمة طعام تفاعلية عبر رمز QR، بطاقة ولاء رقمية على محفظة الهاتف Apple & Google Wallet وتنبيهات إعادة جذب الزبائن.',
    hero_cta_primary: 'تفعيل حساب مطعمي (ابتداءً من 5€/شهرياً)',
    hero_cta_partner: 'الانضمام كشريك توزيع حصري',
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

    // Pricing Page & Cards
    pricing_page_title: 'أسعار بسيطة وشفافة لمضاعفة أرباحك',
    pricing_page_subtitle: 'كل خطة صممت لتحقيق عائد استثماري فوري يغطي التكلفة منذ الأسبوع الأول.',
    plan_basic_name: 'الأساسية',
    plan_basic_price: '5€',
    plan_basic_desc: 'مثالية لرقمنة منيو مطعمك وبدء عرضه على الإنترنت في دقيقتين.',
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
    no_credit_card: 'دفع آمن 100% عبر Stripe - إلغاء بنقرة واحدة في أي وقت',

    // Partner & Distribution Page
    partner_page_title: 'شبكة الشركاء العالمية',
    partner_page_subtitle: 'انضم لشبكة التوزيع العالمية واحصل على عمولات شهرية مستمرة لكل مطعم تقوم بتجهيزه.',
    partner_title: 'كن شريكنا الرسمي المعترف به',
    partner_map_badge: 'منطقة نشطة ومركز استراتيجي',
    partner_map_title: 'فرنسا 🇫🇷 كمركز للشبكة، والتوسع مستمر عالمياً',
    partner_map_desc: 'يقوم MenuFid بتجهيز المطاعم في كافة أرجاء فرنسا. كشريك إقليمي مميز، تصبح الممثل الحصري لمطاعم منطقتك.',
    partner_stat1_val: '100%',
    partner_stat1_label: 'أرباح شهرية مستمرة',
    partner_stat2_val: 'حصرياً',
    partner_stat2_label: 'منطقة مخصصة لك',

    partner_card1_title: 'حصرية إقليمية',
    partner_card1_desc: 'كن الممثل الرسمي الحصري لـ MenuFid في مدينتك أو منطقتك مع وضع فريد ومميز.',
    partner_card2_title: 'دعم وحقيبة تسويق مخصصة',
    partner_card2_desc: 'احصل على العروض التجارية، ملصقات رمز QR، الكتيبات والتدريب المخصص لنجاحك.',
    partner_card3_title: 'عمولات شهرية متكررة',
    partner_card3_desc: 'احصل على هامش ربح ممتاز ومتكرر شهرياً عن كل مطعم مشترك في منطقتك الحصرية.',

    partner_form_title: 'التقديم لتصبح شريكاً رسمياً',
    partner_form_subtitle: 'قم بتعبئة النموذج أدناه. سيتواصل معك فريقنا التجاري خلال 24 ساعة.',
    partner_form_name: 'الاسم الكامل',
    partner_form_email: 'البريد الإلكتروني المهني',
    partner_form_phone: 'رقم الهاتف',
    partner_form_city: 'المدينة والدولة',
    partner_form_exp: 'الخبرة المهنية / النشاط الحالي',
    partner_form_msg: 'تقديم عن مشروعك ونشاطك',
    partner_form_btn: 'إرسال طلب الشراكة',
    partner_success_msg: 'تم تسجيل طلب الشراكة بنجاح. سيتواصل معك فريقنا خلال 24 ساعة.',

    // Contact Page
    contact_title: 'تواصل مع فريقنا المباشر',
    contact_subtitle: 'فريق الدعم والمبيعات في خدمتك 7 أيام في الأسبوع للإجابة على كافة استفساراتك.',
    contact_card_email: 'البريد الإلكتروني المباشر',
    contact_card_phone: 'دعم متواصل 7/7',
    contact_card_location: 'المقر الرئيسي',
    contact_location_val: 'باريس، فرنسا 🇫🇷',
    contact_form_name: 'الاسم واللقب',
    contact_form_email: 'البريد الإلكتروني',
    contact_form_subject: 'موضوع الرسالة',
    contact_form_message: 'نص الرسالة',
    contact_btn_send: 'إرسال الرسالة',
    contact_success_msg: 'تم إرسال رسالتك بنجاح. سنرد عليك في أقل من ساعتين.',

    // Terms Page
    terms_title: 'الشروط والأحكام العامة للاستخدام والبيع',
    terms_subtitle: 'اطّلع على القوانين المنظمة لاستخدام منصة MenuFid وحماية بيانات المستخدمين.',

    // Login & Register Pages
    login_title: 'تسجيل دخول التجار',
    login_subtitle: 'ادخل إلى لوحة تحكم مطعمك لإدارة منيو الطعام والزبائن المخلصين.',
    login_email: 'البريد الإلكتروني',
    login_password: 'كلمة المرور',
    login_btn: 'تسجيل الدخول للوحة التحكم',
    login_no_account: 'ليس لديك حساب بعد؟',
    login_create_account: 'إنشاء حساب جديد',

    register_step1_badge: '1 إنشاء الحساب',
    register_step2_badge: '2 اختيار الخطة',
    register_title: 'إنشاء حساب تاجر جديد',
    register_subtitle: 'سجل مطعمك وابدأ فوراً في زيادة مداخيلك وأرباحك.',
    register_business_name: 'الاسم التجاري للمطعم / المؤسسة',
    register_email: 'البريد الإلكتروني المهني',
    register_phone: 'رقم الهاتف المحمول',
    register_password: 'كلمة المرور السرية',
    register_next_btn: 'الانتقال لاختيار خطة الاشتراك',
    register_already_account: 'مسجل بالفعل؟',

    // Dashboard Layout & Pages
    dash_welcome: 'أهلاً بك مجدداً',
    dash_welcome_sub: 'إدارة أصناف الطعام، إعداد عروض الولاء ومتابعة زبائنك.',
    dash_scanner_btn: 'الماسح الضوئي',
    dash_view_card_btn: 'معاينة المنيو الخاص بي',
    dash_stat_visits: 'زيارات اليوم',
    dash_stat_points: 'النقاط الممنوحة',
    dash_stat_clients: 'الزبائن المسجلون',
    dash_stat_scans: 'مسحات البطاقة',
    dash_top_dishes: 'الأطباق الأكثر مشاهدة من الزبائن',
    dash_top_sub: 'إحصائيات الاهتمام والطلب على منيو مطعمك',
    dash_loyalty_offers: 'عروض ومكافآت الولاء',
    dash_loyalty_sub: 'حدد المكافآت التي يفتحها زبائنك عند تجميع النقاط.',
    dash_loyalty_btn: 'إعداد المكافآت',
    dash_online_card: 'المنيو الرقمي التفاعلي',
    dash_online_sub: 'تعديل الأصناف، إضافة أطباق جديدة وتحديث التوفر مباشرة.',
    dash_online_btn: 'إدارة المنيو الخاص بي',
    dash_qr_client: 'رمز QR المخصص لزبائنك',
    dash_qr_sub: 'اطبع هذا الرمز وضعه على الطاولات. يكتفي زبائنك بمسحه فقط.',
    dash_qr_copy: 'نسخ الرابط',
    dash_qr_print: 'طباعة رمز QR',

    // Dashboard Sidebar Navigation
    dash_nav_overview: 'نظرة عامة',
    dash_nav_menu: 'قائمة الطعام QR',
    dash_nav_flyers: 'رموز الطاولات و QR',
    dash_nav_offers: 'العروض والمكافآت',
    dash_nav_crm: 'قاعدة بيانات الزبائن',
    dash_nav_scanner: 'ماسح الصندوق',
    dash_nav_plugins: 'الإضافات والموديولات',
    dash_nav_profile: 'ملف المطعم والبيانات',
    dash_nav_logout: 'تسجيل الخروج',

    // Footer
    footer_desc: 'المنصة رقم 1 لرقمنة منيو المطاعم والاحتفاظ بالزبائن عبر هواتفهم الذكية.',
    footer_rights: 'جميع الحقوق محفوظة.',

    // Chatbot Widget
    bot_greeting: 'مرحباً بك 👋! أنا المساعد الافتراضي لـ MenuFid. كيف يمكنني مساعدتك في زيادة أرباحك اليوم؟',
    bot_q1: 'كيف يساعد MenuFid في زيادة أرباحي؟',
    bot_a1: 'يحول MenuFid الزوار العاديين إلى زبائن دائمين. يعود الزبائن مرتين أكثر بفضل بطاقة الولاء الرقمية على هواتفهم!',
    bot_q2: 'كم تبلغ تكلفة الاشتراكات؟',
    bot_a2: 'الأسعار شفافة: الأساسية 5€/شهرياً، الولاء 10€/شهرياً، والاحترافية 20€/شهرياً. بدون التزام!',
    bot_q3: 'كيف تعمل قائمة رمز QR؟',
    bot_a3: 'يمسح الزبائن الرمز الموجود على الطاولة دون تحميل أي تطبيق، لتظهر قائمة الطعام فوراً بصور عالية الجودة.',
    bot_q4: 'كيف أصبح شريكاً رسمياً؟',
    bot_a4: 'قدم طلبك على صفحة الشركاء للحصول على منطقة حصرية وتوزيع MenuFid بعمولات مستمرة.',
  },
  de: {
    // Nav & Common
    nav_home: 'Startseite',
    nav_pricing: 'Preise & Tarife',
    nav_partners: 'Partner Werden',
    nav_about: 'Über Uns',
    nav_contact: 'Kontakt',
    nav_login: 'Anmelden',
    nav_register: 'Konto Erstellen',
    nav_dashboard: 'Händler-Bereich',
    nav_logout: 'Abmelden',

    // Hero Section Landing
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

    // Pricing Page & Cards
    pricing_page_title: 'Einfache & Transparente Preise für Maximale Gewinne',
    pricing_page_subtitle: 'Jeder Tarif ist darauf ausgelegt, ab der ersten Woche einen unmittelbaren ROI zu erzielen.',
    plan_basic_name: 'Basis',
    plan_basic_price: '5€',
    plan_basic_desc: 'Ideal, um Ihre Speisekarte zu digitalisieren und in 2 Minuten online zu präsentieren.',
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
    no_credit_card: '100% Sichere Stripe-Zahlung - Jederzeit mit 1 Klick Kündbar',

    // Partner & Distribution Page
    partner_page_title: 'Weltweites Partner-Netzwerk',
    partner_page_subtitle: 'Schließen Sie sich unserem weltweiten Vertriebsnetz an und verdienen Sie monatliche Provisionen.',
    partner_title: 'Werden Sie Offizieller Partner',
    partner_map_badge: 'Aktive Zone & Strategischer Hub',
    partner_map_title: 'Frankreich 🇫🇷 als Netzwerk-Herz, weltweiter Ausbau',
    partner_map_desc: 'MenuFid rüstet Gastronomiebetriebe in ganz Frankreich aus. Als exklusiver Partner werden Sie zum Hauptansprechpartner in Ihrer Region.',
    partner_stat1_val: '100%',
    partner_stat1_label: 'Wiederkehrende Einnahmen',
    partner_stat2_val: 'Exklusivität',
    partner_stat2_label: 'Geschütztes Gebiet',

    partner_card1_title: 'Regionale Exklusivität',
    partner_card1_desc: 'Werden Sie offizieller MenuFid-Partner in Ihrer Stadt mit exklusivem Status.',
    partner_card2_title: 'Support & Dediziertes Marketing-Kit',
    partner_card2_desc: 'Erhalten Sie Verkaufspräsentationen, Demo-Flyer, QR-Code-Sticker und individuelle Schulungen.',
    partner_card3_title: 'Monatliche Provisionen',
    partner_card3_desc: 'Verdienen Sie attraktive wiederkehrende Margen für jeden geworbenen Betrieb in Ihrem Gebiet.',

    partner_form_title: 'Als Partner Bewerben',
    partner_form_subtitle: 'Füllen Sie das Formular aus. Unser Vertriebsteam meldet sich innerhalb von 24 Stunden.',
    partner_form_name: 'Vollständiger Name',
    partner_form_email: 'E-Mail-Adresse',
    partner_form_phone: 'Telefonnummer',
    partner_form_city: 'Stadt & Land',
    partner_form_exp: 'Berufserfahrung / Tätigkeit',
    partner_form_msg: 'Projektpräsentation',
    partner_form_btn: 'Partner-Bewerbung Absenden',
    partner_success_msg: 'Ihre Bewerbung wurde erfolgreich erfasst. Unser Team meldet sich innerhalb von 24h.',

    // Contact Page
    contact_title: 'Kontaktieren Sie Unser Team',
    contact_subtitle: 'Unser Vertriebs- und Support-Team steht Ihnen 7 Tage die Woche zur Verfügung.',
    contact_card_email: 'Direkte E-Mail',
    contact_card_phone: 'Support 7/7',
    contact_card_location: 'Hauptsitz',
    contact_location_val: 'Paris, Frankreich 🇫🇷',
    contact_form_name: 'Name & Nachname',
    contact_form_email: 'E-Mail-Adresse',
    contact_form_subject: 'Betreff',
    contact_form_message: 'Ihre Nachricht',
    contact_btn_send: 'Nachricht Senden',
    contact_success_msg: 'Ihre Nachricht wurde erfolgreich gesendet. Wir antworten innerhalb von 2 Stunden.',

    // Terms Page
    terms_title: 'Allgemeine Geschäfts- & Nutzungsbedingungen',
    terms_subtitle: 'Lesen Sie die Bedingungen für die Nutzung der MenuFid-Plattform und den Datenschutz.',

    // Login & Register Pages
    login_title: 'Händler-Anmeldung',
    login_subtitle: 'Zugang zu Ihrem Restaurant-Dashboard zur Verwaltung von Menü und Stammkunden.',
    login_email: 'E-Mail-Adresse',
    login_password: 'Passwort',
    login_btn: 'Ins Dashboard Einloggen',
    login_no_account: 'Noch kein Konto?',
    login_create_account: 'Registrieren',

    register_step1_badge: '1 Konto Erstellen',
    register_step2_badge: '2 Tarif Wählen',
    register_title: 'Händler-Konto Erstellen',
    register_subtitle: 'Registrieren Sie Ihren Betrieb und steigern Sie Ihren Umsatz.',
    register_business_name: 'Name des Betriebs / Restaurants',
    register_email: 'Geschäftliche E-Mail-Adresse',
    register_phone: 'Mobiltelefon',
    register_password: 'Geheimes Passwort',
    register_next_btn: 'Weiter zur Tarifauswahl',
    register_already_account: 'Bereits registriert?',

    // Dashboard Layout & Pages
    dash_welcome: 'Willkommen zurück',
    dash_welcome_sub: 'Verwalten Sie Gerichtskategorien, konfigurieren Sie Angebote und binden Sie Stammgäste.',
    dash_scanner_btn: 'Scanner',
    dash_view_card_btn: 'Meine Karte anzeigen',
    dash_stat_visits: 'Heutige Besuche',
    dash_stat_points: 'Vergebene Punkte',
    dash_stat_clients: 'Registrierte Kunden',
    dash_stat_scans: 'Karten-Scans',
    dash_top_dishes: 'Beliebteste Gerichte bei Gästen',
    dash_top_sub: 'Interessensstatistiken Ihrer digitalen Speisekarte',
    dash_loyalty_offers: 'Treue-Angebote',
    dash_loyalty_sub: 'Legen Sie Belohnungen fest, die Gäste durch Punkte freischalten.',
    dash_loyalty_btn: 'Prämien Konfigurieren',
    dash_online_card: 'Online-Speisekarte',
    dash_online_sub: 'Kategorien bearbeiten, Gerichte hinzufügen und Verfügbarkeit in Echtzeit anpassen.',
    dash_online_btn: 'Karte Verwalten',
    dash_qr_client: 'Ihr Gäste-QR-Code',
    dash_qr_sub: 'Drucken und platzieren Sie diesen QR-Code auf Ihren Tischen.',
    dash_qr_copy: 'Link kopieren',
    dash_qr_print: 'QR-Code Drucken',

    // Dashboard Sidebar Navigation
    dash_nav_overview: 'Übersicht',
    dash_nav_menu: 'Digitale QR-Karte',
    dash_nav_flyers: 'Tischaufsteller & QR',
    dash_nav_offers: 'Angebote & Prämien',
    dash_nav_crm: 'Kundenkartei',
    dash_nav_scanner: 'Kassen-Scanner',
    dash_nav_plugins: 'Module & Plugins',
    dash_nav_profile: 'Betriebsprofil',
    dash_nav_logout: 'Abmelden',

    // Footer
    footer_desc: 'Die Plattform Nr. 1 zur Digitalisierung von Speisekarten und Kundenbindung auf dem Smartphone.',
    footer_rights: 'Alle Rechte vorbehalten.',

    // Chatbot Widget
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
    nav_pricing: 'Piani e Prezzi',
    nav_partners: 'Diventa Partner',
    nav_about: 'Chi Siamo',
    nav_contact: 'Contatti',
    nav_login: 'Accedi',
    nav_register: 'Crea Account',
    nav_dashboard: 'Area Ristoratore',
    nav_logout: 'Esci',

    // Hero Section Landing
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

    // Pricing Page & Cards
    pricing_page_title: 'Prezzi Semplici e Trasparenti per Aumentare i Tuoi Guadagni',
    pricing_page_subtitle: 'Ogni piano è calibrato per generare un ritorno sull\'investimento immediato fin dalla prima settimana.',
    plan_basic_name: 'Base',
    plan_basic_price: '5€',
    plan_basic_desc: 'Ideale per digitalizzare il menu e iniziare a mostrare i piatti online in 2 minuti.',
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
    no_credit_card: 'Pagamento 100% Sicuro con Stripe - Disdici in 1 Click',

    // Partner / Distribution Page
    partner_page_title: 'Rete Globale Partner',
    partner_page_subtitle: 'Unisciti alla nostra rete globale di distribuzione e ricevi commissioni mensili ricorrenti.',
    partner_title: 'Diventa Nostro Partner Ufficiale',
    partner_map_badge: 'Zona Attiva e Hub Strategico',
    partner_map_title: 'La Francia 🇫🇷 come cuore della rete, in espansione globale',
    partner_map_desc: 'MenuFid equipaggia i ristoranti in tutta la Francia. Come partner regionale privilegiato, diventi il referente esclusivo della tua zona.',
    partner_stat1_val: '100%',
    partner_stat1_label: 'Entrate Ricorrenti',
    partner_stat2_val: 'Esclusività',
    partner_stat2_label: 'Area Riservata',

    partner_card1_title: 'Esclusività Regionale',
    partner_card1_desc: 'Diventa il referente ufficiale MenuFid nella tua città con uno status prioritario.',
    partner_card2_title: 'Supporto e Kit Marketing Dedicato',
    partner_card2_desc: 'Ricevi le presentazioni commerciali, i volantini demo, gli adesivi QR e la formazione su misura.',
    partner_card3_title: 'Commissioni Ricorrenti',
    partner_card3_desc: 'Ottieni un margine ricorrente su ogni ristorante abbonato nella tua zona di esclusiva.',

    partner_form_title: 'Candidati come Partner',
    partner_form_subtitle: 'Compila il modulo sottostante. Il nostro team commerciale ti ricontatterà entro 24 ore.',
    partner_form_name: 'Nome Completo',
    partner_form_email: 'Email Professionale',
    partner_form_phone: 'Telefono',
    partner_form_city: 'Città e Paese',
    partner_form_exp: 'Esperienza professionale / Attività',
    partner_form_msg: 'Presentazione del tuo progetto',
    partner_form_btn: 'Invia Candidatura Partner',
    partner_success_msg: 'La tua candidatura è stata registrata con successo. Il nostro team ti contatterà entro 24 ore.',

    // Contact Page
    contact_title: 'Contatta il Nostro Team',
    contact_subtitle: 'Il nostro team di supporto e vendita è a tua disposizione 7 giorni su 7.',
    contact_card_email: 'Email Diretta',
    contact_card_phone: 'Supporto 7/7',
    contact_card_location: 'Sede Centrale',
    contact_location_val: 'Parigi, Francia 🇫🇷',
    contact_form_name: 'Nome e Cognome',
    contact_form_email: 'Indirizzo Email',
    contact_form_subject: 'Oggetto',
    contact_form_message: 'Il Tuo Messaggio',
    contact_btn_send: 'Invia Messaggio',
    contact_success_msg: 'Il tuo messaggio è stato inviato con successo. Ti risponderemo entro 2 ore.',

    // Terms Page
    terms_title: 'Termini Generali di Servizio e Vendita',
    terms_subtitle: 'Consulta le condizioni che regolano l\'uso della piattaforma MenuFid e la protezione dei dati.',

    // Login & Register Pages
    login_title: 'Accesso Ristoratori',
    login_subtitle: 'Accedi alla tua dashboard per gestire il tuo menu e i tuoi clienti fedeli.',
    login_email: 'Indirizzo Email',
    login_password: 'Password',
    login_btn: 'Entra nella Dashboard',
    login_no_account: 'Non hai ancora un account?',
    login_create_account: 'Registrati',

    register_step1_badge: '1 Crea Account',
    register_step2_badge: '2 Scegli il Piano',
    register_title: 'Crea il Tuo Account Ristoratore',
    register_subtitle: 'Registra il tuo locale e inizia ad aumentare il tuo fatturato.',
    register_business_name: 'Nome del Locale / Ristorante',
    register_email: 'Email aziendale',
    register_phone: 'Telefono cellulare',
    register_password: 'Password segreta',
    register_next_btn: 'Procedi alla Scelta del Piano',
    register_already_account: 'Sei già registrato?',

    // Dashboard Layout & Pages
    dash_welcome: 'Bentornato',
    dash_welcome_sub: 'Gestisci le categorie di piatti, configura le offerte e fidelizza i tuoi clienti.',
    dash_scanner_btn: 'Scanner',
    dash_view_card_btn: 'Vedi il mio menu',
    dash_stat_visits: 'Visite di oggi',
    dash_stat_points: 'Punti assegnati',
    dash_stat_clients: 'Clienti registrati',
    dash_stat_scans: 'Scansioni carta',
    dash_top_dishes: 'Piatti più visti dai clienti',
    dash_top_sub: 'Statistiche di interesse sul tuo menu interattivo',
    dash_loyalty_offers: 'Offerte Fedeltà',
    dash_loyalty_sub: 'Imposta i premi che i clienti sbloccano accumulando punti.',
    dash_loyalty_btn: 'Configura Premi',
    dash_online_card: 'Menu Online',
    dash_online_sub: 'Modifica categorie, aggiungi piatti e aggiorna la disponibilità in tempo reale.',
    dash_online_btn: 'Gestisci il mio menu',
    dash_qr_client: 'Il tuo QR Code Cliente',
    dash_qr_sub: 'Stampa e posiziona questo QR Code sui tuoi tavoli.',
    dash_qr_copy: 'Copia link',
    dash_qr_print: 'Stampa QR Code',

    // Dashboard Sidebar Navigation
    dash_nav_overview: 'Panoramica',
    dash_nav_menu: 'Menu Digitale QR',
    dash_nav_flyers: 'Cavalletti e QR',
    dash_nav_offers: 'Offerte e Premi',
    dash_nav_crm: 'Elenco Clienti',
    dash_nav_scanner: 'Scanner Cassa',
    dash_nav_plugins: 'Moduli e Plugin',
    dash_nav_profile: 'Profilo Locale',
    dash_nav_logout: 'Esci',

    // Footer
    footer_desc: 'La piattaforma N.1 per digitalizzare il menu e fidelizzare i clienti sullo smartphone.',
    footer_rights: 'Tutti i diritti riservati.',

    // Chatbot Widget
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
    // Navigation & Global Header
    nav_home: 'Início',
    nav_pricing: 'Planos e Preços',
    nav_partners: 'Seja Nosso Parceiro',
    nav_about: 'Sobre Nós',
    nav_contact: 'Contato',
    nav_login: 'Entrar',
    nav_register: 'Criar Conta',
    nav_dashboard: 'Área do Comerciante',
    nav_logout: 'Sair',

    // Hero Section Landing
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

    // Pricing Page & Cards
    pricing_page_title: 'Preços Simples e Transparentes para Aumentar seus Lucros',
    pricing_page_subtitle: 'Cada plano foi projetado para gerar retorno financeiro imediato desde a primeira semana.',
    plan_basic_name: 'Básico',
    plan_basic_price: '5€',
    plan_basic_desc: 'Ideal para digitalizar seu cardápio e começar a exibir seus pratos online em 2 minutos.',
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
    no_credit_card: 'Pagamento 100% Seguro Stripe - Cancele Quando Quiser com 1 Clique',

    // Partner & Distribution Page
    partner_page_title: 'Rede Global de Parceiros',
    partner_page_subtitle: 'Junte-se à nossa rede mundial de distribuição e receba comissões mensais recorrentes.',
    partner_title: 'Seja Nosso Parceiro Oficial',
    partner_map_badge: 'Zona Ativa e Centro Estratégico',
    partner_map_title: 'França 🇫🇷 como coração da rede, em expansão mundial',
    partner_map_desc: 'O MenuFid equipa restaurantes em toda a França. Como parceiro regional exclusivo, você se torna o contato principal na sua região.',
    partner_stat1_val: '100%',
    partner_stat1_label: 'Receita Recorrente',
    partner_stat2_val: 'Exclusividade',
    partner_stat2_label: 'Região Reservada',

    partner_card1_title: 'Exclusividade Regional',
    partner_card1_desc: 'Seja o parceiro oficial do MenuFid na sua cidade ou região com um status exclusivo.',
    partner_card2_title: 'Suporte e Kit de Marketing Dedicado',
    partner_card2_desc: 'Receba apresentações comerciais, folhetos de demonstração, adesivos QR e treinamento personalizado.',
    partner_card3_title: 'Comissões Recorrentes',
    partner_card3_desc: 'Ganhe uma margem recorrente atraente para cada estabelecimento assinado na sua região exclusiva.',

    partner_form_title: 'Candidatar-se a Parceiro',
    partner_form_subtitle: 'Preencha o formulário abaixo. Nossa equipe comercial entrará em contato em até 24 horas.',
    partner_form_name: 'Nome Completo',
    partner_form_email: 'E-mail Profissional',
    partner_form_phone: 'Telefone',
    partner_form_city: 'Cidade e País',
    partner_form_exp: 'Experiência profissional / Atividade',
    partner_form_msg: 'Apresentação do seu projeto',
    partner_form_btn: 'Enviar Candidatura de Parceiro',
    partner_success_msg: 'Sua candidatura foi registrada com sucesso. Nossa equipe entrará em contato em até 24 horas.',

    // Contact Page
    contact_title: 'Entre em Contato com Nossa Equipe',
    contact_subtitle: 'Nossa equipe de vendas e suporte está disponível 7 dias por semana.',
    contact_card_email: 'E-mail Direto',
    contact_card_phone: 'Suporte 7/7',
    contact_card_location: 'Sede Principal',
    contact_location_val: 'Paris, França 🇫🇷',
    contact_form_name: 'Nome Completo',
    contact_form_email: 'Endereço de E-mail',
    contact_form_subject: 'Assunto',
    contact_form_message: 'Sua Mensagem',
    contact_btn_send: 'Enviar Mensagem',
    contact_success_msg: 'Sua mensagem foi enviada com sucesso. Responderemos em menos de 2 horas.',

    // Terms Page
    terms_title: 'Termos Gerais de Serviço e Venda',
    terms_subtitle: 'Consulte as condições que regem a plataforma MenuFid e a proteção de dados.',

    // Login & Register Pages
    login_title: 'Acesso do Comerciante',
    login_subtitle: 'Acesse seu painel para gerenciar seu cardápio e seus clientes fiéis.',
    login_email: 'Endereço de E-mail',
    login_password: 'Senha',
    login_btn: 'Entrar no Painel de Controle',
    login_no_account: 'Ainda não tem conta?',
    login_create_account: 'Cadastrar-se',

    register_step1_badge: '1 Criar Minha Conta',
    register_step2_badge: '2 Escolher o Plano',
    register_title: 'Criar Sua Conta de Comerciante',
    register_subtitle: 'Registre sua empresa e comece a aumentar seu faturamento.',
    register_business_name: 'Nome do Estabelecimento / Restaurante',
    register_email: 'E-mail profissional',
    register_phone: 'Telefone celular',
    register_password: 'Senha secreta',
    register_next_btn: 'Ir para Seleção de Plano',
    register_already_account: 'Já está cadastrado?',

    // Dashboard Layout & Pages
    dash_welcome: 'Bem-vindo de volta',
    dash_welcome_sub: 'Gerencie suas categorias de pratos, configure ofertas e fidelize seus clientes.',
    dash_scanner_btn: 'Scanner',
    dash_view_card_btn: 'Ver meu cardápio',
    dash_stat_visits: 'Visitas de hoje',
    dash_stat_points: 'Pontos atribuídos',
    dash_stat_clients: 'Clientes registrados',
    dash_stat_scans: 'Scans de cartão',
    dash_top_dishes: 'Pratos mais vistos pelos clientes',
    dash_top_sub: 'Estatísticas de interesse no seu cardápio interativo',
    dash_loyalty_offers: 'Ofertas de Fidelidade',
    dash_loyalty_sub: 'Defina as recompensas que seus clientes desbloqueiam acumulando pontos.',
    dash_loyalty_btn: 'Configurar Recompensas',
    dash_online_card: 'Cardápio Online',
    dash_online_sub: 'Edite categorias, adicione pratos e atualize a disponibilidade em tempo real.',
    dash_online_btn: 'Gerenciar meu cardápio',
    dash_qr_client: 'Seu QR Code de Cliente',
    dash_qr_sub: 'Imprima e coloque este QR Code nas suas mesas. Seus clientes só precisam escaneá-lo.',
    dash_qr_copy: 'Copiar link',
    dash_qr_print: 'Imprimir QR Code',

    // Dashboard Sidebar Navigation
    dash_nav_overview: 'Visão geral',
    dash_nav_menu: 'Cardápio Digital QR',
    dash_nav_flyers: 'Displays e QR',
    dash_nav_offers: 'Ofertas e Recompensas',
    dash_nav_crm: 'Cadastro de Clientes',
    dash_nav_scanner: 'Scanner de Caixa',
    dash_nav_plugins: 'Módulos e Plugins',
    dash_nav_profile: 'Perfil da Empresa',
    dash_nav_logout: 'Sair',

    // Footer
    footer_desc: 'A plataforma N.1 para digitalizar cardápios e fidelizar clientes no smartphone.',
    footer_rights: 'Todos os direitos reservados.',

    // Chatbot Widget
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
