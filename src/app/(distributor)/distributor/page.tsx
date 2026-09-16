'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Plus, 
  Trash2, 
  Power, 
  PowerOff, 
  Store, 
  TrendingUp, 
  Users, 
  QrCode, 
  Key, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  LogOut, 
  ExternalLink, 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  MessageCircle, 
  Download, 
  FileSpreadsheet, 
  Eye,
  RefreshCcw
} from 'lucide-react';

export default function AdminDistributorPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();

  const [merchants, setMerchants] = useState<any[]>([]);
  const [distributorData, setDistributorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trialing' | 'suspended'>('all');
  
  const [distributorId, setDistributorId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newPlanTier, setNewPlanTier] = useState('basic');
  const [newPlanStatus, setNewPlanStatus] = useState('active');
  const [newCurrency, setNewCurrency] = useState<'EUR' | 'DZD'>('EUR');
  const [newLicenseType, setNewLicenseType] = useState<'recurring' | 'lifetime' | 'free'>('recurring');
  const [newDeliveryPaymentMode, setNewDeliveryPaymentMode] = useState<'cash_on_delivery' | 'online_only' | 'both'>('both');
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Success Created Modal (avec identifiants à copier/WhatsApp)
  const [createdMerchantResult, setCreatedMerchantResult] = useState<any>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Modal Reset Password
  const [resetModalMerchant, setResetModalMerchant] = useState<any>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  // Modal QR Code
  const [qrModalMerchant, setQrModalMerchant] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/distributor/login');
        return;
      }

      // Récupérer le profil distributeur
      const { data: dist, error } = await supabase
        .from('distributors')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error || !dist) {
        showToast(t('distributor_login_error_not_distributor', 'Accès réservé aux distributeurs agréés.'), 'error');
        await supabase.auth.signOut();
        router.push('/distributor/login');
        return;
      }

      setDistributorData(dist);
      setDistributorId(dist.id);
      await fetchMerchants(dist.id);
    } catch (e: any) {
      showToast(e.message || 'Erreur d\'authentification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMerchants = async (distId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/admin/merchants?distributorId=${distId}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMerchants(data.merchants || []);
      } else {
        showToast(data.error || 'Erreur lors du chargement des commerçants', 'error');
      }
    } catch (e: any) {
      console.error(e);
      showToast('Impossible de joindre le serveur', 'error');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distributorId) return;

    if (!newBusinessName.trim() || !newSlug.trim() || !newEmail.trim() || !newPassword.trim()) {
      showToast(t('fill_all_fields', 'Veuillez remplir tous les champs obligatoires.'), 'error');
      return;
    }

    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/admin/merchants', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({
          action: 'create',
          businessName: newBusinessName.trim(),
          slug: newSlug.trim().toLowerCase(),
          email: newEmail.trim().toLowerCase(),
          password: newPassword,
          planTier: newPlanTier,
          planStatus: newPlanStatus,
          currency: newCurrency,
          licenseType: newLicenseType,
          deliveryPaymentMode: newDeliveryPaymentMode,
          distributorId
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(t('merchant_created_success', 'Restaurant créé et activé avec succès !'), 'success');
        
        // Stocker le résultat pour la modale de partage
        setCreatedMerchantResult({
          business_name: newBusinessName,
          slug: newSlug.toLowerCase(),
          email: newEmail,
          password: newPassword,
          short_code: data.merchant?.short_code || 'REST-01'
        });

        // Reset formulaire
        setNewBusinessName('');
        setNewSlug('');
        setNewEmail('');
        setNewPassword('');
        setShowCreate(false);
        await fetchMerchants(distributorId);
      } else {
        showToast(data.error || t('error_creation', 'Erreur lors de la création du compte'), 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Erreur', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (id: string, updates: any) => {
    setUpdatingId(id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const res = await fetch('/api/admin/merchants', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ action: 'update', merchantId: id, distributorId, ...updates })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(t('update_success', 'Modifications enregistrées en direct !'), 'success');
        if (distributorId) await fetchMerchants(distributorId);
      } else {
        showToast(data.error || t('error_update', 'Erreur lors de la mise à jour'), 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Erreur', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const extendDemo = async (m: any, days: number) => {
    const currentEnd = m.demo_end ? new Date(m.demo_end) : new Date();
    const newEnd = new Date(Math.max(currentEnd.getTime(), Date.now()) + days * 24 * 60 * 60 * 1000);
    await handleUpdate(m.id, { 
      planStatus: 'trialing', 
      isSuspended: false,
      demoEnd: newEnd.toISOString() 
    });
    showToast(`Démo prolongée de +${days} jours pour ${m.business_name} !`, 'success');
  };

  const handleDelete = async (m: any) => {
    const confirmed = window.confirm(
      `${t('confirm_delete_restaurant', 'Êtes-vous sûr de vouloir supprimer définitivement le restaurant')} "${m.business_name}" ?`
    );
    if (!confirmed) return;
    
    setUpdatingId(m.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/admin/merchants', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ action: 'delete', merchantId: m.id, distributorId })
      });

      if (res.ok) {
        showToast(t('merchant_deleted_success', 'Restaurant supprimé.'), 'success');
        if (distributorId) await fetchMerchants(distributorId);
      } else {
        const err = await res.json();
        showToast(err.error || t('error_delete', 'Erreur lors de la suppression'), 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Erreur', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExecutePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalMerchant || !newResetPassword) return;

    if (newResetPassword.length < 8) {
      showToast(t('password_min_8', 'Le mot de passe doit contenir au moins 8 caractères.'), 'error');
      return;
    }

    setResettingPassword(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/admin/merchants', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({
          action: 'reset_password',
          merchantId: resetModalMerchant.id,
          distributorId,
          newPassword: newResetPassword
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(t('password_reset_success_msg', 'Nouveau mot de passe enregistré avec succès !'), 'success');
        setResetModalMerchant(null);
        setNewResetPassword('');
      } else {
        showToast(data.error || t('error_reset_pwd', 'Erreur lors de la réinitialisation'), 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Erreur', 'error');
    } finally {
      setResettingPassword(false);
    }
  };

  const getWhatsAppOnboardingMessage = (m: any) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.menufid.site';
    const text = 
      `👋 Bonjour *${m.business_name}*,\n\n` +
      `Bienvenue sur MenuFid ! Votre établissement a été configuré avec succès :\n\n` +
      `🍽️ *Menu Digital en direct :*\n${baseUrl}/menu/${m.slug}\n\n` +
      `📱 *Espace d'Administration SaaS :*\n${baseUrl}/pro/login\n` +
      `📧 *Email :* ${m.contact_email || m.email || 'Votre email'}\n` +
      `🔑 *Code Restaurant :* ${m.short_code || 'N/A'}\n\n` +
      `Vous pouvez scanner et tester votre menu dès maintenant ! Restez à disposition pour toute question.`;
    return encodeURIComponent(text);
  };

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${label} copié dans le presse-papiers !`, 'success');
    }
  };

  const exportCSV = () => {
    const headers = ['Nom', 'Slug', 'Code', 'Email', 'Abonnement', 'Statut', 'Suspendu', 'Scans'];
    const rows = merchants.map(m => [
      `"${m.business_name || ''}"`,
      `"${m.slug || ''}"`,
      `"${m.short_code || ''}"`,
      `"${m.contact_email || ''}"`,
      `"${m.plan_tier || ''}"`,
      `"${m.plan_status || ''}"`,
      m.is_suspended ? 'OUI' : 'NON',
      m.scan_count || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `menufid_merchants_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrage
  const filteredMerchants = merchants.filter((m) => {
    if (statusFilter === 'active' && (m.is_suspended || m.plan_status !== 'active')) return false;
    if (statusFilter === 'suspended' && !m.is_suspended) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      m.business_name?.toLowerCase().includes(q) ||
      m.slug?.toLowerCase().includes(q) ||
      m.contact_email?.toLowerCase().includes(q) ||
      m.short_code?.toLowerCase().includes(q)
    );
  });

  const activeCount = merchants.filter((m) => m.plan_status === 'active' && !m.is_suspended).length;
  const suspendedCount = merchants.filter((m) => m.is_suspended).length;
  const starterCount = merchants.filter((m) => m.plan_tier === 'basic' && !m.is_suspended).length;
  const proCount = merchants.filter((m) => (m.plan_tier === 'loyalty' || m.plan_tier === 'premium') && !m.is_suspended).length;
  const totalScans = merchants.reduce((acc, m) => acc + (m.scan_count || 0), 0);

  // Estimations financières basées sur Starter (19 €), Pro Mensuel (39 €), Pro Annuel (390 € / 12)
  const monthlyVolume = merchants.reduce((acc, m) => {
    if (m.is_suspended || m.plan_status !== 'active') return acc;
    if (m.plan_tier === 'premium') return acc + Math.round(390 / 12);
    if (m.plan_tier === 'loyalty') return acc + 39;
    return acc + 19; // basic (Starter)
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-4">
        <Spinner size={40} className="text-black" />
        <p className="text-xs font-black uppercase tracking-wider text-neutral-700">
          {t('loading_distributor', 'Chargement de votre console distributeur...')}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black font-sans selection:bg-[#FFB800] selection:text-black pb-16">
      
      {/* ── TOP NAVBAR DISTRIBUTEUR ── */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FFB800] border-2 border-black flex items-center justify-center text-black font-black text-lg shadow-[2px_2px_0px_0px_#000] shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-black text-base sm:text-xl tracking-tight uppercase truncate">
                  Menu<span className="bg-[#FFB800] px-1 rounded border border-black text-[11px] sm:text-xs font-black ml-0.5">Fid</span> <span className="hidden xs:inline">{t('distributor_uppercase', 'Distributeur')}</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-neutral-500 truncate max-w-[170px] sm:max-w-xs">
                {distributorData?.name || 'Partenaire Agréé'} • Code: <span className="font-mono font-black text-black">{distributorData?.code || 'REGIONAL'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageSelector />
            <button 
              onClick={handleLogout}
              className="neo-pill-btn-white text-red-600 hover:text-red-700 border-red-600 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs flex items-center gap-1 sm:gap-1.5 shadow-[2px_2px_0px_0px_#000]"
              title={t('logout_to_home', 'Déconnexion et retour au site')}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-black">{t('logout', 'Déconnexion')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-5 sm:pt-8 space-y-6 sm:space-y-8">
        
        {/* ── TOP HERO HEADER & CTA ── */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 sm:gap-6 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-black shadow-[6px_6px_0px_0px_#000] sm:shadow-[8px_8px_0px_0px_#000]">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#00F59B] text-black text-[11px] sm:text-xs font-black px-2.5 sm:px-3 py-1 rounded-full border-2 border-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
                🚀 {t('distributor_partner_console', 'Console Partenaire Régional')}
              </span>
              <span className="bg-neutral-100 text-black text-[11px] sm:text-xs font-black px-2.5 sm:px-3 py-1 rounded-full border border-black font-mono">
                {t('distributor_sector', 'Secteur')} : {distributorData?.city || 'Algérie'}
              </span>
            </div>
            <h1 className="text-xl sm:text-4xl font-black text-black tracking-tight uppercase">
              {t('distributor_console_title', 'Gestion de votre Portefeuille Restaurants')}
            </h1>
            <p className="text-neutral-600 text-xs sm:text-sm font-bold leading-relaxed">
              {t('distributor_console_subtitle', 'Créez des accès instantanés, activez les abonnements mensuels/annuels, prolongez les démos et partagez les QR codes en 1 clic sur WhatsApp.')}
            </p>
          </div>

          <div className="flex flex-row items-center gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0">
            <button 
              onClick={() => {
                setShowCreate(!showCreate);
                if (!newPassword) setNewPassword(generateRandomPassword());
              }}
              className="flex-1 sm:flex-none neo-pill-btn bg-[#FFB800] hover:bg-amber-400 text-black px-4 sm:px-6 py-3 sm:py-4 text-xs font-black flex items-center justify-center gap-1.5 sm:gap-2 shadow-[3px_3px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000]"
            >
              {showCreate ? <RefreshCcw className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{showCreate ? t('close', 'Fermer') : t('distributor_add_merchant', 'Ajouter un Restaurant')}</span>
            </button>

            <button
              onClick={exportCSV}
              className="neo-pill-btn-white px-3 sm:px-4 py-3 sm:py-4 text-xs font-black flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000]"
              title={t('distributor_export_csv', 'Export CSV')}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">{t('distributor_export_csv', 'Export CSV')}</span>
            </button>
          </div>
        </div>

        {/* ── KPI METRICS BAR ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          
          <div className="neo-box p-3.5 sm:p-5 bg-white space-y-1 sm:space-y-2 border-3 border-black">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-neutral-500">
              <span className="uppercase truncate">{t('distributor_total_merchants', 'Total Restaurants')}</span>
              <Store className="w-4 h-4 text-black shrink-0" />
            </div>
            <div className="text-2xl sm:text-4xl font-black text-black">{merchants.length}</div>
            <div className="text-[10px] sm:text-[11px] font-bold text-neutral-600 flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="text-emerald-600 font-black">{activeCount} {t('distributor_active_count', 'actifs')}</span> • 
              <span className="text-red-500 font-black">{suspendedCount} {t('distributor_suspended_count', 'suspendus')}</span>
            </div>
          </div>

          <div className="neo-box-yellow p-3.5 sm:p-5 space-y-1 sm:space-y-2 border-3 border-black">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-black text-black">
              <span className="uppercase truncate">{t('distributor_monthly_volume', 'Volume Mensuel')}</span>
              <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
            </div>
            <div className="text-xl sm:text-3xl font-black text-black truncate">{monthlyVolume.toLocaleString()} €</div>
            <div className="text-[10px] sm:text-[11px] font-black text-black truncate">
              {t('distributor_active_mrr', 'Restaurants actifs')}
            </div>
          </div>

          <div className="neo-box p-3.5 sm:p-5 bg-white space-y-1 sm:space-y-2 border-3 border-black">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-neutral-500">
              <span className="uppercase truncate">Offres</span>
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            </div>
            <div className="text-xl sm:text-3xl font-black text-black truncate">
              {proCount} <span className="text-xs text-neutral-500 font-black">Pro</span>
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-neutral-600 truncate">
              {starterCount} {t('distributor_starter_count', 'Starter')}
            </div>
          </div>

          <div className="neo-box p-3.5 sm:p-5 bg-white space-y-1 sm:space-y-2 border-3 border-black">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-neutral-500">
              <span className="uppercase truncate">{t('distributor_cumulated_scans', 'Total Scans QR')}</span>
              <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            <div className="text-2xl sm:text-4xl font-black text-black truncate">{totalScans.toLocaleString()}</div>
            <div className="text-[10px] sm:text-[11px] font-bold text-emerald-700 flex items-center gap-1 truncate">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" /> {t('distributor_scans_across_sector', 'Sur votre secteur')}
            </div>
          </div>

        </div>

        {/* ── FORMULAIRE NOUVEAU MARCHAND ── */}
        {showCreate && (
          <div className="neo-box p-6 sm:p-8 bg-white border-4 border-black shadow-[10px_10px_0px_0px_#000] animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#FFB800]" />
                  <span>{t('distributor_new_merchant_title', 'Nouveau Restaurant Partenaire')}</span>
                </h2>
                <p className="text-xs text-neutral-600 font-bold mt-0.5">
                  {t('distributor_new_merchant_subtitle', 'Générez un compte avec accès immédiat au menu digital et à la carte de fidélité.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-neutral-500 hover:text-black font-black text-xs uppercase underline"
              >
                {t('cancel', 'Annuler')}
              </button>
            </div>

            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  {t('distributor_business_name_label', 'Nom du Restaurant *')}
                </label>
                <input 
                  type="text" 
                  required 
                  value={newBusinessName} 
                  onChange={(e) => {
                    setNewBusinessName(e.target.value);
                    if (!newSlug) {
                      setNewSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]/g, '-'));
                    }
                  }} 
                  className="w-full neo-input text-xs font-bold" 
                  placeholder={t('distributor_business_name_placeholder', 'ex: Le Bosphore Lounge')} 
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  {t('distributor_slug_label', 'Identifiant URL (Slug unique) *')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-[11px] font-mono text-neutral-400">menufid.site/menu/</span>
                  <input 
                    type="text" 
                    required 
                    value={newSlug} 
                    onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))} 
                    className="w-full neo-input text-xs pl-36 font-mono font-bold" 
                    placeholder="le-bosphore" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  {t('distributor_email_label', 'Email de connexion du restaurateur *')}
                </label>
                <input 
                  type="email" 
                  required 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  className="w-full neo-input text-xs font-bold" 
                  placeholder="contact@lebosphore.dz" 
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-black uppercase text-black">
                    {t('distributor_password_label', 'Mot de passe initial *')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewPassword(generateRandomPassword())}
                    className="text-[10px] font-black text-blue-600 hover:underline uppercase"
                  >
                    🎲 {t('generate', 'Générer')}
                  </button>
                </div>
                <input 
                  type="text" 
                  required 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className="w-full neo-input text-xs font-mono font-bold" 
                  placeholder="ex: Resto2026!" 
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  {t('distributor_plan_tier_label', 'Formule d\'abonnement')}
                </label>
                <select
                  value={newPlanTier}
                  onChange={(e) => {
                    setNewPlanTier(e.target.value);
                    if (e.target.value === 'freemium') {
                      setNewLicenseType('free');
                    }
                  }}
                  className="w-full neo-input text-xs font-bold bg-white"
                >
                  <option value="freemium">{t('license_freemium', 'Freemium (0 € / 0 DA - Menu QR)')}</option>
                  <option value="basic">Starter (Menu Digital HD)</option>
                  <option value="loyalty">Pro (Carte Fidélité Wallet)</option>
                  <option value="delivery">Livraison & Commande Directe</option>
                  <option value="premium">Premium (Multi-points de vente)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  {t('distributor_license_type', 'Type de Licence')}
                </label>
                <select
                  value={newLicenseType}
                  onChange={(e) => setNewLicenseType(e.target.value as any)}
                  className="w-full neo-input text-xs font-bold bg-white"
                >
                  <option value="recurring">{t('license_recurring', 'Abonnement Mensuel')}</option>
                  <option value="lifetime">{t('license_lifetime', 'Licence à Vie (Paiement Unique)')}</option>
                  <option value="free">{t('license_freemium', 'Gratuit / Freemium')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  {t('distributor_currency', 'Devise de facturation')}
                </label>
                <select
                  value={newCurrency}
                  onChange={(e) => {
                    const c = e.target.value as 'EUR' | 'DZD';
                    setNewCurrency(c);
                    if (c === 'DZD') {
                      setNewDeliveryPaymentMode('cash_on_delivery');
                    }
                  }}
                  className="w-full neo-input text-xs font-bold bg-white"
                >
                  <option value="EUR">EUR (€) - Europe / International</option>
                  <option value="DZD">DZD (DA) - Algérie</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  {t('distributor_payment_mode', 'Mode d\'Encaissement Commandes')}
                </label>
                <select
                  value={newDeliveryPaymentMode}
                  onChange={(e) => setNewDeliveryPaymentMode(e.target.value as any)}
                  className="w-full neo-input text-xs font-bold bg-white"
                >
                  <option value="cash_on_delivery">{t('mode_cash_only', 'À la porte uniquement (Espèces / DA)')}</option>
                  <option value="online_only">{t('mode_online_only', 'En ligne uniquement (CB / Stripe EUR)')}</option>
                  <option value="both">{t('mode_hybrid', 'Hybride (Les deux au choix du client)')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  {t('distributor_plan_status_label', 'Statut initial')}
                </label>
                <select
                  value={newPlanStatus}
                  onChange={(e) => setNewPlanStatus(e.target.value)}
                  className="w-full neo-input text-xs font-bold bg-white"
                >
                  <option value="active">{t('distributor_status_active', '✅ Actif (Abonnement réglé)')}</option>
                  <option value="past_due">⚠️ Impayé (Abonnement suspendu)</option>
                </select>
              </div>

              <div className="md:col-span-2 pt-2">
                <button 
                  type="submit" 
                  disabled={creating} 
                  className="w-full neo-pill-btn bg-[#00F59B] hover:bg-emerald-400 text-black justify-center py-4 text-xs font-black shadow-[4px_4px_0px_0px_#000]"
                >
                  {creating ? <Spinner size={20} className="text-black" /> : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{t('distributor_submit_create', 'Créer le compte et activer l\'accès')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── FILTRES & RECHERCHE ── */}
        <div className="space-y-4">
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
            
            {/* Tabs de Filtre */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-black border-2 border-black transition shrink-0 whitespace-nowrap min-h-[38px] ${
                  statusFilter === 'all' 
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000]' 
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                {t('distributor_filter_all', 'Tous')} ({merchants.length})
              </button>

              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-black border-2 border-black transition flex items-center gap-1.5 shrink-0 whitespace-nowrap min-h-[38px] ${
                  statusFilter === 'active' 
                    ? 'bg-[#00F59B] text-black shadow-[2px_2px_0px_0px_#000]' 
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('distributor_filter_active', 'Actifs')} ({activeCount})</span>
              </button>

              <button
                onClick={() => setStatusFilter('suspended')}
                className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-black border-2 border-black transition flex items-center gap-1.5 shrink-0 whitespace-nowrap min-h-[38px] ${
                  statusFilter === 'suspended' 
                    ? 'bg-red-500 text-white shadow-[2px_2px_0px_0px_#000]' 
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                <PowerOff className="w-3.5 h-3.5" />
                <span>{t('distributor_filter_suspended', 'Suspendus')} ({suspendedCount})</span>
              </button>
            </div>

            {/* Barre de Recherche */}
            <div className="relative flex-1 md:max-w-sm w-full">
              <Search className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('distributor_search_placeholder', 'Rechercher par nom, code ou email...')}
                className="w-full neo-input pl-10 pr-3 py-2 text-xs font-bold bg-white"
              />
            </div>
          </div>

          {/* Grille des Restaurants */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMerchants.map((m) => {
              const isUpdating = updatingId === m.id;
              const isTrialExpired = m.plan_status === 'trialing' && m.demo_end && new Date(m.demo_end) < new Date();

              return (
                <div 
                  key={m.id} 
                  className={`neo-box p-5 sm:p-6 flex flex-col justify-between transition-all border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-3xl ${
                    m.is_suspended 
                      ? 'bg-red-50/70 border-red-500' 
                      : isTrialExpired 
                      ? 'bg-amber-50/80 border-amber-500' 
                      : m.plan_status === 'trialing' 
                      ? 'bg-amber-50/40' 
                      : 'bg-white'
                  }`}
                >
                  <div className="space-y-4">
                    
                    {/* Top Bar Card */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex gap-3 items-center min-w-0">
                        {m.logo_url ? (
                          <img src={m.logo_url} alt="logo" className="w-12 h-12 rounded-2xl object-cover border-2 border-black shrink-0 bg-white" />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl border-2 border-black bg-[#FFB800] flex items-center justify-center font-black text-xl shrink-0 text-black shadow-[2px_2px_0px_0px_#000]">
                            {m.business_name?.[0] || 'R'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-black text-base leading-tight text-black truncate">{m.business_name}</h3>
                          <p className="text-[11px] font-mono font-bold text-neutral-500">/{m.slug}</p>
                          {m.short_code && (
                            <span className="inline-block mt-0.5 text-[9px] font-mono font-black bg-neutral-100 border border-black px-1.5 py-0.5 rounded-md">
                              CODE: {m.short_code}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {m.is_suspended ? (
                          <span className="bg-red-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full border border-black uppercase tracking-wider">
                            {t('distributor_filter_suspended', 'SUSPENDU')}
                          </span>
                        ) : isTrialExpired ? (
                          <span className="bg-amber-500 text-black text-[9px] font-black px-2.5 py-0.5 rounded-full border border-black uppercase tracking-wider">
                            {t('trial_expired', 'DÉMO EXPIRÉE')}
                          </span>
                        ) : m.plan_status === 'trialing' ? (
                          <span className="bg-[#FFB800] text-black text-[9px] font-black px-2.5 py-0.5 rounded-full border border-black uppercase tracking-wider">
                            {t('distributor_filter_trial', 'DÉMO ACTIVE')}
                          </span>
                        ) : (
                          <span className="bg-[#00F59B] text-black text-[9px] font-black px-2.5 py-0.5 rounded-full border border-black uppercase tracking-wider">
                            {t('distributor_filter_active', 'ACTIF')}
                          </span>
                        )}

                        <span className="text-[10px] font-black text-neutral-600 flex items-center gap-1">
                          <QrCode className="w-3 h-3 text-neutral-500" />
                          {m.scan_count || 0} scans
                        </span>
                      </div>
                    </div>

                    {/* Email du commerçant */}
                    {m.contact_email && (
                      <div className="flex items-center justify-between text-xs font-bold text-neutral-600 pb-2 border-b-2 border-neutral-100">
                        <span className="truncate max-w-[200px] sm:max-w-xs">📧 {m.contact_email}</span>
                        <button
                          onClick={() => copyToClipboard(m.contact_email, 'Email')}
                          className="text-neutral-400 hover:text-black p-1 transition"
                          title="Copier l'email"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Contrôles Formule, Mode d'Encaissement & Statut en direct */}
                    <div className="bg-neutral-50 p-3.5 rounded-2xl border-2 border-black space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1">
                            {t('distributor_table_col_plan', 'Formule')}
                          </label>
                          <select 
                            value={m.plan_tier || 'basic'} 
                            onChange={(e) => handleUpdate(m.id, { planTier: e.target.value })}
                            className="w-full border-2 border-black rounded-xl px-2 py-1.5 bg-white text-xs font-black shadow-[2px_2px_0px_0px_#000] focus:outline-none cursor-pointer truncate"
                            disabled={isUpdating || m.is_suspended}
                          >
                            <option value="freemium">Freemium (0 €/DA)</option>
                            <option value="basic">Starter (Menu HD)</option>
                            <option value="loyalty">Pro (Fidélité)</option>
                            <option value="delivery">Livraison Directe</option>
                            <option value="premium">Premium</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1">
                            {t('distributor_license_type', 'Licence')}
                          </label>
                          <select 
                            value={m.license_type || (m.plan_tier === 'freemium' ? 'free' : 'recurring')} 
                            onChange={(e) => handleUpdate(m.id, { licenseType: e.target.value })}
                            className="w-full border-2 border-black rounded-xl px-2 py-1.5 bg-white text-xs font-black shadow-[2px_2px_0px_0px_#000] focus:outline-none cursor-pointer truncate"
                            disabled={isUpdating || m.is_suspended}
                          >
                            <option value="recurring">Mensuel</option>
                            <option value="lifetime">⭐ À Vie (One-shot)</option>
                            <option value="free">Gratuit</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1">
                            {t('distributor_currency', 'Devise')}
                          </label>
                          <select 
                            value={m.currency || 'EUR'} 
                            onChange={(e) => handleUpdate(m.id, { currency: e.target.value })}
                            className="w-full border-2 border-black rounded-xl px-2 py-1.5 bg-white text-xs font-black shadow-[2px_2px_0px_0px_#000] focus:outline-none cursor-pointer truncate"
                            disabled={isUpdating || m.is_suspended}
                          >
                            <option value="EUR">EUR (€)</option>
                            <option value="DZD">DZD (DA)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1">
                            {t('distributor_table_col_status', 'Statut')}
                          </label>
                          <select 
                            value={m.plan_status || 'active'} 
                            onChange={(e) => handleUpdate(m.id, { planStatus: e.target.value })}
                            className="w-full border-2 border-black rounded-xl px-2 py-1.5 bg-white text-xs font-black shadow-[2px_2px_0px_0px_#000] focus:outline-none cursor-pointer truncate"
                            disabled={isUpdating || m.is_suspended}
                          >
                            <option value="active">✅ Actif</option>
                            <option value="past_due">⚠️ Impayé</option>
                            <option value="canceled">❌ Annulé</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-neutral-500 mb-1">
                          {t('distributor_payment_mode', 'Mode d\'Encaissement Commandes')}
                        </label>
                        <select 
                          value={m.delivery_payment_mode || (m.currency === 'DZD' ? 'cash_on_delivery' : 'both')} 
                          onChange={(e) => handleUpdate(m.id, { deliveryPaymentMode: e.target.value })}
                          className="w-full border-2 border-black rounded-xl px-2.5 py-1.5 bg-white text-xs font-black shadow-[2px_2px_0px_0px_#000] focus:outline-none cursor-pointer truncate"
                          disabled={isUpdating || m.is_suspended}
                        >
                          <option value="cash_on_delivery">{t('mode_cash_only', 'À la porte uniquement (Espèces / DA)')}</option>
                          <option value="online_only">{t('mode_online_only', 'En ligne uniquement (CB / Stripe EUR)')}</option>
                          <option value="both">{t('mode_hybrid', 'Hybride (Les deux au choix)')}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* ── BARRE D'ACTIONS RAPIDES DU MARCHAND ── */}
                  <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t-2 border-black space-y-2">
                    
                    <div className="grid grid-cols-3 gap-2">
                      <Link
                        href={`/menu/${m.slug}`}
                        target="_blank"
                        className="neo-pill-btn-white min-h-[38px] py-2 px-2 text-xs flex items-center justify-center gap-1.5 font-black shadow-[2px_2px_0px_0px_#000] active:scale-95 transition truncate"
                        title={t('distributor_view_menu', 'Voir Menu')}
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{t('distributor_view_menu', 'Menu')}</span>
                      </Link>

                      <button
                        onClick={() => setQrModalMerchant(m)}
                        className="neo-pill-btn-white min-h-[38px] py-2 px-2 text-xs flex items-center justify-center gap-1.5 font-black shadow-[2px_2px_0px_0px_#000] active:scale-95 transition truncate"
                        title={t('distributor_btn_qr', 'QR Code')}
                      >
                        <QrCode className="w-3.5 h-3.5 text-black shrink-0" />
                        <span className="truncate">{t('distributor_btn_qr', 'QR Code')}</span>
                      </button>

                      <a
                        href={`https://wa.me/?text=${getWhatsAppOnboardingMessage(m)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="min-h-[38px] py-2 px-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 border-2 border-black text-emerald-900 transition flex items-center justify-center gap-1 font-black text-xs shadow-[2px_2px_0px_0px_#000] active:scale-95"
                        title={t('distributor_btn_whatsapp', 'WhatsApp')}
                      >
                        <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="hidden xs:inline">WhatsApp</span>
                      </a>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => setResetModalMerchant(m)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-black min-h-[38px] py-2 px-2 rounded-xl border-2 border-black transition flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_#000] active:scale-95 truncate"
                        title={t('distributor_btn_reset_pwd', 'Modifier le mot de passe')}
                      >
                        <Key className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{t('distributor_btn_reset_pwd', 'Mdp')}</span>
                      </button>

                      <button 
                        onClick={() => handleUpdate(m.id, { isSuspended: !m.is_suspended })}
                        disabled={isUpdating}
                        className={`min-h-[38px] flex items-center justify-center gap-1 py-2 px-2 text-xs font-black rounded-xl border-2 border-black transition shadow-[2px_2px_0px_0px_#000] active:scale-95 truncate ${
                          m.is_suspended 
                            ? 'bg-[#00F59B] hover:bg-green-400 text-black' 
                            : 'bg-[#FFB800] hover:bg-amber-400 text-black'
                        }`}
                        title={m.is_suspended ? t('distributor_btn_activate', 'Activer') : t('distributor_btn_suspend', 'Suspendre')}
                      >
                        {m.is_suspended ? <Power className="w-3.5 h-3.5 shrink-0" /> : <PowerOff className="w-3.5 h-3.5 shrink-0" />}
                        <span className="truncate">{m.is_suspended ? t('distributor_btn_activate', 'Activer') : t('distributor_btn_suspend', 'Suspendre')}</span>
                      </button>

                      <button 
                        onClick={() => handleDelete(m)}
                        disabled={isUpdating}
                        className="min-h-[38px] p-2 rounded-xl bg-red-500 hover:bg-red-600 text-white border-2 border-black transition flex items-center justify-center gap-1 font-black text-xs shadow-[2px_2px_0px_0px_#000] active:scale-95"
                        title={t('distributor_btn_delete', 'Supprimer')}
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="hidden xs:inline">{t('delete', 'Suppr.')}</span>
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}

            {filteredMerchants.length === 0 && (
              <div className="col-span-full neo-box p-12 text-center bg-white border-dashed border-4 border-black space-y-4">
                <Store className="w-12 h-12 text-neutral-400 mx-auto" />
                <p className="font-black text-base uppercase tracking-wider text-black">
                  {merchants.length === 0 
                    ? t('distributor_no_merchants_found', "Aucun restaurant n'a encore été créé dans votre console.") 
                    : t('distributor_no_merchants_found', "Aucun restaurant ne correspond à vos filtres actuels.")}
                </p>
                {merchants.length === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreate(true);
                      if (!newPassword) setNewPassword(generateRandomPassword());
                    }}
                    className="neo-pill-btn text-xs py-3 px-6"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('distributor_add_merchant', 'Créer mon premier restaurant')}</span>
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

      </main>

      {/* ── MODAL RECAPITULATIF DE CRÉATION DE COMPTE ── */}
      {createdMerchantResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4">
          <div className="neo-box bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 space-y-5 border-4 border-black shadow-[10px_10px_0px_0px_#00F59B] animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00F59B] border-2 border-black flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-black" />
                </div>
                <h3 className="font-black text-lg text-black uppercase">
                  {t('distributor_success_modal_title', 'Compte Restaurant Prêt !')}
                </h3>
              </div>
              <button
                onClick={() => setCreatedMerchantResult(null)}
                className="text-neutral-500 hover:text-black font-black text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-700 font-bold">
              {t('distributor_success_modal_subtitle', 'Le compte a été créé avec succès. Voici les identifiants à transmettre :')}
            </p>

            <div className="bg-neutral-50 p-4 rounded-xl border-2 border-black space-y-2 text-xs font-mono font-bold">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">{t('public_menu', 'Menu Public')} :</span>
                <span className="text-blue-600 font-black">menufid.site/menu/{createdMerchantResult.slug}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">{t('email', 'Email')} :</span>
                <span className="text-black font-black">{createdMerchantResult.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">{t('password', 'Mot de passe')} :</span>
                <span className="text-emerald-700 font-black bg-emerald-100 px-1.5 py-0.5 rounded">{createdMerchantResult.password}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">{t('short_code', 'Code Restaurant')} :</span>
                <span className="text-black font-black">{createdMerchantResult.short_code}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={`https://wa.me/?text=${getWhatsAppOnboardingMessage(createdMerchantResult)}`}
                target="_blank"
                rel="noreferrer"
                className="neo-pill-btn bg-emerald-600 hover:bg-emerald-700 text-white w-full py-3.5 text-xs flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t('distributor_btn_send_whatsapp', 'Envoyer les accès au client sur WhatsApp')}</span>
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const text = `Identifiants MenuFid :\nEmail: ${createdMerchantResult.email}\nMot de passe: ${createdMerchantResult.password}\nLien: https://www.menufid.site/pro/login`;
                    copyToClipboard(text, 'Identifiants');
                    setCopiedId(true);
                    setTimeout(() => setCopiedId(false), 2000);
                  }}
                  className="neo-pill-btn-white flex-1 py-3 text-xs flex items-center justify-center gap-1.5"
                >
                  {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedId ? t('copied', 'Copié !') : t('distributor_btn_copy_all', 'Copier les accès')}</span>
                </button>

                <button
                  onClick={() => setCreatedMerchantResult(null)}
                  className="neo-pill-btn-white flex-1 py-3 text-xs"
                >
                  {t('close', 'Fermer')}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL VISUALISATION & TÉLÉCHARGEMENT QR CODE ── */}
      {qrModalMerchant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4">
          <div className="neo-box bg-white max-w-sm w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 text-center space-y-5 border-4 border-black shadow-[10px_10px_0px_0px_#000]">
            
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <h3 className="font-black text-base text-black uppercase truncate">
                {t('distributor_qr_modal_title', 'QR Code')} : {qrModalMerchant.business_name}
              </h3>
              <button
                onClick={() => setQrModalMerchant(null)}
                className="text-neutral-500 hover:text-black font-black text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border-3 border-black inline-block shadow-[4px_4px_0px_0px_#000]">
              <QRCodeSVG
                value={`https://www.menufid.site/menu/${qrModalMerchant.slug}`}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-mono font-bold text-neutral-600">
                menufid.site/menu/{qrModalMerchant.slug}
              </p>
              <p className="text-[11px] font-bold text-neutral-500">
                {t('distributor_qr_modal_desc', 'Imprimez ce QR code sur les tables ou chevalets.')}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Link
                href={`/menu/${qrModalMerchant.slug}`}
                target="_blank"
                className="neo-pill-btn-white flex-1 py-3 text-xs flex items-center justify-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{t('distributor_qr_test_menu', 'Tester')}</span>
              </Link>
              <button
                onClick={() => setQrModalMerchant(null)}
                className="neo-pill-btn flex-1 py-3 text-xs"
              >
                {t('close', 'Fermer')}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL MODIFICATION DU MOT DE PASSE COMMERÇANT ── */}
      {resetModalMerchant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4">
          <div className="neo-box bg-white max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 space-y-4 border-4 border-black shadow-[10px_10px_0px_0px_#FFB800] animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <h3 className="font-black text-lg text-black uppercase flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                <span>{t('distributor_reset_modal_title', 'Changer le mot de passe')}</span>
              </h3>
              <button
                onClick={() => setResetModalMerchant(null)}
                className="text-neutral-500 hover:text-black font-black text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600 font-bold">
              {t('distributor_reset_modal_desc', 'Définir un nouveau mot de passe pour')} <span className="text-black font-black">{resetModalMerchant.business_name}</span> :
            </p>

            <form onSubmit={handleExecutePasswordReset} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-black uppercase text-black">
                    {t('distributor_password_label', 'Nouveau mot de passe (min 8 car.)')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewResetPassword(generateRandomPassword())}
                    className="text-[10px] font-black text-blue-600 hover:underline uppercase"
                  >
                    🎲 {t('generate', 'Générer')}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  placeholder="ex: NouveauPass2026!"
                  className="w-full neo-input text-xs font-mono font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalMerchant(null)}
                  className="neo-pill-btn-white flex-1 py-3 text-xs justify-center"
                >
                  {t('cancel', 'Annuler')}
                </button>
                <button
                  type="submit"
                  disabled={resettingPassword}
                  className="neo-pill-btn flex-1 py-3 text-xs justify-center"
                >
                  {resettingPassword ? <Spinner size={18} className="text-black" /> : t('save', 'Enregistrer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
