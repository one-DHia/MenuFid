'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { compressImage } from '@/lib/imageCompression';
import { uploadMerchantMedia } from '@/lib/storageHelper';
import { Modal } from '@/components/ui/Modal';
import { 
  Store, 
  ArrowLeft, 
  Camera, 
  Mail, 
  Lock, 
  MapPin, 
  Globe, 
  Save, 
  ExternalLink, 
  KeyRound, 
  Building, 
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Loader2,
  LifeBuoy,
  Send,
  CreditCard,
  Calendar,
  AlertTriangle,
  Trash2,
  Download,
  RefreshCw,
  Clock,
  ShoppingBag,
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/InstagramIcon';
import ProBottomNav from '@/components/ProBottomNav';

export default function ProProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();
  const { merchant, isLoading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !merchant) {
      router.replace('/pro/login');
    }
  }, [mounted, isLoading, merchant, router]);

  // Établissement
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Horaires de Commande & Panier Minimum
  const [minOrderAmount, setMinOrderAmount] = useState<number>(0);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [orderOpeningTime, setOrderOpeningTime] = useState<string>('11:30');
  const [orderClosingTime, setOrderClosingTime] = useState<string>('23:00');
  const [ordersPaused, setOrdersPaused] = useState<boolean>(false);
  const [deliveryPaymentMode, setDeliveryPaymentMode] = useState<'both' | 'cash_on_delivery' | 'online_only'>('both');
  const [stripeConnectAccountId, setStripeConnectAccountId] = useState<string>('');
  const [savingDeliverySettings, setSavingDeliverySettings] = useState<boolean>(false);

  // Sécurité
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // États de chargement
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingLinks, setSavingLinks] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [sendingResetEmail, setSendingResetEmail] = useState(false);

  // Abonnement & Facturation
  const [planStatus, setPlanStatus] = useState<'active' | 'trialing' | 'past_due' | 'canceled'>('active');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [cancelingSub, setCancelingSub] = useState(false);
  const [reactivatingSub, setReactivatingSub] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Suppression & Export
  const [exportingData, setExportingData] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const logoInputRef = useRef<HTMLInputElement>(null);

  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    const emailTo = 'support@menufid.site';
    const subject = encodeURIComponent(`[MenuFid Pro] ${supportSubject || 'Demande d\'assistance'} - ${businessName || merchant?.business_name || ''}`);
    const body = encodeURIComponent(
      `Bonjour l'équipe support MenuFid,\n\n` +
      `${supportMessage}\n\n` +
      `---\n` +
      `Restaurant : ${businessName || merchant?.business_name || 'N/A'}\n` +
      `Merchant ID : ${merchant?.id || 'N/A'}\n` +
      `Email Pro : ${currentEmail || 'N/A'}\n` +
      `Ville / Pays : ${city || merchant?.city || ''} ${country || merchant?.country || ''}\n`
    );

    window.open(`mailto:${emailTo}?subject=${subject}&body=${body}`, '_blank');
    showToast(t('support_message_sent', 'Votre messagerie va s\'ouvrir pour envoyer le message à support@menufid.site !'), 'success');
    setSupportSubject('');
    setSupportMessage('');
  };

  useEffect(() => {
    if (merchant) {
      setBusinessName(merchant.business_name || '');
      setCity(merchant.city || '');
      setCountry(merchant.country || '');
      setGoogleMapsUrl(merchant.google_maps_url || '');
      setInstagramUrl(merchant.instagram_url || '');
      setLogoUrl(merchant.logo_url || null);
      if (merchant.plan_status) setPlanStatus(merchant.plan_status);
      if (merchant.subscription_expires_at) setExpiresAt(merchant.subscription_expires_at);
      if (merchant.min_order_amount !== undefined) setMinOrderAmount(merchant.min_order_amount || 0);
      if (merchant.delivery_fee !== undefined) setDeliveryFee(merchant.delivery_fee || 0);
      if (merchant.orders_paused !== undefined) setOrdersPaused(!!merchant.orders_paused);
      if (merchant.delivery_payment_mode) setDeliveryPaymentMode(merchant.delivery_payment_mode as any);
      if (merchant.stripe_connect_account_id) setStripeConnectAccountId(merchant.stripe_connect_account_id);
      if (merchant.delivery_hours) {
        try {
          const parsed = typeof merchant.delivery_hours === 'string' ? JSON.parse(merchant.delivery_hours) : merchant.delivery_hours;
          if (parsed?.open) setOrderOpeningTime(parsed.open);
          if (parsed?.close) setOrderClosingTime(parsed.close);
        } catch {
          // ignore
        }
      }
    }

    async function fetchAuthUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email) {
        setCurrentEmail(data.user.email);
      }
    }
    fetchAuthUser();
  }, [merchant]);

  // Gestion de l'abonnement Stripe (Résiliation à l'échéance ou réactivation)
  async function handleCancelSubscription(action: 'cancel_at_period_end' | 'reactivate') {
    if (!merchant?.id) return;
    try {
      if (action === 'reactivate') {
        setReactivatingSub(true);
      } else {
        setCancelingSub(true);
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Session expirée.');

      const res = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          merchantId: merchant.id,
          action,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la modification.');

      setPlanStatus(data.status);
      if (data.expiresAt) {
        setExpiresAt(data.expiresAt);
      }
      merchant.plan_status = data.status;

      showToast(
        action === 'reactivate'
          ? t('subscription_reactivated_success', 'Votre abonnement a été réactivé avec succès !')
          : t('subscription_canceled_success', 'Le renouvellement automatique a été interrompu.'),
        'success'
      );
      setShowCancelModal(false);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erreur lors de la modification.', 'error');
    } finally {
      setCancelingSub(false);
      setReactivatingSub(false);
    }
  }

  // Ouverture du portail client Stripe pour gestion CB et factures
  async function handleOpenStripePortal() {
    if (!merchant?.id) return;
    try {
      setLoadingPortal(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Session expirée.');

      const res = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ merchantId: merchant.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Impossible d\'ouvrir le portail.');

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erreur lors de l\'ouverture du portail de facturation.', 'error');
    } finally {
      setLoadingPortal(false);
    }
  }

  // Export complet des données du restaurant en JSON
  async function handleExportData() {
    if (!merchant?.id) return;
    try {
      setExportingData(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Session expirée.');

      const res = await fetch('/api/account/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ merchantId: merchant.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'exportation.');

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `menufid-${merchant.slug || 'export'}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(t('export_data_success', 'Vos données ont été exportées avec succès !'), 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erreur lors du téléchargement des données.', 'error');
    } finally {
      setExportingData(false);
    }
  }

  // Suppression irréversible du compte marchand et arrêt Stripe
  async function handleDeleteAccount() {
    if (!merchant?.id) return;
    const targetName = (businessName || merchant.business_name || '').trim().toLowerCase();
    const inputVal = deleteConfirmText.trim().toLowerCase();

    if (inputVal !== targetName && inputVal !== 'supprimer') {
      showToast('Veuillez saisir exactement le nom du restaurant ou SUPPRIMER.', 'error');
      return;
    }

    try {
      setDeletingAccount(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Session expirée.');

      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ merchantId: merchant.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la suppression.');

      if (typeof window !== 'undefined') {
        localStorage.removeItem('menufid_merchant_profile');
        localStorage.removeItem('menufid_merchant_id');
        localStorage.removeItem('menufid_merchant_name');
        localStorage.removeItem('menufid_merchant_slug');
        localStorage.removeItem('menufid_plan_tier');
        localStorage.removeItem('menufid_merchant_currency');
        document.cookie = 'menufid_merchant_id=; path=/; max-age=0;';
      }

      await supabase.auth.signOut();
      setShowDeleteModal(false);
      showToast(t('delete_account_success', 'Votre compte et vos données ont été définitivement supprimés.'), 'success');
      router.push('/pro/deleted');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erreur lors de la suppression du compte.', 'error');
    } finally {
      setDeletingAccount(false);
    }
  }

  // Sauvegarde des Horaires de Commande & Panier Minimum
  async function handleSaveDeliverySettings(e: React.FormEvent) {
    e.preventDefault();
    if (!merchant?.id) return;
    try {
      setSavingDeliverySettings(true);
      const deliveryHoursJson = JSON.stringify({
        open: orderOpeningTime,
        close: orderClosingTime,
      });

      const { error } = await supabase
        .from('merchants')
        .update({
          min_order_amount: Number(minOrderAmount) || 0,
          delivery_fee: Number(deliveryFee) || 0,
          delivery_hours: deliveryHoursJson,
          orders_paused: ordersPaused,
          delivery_payment_mode: deliveryPaymentMode,
          stripe_connect_account_id: stripeConnectAccountId.trim() || null,
        })
        .eq('id', merchant.id);

      if (error) throw error;

      merchant.min_order_amount = Number(minOrderAmount) || 0;
      merchant.delivery_fee = Number(deliveryFee) || 0;
      merchant.delivery_hours = deliveryHoursJson;
      merchant.orders_paused = ordersPaused;
      merchant.delivery_payment_mode = deliveryPaymentMode;
      merchant.stripe_connect_account_id = stripeConnectAccountId.trim() || null;

      showToast(t('update_merchant_success', 'Paramètres de l\'établissement mis à jour avec succès !'), 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erreur lors de l\'enregistrement.', 'error');
    } finally {
      setSavingDeliverySettings(false);
    }
  }

  // 1. Mise à jour du logo avec compression WebP
  async function handleLogoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !merchant?.id) return;

    try {
      setUploadingLogo(true);
      const compressed = await compressImage(file, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.85,
        outputFormat: 'image/webp'
      });

      const publicUrl = await uploadMerchantMedia({
        file: compressed.file,
        folder: 'logos',
        merchantId: merchant.id,
        oldUrl: logoUrl
      });

      const { error } = await supabase
        .from('merchants')
        .update({ logo_url: publicUrl })
        .eq('id', merchant.id);

      if (error) throw error;

      setLogoUrl(publicUrl);
      merchant.logo_url = publicUrl;
      showToast(t('logo_updated_success', 'Logo du restaurant mis à jour avec succès !'), 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Erreur lors de la mise à jour du logo", 'error');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  }

  // 2. Sauvegarde des informations générales (Nom, Ville, Pays)
  async function handleSaveGeneral(e: React.FormEvent) {
    e.preventDefault();
    if (!merchant?.id) return;

    try {
      setSavingGeneral(true);
      const { error } = await supabase
        .from('merchants')
        .update({
          business_name: businessName.trim(),
          city: city.trim() || null,
          country: country.trim() || null
        })
        .eq('id', merchant.id);

      if (error) throw error;

      merchant.business_name = businessName.trim();
      merchant.city = city.trim() || null;
      merchant.country = country.trim() || null;
      showToast(t('profile_updated_success', 'Profil mis à jour avec succès !'), 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Erreur lors de la sauvegarde", 'error');
    } finally {
      setSavingGeneral(false);
    }
  }

  // 3. Sauvegarde des liens (Google Maps, Instagram)
  async function handleSaveLinks(e: React.FormEvent) {
    e.preventDefault();
    if (!merchant?.id) return;

    try {
      setSavingLinks(true);
      const { error } = await supabase
        .from('merchants')
        .update({
          google_maps_url: googleMapsUrl.trim() || null,
          instagram_url: instagramUrl.trim() || null
        })
        .eq('id', merchant.id);

      if (error) throw error;

      merchant.google_maps_url = googleMapsUrl.trim() || null;
      merchant.instagram_url = instagramUrl.trim() || null;
      showToast(t('profile_updated_success', 'Informations enregistrées !'), 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Erreur lors de la sauvegarde", 'error');
    } finally {
      setSavingLinks(false);
    }
  }

  // 4. Changement d'email avec confirmation Supabase
  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      setUpdatingEmail(true);
      const { data, error } = await supabase.auth.updateUser({
        email: newEmail.trim()
      });

      if (error) throw error;

      showToast(
        t('email_confirmation_sent', 'Un email de confirmation a été envoyé à votre nouvelle adresse. Veuillez cliquer sur le lien reçu pour valider le changement.'),
        'success'
      );
      setNewEmail('');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Erreur lors de la demande de changement d'email", 'error');
    } finally {
      setUpdatingEmail(false);
    }
  }

  // 5. Changement de mot de passe direct
  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast(t('password_min_chars', 'Le mot de passe doit contenir au moins 6 caractères.'), 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(t('passwords_dont_match', 'Les mots de passe ne correspondent pas.'), 'error');
      return;
    }

    try {
      setUpdatingPassword(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      showToast(t('password_updated_success', 'Mot de passe mis à jour avec succès !'), 'success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Erreur lors de la modification du mot de passe", 'error');
    } finally {
      setUpdatingPassword(false);
    }
  }

  // 5. Envoi d'un email de réinitialisation de mot de passe sécurisé via Resend
  async function handleSendResetEmail() {
    if (!currentEmail) {
      showToast(t('error_no_email', 'Adresse email introuvable'), 'error');
      return;
    }

    try {
      setSendingResetEmail(true);
      const res = await fetch('/api/auth/send-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentEmail.trim().toLowerCase() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');

      showToast(t('reset_email_sent_toast', 'Lien de réinitialisation envoyé avec succès !'), 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Erreur lors de l'envoi de l'email", 'error');
    } finally {
      setSendingResetEmail(false);
    }
  }

  if (!mounted || isLoading || !merchant) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Spinner size={36} className="text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black font-sans flex flex-col selection:bg-[#FFB800] selection:text-black">
      {/* Top Header */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/pro/dashboard"
              className="p-2 rounded-xl text-black hover:bg-[#FFB800] border-2 border-transparent hover:border-black transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-black text-lg text-black tracking-tight">{t('profile_title', 'Profil & Établissement')}</h1>
              <p className="text-[11px] font-bold text-neutral-500 line-clamp-1">{merchant?.business_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Link
              href={`/menu/${merchant?.slug || 'shop'}`}
              target="_blank"
              className="neo-pill-btn text-xs py-2 px-4 hidden sm:flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{t('view_live_menu', 'Voir le Menu')}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-28 sm:pb-16">
        
        {/* Page Banner */}
        <div className="neo-box-yellow p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border-2 border-black text-black text-xs font-black shadow-[2px_2px_0px_0px_#000]">
              <Store className="w-3.5 h-3.5" />
              <span>{t('my_establishment', 'Mon Établissement')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              {merchant?.business_name || t('profile_title', 'Profil & Établissement')}
            </h2>
            <p className="text-neutral-800 text-xs sm:text-sm font-bold">
              {t('profile_subtitle', 'Gérez les informations visibles par vos clients et vos accès de connexion.')}
            </p>
          </div>

          {/* Quick Avatar / Logo Upload */}
          <div className="flex flex-col items-center gap-2 self-center sm:self-auto shrink-0">
            <input
              type="file"
              accept="image/*"
              ref={logoInputRef}
              onChange={handleLogoSelected}
              className="hidden"
            />
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] overflow-hidden flex items-center justify-center">
                {logoUrl ? (
                  <img src={logoUrl} alt={businessName} className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-10 h-10 text-neutral-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="absolute -bottom-2 -right-2 bg-black text-white p-2 rounded-full border-2 border-white shadow-[2px_2px_0px_0px_#000] hover:bg-[#FFB800] hover:text-black transition"
                title={t('change_restaurant_logo', 'Modifier le logo')}
              >
                {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] font-black uppercase text-neutral-700">Logo Restaurant</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* SECTION 1: Informations Générales */}
          <div className="neo-box bg-white p-6 space-y-6">
            <div className="flex items-center gap-2 border-b-2 border-black pb-3">
              <Building className="w-5 h-5 text-black" />
              <h3 className="font-black text-base uppercase tracking-tight text-black">
                {t('general_info', 'Informations Générales')}
              </h3>
            </div>

            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  {t('restaurant_name', 'Nom du restaurant')} *
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={t('restaurant_name_placeholder', 'ex: Le Bistro Parisien')}
                  className="w-full neo-input text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    {t('city', 'Ville')}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Paris"
                    className="w-full neo-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    {t('country', 'Pays')}
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="France"
                    className="w-full neo-input text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingGeneral}
                className="w-full neo-pill-btn py-3 text-xs flex items-center justify-center gap-2 mt-2"
              >
                {savingGeneral ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{t('save_changes', 'Enregistrer les modifications')}</span>
              </button>
            </form>
          </div>

          {/* SECTION: Horaires & Paramètres de Commande (Panier Minimum & Livraison) */}
          <div className="neo-box bg-white p-6 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-black" />
                <h3 className="font-black text-base uppercase tracking-tight text-black">
                  {t('delivery_settings_title', 'Horaires & Paramètres de Commande')}
                </h3>
              </div>
              {ordersPaused && (
                <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded border border-black animate-pulse">
                  Pause Active
                </span>
              )}
            </div>

            <form onSubmit={handleSaveDeliverySettings} className="space-y-4">
              {/* Bouton d'urgence Rush / Pause */}
              <div className={`p-4 rounded-xl border-2 border-black flex items-center justify-between transition-all ${
                ordersPaused ? 'bg-red-50' : 'bg-emerald-50'
              }`}>
                <div>
                  <h4 className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                    {ordersPaused ? (
                      <>
                        <PauseCircle className="w-4 h-4 text-red-600" />
                        <span>Commandes en Pause (Coup de feu)</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-4 h-4 text-emerald-600" />
                        <span>Commandes Actives & Ouvertes</span>
                      </>
                    )}
                  </h4>
                  <p className="text-[11px] text-neutral-600 font-bold mt-0.5">
                    {ordersPaused 
                      ? 'Les clients sont avertis que la cuisine est temporairement surchargée.' 
                      : 'Les clients peuvent passer commande selon vos horaires d\'ouverture.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOrdersPaused(!ordersPaused)}
                  className={`px-3 py-2 rounded-xl border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000] transition ${
                    ordersPaused 
                      ? 'bg-[#00F59B] text-black hover:bg-emerald-400' 
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {ordersPaused ? t('resume_orders', 'Reprendre') : t('pause_orders', 'Mettre en Pause')}
                </button>
              </div>

              {/* Plages Horaires */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    {t('order_opening_time', 'Ouverture commandes')}
                  </label>
                  <input
                    type="time"
                    value={orderOpeningTime}
                    onChange={(e) => setOrderOpeningTime(e.target.value)}
                    className="w-full neo-input text-xs font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    {t('order_closing_time', 'Fermeture commandes')}
                  </label>
                  <input
                    type="time"
                    value={orderClosingTime}
                    onChange={(e) => setOrderClosingTime(e.target.value)}
                    className="w-full neo-input text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* Panier Minimum & Frais de livraison */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    {t('min_order_amount', 'Panier Minimum')} ({merchant?.currency || 'EUR'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    placeholder="ex: 15"
                    className="w-full neo-input text-xs font-bold"
                  />
                  <p className="text-[10px] text-neutral-500 font-bold mt-1">
                    {t('min_order_help', 'Montant minimum requis pour valider une commande.')}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    {t('delivery_fee', 'Frais de Livraison')} ({merchant?.currency || 'EUR'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                    placeholder="ex: 2.50"
                    className="w-full neo-input text-xs font-bold"
                  />
                  <p className="text-[10px] text-neutral-500 font-bold mt-1">
                    {t('delivery_fee_help', 'Ajoutés automatiquement aux livraisons.')}
                  </p>
                </div>
              </div>

              {/* Mode d'encaissement accepté & Coordonnées Stripe */}
              <div className="p-4 rounded-2xl bg-neutral-50 border-2 border-black space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    Mode d’encaissement accepté pour les livraisons
                  </label>
                  <select
                    value={deliveryPaymentMode}
                    onChange={(e) => setDeliveryPaymentMode(e.target.value as any)}
                    className="w-full neo-input text-xs font-bold bg-white"
                  >
                    <option value="both">💳 Carte Bancaire (Stripe) + 💵 Espèces à la livraison (Recommandé)</option>
                    <option value="cash_on_delivery">💵 Espèces à la livraison uniquement (0% commission)</option>
                    <option value="online_only">💳 Carte Bancaire en ligne uniquement (Stripe Connect)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black uppercase text-black">
                      Coordonnées Bancaires / Compte Stripe Connect (Paiements Directs)
                    </label>
                    {stripeConnectAccountId ? (
                      <span className="text-[10px] bg-[#00F59B] text-black font-black px-2 py-0.5 rounded-full border border-black">
                        ✓ Stripe Connect Connecté
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-black px-2 py-0.5 rounded-full border border-amber-300">
                        À configurer
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={stripeConnectAccountId}
                    onChange={(e) => setStripeConnectAccountId(e.target.value)}
                    placeholder="Ex: acct_1NxXXXXXXXXXXXXX ou votre IBAN pro"
                    className="w-full neo-input text-xs font-mono font-bold bg-white"
                  />
                  <p className="text-[10px] text-neutral-500 font-bold mt-1">
                    Renseignez votre identifiant Stripe Connect ou vos coordonnées bancaires pour recevoir les paiements par carte de vos clients directement sur votre compte.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingDeliverySettings}
                className="w-full neo-pill-btn py-3 text-xs flex items-center justify-center gap-2 mt-2"
              >
                {savingDeliverySettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{t('save_changes', 'Enregistrer les modifications')}</span>
              </button>
            </form>
          </div>

          {/* SECTION 2: Localisation & Réseaux */}
          <div className="neo-box bg-white p-6 space-y-6">
            <div className="flex items-center gap-2 border-b-2 border-black pb-3">
              <MapPin className="w-5 h-5 text-black" />
              <h3 className="font-black text-base uppercase tracking-tight text-black">
                {t('social_and_location', 'Localisation & Réseaux Sociaux')}
              </h3>
            </div>

            <form onSubmit={handleSaveLinks} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-black uppercase text-black">
                    {t('google_maps_url', 'Lien Google Maps (Itinéraire)')}
                  </label>
                  {googleMapsUrl && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-black text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>{t('test_link', 'Tester')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-red-500 absolute left-3 top-3.5" />
                  <input
                    type="url"
                    value={googleMapsUrl}
                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    placeholder={t('google_maps_placeholder', 'https://maps.app.goo.gl/...')}
                    className="w-full neo-input text-xs pl-9"
                  />
                </div>
                <p className="text-[10px] font-bold text-neutral-500 mt-1">
                  {t('google_maps_hint', 'Les clients pourront cliquer sur la position dans votre menu pour lancer l\'itinéraire GPS.')}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-black uppercase text-black">
                    {t('instagram_url', 'Lien ou Compte Instagram')}
                  </label>
                  {instagramUrl && (
                    <a
                      href={instagramUrl.startsWith('http') ? instagramUrl : `https://instagram.com/${instagramUrl.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-black text-pink-600 hover:underline flex items-center gap-1"
                    >
                      <span>{t('test_link', 'Tester')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="relative">
                  <InstagramIcon className="w-4 h-4 text-pink-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder={t('instagram_placeholder', 'https://instagram.com/... ou @monresto')}
                    className="w-full neo-input text-xs pl-9"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingLinks}
                className="w-full neo-pill-btn py-3 text-xs flex items-center justify-center gap-2 mt-2"
              >
                {savingLinks ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{t('save_changes', 'Enregistrer les modifications')}</span>
              </button>
            </form>
          </div>

          {/* SECTION 3: Email de Connexion (Sécurisé & Verrouillé) */}
          <div className="neo-box bg-white p-6 space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-3">
              <Mail className="w-5 h-5 text-black" />
              <h3 className="font-black text-base uppercase tracking-tight text-black">
                {t('current_email', 'Identifiant & Email Pro')}
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1">
                  {t('current_email_label', 'Email de connexion')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={currentEmail || ''}
                    disabled
                    className="w-full neo-input text-xs pl-10 bg-neutral-100 font-mono font-bold opacity-80 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border-2 border-black text-[11px] text-neutral-600 font-bold flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>{t('email_locked_notice', 'Pour des raisons de sécurité et de protection contre le vol de compte, l\'email de votre restaurant est verrouillé. Contactez le support pour le modifier.')}</p>
              </div>
            </div>
          </div>

          {/* SECTION 4: Sécurité & Mot de Passe (Par Email Sécurisé) */}
          <div className="neo-box bg-white p-6 space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-3">
              <Lock className="w-5 h-5 text-black" />
              <h3 className="font-black text-base uppercase tracking-tight text-black">
                {t('security_and_auth', 'Sécurité & Mot de Passe')}
              </h3>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-neutral-700 font-bold leading-relaxed">
                {t('password_email_security_desc', 'Pour protéger votre compte contre toute modification non autorisée sur vos terminaux, la mise à jour du mot de passe requiert obligatoirement une validation par email.')}
              </p>

              <div className="p-3.5 bg-neutral-50 rounded-xl border-2 border-black text-xs font-bold space-y-1">
                <div className="flex items-center gap-2 text-black font-black">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t('account_protection', 'Vérification par email')}</span>
                </div>
                <p className="text-[11px] text-neutral-600">
                  {t('reset_link_sent_to', 'Le lien de modification sera expédié à :')} <span className="font-mono font-black text-black">{currentEmail}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={handleSendResetEmail}
                disabled={sendingResetEmail}
                className="w-full neo-pill-btn py-3.5 text-xs flex items-center justify-center gap-2"
              >
                {sendingResetEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <Mail className="w-4 h-4 text-white" />
                    <span>{t('send_password_reset_email_btn', 'M\'envoyer le lien de modification par email')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* SECTION 5: Abonnement & Facturation */}
        <div className="neo-box bg-white p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#FFB800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                <CreditCard className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="font-black text-base uppercase tracking-tight text-black">
                  {t('billing_and_subscription', 'Abonnement & Facturation')}
                </h3>
                <p className="text-xs text-neutral-500 font-bold">
                  Gérez votre formule SaaS, vos cartes et votre renouvellement
                </p>
              </div>
            </div>

            {/* Statut Badge */}
            <div className="flex items-center gap-2">
              {planStatus === 'active' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border-2 border-emerald-800 text-emerald-900 text-xs font-black shadow-[2px_2px_0px_0px_#059669]">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  {t('subscription_active', 'ACTIF')}
                </span>
              )}
              {planStatus === 'canceled' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border-2 border-amber-800 text-amber-900 text-xs font-black shadow-[2px_2px_0px_0px_#d97706]">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  {t('subscription_canceling', 'RÉSILIATION PROGRAMMÉE')}
                </span>
              )}
              {planStatus === 'trialing' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 border-2 border-blue-800 text-blue-900 text-xs font-black shadow-[2px_2px_0px_0px_#2563eb]">
                  {t('subscription_trialing', 'PÉRIODE D\'ESSAI')}
                </span>
              )}
              {planStatus === 'past_due' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 border-2 border-red-800 text-red-900 text-xs font-black shadow-[2px_2px_0px_0px_#dc2626]">
                  {t('subscription_past_due', 'PAIEMENT EN ATTENTE')}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Formule */}
            <div className="p-4 rounded-xl border-2 border-black bg-neutral-50 shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] font-black uppercase text-neutral-500 block mb-1">
                {t('subscription_tier', 'Formule active')}
              </span>
              <div className="font-black text-sm text-black flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FFB800]" />
                <span>
                  {merchant?.plan_tier === 'basic' ? 'Starter (19€/m)' : merchant?.plan_tier === 'loyalty' ? 'Pro & Fidélité (39€/m)' : (merchant?.plan_tier || 'STARTER').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Échéance / Renouvellement */}
            <div className="p-4 rounded-xl border-2 border-black bg-neutral-50 shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] font-black uppercase text-neutral-500 block mb-1">
                {planStatus === 'canceled' ? t('subscription_expiry_date', 'Date d\'échéance') : t('subscription_renewal_date', 'Prochain renouvellement')}
              </span>
              <div className="font-black text-sm text-black flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-neutral-700" />
                <span>
                  {expiresAt ? new Date(expiresAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : 'Automatique'}
                </span>
              </div>
            </div>

            {/* Mode de règlement */}
            <div className="p-4 rounded-xl border-2 border-black bg-neutral-50 shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] font-black uppercase text-neutral-500 block mb-1">
                Règlement
              </span>
              <div className="font-black text-sm text-black flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-neutral-700" />
                <span className="truncate">
                  {merchant?.stripe_customer_id ? t('payment_method_stripe', 'Prélèvement CB (Stripe)') : t('payment_method_manual', 'Manuel / Distributeur')}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div>
              {merchant?.stripe_customer_id && (
                <button
                  type="button"
                  onClick={handleOpenStripePortal}
                  disabled={loadingPortal}
                  className="neo-pill-btn bg-white hover:bg-neutral-100 text-black text-xs py-3 px-5 flex items-center justify-center gap-2 border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                >
                  {loadingPortal ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  <span>{t('manage_billing_stripe', 'Gérer ma facturation (Cartes & Factures)')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div>
              {planStatus === 'canceled' ? (
                <button
                  type="button"
                  onClick={() => handleCancelSubscription('reactivate')}
                  disabled={reactivatingSub}
                  className="neo-pill-btn py-3 px-5 text-xs flex items-center justify-center gap-2"
                >
                  {reactivatingSub ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <RefreshCw className="w-4 h-4" />}
                  <span>{t('reactivate_subscription_btn', 'Réactiver mon abonnement')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="text-xs font-black text-neutral-600 hover:text-red-600 underline py-2 px-3 transition"
                >
                  {t('cancel_subscription_btn', 'Arrêter mon abonnement')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 6: Zone Dangereuse - Suppression de compte */}
        <div className="neo-box border-4 border-red-600 bg-red-50/40 p-6 sm:p-8 space-y-6 shadow-[6px_6px_0px_0px_#dc2626]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-red-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-600 border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#000]">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-100 border border-red-300 px-2 py-0.5 rounded-md">
                  {t('danger_zone', 'Zone Dangereuse')}
                </span>
                <h3 className="font-black text-lg uppercase tracking-tight text-red-700 mt-0.5">
                  {t('delete_account_title', 'Suppression Définitive du Compte')}
                </h3>
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-700 font-bold leading-relaxed max-w-2xl">
            {t('delete_account_desc', 'Cette action est irréversible. Toutes vos données seront définitivement effacées (catégories, plats, clients, cartes de fidélité) et tout prélèvement bancaire Stripe sera immédiatement résilié.')}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleExportData}
              disabled={exportingData}
              className="neo-pill-btn bg-white hover:bg-neutral-100 text-black text-xs py-3 px-5 flex items-center justify-center gap-2 border-2 border-black shadow-[2px_2px_0px_0px_#000]"
            >
              {exportingData ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{t('export_data_btn', 'Exporter mes données (JSON)')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDeleteConfirmText('');
                setShowDeleteModal(true);
              }}
              className="neo-pill-btn bg-red-600 hover:bg-red-700 text-white text-xs py-3 px-5 flex items-center justify-center gap-2 border-2 border-black shadow-[2px_2px_0px_0px_#000]"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('delete_account_btn', 'Supprimer définitivement mon compte')}</span>
            </button>
          </div>
        </div>

        {/* SECTION 7: Support Dédié */}
        <div className="neo-box-yellow p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
              <LifeBuoy className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="font-black text-lg uppercase tracking-tight text-black">
                {t('need_assistance_title', 'Besoin d\'Assistance Technique ou Commerciale ?')}
              </h3>
              <p className="text-xs text-neutral-900 font-bold mt-0.5">
                {t('visit_support_desc', 'Accédez au centre d\'aide, WhatsApp 7j/7, FAQ et contact direct.')}
              </p>
            </div>
          </div>

          <Link
            href="/pro/support"
            className="neo-pill-btn bg-white hover:bg-neutral-100 text-black text-xs py-3.5 px-6 flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
          >
            <span>{t('open_support_center', 'Ouvrir le Centre de Support')}</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

      </main>

      {/* Modal Arrêt Abonnement */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title={t('cancel_subscription_modal_title', 'Arrêter le renouvellement de l\'abonnement')}
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs font-bold text-neutral-700 leading-relaxed">
            {t('cancel_subscription_modal_desc', 'Votre abonnement ne sera pas renouvelé à la prochaine échéance. Vous conserverez l\'accès complet à tous vos services jusqu\'au')}{' '}
            <span className="font-black text-black">
              {expiresAt ? new Date(expiresAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : 'la fin de la période'}.
            </span>
          </p>
          <div className="p-3 bg-amber-50 border-2 border-amber-400 rounded-xl text-[11px] font-bold text-amber-900">
            💡 Vous ne serez plus jamais débité après cette date. Vos menus et fidélités restent actifs jusqu'à cette échéance, et vous pourrez réactiver votre formule à tout moment en un clic.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => setShowCancelModal(false)}
              className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-bold px-4 py-2.5 rounded-xl transition"
            >
              {t('keep_subscription_btn', 'Garder mon abonnement')}
            </button>
            <button
              type="button"
              onClick={() => handleCancelSubscription('cancel_at_period_end')}
              disabled={cancelingSub}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              {cancelingSub ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : null}
              <span>{t('cancel_subscription_confirm_btn', 'Confirmer l\'arrêt du renouvellement')}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Suppression Définitive Compte */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('delete_account_modal_title', 'Supprimer définitivement l\'établissement ?')}
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 bg-red-50 border-2 border-red-500 rounded-xl text-xs font-bold text-red-900 space-y-1">
            <p className="font-black">
              {t('delete_account_modal_warning', 'Attention : cette action est immédiate et irréversible.')}
            </p>
            <p className="text-[11px] text-red-700">
              Tous vos plats, catégories, QR codes de table, points de fidélité et comptes clients seront détruits. Tout prélèvement Stripe actif sera automatiquement résilié.
            </p>
          </div>

          <div>
            <label className="block text-xs font-black text-black mb-1">
              {t('delete_account_type_confirm', 'Veuillez saisir le nom de votre établissement ou "SUPPRIMER" pour confirmer :')}
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={businessName || 'SUPPRIMER'}
              className="w-full neo-input text-xs font-bold border-red-500 focus:border-red-700"
              autoFocus
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-bold px-4 py-2.5 rounded-xl transition"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={
                deletingAccount ||
                (deleteConfirmText.trim().toLowerCase() !== (businessName || merchant?.business_name || '').trim().toLowerCase() &&
                 deleteConfirmText.trim().toUpperCase() !== 'SUPPRIMER')
              }
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white text-xs font-black px-4 py-2.5 rounded-xl transition disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Trash2 className="w-4 h-4" />}
              <span>{t('delete_account_confirm_btn', 'Supprimer définitivement tout')}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Mobile Bottom Navigation */}
      <ProBottomNav />
    </div>
  );
}
