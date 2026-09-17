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
  city?: string | null;
}

export default function PartnerLogosSection() {
  const { t, dir } = useLanguage();
  const [partners, setPartners] = useState<PartnerMerchant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRealPartners() {
      try {
        const { data, error } = await supabase
          .from('merchants')
          .select('id, business_name, slug, logo_url, city')
          .eq('is_suspended', false)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data && data.length > 0) {
          const realList: PartnerMerchant[] = data.map((m: any) => ({
            id: m.id,
            business_name: m.business_name || 'Restaurant',
            slug: m.slug || '',
            logo_url: m.logo_url || null,
            city: m.city || null,
          }));
          setPartners(realList);
        } else {
          setPartners([]);
        }
      } catch (err) {
        console.error('Error loading real partner merchants:', err);
        setPartners([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRealPartners();
  }, []);

  // Si aucun restaurant réel n'est encore enregistré, ne rien afficher d'inventé
  if (loading || partners.length === 0) {
    return null;
  }

  // Répéter la liste des vrais restaurants pour assurer un défilement infini continu
  const repeatCount = Math.max(2, Math.ceil(12 / partners.length));
  const marqueeList = Array(repeatCount).fill(partners).flat();

  return (
    <section className="py-10 sm:py-14 w-full overflow-hidden" dir={dir}>
      <div className="max-w-6xl mx-auto px-4 text-center mb-6">
        <p className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-neutral-400">
          {t('partners_bar_title', 'Ils propulsent leur carte & fidélité avec MenuFid')}
        </p>
      </div>

      {/* Barre Défilante Automatique (Auto-Scroll Marquee Infini) - 100% Real Data */}
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
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-neutral-50 flex items-center justify-center shrink-0 border border-black/10">
                    <img
                      src={partner.logo_url!}
                      alt={partner.business_name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#FFB800] border border-black/20 text-black font-black flex items-center justify-center text-xs sm:text-sm shrink-0 shadow-inner">
                    {partner.business_name.substring(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="flex flex-col text-left">
                  <span className="text-xs sm:text-sm font-bold text-neutral-800 group-hover:text-black whitespace-nowrap">
                    {partner.business_name}
                  </span>
                  {partner.city && (
                    <span className="text-[10px] text-neutral-400 font-bold capitalize">
                      {partner.city}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
