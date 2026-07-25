/**
 * types/index.ts
 * ─────────────────────────────────────────────────────────────
 * Source unique de vérité pour tous les types partagés du projet.
 * Importer depuis '@/types' dans chaque fichier.
 */

// ─── Plans d'abonnement ───────────────────────────────────────
export type PlanTier = 'basic' | 'loyalty' | 'premium';

// ─── Commerçant (utilisateur authentifié) ─────────────────────
export interface Merchant {
  id: string;
  email: string;
  business_name: string;
  slug: string;
  plan_tier: PlanTier;
  primary_color: string;
  logo_url?: string;
  google_review_url?: string; // URL fiche Google Maps pour Booster d'Avis 5 Étoiles
  pdf_menu_url?: string;      // URL du fichier PDF importé par le commerçant
  role?: string;              // 'admin' | 'merchant'
  created?: string;
}

// ─── Catégorie de menu ─────────────────────────────────────────
export interface Category {
  id: string;
  merchant: string; // FK vers Merchant.id
  name: string;
  display_order: number;
  is_active: boolean;
}

// ─── Plat / Article du menu ────────────────────────────────────
export interface MenuItem {
  id: string;
  merchant: string;       // FK vers Merchant.id
  category: string;       // FK vers Category.id (PocketBase)
  category_id: string;    // Alias utilisé en lecture (rétrocompat)
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  allergens?: string[];
  dietary_tags?: string[]; // Halal, Végétarien, Végan, Sans Gluten, Sans Lactose, Cascher, Épicé
  options?: MenuItemOption[];
  is_featured?: boolean;
  views_count?: number;    // Compteur de vues pour analytics top plats
}

// Régimes alimentaires et filtres disponibles
export const DIETARY_TAGS = [
  { id: 'halal', label: 'Halal 🌙' },
  { id: 'veggie', label: 'Végétarien 🥦' },
  { id: 'vegan', label: 'Végan 🌿' },
  { id: 'gluten-free', label: 'Sans Gluten 🌾' },
  { id: 'lactose-free', label: 'Sans Lactose 🥛' },
  { id: 'kasher', label: 'Cascher ✡️' },
  { id: 'spicy', label: 'Épicé 🌶️' },
] as const;

// Supplément / option d'un plat
export interface MenuItemOption {
  title: string;
  price: number;
}

// ─── Client fidélité ───────────────────────────────────────────
export interface Customer {
  id: string;
  merchant: string; // FK vers Merchant.id
  name: string;
  email: string;
  phone: string;
  points_balance: number;
  total_visits?: number;
  last_visit?: string;
  created?: string;
}

// ─── Offre de récompense ───────────────────────────────────────
export interface Reward {
  id: string;
  merchant: string; // FK vers Merchant.id
  title: string;
  points_required: number;
  description: string;
  is_active: boolean;
}

// ─── Visite (historique des points) ───────────────────────────
export interface Visit {
  id: string;
  merchant: string;
  customer: string;
  points_awarded: number;
  created: string;
}

// ─── Offre Flash / Campagne Marketing ─────────────────────────
export interface FlashCampaign {
  id: string;
  title: string;
  message: string;
  channel: 'email' | 'sms';
  sent_count: number;
  created_at: string;
}

// ─── Configuration des plugins ─────────────────────────────────
export interface PluginsConfig {
  id: string;
  merchant: string;
  allergens: boolean;
  options: boolean;
  featured: boolean;
}

// ─── Thème visuel de la carte client ──────────────────────────
export type FontFamily = 'serif' | 'sans' | 'mono';
export type CardStyle = 'flat' | 'bordered' | 'glass';
export type TemplateId = 'minimalist' | 'dark-red' | 'luxury-gold' | 'vibrant-orange';

export interface MenuTheme {
  id?: string;
  merchant?: string;
  templateId: TemplateId;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: FontFamily;
  cardStyle: CardStyle;
}

// ─── Panier (local, côté client uniquement) ────────────────────
export interface CartItem {
  id: string;           // Clé unique pour React (item.id + timestamp)
  item: MenuItem;
  selectedExtras: string[];
  quantity: number;
  priceTotal: number;
}

// ─── Helpers de type ───────────────────────────────────────────

/** Vérifie si un plan inclut le module fidélité */
export function hasLoyalty(tier: PlanTier): boolean {
  if (typeof window !== 'undefined') {
    const savedPlan = localStorage.getItem('menufid_plan_tier') as PlanTier | null;
    if (savedPlan) {
      return savedPlan === 'loyalty' || savedPlan === 'premium';
    }
  }
  return tier === 'loyalty' || tier === 'premium';
}
