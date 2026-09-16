'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Check, 
  Palette, 
  Sparkles, 
  Sliders, 
  Image as ImageIcon, 
  FileText,
  Copy,
  ExternalLink,
  RefreshCw,
  Share2,
  Smartphone,
  Wifi,
  Layers,
  Award,
  CheckCircle2,
  Share,
  PlusSquare,
  MoreVertical,
  Apple,
  Zap,
  Info
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import ProBottomNav from '@/components/ProBottomNav';

const TEMPLATES = [
  {
    id: 'template1',
    name: 'Classique Beige',
    src: '/templates/template1.png',
    qrConfig: { top: '53.5%', width: '51%', bgColor: 'white', borderRadius: '16px' }
  },
  {
    id: 'template2',
    name: 'Violet Audacieux',
    src: '/templates/template2.png',
    qrConfig: { top: '58.8%', width: '51%', bgColor: 'white', borderRadius: '16px' }
  },
  {
    id: 'template3',
    name: 'Style Mobile',
    src: '/templates/template3.png',
    qrConfig: { top: '58.5%', width: '44%', bgColor: 'white', borderRadius: '20px' }
  },
  {
    id: 'template4',
    name: 'Minimaliste',
    src: '/templates/template4.png',
    qrConfig: { top: '65.5%', width: '54%', bgColor: 'white', borderRadius: '16px' }
  }
];

const PRESET_COLORS = [
  { name: 'Noir Classique', fg: '#000000', bg: '#FFFFFF' },
  { name: 'Jaune Néo', fg: '#000000', bg: '#FFB800' },
  { name: 'Bleu Royal', fg: '#1E3A8A', bg: '#EFF6FF' },
  { name: 'Vert Émeraude', fg: '#047857', bg: '#ECFDF5' },
  { name: 'Violet Sombre', fg: '#5B21B6', bg: '#F5F3FF' },
  { name: 'Rouge Brique', fg: '#991B1B', bg: '#FEF2F2' },
];

const FLYER_THEMES = [
  { id: 'yellow', name: 'Néo Jaune', headerBg: '#FFB800', accent: '#FFB800', border: '#000000' },
  { id: 'white', name: 'Blanc Minimal', headerBg: '#FAFAFA', accent: '#000000', border: '#000000' },
  { id: 'green', name: 'Vert Fraîcheur', headerBg: '#00F59B', accent: '#00F59B', border: '#000000' },
  { id: 'dark', name: 'Noir & Or', headerBg: '#1A1A1A', accent: '#FFB800', border: '#000000', dark: true },
];

export default function QRPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { merchant, isLoading } = useAuth();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !merchant) {
      router.replace('/pro/login');
    }
  }, [mounted, isLoading, merchant, router]);

  const [activeTab, setActiveTab] = useState<'customizer' | 'posters' | 'install_guide'>('customizer');
  const [menuUrl, setMenuUrl] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('template1');

  // QR Customizer States
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [logoChoice, setLogoChoice] = useState<'merchant' | 'menufid' | 'none'>('merchant');
  const [logoSizePercent, setLogoSizePercent] = useState<number>(22);
  const [ctaText, setCtaText] = useState(
    language === 'ar' ? 'امسح لعرض القائمة وبطاقة الوفاء' : 'Scannez pour le Menu & Fidélité'
  );
  const [cardFrame, setCardFrame] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Flyer / Table Tent Installation Tutorial States
  const [flyerFormat, setFlyerFormat] = useState<'tent' | 'a5' | 'a4'>('tent');
  const [flyerThemeId, setFlyerThemeId] = useState('yellow');
  const [flyerTitle, setFlyerTitle] = useState('');
  const [flyerSubtitle, setFlyerSubtitle] = useState('');
  const [flyerReward, setFlyerReward] = useState('');
  const [flyerShowWifi, setFlyerShowWifi] = useState(false);
  const [flyerWifiName, setFlyerWifiName] = useState('');
  const [flyerWifiPass, setFlyerWifiPass] = useState('');
  const [downloadingFlyer, setDownloadingFlyer] = useState(false);

  const flyerPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (language === 'ar') {
      setCtaText('امسح لعرض القائمة وبطاقة الوفاء');
      setFlyerTitle('ثبّت بطاقة الوفاء على هاتفك في 5 ثوانٍ !');
      setFlyerSubtitle('امسح رمز QR واجمع أختامك لتربح هديتك');
      setFlyerReward('🎁 الوجبة العاشرة مجانية + عروض حصرية');
    } else if (language === 'en') {
      setCtaText('Scan for Menu & Loyalty Card');
      setFlyerTitle('Install Our Loyalty Card in 5s!');
      setFlyerSubtitle('Scan the QR code and collect stamps to unlock gifts');
      setFlyerReward('🎁 10th Meal Free & Exclusive Deals');
    } else {
      setCtaText('Scannez pour le Menu & Fidélité');
      setFlyerTitle('Installez Notre Carte de Fidélité en 5s !');
      setFlyerSubtitle('Scannez le QR code pour cumuler vos tampons et débloquer vos cadeaux');
      setFlyerReward('🎁 10ème repas offert & Réductions exclusives');
    }
  }, [language]);

  useEffect(() => {
    if (merchant?.business_name) {
      setFlyerWifiName(`${merchant.business_name}-WiFi`);
    }
  }, [merchant?.business_name]);

  useEffect(() => {
    async function loadQrUrl() {
      let finalSlug = merchant?.slug || '';
      if (!finalSlug && typeof window !== 'undefined') {
        finalSlug = localStorage.getItem('menufid_merchant_slug') || '';
      }

      if (merchant?.id) {
        try {
          const { data } = await supabase.from('merchants').select('slug').eq('id', merchant.id).maybeSingle();
          if (data?.slug) {
            finalSlug = data.slug;
          }
        } catch (e) {}
      }

      if (!finalSlug) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data } = await supabase.from('merchants').select('slug').eq('user_id', user.id).maybeSingle();
            if (data?.slug) finalSlug = data.slug;
          }
        } catch (e) {}
      }

      const host = typeof window !== 'undefined' ? window.location.origin : 'https://www.menufid.site';
      const fallback = finalSlug || 'brooklyn_boussada';
      setMenuUrl(`${host}/menu/${fallback}?scan=true`);
    }

    loadQrUrl();
  }, [merchant]);

  if (!mounted || isLoading || !merchant) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Spinner size={36} className="text-black" />
      </div>
    );
  }

  const selectedTemplate = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];
  const selectedFlyerTheme = FLYER_THEMES.find(t => t.id === flyerThemeId) || FLYER_THEMES[0];

  // Download Complete Table Stand Card as High-Resolution PNG
  const handleDownloadCompleteCardPng = async () => {
    if (!menuUrl) return;
    setDownloading(true);
    try {
      const width = 900;
      const height = 1250;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Background
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(0, 0, width, height);

      // 2. Outer Border Frame
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 14;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      // 3. Top Yellow Header Block
      ctx.fillStyle = '#FFB800';
      ctx.fillRect(30, 30, width - 60, 240);
      ctx.beginPath();
      ctx.moveTo(30, 270);
      ctx.lineTo(width - 30, 270);
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      // 4. Restaurant Title Text
      const name = merchant?.business_name || 'NOTRE ÉTABLISSEMENT';
      ctx.fillStyle = '#000000';
      ctx.font = '900 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(name.toUpperCase(), width / 2, 130);

      // 5. Subtitle Badge
      ctx.font = '700 24px sans-serif';
      ctx.fillText('MENU DIGITAL & CARTE DE FIDÉLITÉ', width / 2, 190);

      // 6. Draw QR Code in Center
      const qrSvg = document.getElementById('main-qr-code-svg');
      if (qrSvg) {
        const svgData = new XMLSerializer().serializeToString(qrSvg);
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        await new Promise((resolve) => {
          img.onload = () => {
            const qrSize = 480;
            const qrX = (width - qrSize) / 2;
            const qrY = 360;

            // QR Box Background & Shadow
            ctx.fillStyle = '#000000';
            ctx.fillRect(qrX + 12, qrY + 12, qrSize, qrSize);
            ctx.fillStyle = bgColor;
            ctx.fillRect(qrX, qrY, qrSize, qrSize);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 8;
            ctx.strokeRect(qrX, qrY, qrSize, qrSize);

            // Draw QR
            ctx.drawImage(img, qrX + 24, qrY + 24, qrSize - 48, qrSize - 48);
            resolve(true);
          };
        });
      }

      // 7. CTA Banner at Bottom
      const ctaY = 930;
      ctx.fillStyle = '#00F59B';
      ctx.fillRect(100, ctaY, width - 200, 110);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 8;
      ctx.strokeRect(100, ctaY, width - 200, 110);

      ctx.fillStyle = '#000000';
      ctx.font = '900 28px sans-serif';
      ctx.fillText(ctaText.toUpperCase(), width / 2, ctaY + 65);

      // 8. Footer Brand
      ctx.fillStyle = '#888888';
      ctx.font = '700 18px sans-serif';
      ctx.fillText('Propulsé par MenuFid.site • Carte de fidélité instantanée', width / 2, 1160);

      // 9. Download file
      const link = document.createElement('a');
      link.download = `chevalet-qr-${merchant?.slug || 'menufid'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      showToast(t('download_success', 'Chevalet haute résolution téléchargé avec succès !'), 'success');
    } catch (e) {
      console.error(e);
      showToast('Erreur lors de la génération de l\'image', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!menuUrl) return;
    try {
      await navigator.clipboard.writeText(menuUrl);
      showToast('Lien du menu copié dans le presse-papier !', 'success');
    } catch (e) {
      showToast('Erreur lors de la copie', 'error');
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-poster, #printable-poster * {
            visibility: visible;
          }
          #printable-poster {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}} />
      
      {/* Hidden print container for Posters & Install Flyers */}
      <div id="printable-poster" className="hidden print:block w-[210mm] h-[297mm] relative overflow-hidden bg-white">
        {activeTab === 'install_guide' ? (
          /* ── PRINT VIEW: GUIDE D'INSTALLATION & CHEVALET ── */
          <div className="w-full h-full p-8 flex flex-col justify-between border-[12px] border-black bg-[#FAFAFA] font-sans">
            {/* Header */}
            <div className="text-center space-y-2 border-b-4 border-black pb-6 bg-[#FFB800] p-6 -mx-8 -mt-8 border-t-0">
              <h1 className="text-3xl font-black uppercase text-black">
                {merchant?.business_name || 'NOTRE ÉTABLISSEMENT'}
              </h1>
              <div className="inline-block bg-black text-white px-4 py-1 rounded-full text-sm font-black uppercase">
                {t('install_guide_badge', 'Guide d\'installation instantanée')}
              </div>
            </div>

            {/* Title & Slogan */}
            <div className="text-center space-y-2 my-2">
              <h2 className="text-2xl font-black uppercase text-black">
                {flyerTitle || 'Installez Notre Carte de Fidélité !'}
              </h2>
              <p className="text-sm font-bold text-neutral-700">
                {flyerSubtitle || 'Scannez le QR code ci-dessous avec votre appareil photo'}
              </p>
              {flyerReward && (
                <div className="inline-block bg-[#00F59B] border-2 border-black px-4 py-2 rounded-xl text-sm font-black shadow-[2px_2px_0px_0px_#000]">
                  {flyerReward}
                </div>
              )}
            </div>

            {/* QR Code Center Box */}
            <div className="flex justify-center my-4">
              <div className="p-5 bg-white border-4 border-black rounded-3xl shadow-[6px_6px_0px_0px_#000] text-center space-y-2">
                {menuUrl && (
                  <QRCodeSVG 
                    value={menuUrl} 
                    size={220}
                    fgColor="#000000"
                    bgColor="#FFFFFF"
                    level="H"
                    imageSettings={{
                      src: merchant?.logo_url || '/icon.svg',
                      height: 48,
                      width: 48,
                      excavate: true,
                    }}
                  />
                )}
                <span className="block text-[11px] font-black uppercase tracking-wider text-neutral-700">
                  Scannez pour Installer 📲
                </span>
              </div>
            </div>

            {/* 3 Step Visual Guide */}
            <div className="grid grid-cols-3 gap-4 my-2">
              <div className="p-4 bg-white border-2 border-black rounded-xl text-center space-y-1.5 shadow-[2px_2px_0px_0px_#000]">
                <div className="w-8 h-8 rounded-full bg-black text-white font-black text-xs flex items-center justify-center mx-auto">1</div>
                <h4 className="font-black text-xs uppercase">1. Scannez</h4>
                <p className="text-[10px] font-bold text-neutral-600 leading-tight">Avec l'appareil photo de votre smartphone</p>
              </div>

              <div className="p-4 bg-white border-2 border-black rounded-xl text-center space-y-1.5 shadow-[2px_2px_0px_0px_#000]">
                <div className="w-8 h-8 rounded-full bg-[#FFB800] border border-black text-black font-black text-xs flex items-center justify-center mx-auto">2</div>
                <h4 className="font-black text-xs uppercase">2. Ajoutez</h4>
                <p className="text-[10px] font-bold text-neutral-600 leading-tight">Touchez Partager ⎋ ou Menu ⋮ puis "Sur l'écran d'accueil"</p>
              </div>

              <div className="p-4 bg-white border-2 border-black rounded-xl text-center space-y-1.5 shadow-[2px_2px_0px_0px_#000]">
                <div className="w-8 h-8 rounded-full bg-[#00F59B] border border-black text-black font-black text-xs flex items-center justify-center mx-auto">3</div>
                <h4 className="font-black text-xs uppercase">3. Gagnez</h4>
                <p className="text-[10px] font-bold text-neutral-600 leading-tight">Cumulez vos tampons et recevez vos alertes de cadeaux</p>
              </div>
            </div>

            {/* Wi-Fi Credentials (if enabled) */}
            {flyerShowWifi && (
              <div className="p-3 bg-amber-50 border-2 border-black rounded-xl flex items-center justify-around text-xs font-black">
                <div>📶 Wi-Fi : <span className="font-bold">{flyerWifiName}</span></div>
                <div>🔑 Code : <span className="font-mono">{flyerWifiPass || 'Non requis'}</span></div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-[10px] font-bold text-neutral-500 pt-2 border-t-2 border-black">
              MenuFid.site • 0 Téléchargement App Store requis • 100% Web & Instantané
            </div>
          </div>
        ) : (
          /* ── PRINT VIEW: POSTER CLASSIQUE ── */
          <>
            <img 
              src={selectedTemplate.src} 
              alt="QR Poster Background" 
              className="absolute inset-0 w-full h-full object-cover" 
            />
            <div 
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{ 
                top: selectedTemplate.qrConfig.top, 
                width: selectedTemplate.qrConfig.width,
                aspectRatio: '1 / 1'
              }}
            >
              {menuUrl && (
                <div 
                  className="p-3 w-full h-full flex items-center justify-center shadow-sm" 
                  style={{ 
                    backgroundColor: selectedTemplate.qrConfig.bgColor, 
                    borderRadius: selectedTemplate.qrConfig.borderRadius 
                  }}
                >
                  <QRCodeSVG 
                    value={menuUrl} 
                    style={{ width: '100%', height: '100%' }} 
                    fgColor={fgColor}
                    bgColor={bgColor}
                    level="H"
                    imageSettings={logoChoice !== 'none' ? {
                      src: logoChoice === 'menufid' ? '/icon.svg' : (merchant?.logo_url || '/icon.svg'),
                      height: Math.round((36 * logoSizePercent) / 22),
                      width: Math.round((36 * logoSizePercent) / 22),
                      excavate: true,
                    } : undefined}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="min-h-screen bg-[#FAFAFA] text-black font-sans flex flex-col selection:bg-[#FFB800] selection:text-black print:hidden pb-28 sm:pb-12">
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
              <h1 className="font-black text-lg text-black tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-black" />
                <span>{t('qr_code_table_title', 'QR Code & Supports Tables')}</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSelector />
            </div>
          </div>
        </header>

        {/* Tab switcher */}
        <div className="bg-white border-b-2 border-black sticky top-16 z-40">
          <div className="max-w-6xl mx-auto px-4 flex gap-2 sm:gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('customizer')}
              className={`py-3.5 px-4 font-black text-xs uppercase tracking-wider border-b-4 transition flex items-center gap-2 shrink-0 ${
                activeTab === 'customizer'
                  ? 'border-black text-black bg-[#FFB800]/20'
                  : 'border-transparent text-neutral-500 hover:text-black'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>{t('qr_studio_tab', 'Studio QR Code')}</span>
            </button>

            <button
              onClick={() => setActiveTab('install_guide')}
              className={`py-3.5 px-4 font-black text-xs uppercase tracking-wider border-b-4 transition flex items-center gap-2 shrink-0 ${
                activeTab === 'install_guide'
                  ? 'border-black text-black bg-[#00F59B]/30'
                  : 'border-transparent text-neutral-500 hover:text-black'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{t('qr_install_flyer_tab', 'Guide & Chevalet Installation')}</span>
            </button>

            <button
              onClick={() => setActiveTab('posters')}
              className={`py-3.5 px-4 font-black text-xs uppercase tracking-wider border-b-4 transition flex items-center gap-2 shrink-0 ${
                activeTab === 'posters'
                  ? 'border-black text-black bg-[#93C5FD]/30'
                  : 'border-transparent text-neutral-500 hover:text-black'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t('qr_posters_tab', 'Affiches Prêtes à Imprimer')}</span>
            </button>
          </div>
        </div>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
          {activeTab === 'customizer' && (
            /* ── ONGLET 1 : STUDIO DE PERSONNALISATION QR ── */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Controls Column */}
              <div className="lg:col-span-7 space-y-6">
                <div className="neo-box p-6 sm:p-8 bg-white space-y-6">
                  <div className="flex items-center justify-between border-b-2 border-black pb-4">
                    <div>
                      <h2 className="font-black text-lg uppercase tracking-tight text-black flex items-center gap-2">
                        <Sliders className="w-5 h-5" />
                        <span>{t('customize_qr_title', 'Personnalisez votre QR Code')}</span>
                      </h2>
                      <p className="text-xs text-neutral-600 font-bold mt-1">
                        {t('customize_qr_desc', 'Adaptez les couleurs aux tons de votre restaurant et ajoutez votre logo au centre.')}
                      </p>
                    </div>
                  </div>

                  {/* Destination URL */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black uppercase tracking-wider">Lien de Destination du QR Code</label>
                      {menuUrl && (
                        <a 
                          href={menuUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[11px] font-black text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <span>Tester le lien</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={menuUrl}
                        onChange={(e) => setMenuUrl(e.target.value)}
                        placeholder="https://www.menufid.site/menu/votre_restaurant"
                        className="flex-1 neo-input text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Preset Colors */}
                  <div className="space-y-2.5 pt-2 border-t-2 border-black/10">
                    <label className="block text-xs font-black uppercase tracking-wider">{t('preset_palettes', 'Palettes Prédéfinies')}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {PRESET_COLORS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setFgColor(preset.fg);
                            setBgColor(preset.bg);
                          }}
                          className={`p-2.5 rounded-xl border-2 border-black flex items-center gap-2 text-xs font-black transition ${
                            fgColor === preset.fg && bgColor === preset.bg
                              ? 'ring-2 ring-black shadow-[2px_2px_0px_0px_#000] bg-neutral-100'
                              : 'hover:bg-neutral-50'
                          }`}
                        >
                          <span
                            className="w-5 h-5 rounded-md border border-black shrink-0"
                            style={{ backgroundColor: preset.bg, boxShadow: `inset 0 0 0 2px ${preset.fg}` }}
                          />
                          <span className="truncate">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Colors Picker */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider mb-1.5">{t('qr_color', 'Couleur du QR')}</label>
                      <div className="flex items-center gap-2 p-2 border-2 border-black rounded-xl bg-neutral-50">
                        <input
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-8 h-8 rounded border-0 cursor-pointer"
                        />
                        <span className="font-mono text-xs font-black">{fgColor}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider mb-1.5">{t('bg_color', 'Couleur de Fond')}</label>
                      <div className="flex items-center gap-2 p-2 border-2 border-black rounded-xl bg-neutral-50">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-8 h-8 rounded border-0 cursor-pointer"
                        />
                        <span className="font-mono text-xs font-black">{bgColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Logo Options */}
                  <div className="space-y-2.5 pt-2 border-t-2 border-black/10">
                    <label className="block text-xs font-black uppercase tracking-wider">{t('center_logo', 'Logo au Centre du QR')}</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setLogoChoice('merchant')}
                        className={`p-3 rounded-xl border-2 border-black font-black text-xs flex flex-col items-center gap-1.5 transition ${
                          logoChoice === 'merchant'
                            ? 'bg-[#FFB800] shadow-[2px_2px_0px_0px_#000]'
                            : 'bg-white hover:bg-neutral-50'
                        }`}
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>Logo Resto</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLogoChoice('menufid')}
                        className={`p-3 rounded-xl border-2 border-black font-black text-xs flex flex-col items-center gap-1.5 transition ${
                          logoChoice === 'menufid'
                            ? 'bg-[#FFB800] shadow-[2px_2px_0px_0px_#000]'
                            : 'bg-white hover:bg-neutral-50'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Logo MenuFid</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLogoChoice('none')}
                        className={`p-3 rounded-xl border-2 border-black font-black text-xs flex flex-col items-center gap-1.5 transition ${
                          logoChoice === 'none'
                            ? 'bg-[#FFB800] shadow-[2px_2px_0px_0px_#000]'
                            : 'bg-white hover:bg-neutral-50'
                        }`}
                      >
                        <span>∅</span>
                        <span>Sans Logo</span>
                      </button>
                    </div>
                  </div>

                  {/* CTA Text */}
                  <div className="space-y-1.5 pt-2 border-t-2 border-black/10">
                    <label className="block text-xs font-black uppercase tracking-wider">Texte du Chevalet (Sous le QR)</label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="w-full neo-input text-xs font-bold"
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t-2 border-black/10 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={handleDownloadCompleteCardPng}
                      disabled={downloading}
                      className="neo-pill-btn bg-[#FFB800] text-black w-full sm:flex-1 py-3 text-xs flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000]"
                    >
                      {downloading ? <Spinner size={16} className="text-black" /> : <Download className="w-4 h-4" />}
                      <span>Télécharger Chevalet Complet (PNG)</span>
                    </button>

                    <button
                      onClick={handleCopyLink}
                      className="neo-pill-btn-white w-full sm:w-auto py-3 text-xs flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000]"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copier le Lien</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="neo-box p-6 bg-white border-4 border-black space-y-4 text-center">
                  <span className="inline-block bg-black text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded">
                    Aperçu Chevalet de Table
                  </span>

                  <div className="p-6 bg-amber-50 rounded-2xl border-2 border-black space-y-4 shadow-[4px_4px_0px_0px_#000]">
                    <div className="bg-[#FFB800] border-2 border-black p-3 rounded-xl shadow-[2px_2px_0px_0px_#000]">
                      <h3 className="font-black text-base uppercase text-black">
                        {merchant?.business_name || 'Mon Établissement'}
                      </h3>
                      <p className="text-[10px] font-bold text-neutral-800">
                        MENU DIGITAL & CARTE DE FIDÉLITÉ
                      </p>
                    </div>

                    <div className="flex justify-center p-3 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_#000]">
                      <div id="main-qr-code-svg">
                        <QRCodeSVG 
                          value={menuUrl || 'https://menufid.site'} 
                          size={180}
                          fgColor={fgColor}
                          bgColor={bgColor}
                          level="H"
                          imageSettings={logoChoice !== 'none' ? {
                            src: logoChoice === 'menufid' ? '/icon.svg' : (merchant?.logo_url || '/icon.svg'),
                            height: Math.round((36 * logoSizePercent) / 22),
                            width: Math.round((36 * logoSizePercent) / 22),
                            excavate: true,
                          } : undefined}
                        />
                      </div>
                    </div>

                    <div className="p-2.5 bg-[#00F59B] border-2 border-black rounded-xl text-black font-black text-xs shadow-[2px_2px_0px_0px_#000]">
                      {ctaText}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'install_guide' && (
            /* ── ONGLET 2 : GUIDE D'INSTALLATION & CHEVALET CLIENT TUTO ── */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Controls */}
              <div className="lg:col-span-6 space-y-6">
                <div className="neo-box p-6 sm:p-8 bg-white space-y-6">
                  <div className="border-b-2 border-black pb-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00F59B] border-2 border-black text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_#000] mb-2">
                      <Smartphone className="w-3 h-3 text-black" />
                      <span>{t('qr_install_flyer_tab', 'Guide d\'Installation & Chevalet Table')}</span>
                    </div>
                    <h2 className="font-black text-xl uppercase tracking-tight text-black">
                      {t('install_flyer_customizer_title', 'Personnaliser le Chevalet / Affiche d\'Installation')}
                    </h2>
                    <p className="text-xs text-neutral-600 font-bold mt-1">
                      {t('install_flyer_customizer_desc', 'Imprimez un guide visuel clair pour inciter vos clients à installer votre carte de fidélité et cumuler leurs tampons.')}
                    </p>
                  </div>

                  {/* Format Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider">
                      {t('flyer_format_label', 'Format d\'Impression')}
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setFlyerFormat('tent')}
                        className={`p-3 rounded-xl border-2 border-black font-black text-xs flex flex-col items-center gap-1 transition ${
                          flyerFormat === 'tent'
                            ? 'bg-[#FFB800] shadow-[2px_2px_0px_0px_#000]'
                            : 'bg-white hover:bg-neutral-50'
                        }`}
                      >
                        <Layers className="w-4 h-4" />
                        <span>Chevalet Table</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFlyerFormat('a5')}
                        className={`p-3 rounded-xl border-2 border-black font-black text-xs flex flex-col items-center gap-1 transition ${
                          flyerFormat === 'a5'
                            ? 'bg-[#00F59B] shadow-[2px_2px_0px_0px_#000]'
                            : 'bg-white hover:bg-neutral-50'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span>A5 Dépliant</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFlyerFormat('a4')}
                        className={`p-3 rounded-xl border-2 border-black font-black text-xs flex flex-col items-center gap-1 transition ${
                          flyerFormat === 'a4'
                            ? 'bg-[#93C5FD] shadow-[2px_2px_0px_0px_#000]'
                            : 'bg-white hover:bg-neutral-50'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span>A4 Affiche</span>
                      </button>
                    </div>
                  </div>

                  {/* Theme Selector */}
                  <div className="space-y-2 pt-2 border-t-2 border-black/10">
                    <label className="block text-xs font-black uppercase tracking-wider">Thème Graphique</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {FLYER_THEMES.map((th) => (
                        <button
                          key={th.id}
                          type="button"
                          onClick={() => setFlyerThemeId(th.id)}
                          className={`p-2.5 rounded-xl border-2 border-black font-black text-xs text-center transition ${
                            flyerThemeId === th.id
                              ? 'ring-2 ring-black shadow-[2px_2px_0px_0px_#000]'
                              : 'hover:bg-neutral-50'
                          }`}
                          style={{ backgroundColor: th.headerBg, color: th.dark ? '#FFFFFF' : '#000000' }}
                        >
                          {th.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Texts Inputs */}
                  <div className="space-y-4 pt-2 border-t-2 border-black/10">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider mb-1">
                        {t('flyer_title_label', 'Titre Principal de l\'Affiche')}
                      </label>
                      <input
                        type="text"
                        value={flyerTitle}
                        onChange={(e) => setFlyerTitle(e.target.value)}
                        placeholder="Installez Notre Carte de Fidélité !"
                        className="w-full neo-input text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider mb-1">
                        {t('flyer_subtitle_label', 'Sous-titre / Message Incitatif')}
                      </label>
                      <input
                        type="text"
                        value={flyerSubtitle}
                        onChange={(e) => setFlyerSubtitle(e.target.value)}
                        placeholder="Scannez le QR code pour cumuler vos tampons"
                        className="w-full neo-input text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider mb-1">
                        {t('flyer_reward_label', 'Cadeau ou Avantage Mis en Avant')}
                      </label>
                      <input
                        type="text"
                        value={flyerReward}
                        onChange={(e) => setFlyerReward(e.target.value)}
                        placeholder="🎁 10ème repas offert & Réductions exclusives"
                        className="w-full neo-input text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Wi-Fi Details Toggle */}
                  <div className="space-y-3 pt-2 border-t-2 border-black/10">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={flyerShowWifi}
                        onChange={(e) => setFlyerShowWifi(e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-black text-black focus:ring-0"
                      />
                      <span className="text-xs font-black uppercase">
                        {t('flyer_wifi_toggle', 'Afficher les codes Wi-Fi du restaurant sur le chevalet')}
                      </span>
                    </label>

                    {flyerShowWifi && (
                      <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50 rounded-xl border-2 border-black">
                        <div>
                          <label className="block text-[10px] font-black uppercase mb-1">{t('wifi_name_label', 'Nom Wi-Fi')}</label>
                          <input
                            type="text"
                            value={flyerWifiName}
                            onChange={(e) => setFlyerWifiName(e.target.value)}
                            className="w-full neo-input text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase mb-1">{t('wifi_pass_label', 'Mot de passe')}</label>
                          <input
                            type="text"
                            value={flyerWifiPass}
                            onChange={(e) => setFlyerWifiPass(e.target.value)}
                            className="w-full neo-input text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Print & Download Actions */}
                  <div className="pt-4 border-t-2 border-black/10 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => window.print()}
                      className="neo-pill-btn bg-[#00F59B] text-black hover:bg-[#00d888] w-full sm:flex-1 py-4 text-xs font-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000]"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{t('print_flyer_btn', 'Imprimer le Guide Client')}</span>
                    </button>

                    <Link
                      href="/installer"
                      target="_blank"
                      className="neo-pill-btn-white w-full sm:w-auto py-4 text-xs font-black flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000]"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Page Tuto Web</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Table Tent / Flyer Preview */}
              <div className="lg:col-span-6 space-y-4">
                <div className="neo-box p-6 bg-neutral-100 border-4 border-black space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-black text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded">
                      Aperçu Chevalet / Affiche d'Installation
                    </span>
                    <span className="text-xs font-bold text-neutral-500">Format : {flyerFormat.toUpperCase()}</span>
                  </div>

                  {/* Rendered Live Card Preview */}
                  <div 
                    ref={flyerPreviewRef}
                    className="p-6 bg-white border-4 border-black rounded-3xl space-y-5 shadow-[6px_6px_0px_0px_#000] text-center"
                  >
                    {/* Header Banner */}
                    <div 
                      className="p-4 rounded-2xl border-2 border-black space-y-1 shadow-[2px_2px_0px_0px_#000]"
                      style={{ 
                        backgroundColor: selectedFlyerTheme.headerBg, 
                        color: selectedFlyerTheme.dark ? '#FFFFFF' : '#000000' 
                      }}
                    >
                      <h3 className="font-black text-lg uppercase tracking-tight">
                        {merchant?.business_name || 'MON RESTAURANT'}
                      </h3>
                      <div className="inline-block bg-black text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                        CARTE DE FIDÉLITÉ INSTANTANÉE
                      </div>
                    </div>

                    {/* Headline */}
                    <div className="space-y-1">
                      <h4 className="font-black text-base uppercase text-black leading-tight">
                        {flyerTitle || 'Installez Notre Carte de Fidélité !'}
                      </h4>
                      <p className="text-xs font-bold text-neutral-600 leading-snug">
                        {flyerSubtitle || 'Scannez le QR code ci-dessous avec votre appareil photo'}
                      </p>
                    </div>

                    {/* Reward Pill */}
                    {flyerReward && (
                      <div className="p-2.5 bg-[#00F59B] border-2 border-black rounded-xl text-black font-black text-xs shadow-[2px_2px_0px_0px_#000]">
                        {flyerReward}
                      </div>
                    )}

                    {/* QR Code */}
                    <div className="flex justify-center my-2">
                      <div className="p-4 bg-white border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] text-center space-y-1.5">
                        <QRCodeSVG 
                          value={menuUrl || 'https://menufid.site'} 
                          size={160}
                          fgColor="#000000"
                          bgColor="#FFFFFF"
                          level="H"
                          imageSettings={{
                            src: merchant?.logo_url || '/icon.svg',
                            height: 38,
                            width: 38,
                            excavate: true,
                          }}
                        />
                        <span className="block text-[10px] font-black uppercase text-neutral-700">
                          Scannez pour Installer 📲
                        </span>
                      </div>
                    </div>

                    {/* 3 Step Visual Mini Guide */}
                    <div className="grid grid-cols-3 gap-2 text-left pt-2 border-t-2 border-black/10">
                      <div className="p-2 bg-amber-50 border border-black rounded-lg space-y-1">
                        <span className="w-5 h-5 rounded-full bg-black text-white font-black text-[9px] flex items-center justify-center">1</span>
                        <p className="text-[10px] font-black text-black">1. Scanner</p>
                        <p className="text-[9px] text-neutral-600 font-bold leading-tight">Appareil photo</p>
                      </div>

                      <div className="p-2 bg-[#FFB800]/20 border border-black rounded-lg space-y-1">
                        <span className="w-5 h-5 rounded-full bg-[#FFB800] border border-black text-black font-black text-[9px] flex items-center justify-center">2</span>
                        <p className="text-[10px] font-black text-black">2. Ajouter</p>
                        <p className="text-[9px] text-neutral-600 font-bold leading-tight">Écran d'accueil</p>
                      </div>

                      <div className="p-2 bg-green-50 border border-black rounded-lg space-y-1">
                        <span className="w-5 h-5 rounded-full bg-[#00F59B] border border-black text-black font-black text-[9px] flex items-center justify-center">3</span>
                        <p className="text-[10px] font-black text-black">3. Gagner</p>
                        <p className="text-[9px] text-neutral-600 font-bold leading-tight">Tampons & Cadeaux</p>
                      </div>
                    </div>

                    {/* WiFi credentials */}
                    {flyerShowWifi && (
                      <div className="p-2.5 bg-amber-50 border-2 border-black rounded-xl text-xs font-black flex items-center justify-around">
                        <div>📶 Wi-Fi : <span className="font-bold">{flyerWifiName}</span></div>
                        <div>🔑 Code : <span className="font-mono">{flyerWifiPass || 'Non requis'}</span></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posters' && (
            /* ── ONGLET 3 : AFFICHES A4 PRÊTES À L'EMPLOI ── */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Template Selection */}
              <div className="space-y-6">
                <div className="neo-box p-6 sm:p-8 bg-white space-y-6">
                  <div>
                    <h2 className="font-black text-xl uppercase tracking-tight text-black flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      <span>{t('qr_posters_tab', 'Affiches Prêtes à Imprimer (A4)')}</span>
                    </h2>
                    <p className="text-xs text-neutral-600 font-bold mt-1">
                      Sélectionnez un modèle d'affiche haute définition pour imprimer et afficher dans votre restaurant.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    {TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => setSelectedTemplateId(tpl.id)}
                        className={`relative aspect-[1/1.4] rounded-xl overflow-hidden border-4 transition-all ${
                          selectedTemplateId === tpl.id 
                            ? 'border-[#00F59B] shadow-[4px_4px_0px_0px_#00F59B]' 
                            : 'border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]'
                        }`}
                      >
                        <img src={tpl.src} alt={tpl.name} className="w-full h-full object-cover" />
                        {selectedTemplateId === tpl.id && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-[#00F59B] border-2 border-black rounded-full flex items-center justify-center shadow-sm">
                            <Check className="w-4 h-4 text-black" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-2 text-white text-xs font-bold text-center">
                          {tpl.name}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-6 border-t-4 border-black/10 flex flex-col sm:flex-row items-center gap-4">
                    <button 
                      onClick={() => window.print()}
                      className="neo-pill-btn bg-[#FFB800] text-black px-8 py-3 text-sm flex items-center gap-2 flex-1 justify-center shadow-[3px_3px_0px_0px_#000]"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{t('print_poster', 'Imprimer l\'Affiche A4')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Preview */}
              <div className="neo-box p-6 bg-neutral-100 flex items-center justify-center min-h-[600px] relative overflow-hidden">
                <div className="absolute top-4 left-4 bg-black text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest z-10 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                  {t('preview', 'Aperçu')}
                </div>
                
                <div className="relative w-full max-w-sm aspect-[1/1.414] bg-white shadow-2xl border-4 border-black overflow-hidden" style={{ transform: 'scale(0.95)' }}>
                  <img 
                    src={selectedTemplate.src} 
                    alt="Preview Background" 
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                  <div 
                    className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                    style={{ 
                      top: selectedTemplate.qrConfig.top, 
                      width: selectedTemplate.qrConfig.width,
                      aspectRatio: '1 / 1'
                    }}
                  >
                    {menuUrl ? (
                      <div 
                        className="p-[4%] w-full h-full flex items-center justify-center shadow-md transition-all duration-200" 
                        style={{ 
                          backgroundColor: selectedTemplate.qrConfig.bgColor, 
                          borderRadius: selectedTemplate.qrConfig.borderRadius 
                        }}
                      >
                        <QRCodeSVG 
                          value={menuUrl} 
                          style={{ width: '100%', height: '100%' }}
                          fgColor={fgColor}
                          bgColor={bgColor}
                          level="H"
                          imageSettings={logoChoice !== 'none' ? {
                            src: logoChoice === 'menufid' ? '/icon.svg' : (merchant?.logo_url || '/icon.svg'),
                            height: Math.round((36 * logoSizePercent) / 22),
                            width: Math.round((36 * logoSizePercent) / 22),
                            excavate: true,
                          } : undefined}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-white/50 backdrop-blur-sm border-2 border-dashed border-black/20 flex items-center justify-center rounded-2xl">
                        <Spinner size={24} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <ProBottomNav />
      </div>
    </>
  );
}
