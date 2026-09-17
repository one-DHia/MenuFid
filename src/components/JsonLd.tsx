import React from 'react';

export function JsonLd() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://www.menufid.site/#software',
        name: 'MenuFid',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'All (Web, iOS, Android, PWA)',
        offers: [
          {
            '@type': 'Offer',
            name: 'Formule Essentiel MenuFid (3 mois offerts)',
            price: '3.99',
            priceCurrency: 'EUR',
            priceValidUntil: '2028-12-31',
            availability: 'https://schema.org/InStock',
            description: 'Menu digital interactif QR code jusqu\'à 100 plats, 3 mois offerts puis 3,99 €/mois (ou 1 000 DA/mois).',
          },
          {
            '@type': 'Offer',
            name: 'Formule PRO MenuFid (3 mois offerts)',
            price: '39.00',
            priceCurrency: 'EUR',
            priceValidUntil: '2028-12-31',
            availability: 'https://schema.org/InStock',
            description: 'Solution complète : commandes en ligne 0% commission, carte de fidélité 10 tampons, 3 mois offerts puis 39 €/mois (ou 3 900 DA/mois).',
          },
          {
            '@type': 'Offer',
            name: 'Licence Complète à Vie MenuFid (One-Shot)',
            price: '490.00',
            priceCurrency: 'EUR',
            priceValidUntil: '2028-12-31',
            availability: 'https://schema.org/InStock',
            description: 'Accès PRO illimité à vie avec toutes les futures mises à jour incluses, en paiement unique à 490 € (ou 49 000 DA).',
          },
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.95',
          ratingCount: '280',
          bestRating: '5',
          worstRating: '1',
        },
        description: 'Solution N°1 de digitalisation de menus QR code interactifs et de cartes de fidélité mobile pour restaurants en Algérie et à l\'international.',
      },
      {
        '@type': 'Organization',
        '@id': 'https://www.menufid.site/#organization',
        name: 'MenuFid',
        url: 'https://www.menufid.site',
        logo: 'https://www.menufid.site/icon.svg',
        areaServed: [
          { '@type': 'Country', name: 'DZ', alternateName: 'Algérie' },
          { '@type': 'Country', name: 'FR', alternateName: 'France' },
          { '@type': 'Country', name: 'TN', alternateName: 'Tunisie' },
          { '@type': 'Country', name: 'MA', alternateName: 'Maroc' },
          { '@type': 'Country', name: 'AE', alternateName: 'Émirats arabes unis' },
        ],
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'DZ',
          addressLocality: 'Alger',
        },
        sameAs: [
          'https://www.instagram.com/menu.fid?igsi=ZDNlZDc0MzIxNw==',
          'https://wa.me/33766518278',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          telephone: '+33766518278',
          email: 'support@menufid.site',
          availableLanguage: ['French', 'Arabic', 'English'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.menufid.site/#website',
        url: 'https://www.menufid.site',
        name: 'MenuFid - Menu Digital & Fidélité Restaurant',
        description: 'Créez votre menu digital QR code interactif et fidélisez vos clients de restaurant en 1 clic.',
        inLanguage: ['fr', 'ar', 'en'],
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.menufid.site/menu/{search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://www.menufid.site/#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Comment MenuFid augmente le chiffre d\'affaires de mon restaurant ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'MenuFid digitalise votre carte avec des photos gourmandes HD et intègre une carte de fidélité 10 tampons. Les clients reviennent 2x plus souvent pour débloquer leurs récompenses.',
            },
          },
          {
            '@type': 'Question',
            name: 'Les clients doivent-ils installer une application pour voir le menu ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Non, aucune application n\'est requise. Les clients scannent simplement le QR code de table avec l\'appareil photo de leur téléphone pour accéder instantanément au menu.',
            },
          },
          {
            '@type': 'Question',
            name: 'Combien coûte l\'abonnement MenuFid ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'La formule Essentiel démarre avec 3 mois offerts puis 3,99 € / mois (ou 1 000 DA / mois). La formule PRO est à 39 € / mois (ou 3 900 DA / mois) avec 3 mois offerts. Une Licence Complète à Vie est également disponible à 490 € (ou 49 000 DA) en paiement unique.',
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
