/**
 * types/index.ts
 * ─────────────────────────────────────────────────────────────
 * Source unique de vérité pour tous les types partagés du projet (v2.0).
 * Importer depuis '@/types' dans chaque fichier.
 */

export * from '@/lib/types/database';
export * from '@/lib/currency';
import type { MenuItemOption } from '@/lib/types/database';

export type MenuMode = 'interactive' | 'pdf';

export const DIETARY_TAGS = [
  { id: 'halal', label: 'Halal 🌙' },
  { id: 'veggie', label: 'Végétarien 🥦' },
  { id: 'vegan', label: 'Végan 🌿' },
  { id: 'gluten-free', label: 'Sans Gluten 🌾' },
  { id: 'lactose-free', label: 'Sans Lactose 🥛' },
  { id: 'kasher', label: 'Cascher ✡️' },
  { id: 'spicy', label: 'Épicé 🌶️' },
] as const;

export interface PluginsConfig {
  ai_translation?: boolean;
  currency_converter?: boolean;
  allergen_filter?: boolean;
  theme_mode?: string;
  [key: string]: any;
}

export interface MenuTheme {
  templateId: 'minimalist' | 'grid' | 'cards';
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: 'serif' | 'sans' | 'mono';
  cardStyle: string;
  [key: string]: any;
}

export interface CartItem {
  id?: string;
  item: any;
  quantity: number;
  selectedOptions?: MenuItemOption[];
  selectedExtras?: string[] | MenuItemOption[];
  priceTotal: number;
}

export function hasLoyalty(tier: string): boolean {
  return tier === 'loyalty' || tier === 'premium' || tier === 'delivery';
}

export function hasPremium(tier: string): boolean {
  return tier === 'premium';
}

export function hasDelivery(tier: string): boolean {
  return tier === 'delivery' || tier === 'premium';
}
