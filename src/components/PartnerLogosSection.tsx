'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';

interface PartnerMerchant {
  id: string;
  business_name: string;
  slug: string;
  logo_url?: string | null;
}

const DEFAULT_PARTNERS: PartnerMerchant[] = [
  { id: 'p1', business_name: 'Le Gourmet Parisien', slug: 'le-gourmet-parisien', logo_url: null },
  { id: 'p2', business_name: "L'Olivier d'Alger", slug: 'lolivier-dalger', logo_url: null },
  { id: 'p3', business_name: 'Sakura Sushi Bar', slug: 'sakura-sushi', logo_url: null },
  { id: 'p4', business_name: 'Casa Della Pizza', slug: 'casa-della-pizza', logo_url: null },
  { id: 'p5', business_name: 'Le Comptoir Burger', slug: 'le-comptoir-burger', logo_url: null },
  { id: 'p6', business_name: 'Atlas Grill & Lounge', slug: 'atlas-grill', logo_url: null },
  { id: 'p7', business_name: 'Café des Délices', slug: 'cafe-des-delices', logo_url: null },
  { id: 'p8', business_name: 'Bosphore Berliner', slug: 'bosphore-berliner', logo_url: null },
];

export default function PartnerLogosSection() {
  const { t, dir } = useLanguage();
  const [partners, setPartners] = useState<PartnerMerchant[]>(DEFAULT_PARTNERS);

  useEffect(() => {
    async function fetchPartners() {
      try {
        const { data, error } = await supabase
          .from('merchants')
          .select('id, business_name, slug, logo_url')
          .eq('is_suspended', false)
          .not('logo_url', 'is', null)
          .limit(12);

        if (!error && data && data.length > 0) {
          const dbList = data.map((m: any) => ({
            id: m.id,
            business_name: m.business_name || 'Restaurant',
            slug: m.slug || '',
            logo_url: m.logo_url,
          }));

          const combined = dbList.length >= 6 
            ? dbList 
            : [...dbList, ...DEFAULT_PARTNERS.slice(0, 8 - dbList.length)];
          setPartners(combined);
        }
      } catch {
        // Fallback silently to DEFAULT_PARTNERS
      }
    }

    fetchPartners();
  }, []);

  // Dupliquer la liste pour un défilement infini sans coupure
  const marqueeList = [...partners, ...partners];

  return (
    <section className="py-10 sm:py-14 w-full overflow-hidden" dir={dir}>
      <div className="max-w-6xl mx-auto px-4 text-center mb-6">
        <p className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-neutral-400">
          {t('partners_bar_title', 'Ils propulsent leur carte & fidélité avec MenuFid')}
        </p>
      </div>

      {/* Barre Défilante Automatique (Auto-Scroll Marquee Infini) */}
      <div className="w-full relative mask-edge-fade select-none">
        <div className="animate-marquee-infinite items-center gap-6 sm:gap-10 py-3">
          {marqueeList.map((partner, index) => {
            const hasRealLogo = !!partner.logo_url;
            return (
              <Link
                key={`${partner.id}-${index}`}
                href={partner.slug ? `/menu/${partner.slug}` : '#'}
                title={partner.business_name}
                className="group flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border-2 border-black/10 hover:border-black shadow-sm hover:shadow-[3px_3px_0px_0px_#000] transition-all duration-200 shrink-0"
              >
                {hasRealLogo ? (
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-neutral-50 flex items-center justify-center shrink-0">
                    <img
                      src={partner.logo_url!}
                      alt={partner.business_name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#FFB800] border border-black/10 text-black font-black flex items-center justify-center text-xs sm:text-sm shrink-0 shadow-inner">
                    {partner.business_name.substring(0, 2).toUpperCase()}
                  </div>
                )}

                <span className="text-xs sm:text-sm font-bold text-neutral-800 group-hover:text-black whitespace-nowrap">
                  {partner.business_name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
