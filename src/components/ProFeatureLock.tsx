'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface ProFeatureLockProps {
  featureName: string;
  featureDesc?: string;
  icon?: React.ReactNode;
}

export default function ProFeatureLock({ featureName, featureDesc, icon }: ProFeatureLockProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full neo-box p-6 sm:p-8 bg-white text-center space-y-6 relative overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_#000] rounded-3xl">
        {/* Top badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFB800] border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000]">
          <Lock className="w-3.5 h-3.5 text-black" />
          <span>{t('plan_pro_required_badge', 'Abonnement PRO Requis')}</span>
        </div>

        {/* Icon */}
        <div className="w-20 h-20 mx-auto rounded-2xl bg-[#FFFBEB] border-3 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
          {icon || <Lock className="w-10 h-10 text-black" />}
        </div>

        {/* Title and Description */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-black">
            {featureName}
          </h2>
          <p className="text-xs sm:text-sm font-bold text-neutral-600 leading-relaxed">
            {featureDesc || t('feature_locked_default_desc', "Votre abonnement Starter actuel comprend uniquement le Menu QR interactif. Pour débloquer la Carte de Fidélité, le Scanner Caissier et les Notifications clients, passez à la Formule PRO.")}
          </p>
        </div>

        {/* Features reminder list */}
        <div className="p-4 bg-neutral-50 rounded-2xl border-2 border-black text-left text-xs font-bold space-y-2 text-neutral-800">
          <div className="text-[11px] font-black uppercase text-black mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>{t('included_in_pro', 'Inclus dans la formule PRO (39 €/mois) :')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-black">✓</span>
            <span>{t('pro_feature_1', 'Carte de fidélité 10 tampons client')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-black">✓</span>
            <span>{t('pro_feature_2', 'Web Scanner de caisse pour créditer les tampons')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-black">✓</span>
            <span>{t('pro_feature_3', 'Envoi de notifications Web Push illimitées')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <Link
            href="/pricing"
            className="w-full neo-pill-btn-yellow py-3.5 px-4 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000]"
          >
            <span>{t('upgrade_to_pro_btn', 'Découvrir la Formule PRO')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/pro/dashboard"
            className="w-full neo-pill-btn-white py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back_to_dashboard_btn', 'Retour au tableau de bord')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
