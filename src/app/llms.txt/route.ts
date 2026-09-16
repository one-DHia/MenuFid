import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  const content = `# MenuFid — Plateforme SaaS de Menu QR Code Interactif & Carte de Fidélité

> MenuFid (https://www.menufid.site) est la plateforme SaaS et PWA N°1 pour la digitalisation de menus QR code interactifs et de cartes de fidélité mobile 10 tampons pour restaurants, fast-foods et cafés.

## Documentation & Pages Clés

- [Accueil MenuFid](https://www.menufid.site/): Présentation de la plateforme et démo interactive.
- [Tarifs & Abonnements](https://www.menufid.site/pricing): Formule mensuelle (39 €/mois) et formule annuelle (390 €/an avec 2 mois offerts).
- [Portail Distributeurs](https://www.menufid.site/distribution): Programme de partenariat et console pour distributeurs régionaux.
- [Portefeuille Client Wallet](https://www.menufid.site/wallet): Espace client pour stocker ses cartes de fidélité 10 tampons.
- [Espace Pro Inscription](https://www.menufid.site/pro/register): Inscription et essai gratuit 14 jours pour les restaurateurs.
- [Espace Pro Connexion](https://www.menufid.site/pro/login): Connexion au tableau de bord de gestion du restaurant.
- [Conditions Générales d'Utilisation](https://www.menufid.site/terms): Conditions contractuelles et d'utilisation.
- [Politique de Confidentialité](https://www.menufid.site/privacy): Protection des données et conformité RGPD.

## Fonctionnalités Principales

- [Éditeur de Menu Digital](https://www.menufid.site/pro/menu): Gestion des catégories, plats, allergènes et disponibilité en direct.
- [Traduction par IA Google Gemini](https://www.menufid.site/pro/menu): Traduction automatique instantanée en Français, Arabe et Anglais.
- [Carte de Fidélité 10 Tampons](https://www.menufid.site/pro/loyalty): Programme de récompenses sans application mobile à installer.
- [Scanner de Caisse](https://www.menufid.site/pro/scanner): Tamponnage instantané des cartes clients via caméra ou saisie rapide.
- [Générateur de QR Code HD](https://www.menufid.site/pro/qr): Création et téléchargement de QR codes pour chevalets de table.
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
