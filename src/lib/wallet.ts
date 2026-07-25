/**
 * lib/wallet.ts
 * ─────────────────────────────────────────────────────────────
 * Utilitaire pour générer des passes Apple Wallet et Google Wallet
 * via l'API PassKit (ou un mock en développement).
 *
 * Configuration production :
 *   1. Créer un compte sur passkit.com
 *   2. Ajouter dans .env.local :
 *      PASSKIT_API_KEY=your_key
 *      PASSKIT_CAMPAIGN_ID=your_campaign_id
 *   3. Le mock est automatiquement désactivé si PASSKIT_API_KEY est défini.
 */

export interface WalletPassUrls {
  appleWalletUrl: string;
  googleWalletUrl: string;
}

/**
 * Génère les URLs de passes wallet pour un client fidélité.
 * En mode développement (pas de clé API), retourne des URLs simulées.
 */
export async function generateWalletPass(
  customerId: string,
  customerName: string,
  merchantName: string,
  currentPoints: number
): Promise<WalletPassUrls> {
  const apiKey = process.env.PASSKIT_API_KEY;
  const isMockMode = !apiKey || apiKey === 'mock-passkit-api-key';

  if (isMockMode) {
    return buildMockUrls(customerId);
  }

  try {
    const response = await fetch('https://api.pub.passkit.io/v1/passes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        campaignId: process.env.PASSKIT_CAMPAIGN_ID,
        members: [
          {
            id: customerId,
            displayName: customerName,
            points: currentPoints,
            meta: { merchant: merchantName },
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`PassKit API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      appleWalletUrl: data.appleWalletUrl,
      googleWalletUrl: data.googleWalletUrl,
    };
  } catch (error) {
    console.error('[Wallet] Échec de la génération du pass:', error);
    // Fallback gracieux : ne pas bloquer l'UX
    return buildMockUrls(customerId);
  }
}

/** Construit des URLs de prévisualisation pour le mode développement */
function buildMockUrls(customerId: string): WalletPassUrls {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? 'https://menufid.com';

  return {
    appleWalletUrl: `${origin}/loyalty/pass/preview?platform=apple&customer=${customerId}`,
    googleWalletUrl: `${origin}/loyalty/pass/preview?platform=google&customer=${customerId}`,
  };
}
