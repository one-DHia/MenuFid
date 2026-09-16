import type { Metadata } from 'next';
import CustomerMenu from '@/components/CustomerMenu';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface PageProps {
  params: Promise<{ merchantSlug: string }>;
}

export const revalidate = 60; // Cache on edge for 60 seconds (with on-demand invalidation)

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { merchantSlug } = await params;
  
  let businessName = 'Restaurant';
  let city = '';
  let country = '';
  let logoUrl = '';

  try {
    const { data: merchant } = await supabaseAdmin
      .from('merchants')
      .select('business_name, city, country, logo_url')
      .eq('slug', merchantSlug)
      .maybeSingle();

    if (merchant) {
      businessName = merchant.business_name || 'Restaurant';
      city = merchant.city || '';
      country = merchant.country || '';
      logoUrl = merchant.logo_url || '';
    }
  } catch (e) {
    console.warn('[Metadata fetch error]:', e);
  }

  const location = [city, country].filter(Boolean).join(', ');
  const title = `${businessName} - Menu Digital & Carte Gourmande`;
  const description = `Consultez le menu digital de ${businessName}${location ? ` (${location})` : ''}. Découvrez nos plats, spécialités, tarifs et carte de fidélité.`;
  const pageUrl = `https://www.menufid.site/menu/${encodeURIComponent(merchantSlug)}`;
  const ogImageUrl = `https://www.menufid.site/api/og/menu?slug=${encodeURIComponent(merchantSlug)}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'MenuFid',
      images: [
        {
          url: ogImageUrl,
          secureUrl: ogImageUrl,
          width: 1200,
          height: 630,
          type: 'image/png',
          alt: `${businessName} - Menu Digital`,
        },
      ],
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    other: {
      'geo.region': country === 'France' ? 'FR' : 'DZ',
      'geo.placename': location || 'Algérie',
      'robots': 'index, follow, max-image-preview:large',
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { merchantSlug } = await params;

  let merchantData: any = null;
  let sections: any[] = [];

  try {
    const { data: merchant } = await supabaseAdmin
      .from('merchants')
      .select('id, business_name, slug, city, country, logo_url, google_maps_url')
      .eq('slug', merchantSlug)
      .maybeSingle();

    if (merchant) {
      merchantData = merchant;

      const { data: categories } = await supabaseAdmin
        .from('categories')
        .select('id, name')
        .eq('merchant_id', merchant.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      const { data: menuItems } = await supabaseAdmin
        .from('menu_items')
        .select('name, description, price, image_url, category_id, dietary_tags')
        .eq('merchant_id', merchant.id)
        .eq('is_available', true);

      if (categories && menuItems) {
        sections = categories.map((cat) => {
          const items = menuItems.filter((i) => i.category_id === cat.id);
          return {
            '@type': 'MenuSection',
            name: cat.name,
            hasMenuItem: items.map((item) => ({
              '@type': 'MenuItem',
              name: item.name,
              description: item.description || undefined,
              image: item.image_url || undefined,
              offers: {
                '@type': 'Offer',
                price: item.price,
                priceCurrency: merchantData?.currency || 'EUR',
                availability: 'https://schema.org/InStock',
              },
            })),
          };
        });
      }
    }
  } catch (err) {
    console.error('[Schema.org Generation Error]:', err);
  }

  const jsonLd = merchantData ? {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: merchantData.business_name,
    image: merchantData.logo_url || 'https://www.menufid.site/og-image.png',
    url: `https://www.menufid.site/menu/${encodeURIComponent(merchantSlug)}`,
    hasMenu: {
      '@type': 'Menu',
      name: `Menu Digital - ${merchantData.business_name}`,
      url: `https://www.menufid.site/menu/${encodeURIComponent(merchantSlug)}`,
      hasMenuSection: sections,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: merchantData.city || 'Algérie',
      addressCountry: merchantData.country || 'DZ',
    },
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <CustomerMenu slug={merchantSlug} />
    </>
  );
}
