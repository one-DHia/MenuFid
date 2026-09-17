/**
 * lib/types/database.ts
 * ─────────────────────────────────────────────────────────────
 * Définitions TypeScript strictes v2.0 des tables Supabase (Tri-Portal Architecture).
 */

export type PlanTier = 'freemium' | 'basic' | 'loyalty' | 'delivery' | 'premium';
export type PlanStatus = 'active' | 'trialing' | 'past_due' | 'canceled';
export type LicenseType = 'recurring' | 'lifetime' | 'free';
export type DeliveryPaymentMode = 'cash_on_delivery' | 'online_only' | 'both';

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'in_delivery' | 'delivered' | 'rejected' | 'canceled';
export type PaymentStatus = 'pending' | 'paid' | 'cash_on_delivery' | 'refunded';
export type OrderType = 'delivery' | 'takeaway' | 'dine_in';

export interface OrderItem {
  item_id: string;
  name: string;
  price: number;
  quantity: number;
  options?: MenuItemOption[];
  notes?: string;
}

export interface Order {
  id: string;
  merchant_id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  customer_address?: string | null;
  delivery_notes?: string | null;
  order_type: OrderType;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  currency: string;
  payment_method: 'cash_on_delivery' | 'stripe' | 'card_online';
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  assigned_driver_id?: string | null;
  points_awarded?: boolean;
  driver_cash_collected?: boolean;
  tracking_token?: string;
  stripe_payment_intent_id?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface DeliveryDriver {
  id: string;
  merchant_id: string;
  name: string;
  username: string;
  phone?: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface RestaurantReview {
  id: string;
  merchant_id?: string | null;
  restaurant_name: string;
  owner_name?: string | null;
  city?: string | null;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export interface Distributor {
  id: string;
  user_id?: string | null;
  name: string;
  email: string;
  code: string;
  city?: string | null;
  country?: string | null;
  commission_rate: number;
  created_at: string;
}

export interface Merchant {
  id: string;
  distributor_id?: string | null;
  business_name: string;
  slug: string;
  short_code?: string;
  city?: string | null;
  country?: string | null;
  plan_tier: PlanTier;
  plan_status?: PlanStatus;
  license_type?: LicenseType;
  is_suspended?: boolean;
  monthly_price?: number;
  primary_color: string;
  currency?: string;
  logo_url?: string | null;
  google_review_url?: string | null;
  pdf_menu_url?: string | null;
  google_maps_url?: string | null;
  instagram_url?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  email?: string;
  scan_count?: number;
  demo_start?: string | null;
  demo_end?: string | null;
  subscription_expires_at?: string | null;
  deactivated_at?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  payment_method?: 'stripe' | 'manual' | 'distributor' | null;
  delivery_payment_mode?: DeliveryPaymentMode;
  min_order_amount?: number;
  delivery_fee?: number;
  delivery_hours?: string | null;
  orders_paused?: boolean;
  stripe_connect_account_id?: string | null;
  created_at?: string;
}

export interface Category {
  id: string;
  merchant_id?: string;
  merchant?: string;
  name: string;
  display_order: number;
  is_active: boolean;
  image_url?: string | null;
  created_at?: string;
}

export interface MenuItemOption {
  title: string;
  price: number;
}

export interface MenuItem {
  id: string;
  merchant_id?: string;
  merchant?: string;
  category_id: string;
  category?: string;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  allergens?: string[];
  dietary_tags?: string[];
  options?: MenuItemOption[];
  is_available: boolean;
  is_featured?: boolean;
  created_at?: string;
}

export interface Reward {
  id: string;
  merchant_id: string;
  title: string;
  description?: string | null;
  stamps_required: number;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  phone: string;
  full_name?: string | null;
  email?: string | null;
  loyalty_code?: string;
  created_at: string;
}

export interface LoyaltyCard {
  id: string;
  customer_id: string;
  merchant_id: string;
  stamps_count: number;
  total_visits: number;
  last_visit_at: string;
  created_at: string;
}

export interface StampTransaction {
  id: string;
  loyalty_card_id: string;
  merchant_id: string;
  stamps_change: number;
  reward_id?: string | null;
  note?: string | null;
  created_at: string;
}

export interface DistributorRevenueSummary {
  distributor_id: string;
  distributor_name: string;
  distributor_email: string;
  distributor_city?: string | null;
  distributor_country?: string | null;
  commission_rate: number;
  total_merchants: number;
  active_merchants: number;
  basic_count: number;
  loyalty_count: number;
  premium_count: number;
  total_monthly_revenue: number;
  total_distributor_commission: number;
}
