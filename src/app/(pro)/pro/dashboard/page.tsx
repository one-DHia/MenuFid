'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { 
  Utensils, 
  Award, 
  Scan, 
  Users, 
  TrendingUp, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  QrCode,
  Camera,
  Store,
  Settings,
  LifeBuoy,
  Bell,
  ArrowRight,
  Lock,
  ShoppingBag
} from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { compressImage } from '@/lib/imageCompression';
import { uploadMerchantMedia } from '@/lib/storageHelper';
import ProBottomNav from '@/components/ProBottomNav';

export default function ProDashboardPage() {
  const { t } = useLanguage();
  const { merchant, isLoading, logout } = useAuth();
  const { showToast } = useToast();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState({
    menuItemsCount: 0,
    rewardsCount: 0,
    activeCustomersCount: 0,
    totalStampsAwarded: 0,
    scanCount: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [distributorCode, setDistributorCode] = useState<string | null>(null);

  useEffect(() => {
    if (merchant?.id) {
      loadStats(merchant.id);
    }
    if (merchant?.distributor_id) {
      supabase
        .from('distributors')
        .select('code')
        .eq('id', merchant.distributor_id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.code) {
            setDistributorCode(data.code);
          }
        });
    }
  }, [merchant]);

  async function loadStats(merchantId: string) {
    setLoadingStats(true);
    try {
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('scan_count')
        .eq('id', merchantId)
        .single();
        
      const { count: itemsCount } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', merchantId);

      const { count: rewCount } = await supabase
        .from('rewards')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', merchantId);

      const { count: custCount, data: cards } = await supabase
        .from('loyalty_cards')
        .select('stamps_count', { count: 'exact' })
        .eq('merchant_id', merchantId);

      const totalStamps = (cards || []).reduce((acc: number, c: any) => acc + (c.stamps_count || 0), 0);

      setStats({
        menuItemsCount: itemsCount || 0,
        rewardsCount: rewCount || 0,
        activeCustomersCount: custCount || 0,
        totalStampsAwarded: totalStamps,
        scanCount: merchantData?.scan_count || 0,
      });
    } catch (e) {
      console.error('[DashboardStats] Erreur:', e);
    } finally {
      setLoadingStats(false);
    }
  }

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
        oldUrl: merchant.logo_url || null
      });

      const { error: updateErr } = await supabase
        .from('merchants')
        .update({ logo_url: publicUrl })
        .eq('id', merchant.id);

      if (updateErr) throw updateErr;

      merchant.logo_url = publicUrl;
      showToast(t('logo_updated_success', 'Logo du restaurant mis à jour avec succès !'), 'success');
    } catch (err: any) {
      console.error('Erreur upload logo:', err);
      showToast(err.message || "Erreur lors de la mise à jour du logo", 'error');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Spinner size={36} className="text-black" />
      </div>
    );
  }

  const clientViewUrl = `/menu/${merchant?.slug || 'shop'}`;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black font-sans flex flex-col selection:bg-[#FFB800] selection:text-black">
      {/* Top Header Navigation */}
      <header className="bg-white border-b-4 border-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={logoInputRef}
              onChange={handleLogoSelected}
            />
            <button
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
              className="relative group w-10 h-10 rounded-xl bg-[#FFB800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000] overflow-hidden hover:scale-105 transition"
              title={t('change_restaurant_logo', 'Modifier le logo du restaurant')}
            >
              {merchant?.logo_url ? (
                <img
                  src={merchant.logo_url}
                  alt={merchant.business_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Utensils className="w-5 h-5 text-black" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-4 h-4" />
              </div>
            </button>
            <div>
              <h1 className="font-black text-sm text-black tracking-tight leading-tight truncate max-w-[130px] sm:max-w-xs">
                {merchant?.business_name || t('my_establishment', 'Mon Établissement')}
              </h1>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 border border-black animate-pulse" />
                <span className="text-[11px] text-neutral-600 font-bold uppercase">
                  {merchant?.plan_tier === 'basic' ? t('starter', 'Starter') : t('pro', 'Pro')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={clientViewUrl}
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-black bg-white hover:bg-neutral-100 px-3.5 py-2 rounded-full border-2 border-black transition shadow-[2px_2px_0px_0px_#000]"
            >
              <span>{t('client_view', 'Vue Client')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/pro/profile"
              className="hidden sm:flex p-2 rounded-full text-black hover:bg-neutral-100 border-2 border-black transition shadow-[2px_2px_0px_0px_#000] items-center gap-1.5 px-3 text-xs font-bold"
              title={t('profile_settings', 'Profil & Réglages')}
            >
              <Settings className="w-4 h-4" />
              <span>{t('profile_settings', 'Profil')}</span>
            </Link>

            <Link
              href="/pro/support"
              className="p-2 rounded-full text-black hover:bg-neutral-100 border-2 border-black transition shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 px-3 text-xs font-bold"
              title={t('support_title', 'Support & Assistance')}
            >
              <LifeBuoy className="w-4 h-4 text-black" />
              <span className="hidden md:inline">{t('support_title', 'Support')}</span>
            </Link>

            <LanguageSelector />
            <button
              onClick={logout}
              className="p-2 rounded-full text-black hover:bg-rose-100 border-2 border-black transition shadow-[2px_2px_0px_0px_#000]"
              title={t('logout', 'Déconnexion')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-28 sm:pb-12">
        
        {/* Banner Welcome & Scanner Call-to-action */}
        <div className="neo-box-yellow p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6 relative overflow-hidden">
          <div className="space-y-2 max-w-xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border-2 border-black text-black text-xs font-black shadow-[2px_2px_0px_0px_#000]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{merchant?.plan_tier === 'basic' ? t('saas_starter', 'SaaS STARTER') : t('saas_pro', 'SaaS PRO')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
              {t('welcome_menufid', 'Bienvenue sur MenuFid')}
            </h2>
            <p className="text-neutral-800 text-xs sm:text-sm font-bold">
              {merchant?.plan_tier === 'basic'
                ? t('welcome_desc_starter', 'Gérez votre menu digital interactif QR en direct 24h/24.')
                : t('welcome_desc', 'Gérez votre menu digital et fidélisez en scannant le QR code de vos clients.')}
            </p>
          </div>

          {merchant?.plan_tier === 'basic' ? (
            <Link
              href="/pro/menu"
              className="w-full sm:w-auto neo-pill-btn-white py-4 px-8 text-sm gap-3 shrink-0 relative z-10 flex items-center justify-center font-black shadow-[3px_3px_0px_0px_#000]"
            >
              <Utensils className="w-5 h-5 text-black" />
              <span>{t('manage_menu', 'Gérer mon menu')}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/pro/scanner"
              className="w-full sm:w-auto neo-pill-btn py-4 px-8 text-sm gap-3 shrink-0 relative z-10"
            >
              <Scan className="w-5 h-5" />
              <span>{t('open_scanner', 'Ouvrir Scanner')}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Stats Grid */}
        <div className={`grid gap-3 sm:gap-6 ${merchant?.plan_tier === 'basic' ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-5'}`}>
          <div className="neo-box p-3.5 sm:p-5 space-y-1 sm:space-y-2 bg-[#FFB800]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-black text-black uppercase">{t('stat_scans', 'Scans')}</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-black bg-white flex items-center justify-center">
                <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-black">{loadingStats ? '-' : stats.scanCount}</p>
          </div>

          <div className="neo-box p-3.5 sm:p-5 space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-black text-neutral-500 uppercase">{t('stat_dishes', 'Plats')}</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-black bg-blue-300 flex items-center justify-center">
                <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-black">{loadingStats ? '-' : stats.menuItemsCount}</p>
          </div>

          {merchant?.plan_tier !== 'basic' && (
            <>
              <div className="neo-box p-3.5 sm:p-5 space-y-1 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-black text-neutral-500 uppercase">{t('stat_gifts', 'Cadeaux')}</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-black bg-pink-300 flex items-center justify-center">
                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-black">{loadingStats ? '-' : stats.rewardsCount}</p>
              </div>

              <div className="neo-box p-3.5 sm:p-5 space-y-1 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-black text-neutral-500 uppercase">{t('stat_clients', 'Clients')}</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-black bg-green-300 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-black">{loadingStats ? '-' : stats.activeCustomersCount}</p>
              </div>

              <div className="neo-box p-3.5 sm:p-5 space-y-1 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-black text-neutral-500 uppercase">{t('stat_stamps', 'Tampons')}</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-black bg-purple-300 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-black">{loadingStats ? '-' : stats.totalStampsAwarded}</p>
              </div>
            </>
          )}
        </div>

        {/* Core Modules Grid */}
        <div className={`grid gap-6 ${merchant?.plan_tier === 'basic' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'}`}>
          <Link href="/pro/menu" className="neo-box neo-box-hover p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                <Utensils className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-black text-xl text-black">{t('digital_menu', 'Menu Digital')}</h3>
              <p className="text-neutral-600 text-xs font-bold">
                {t('menu_module_desc', 'Éditez vos plats, prix et allergènes en temps réel.')}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-black pt-2">
              <span>{t('manage_menu', 'Gérer mon menu')}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {merchant?.plan_tier !== 'basic' && (
            <>
              <Link href="/pro/loyalty" className="neo-box neo-box-hover p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-pink-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                    <Award className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="font-black text-xl text-black">{t('loyalty', 'Fidélité')}</h3>
                  <p className="text-neutral-600 text-xs font-bold">
                    {t('loyalty_module_desc', 'Catalogue de cadeaux et configuration des paliers.')}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-black text-black pt-2">
                  <span>{t('configure_gifts', 'Configurer cadeaux')}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>

              <Link href="/pro/scanner" className="neo-box neo-box-hover p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                    <Scan className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="font-black text-xl text-black">{t('scanner_module', 'Scanner')}</h3>
                  <p className="text-neutral-600 text-xs font-bold">
                    {t('scanner_module_desc', 'Ajoutez des tampons en flashant le QR du client.')}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-black text-black pt-2">
                  <span>{t('start_scanner', 'Lancer Scanner')}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>

              <Link href="/pro/notifications" className="neo-box neo-box-hover p-6 flex flex-col justify-between space-y-4 bg-amber-50">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#FFB800] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                    <Bell className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="font-black text-xl text-black">{t('notifications_module', 'Notifications')}</h3>
                  <p className="text-neutral-600 text-xs font-bold">
                    {t('notifications_module_desc', 'Diffusion de notifications Web Push en direct à vos clients.')}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-black text-black pt-2">
                  <span>{t('send_notifications', 'Envoyer des alertes')}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            </>
          )}

          {merchant?.plan_tier === 'basic' && (
            <Link href="/pro/qr" className="neo-box neo-box-hover p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                  <QrCode className="w-6 h-6 text-black" />
                </div>
                <h3 className="font-black text-xl text-black">{t('qr_code_module', 'QR Code de Table')}</h3>
                <p className="text-neutral-600 text-xs font-bold">
                  {t('qr_module_desc', 'Téléchargez et imprimez vos supports QR de table.')}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-black text-black pt-2">
                <span>{t('view_qr_codes', 'Voir les QR codes')}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          )}

          <Link href="/pro/orders" className="neo-box neo-box-hover p-6 flex flex-col justify-between space-y-4 bg-emerald-50/70 border-3 border-black">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#00F59B] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                <ShoppingBag className="w-6 h-6 text-black" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xl text-black">{t('live_orders_title', 'Commandes Directes')}</h3>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-neutral-600 text-xs font-bold">
                {t('live_orders_desc', 'Réception en direct avec sonnerie continue et gestion des livraisons.')}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-black pt-2">
              <span>{t('manage_orders', 'Ouvrir le flux')}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          <Link href="/pro/profile" className="neo-box neo-box-hover p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                <Store className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-black text-xl text-black">{t('profile_settings', 'Profil & Réglages')}</h3>
              <p className="text-neutral-600 text-xs font-bold">
                {t('profile_module_desc', 'Nom, logo, email, mot de passe, Maps & Instagram.')}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-black pt-2">
              <span>{t('manage_profile', 'Gérer le profil')}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Upgrade Banner for Starter Merchants */}
        {merchant?.plan_tier === 'basic' && (
          <div className="neo-box p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-3 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-black uppercase">
                <Sparkles className="w-3 h-3 text-[#FFB800]" />
                <span>{t('upgrade_banner_badge', 'Passez au niveau supérieur')}</span>
              </div>
              <h4 className="font-black text-lg text-black">
                {t('upgrade_banner_title', 'Débloquez la Carte de Fidélité, le Scanner & les Notifications')}
              </h4>
              <p className="text-xs font-bold text-neutral-600">
                {t('upgrade_banner_desc', 'Boostez les visites récurrentes de vos clients et envoyez des offres Push avec la formule PRO (39 €/mois).')}
              </p>
            </div>
            <Link
              href="/pricing"
              className="neo-pill-btn-yellow py-3 px-6 text-xs font-black shrink-0 flex items-center gap-2 shadow-[2px_2px_0px_0px_#000]"
            >
              <span>{t('upgrade_to_pro_btn', 'Découvrir la Formule PRO')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* QR Code Section */}
        {merchant?.slug && (
          <div className="neo-box bg-white p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 max-w-2xl mx-auto">
            <div className="w-48 h-48 rounded-xl border-4 border-black p-2 bg-white flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#000]">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  typeof window !== 'undefined'
                    ? `${window.location.origin}/menu/${merchant.slug}`
                    : ''
                )}`}
                alt={t('qr_code_restaurant_alt', 'QR Code Restaurant')}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-4 text-center md:text-left flex-grow">
              <h3 className="font-black text-xl text-black uppercase tracking-tight">
                {t('your_table_qr', 'VOTRE QR CODE DE TABLE')}
              </h3>
              <p className="text-neutral-600 text-xs font-bold leading-relaxed">
                {t('qr_code_instructions', 'Affichez ce QR Code sur vos tables. Vos clients pourront le scanner pour accéder directement au menu et s\'inscrire au programme de fidélité.')}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <Link
                  href="/pro/qr"
                  className="neo-pill-btn py-2 px-5 text-xs"
                >
                  {t('print_qr', 'Imprimer / Télécharger')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <ProBottomNav />
    </div>
  );
}
