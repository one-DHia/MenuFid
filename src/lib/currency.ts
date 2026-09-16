/**
 * lib/currency.ts
 * ─────────────────────────────────────────────────────────────
 * Module centralisé de gestion et formatage des devises supportées par MenuFid.
 */

export type CurrencyCode = 'EUR' | 'USD' | 'DZD' | 'MAD' | 'TND' | 'SAR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  symbolAr: string;
  label: {
    fr: string;
    en: string;
    ar: string;
  };
  position: 'after' | 'before';
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  EUR: {
    code: 'EUR',
    symbol: '€',
    symbolAr: '€',
    label: {
      fr: 'Euro (€)',
      en: 'Euro (€)',
      ar: 'يورو (€)',
    },
    position: 'after',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    symbolAr: '$',
    label: {
      fr: 'Dollar ($)',
      en: 'Dollar ($)',
      ar: 'دولار ($)',
    },
    position: 'before',
  },
  DZD: {
    code: 'DZD',
    symbol: 'DZD',
    symbolAr: 'د.ج',
    label: {
      fr: 'DZD (Dinar Algérien)',
      en: 'DZD (Algerian Dinar)',
      ar: 'د.ج (دينار جزائري)',
    },
    position: 'after',
  },
  MAD: {
    code: 'MAD',
    symbol: 'DH',
    symbolAr: 'د.م',
    label: {
      fr: 'DH (Dirham)',
      en: 'DH (Dirham)',
      ar: 'د.م (درهم)',
    },
    position: 'after',
  },
  TND: {
    code: 'TND',
    symbol: 'DT',
    symbolAr: 'د.ت',
    label: {
      fr: 'DT (Dinar Tunisien)',
      en: 'DT (Tunisian Dinar)',
      ar: 'د.ت (دينار تونسي)',
    },
    position: 'after',
  },
  SAR: {
    code: 'SAR',
    symbol: 'SAR',
    symbolAr: 'ر.س',
    label: {
      fr: 'SAR (Riyal Saoudien)',
      en: 'SAR (Saudi Riyal)',
      ar: 'ر.س (ريال سعودي)',
    },
    position: 'after',
  },
};

export const CURRENCY_OPTIONS: CurrencyConfig[] = [
  SUPPORTED_CURRENCIES.EUR,
  SUPPORTED_CURRENCIES.USD,
  SUPPORTED_CURRENCIES.DZD,
  SUPPORTED_CURRENCIES.MAD,
  SUPPORTED_CURRENCIES.TND,
  SUPPORTED_CURRENCIES.SAR,
];

export const DEFAULT_CURRENCY: CurrencyCode = 'EUR';

/**
 * Normalise un code devise ou symbole en CurrencyCode standard.
 */
export function normalizeCurrency(currency?: string | null): CurrencyCode {
  if (!currency) return DEFAULT_CURRENCY;
  const c = currency.trim().toUpperCase();

  if (c === 'EUR' || c === '€' || c === 'EURO') return 'EUR';
  if (c === 'USD' || c === '$' || c === 'DOLLAR') return 'USD';
  if (c === 'DZD' || c === 'DA' || c === 'د.ج' || c === 'دج' || c === 'DINAR') return 'DZD';
  if (c === 'MAD' || c === 'DH' || c === 'DIRHAM' || c === 'د.م' || c === 'AED') return 'MAD';
  if (c === 'TND' || c === 'DT' || c === 'DINAR_TN' || c === 'د.ت') return 'TND';
  if (c === 'SAR' || c === 'RIYAL' || c === 'ر.س' || c === 'SAUDI') return 'SAR';

  return DEFAULT_CURRENCY;
}

/**
 * Récupère le symbole d'une devise selon la langue active.
 */
export function getCurrencySymbol(currency?: string | null, language: string = 'fr'): string {
  const code = normalizeCurrency(currency);
  const cfg = SUPPORTED_CURRENCIES[code] || SUPPORTED_CURRENCIES.EUR;
  return language === 'ar' ? cfg.symbolAr : cfg.symbol;
}

/**
 * Formate un montant avec le symbole et la position appropriés.
 */
export function formatPrice(
  price: number | string | null | undefined,
  currency?: string | null,
  language: string = 'fr'
): string {
  const num = typeof price === 'number' ? price : parseFloat(String(price || '0')) || 0;
  const code = normalizeCurrency(currency);
  const cfg = SUPPORTED_CURRENCIES[code] || SUPPORTED_CURRENCIES.EUR;
  const symbol = language === 'ar' ? cfg.symbolAr : cfg.symbol;

  // Formatage des décimales
  const formattedNum = num.toFixed(2);

  if (cfg.position === 'before' && language !== 'ar') {
    return `${symbol}${formattedNum}`;
  }
  return `${formattedNum} ${symbol}`;
}
