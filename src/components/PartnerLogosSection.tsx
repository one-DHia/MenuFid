'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';
import { Store, ShieldCheck, ArrowUpRight, Utensils, Award } from 'lucide-react';

interface PartnerMerchant {
  id: string;
  business_name: string;
  slug: string;
  logo_url?: string | null;
  city?: string | null;
  category_name?: string;
}

const DEFAULT_PARTNERS: PartnerMerchant[] = [
  {
    id: 'p1',
    business_name: 'Le Gourmet Parisien',
    slug: 'le-gourmet-parisien',
    logo_url: null,
    city: 'Paris',
    category_name: 'Bistrot Français',
  },
  {
    id: 'p2',
    business_name: "L'Olivier d'Alger",
    slug: 'lolivier-dalger',
    logo_url: null,
    city: 'Alger',
    category_name: 'Méditerranéen',
  },
  {
    id: 'p3',
    business_name: 'Sakura Sushi Bar',
    slug: 'sakura-sushi',
    logo_url: null,
    city: 'Lyon',
    category_name: 'Japonais & Fusion',
  },
  {
    id: 'p4',
    business_name: 'Casa Della Pizza',
    slug: 'casa-della-pizza',
    logo_url: null,
    city: 'Marseille',
    category_name: 'Pizzeria Napolitaine',
  },
  {
    id: 'p5',
    business_name: 'Le Comptoir Burger',
    slug: 'le-comptoir-burger',
    logo_url: null,
    city: 'Bordeaux',
    category_name: 'Burgers Gourmets',
  },
  {
    id: 'p6',
    business_name: 'Atlas Grill & Lounge',
    slug: 'atlas-grill',
    logo_url: null,
    city: 'Oran',
    category_name: 'Grillades & Rôtisserie',
  },
  {
    id: 'p7',
    business_name: 'Café des Délices',
    slug: 'cafe-des-delices',
    logo_url: null,
    city: 'Nice',
    category_name: 'Salon de Thé & Brunch',
  },
];

export default function PartnerLogosSection() {
  const { t, dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const [partners, setPartners] = useState<PartnerMerchant[]>(DEFAULT_PARTNERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPartners() {
      try {
        const { data, error } = await supabase
          .from('merchants')
          .select('id, business_name, slug, logo_url, city')
          .eq('is_suspended', false)
          .limit(7);

        if (!error && data && data.length > 0) {
          // If we have DB restaurants, combine with defaults to always provide up to 7
          const dbList = data.map((m: any) => ({
            id: m.id,
            business_name: m.business_name || 'Restaurant Partenaire',
            slug: m.slug || '',
            logo_url: m.logo_url,
            city: m.city || 'Paris',
            category_name: 'Partenaire MenuFid',
          }));

          const remainingSlots = 7 - dbList.length;
          const combined = remainingSlots > 0
            ? [...dbList, ...DEFAULT_PARTNERS.slice(0, remainingSlots)]
            : dbList.slice(0, 7);

          setPartners(combined);
        }
      } catch {
        // Keep DEFAULT_PARTNERS on error
      } finally {
        setLoading(false);
      }
    }

    fetchPartners();
  }, []);

  // Limit strictly to 7
  const displayPartners = partners.slice(0, 7);

  return (
    <section className="py-20 px-4 max-w-6xl mx-auto border-t-2 border-black" dir={dir}>
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 neo-badge-yellow mb-3">
          <Award className="w-4 h-4 text-black" />
          <span>{t('partners_badge', 'Ils nous font confiance')}</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black mt-2">
          {t('partners_title', 'Plus de 500+ restaurants propulsés par MenuFid')}
        </h2>
        <p className="text-neutral-600 text-xs sm:text-sm font-medium mt-3">
          {t(
            'partners_subtitle',
            'Découvrez quelques-uns des établissements qui fidélisent leurs clients et livrent en direct avec zéro commission.'
          )}
        </p>
      </div>

      {/* Grid of up to 7 restaurant partner logos/cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {displayPartners.map((partner, index) => {
          const isFeatured = index === 0;
          return (
            <Link
              key={partner.id || index}
              href={partner.slug ? `/menu/${partner.slug}` : '#'}
              className={`group neo-box neo-box-hover p-4 sm:p-5 flex flex-col justify-between transition-all bg-white hover:bg-neutral-50 ${
                isFeatured ? 'col-span-2 sm:col-span-1 bg-amber-50/50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                {partner.logo_url ? (
                  <div className="w-12 h-12 rounded-xl border-2 border-black overflow-hidden bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                    <img
                      src={partner.logo_url}
                      alt={partner.business_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#FFB800] border-2 border-black text-black font-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-base">
                    {partner.business_name.substring(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="flex items-center gap-1 bg-neutral-100 border border-black rounded-full px-2 py-0.5 text-[10px] font-black text-neutral-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{t('verified_partner', 'Vérifié')}</span>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-black group-hover:text-neutral-800 line-clamp-1">
                  {partner.business_name}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500 font-bold">
                  <span>{partner.city || 'France'}</span>
                  <span>•</span>
                  <span className="text-neutral-700">{partner.category_name || 'Restaurant'}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between text-xs font-black text-black group-hover:text-[#FFB800]">
                <span className="text-[11px] font-bold text-neutral-600">{t('view_menu', 'Voir la carte')}</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Trust Stat Bar */}
      <div className="mt-10 p-4 sm:p-6 neo-box bg-white flex flex-wrap items-center justify-around gap-4 text-center">
        <div>
          <div className="text-xl sm:text-2xl font-black text-black">100%</div>
          <div className="text-[11px] font-extrabold uppercase text-neutral-500 tracking-wider">
            {t('metric_direct_payout', 'Encaissement Direct')}
          </div>
        </div>
        <div className="h-8 w-[2px] bg-black hidden sm:block" />
        <div>
          <div className="text-xl sm:text-2xl font-black text-[#00F59B] bg-black px-2 py-0.5 rounded">
            0%
          </div>
          <div className="text-[11px] font-extrabold uppercase text-neutral-500 tracking-wider mt-1">
            {t('metric_zero_commission', 'Commission sur vos Ventes')}
          </div>
        </div>
        <div className="h-8 w-[2px] bg-black hidden sm:block" />
        <div>
          <div className="text-xl sm:text-2xl font-black text-black">4.9 / 5</div>
          <div className="text-[11px] font-extrabold uppercase text-neutral-500 tracking-wider">
            {t('metric_satisfaction', 'Satisfaction Restaurateurs')}
          </div>
        </div>
      </div>
    </section>
  );
}
