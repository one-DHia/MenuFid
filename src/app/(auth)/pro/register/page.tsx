'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  CreditCard, 
  MessageCircle, 
  Camera, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Building2, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

function RegisterContent() {
  const { t, language, dir } = useLanguage();
  const searchParams = useSearchParams();

  const planParam = searchParams.get('plan') || 'pro';
  const billingParam = searchParams.get('billing') || 'monthly';
  const isCanceled = searchParams.get('canceled') === 'true';

  // Mode de paiement : 'online' (CB Stripe) ou 'offline' (Pas de carte / Contact)
  const [paymentMode, setPaymentMode] = useState<'online' | 'offline'>('online');

  const isEssential = planParam === 'essential' || planParam === 'starter';
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro'>(isEssential ? 'starter' : 'pro');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(billingParam === 'yearly' ? 'yearly' : 'monthly');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // États de chargement et d'erreur
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isEssential) setSelectedPlan('starter');
    if (billingParam === 'yearly') setBillingPeriod('yearly');
  }, [planParam, billingParam, isEssential]);

  const priceSuffix = billingPeriod === 'yearly' 
    ? (language === 'ar' ? '/ سنوياً' : (language === 'en' ? '/ yr' : '/ an'))
    : (language === 'ar' ? '/ شهرياً' : (language === 'en' ? '/ mo' : '/ mois'));

  const planPrice = selectedPlan === 'starter' 
    ? (billingPeriod === 'yearly' ? `39,90 € ${priceSuffix}` : `3,99 € ${priceSuffix}`) 
    : (billingPeriod === 'yearly' ? `390 € ${priceSuffix}` : `39 € ${priceSuffix}`);

  const planTitle = selectedPlan === 'starter' 
    ? t('plan_essential_title', 'Formule ESSENTIEL') 
    : t('plan_pro_title', 'Formule PRO & Fidélité');

  const handleOnlineCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!businessName.trim()) {
      setErrorMessage(t('err_business_name_required', "Veuillez renseigner le nom de votre établissement."));
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage(t('err_valid_email_required', "Veuillez renseigner une adresse email valide."));
      return;
    }
    if (password.length < 6) {
      setErrorMessage(t('err_password_min', "Le mot de passe doit comporter au moins 6 caractères."));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          email: email.trim(),
          password: password,
          plan: selectedPlan,
          billing: billingPeriod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || t('err_stripe_redirect', "Une erreur est survenue lors de la redirection vers Stripe."));
      }

      // Redirection vers Stripe Checkout sécurisé
      window.location.href = data.url;
    } catch (err: any) {
      setErrorMessage(err.message || t('err_payment_server', "Erreur de connexion avec le serveur de paiement."));
      setLoading(false);
    }
  };

  const periodText = billingPeriod === 'yearly'
    ? (language === 'ar' ? 'السنوية' : (language === 'en' ? 'Annual' : 'Annuelle'))
    : (language === 'ar' ? 'الشهرية' : (language === 'en' ? 'Monthly' : 'Mensuelle'));

  const waRaw = t('reg_wa_template', 'Bonjour Menufid, je souhaite souscrire à la formule {plan} ({period}) pour mon restaurant "{business}", mais je n\'ai pas de carte Visa pour payer en ligne. Comment puis-je procéder ?')
    .replace('{plan}', selectedPlan.toUpperCase())
    .replace('{period}', periodText)
    .replace('{business}', businessName.trim() || (language === 'ar' ? 'مطعمي' : (language === 'en' ? 'my restaurant' : 'mon établissement')));

  const whatsappMessage = encodeURIComponent(waRaw);

  return (
    <div dir={dir} className="min-h-screen bg-[#FAFAFA] text-black flex flex-col font-sans selection:bg-[#FFB800] selection:text-black">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl">
          
          {/* Header */}
          <div className="text-center mb-6">
            <span className="neo-badge-yellow mb-2 inline-flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('activation_instant', 'Activation Rapide')}</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black mt-2 mb-2">
              {t('reg_title', 'Rejoignez Menufid Pro')}
            </h1>
            <p className="text-neutral-600 text-xs sm:text-sm font-bold">
              {t('reg_subtitle', 'Choisissez votre méthode de règlement pour activer votre établissement.')}
            </p>
          </div>

          {/* Bannière d'annulation si retour de Stripe sans paiement */}
          {isCanceled && (
            <div className="mb-6 p-4 bg-amber-50 border-3 border-black rounded-2xl flex items-start gap-3 shadow-[4px_4px_0px_0px_#000]">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs font-bold text-neutral-800">
                <span className="font-black text-black block mb-0.5">
                  {t('reg_canceled_title', 'Paiement non finalisé')}
                </span>
                {t('reg_canceled_desc', "Aucun montant n'a été débité et votre compte n'a pas été créé. Vous pouvez reprendre à tout moment ci-dessous.")}
              </div>
            </div>
          )}

          {/* SÉLECTEUR DE MODE : CB EN LIGNE VS NO VISA / CONTACT */}
          <div className="grid grid-cols-2 gap-3 mb-6 p-1.5 bg-white border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000]">
            <button
              type="button"
              onClick={() => setPaymentMode('online')}
              className={`py-3 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                paymentMode === 'online'
                  ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000]'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{t('reg_mode_online', 'Paiement en Ligne')}</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMode('offline')}
              className={`py-3 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                paymentMode === 'offline'
                  ? 'bg-[#FFB800] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t('reg_mode_offline', 'Pas de Carte Visa')}</span>
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* OPTION A : PAIEMENT EN LIGNE STRIPE (2 SECTIONS)                    */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {paymentMode === 'online' && (
            <div className="neo-box p-6 sm:p-8 space-y-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] rounded-3xl">
              
              {/* Récapitulatif Plan Sélectionné */}
              <div className="flex items-center justify-between p-4 bg-[#FFF9E6] border-2 border-black rounded-2xl">
                <div>
                  <span className="text-[10px] font-black uppercase text-neutral-500 block">
                    {t('reg_chosen_plan', 'Formule choisie')}
                  </span>
                  <h3 className="font-black text-sm sm:text-base text-black">{planTitle}</h3>
                  <p className="text-xs font-bold text-neutral-600">
                    {billingPeriod === 'yearly' 
                      ? t('reg_billing_yearly', 'Facturation Annuelle (2 mois offerts)') 
                      : t('reg_billing_monthly', 'Facturation Mensuelle')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-[#00F59B] text-black font-black px-2 py-0.5 rounded-full border border-black inline-block mb-1">
                    {t('pricing_3_months_free', '🎁 3 MOIS OFFERTS')}
                  </span>
                  <div className="text-lg sm:text-xl font-black text-black">
                    0 € <span className="text-xs font-bold text-neutral-500">{language === 'ar' ? 'اليوم' : (language === 'en' ? 'today' : 'aujourd\'hui')}</span>
                  </div>
                  <p className="text-[11px] font-bold text-neutral-600">
                    {language === 'ar' ? 'ثم' : (language === 'en' ? 'then' : 'puis')} {planPrice}
                  </p>
                  <Link href="/pricing" className="block text-[10px] font-black text-[#B45309] hover:underline mt-0.5">
                    {t('reg_change_plan', "Changer d'offre")}
                  </Link>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-red-50 border-2 border-red-500 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleOnlineCheckout} className="space-y-5">
                
                {/* ── SECTION 1 : INFORMATIONS DU RESTAURANT & COMPTE ── */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b-2 border-black">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-black flex items-center justify-center">
                      1
                    </span>
                    <h4 className="font-black text-sm uppercase text-black">
                      {t('reg_sec1_title', 'Informations de votre Restaurant')}
                    </h4>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-700 mb-1.5 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{t('reg_label_business_name', "Nom de l'établissement *")}</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t('reg_ph_business_name', 'Ex: Le Bistrot Parisien, Café de la Paix...')}
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 border-2 border-black rounded-xl text-xs sm:text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-700 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{t('reg_label_email', 'Email professionnel *')}</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder={t('reg_ph_email', 'contact@votre-restaurant.com')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 border-2 border-black rounded-xl text-xs sm:text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-700 mb-1.5 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{t('reg_label_password', 'Mot de passe du compte *')}</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder={t('reg_ph_password', 'Au moins 6 caractères')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 border-2 border-black rounded-xl text-xs sm:text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFB800]"
                    />
                  </div>
                </div>

                {/* ── SECTION 2 : VALIDATION DU PAIEMENT STRIPE ── */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 pb-2 border-b-2 border-black">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-black flex items-center justify-center">
                      2
                    </span>
                    <h4 className="font-black text-sm uppercase text-black">
                      {t('reg_sec2_title', 'Validation Sécurisée du Paiement')}
                    </h4>
                  </div>

                  <div className="p-3.5 bg-emerald-50 border-2 border-emerald-500 rounded-xl space-y-1.5 text-xs font-bold text-emerald-950">
                    <div className="flex items-center gap-2 text-black font-black">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('reg_sec2_encrypted', 'Validation sécurisée 0 € gérée par Stripe')}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      🎁 <strong>{t('reg_sec2_rule_title', '3 Mois 100% Offerts :')}</strong> {t('reg_sec2_rule_desc', "Votre carte est validée par Stripe mais 0,00 € sont débités aujourd'hui. Votre premier prélèvement aura lieu uniquement dans 3 mois.")}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full neo-pill-btn bg-black hover:bg-neutral-800 text-white text-sm py-4 flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000] cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t('reg_btn_loading', 'Préparation du paiement sécurisé...')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('reg_btn_pay_on_stripe', 'Activer mes 3 Mois Offerts sur Stripe (0 €)')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="pt-4 border-t-2 border-black text-center">
                <p className="text-xs font-bold text-neutral-500 mb-1">
                  {t('reg_already_client', 'Déjà client ou compte existant ?')}
                </p>
                <Link href="/pro/login" className="text-black font-black text-xs hover:underline inline-flex items-center gap-1">
                  {t('reg_login_link', "Se connecter à l'espace Pro")} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* OPTION B : PAS DE VISA / NOUS CONTACTER (ESPÈCES / DISTRIBUTEUR)    */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {paymentMode === 'offline' && (
            <div className="neo-box p-6 sm:p-8 space-y-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] rounded-3xl relative">
              <div className="absolute -top-3 -right-3 bg-[#FFB800] text-black text-[10px] font-black px-3 py-1 rounded-full border-2 border-black transform rotate-6">
                {t('reg_offline_badge', 'Support Local 7j/7')}
              </div>

              <div className="text-center space-y-2 border-b-2 border-black pb-4">
                <h3 className="font-black text-lg text-black">
                  {t('reg_offline_title', 'Pas de Carte Bancaire Internationale ?')}
                </h3>
                <p className="text-xs font-bold text-neutral-600">
                  {t('reg_offline_desc', 'Pas de problème ! Nous acceptons les règlements par virement bancaire, espèces ou via nos partenaires distributeurs locaux.')}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <a 
                  href={`https://wa.me/33766518278?text=${whatsappMessage}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full neo-pill-btn text-xs sm:text-sm py-4 justify-center bg-[#25D366] hover:bg-green-600 border-2 border-black text-white gap-2 flex items-center shadow-[3px_3px_0px_0px_#000]"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{t('reg_offline_wa', 'Contacter sur WhatsApp (+33 7 66 51 82 78)')}</span>
                </a>

                <a 
                  href="https://www.instagram.com/menu.fid?igsi=ZDNlZDc0MzIxNw==" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full neo-pill-btn text-xs sm:text-sm py-4 justify-center bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 border-2 border-black text-white gap-2 flex items-center shadow-[3px_3px_0px_0px_#000]"
                >
                  <Camera className="w-5 h-5" />
                  <span>{t('reg_offline_insta', 'Message privé Instagram (@menu.fid)')}</span>
                </a>

                <a 
                  href={`mailto:contact@menufid.site?subject=Souscription ${selectedPlan.toUpperCase()}`} 
                  className="w-full neo-pill-btn-white text-xs sm:text-sm py-4 justify-center gap-2 flex items-center"
                >
                  <Mail className="w-5 h-5" />
                  <span>{t('reg_offline_email', 'Par Email : contact@menufid.site')}</span>
                </a>
              </div>

              <div className="p-4 bg-amber-50 border-2 border-black rounded-2xl flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-neutral-700 leading-relaxed">
                  {t('reg_offline_reassurance', 'Notre équipe ou votre distributeur local configurera votre compte et vous remettra vos accès en moins de 24h.')}
                </p>
              </div>

              <div className="pt-2 text-center">
                <p className="text-xs font-bold text-neutral-500 mb-1">
                  {t('reg_already_client', 'Déjà client ?')}
                </p>
                <Link href="/pro/login" className="text-black font-black text-xs hover:underline inline-flex items-center gap-1">
                  {t('reg_login_link', "Se connecter à l'espace Pro")} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAFA]" />}>
      <RegisterContent />
    </Suspense>
  );
}
