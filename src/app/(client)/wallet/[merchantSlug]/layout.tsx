import type { Metadata } from 'next';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ merchantSlug: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ merchantSlug: string }> }): Promise<Metadata> {
  const { merchantSlug } = await params;
  
  let businessName = 'Restaurant';
  let city = '';
  let country = '';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/merchants?slug=eq.${encodeURIComponent(merchantSlug)}&select=business_name,city,country,logo_url`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          cache: 'no-store',
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data[0]) {
          businessName = data[0].business_name || 'Restaurant';
          city = data[0].city || '';
          country = data[0].country || '';
        }
      }
    } catch (e) {
      console.warn('[Wallet metadata fetch error]:', e);
    }
  }

  const location = [city, country].filter(Boolean).join(', ');
  const title = `Carte de Fidélité - ${businessName}`;
  const description = `Rejoignez le programme de fidélité digital de ${businessName}${location ? ` (${location})` : ''}. Cumulez des tampons et débloquez des cadeaux exclusifs !`;
  const pageUrl = `https://www.menufid.site/wallet/${encodeURIComponent(merchantSlug)}`;
  const ogImageUrl = `https://www.menufid.site/api/og/menu?slug=${encodeURIComponent(merchantSlug)}`;

  return {
    title,
    description,
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
          alt: `Carte de Fidélité ${businessName}`,
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
  };
}

export default function WalletLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
