-- ========================================================
-- MIGRATION : Système de Commande Directe, Livraison, 
-- Portail Livreur, Avis Restaurateurs, Licences & Devises
-- Tables: public.merchants, public.orders, public.delivery_drivers, public.restaurant_reviews
-- ========================================================

-- 1. Extension de la table merchants (Devise, Licences, Livraison)
ALTER TABLE public.merchants
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS license_type text DEFAULT 'recurring',
ADD COLUMN IF NOT EXISTS delivery_payment_mode text DEFAULT 'both',
ADD COLUMN IF NOT EXISTS min_order_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_hours text,
ADD COLUMN IF NOT EXISTS orders_paused boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_connect_account_id text;

COMMENT ON COLUMN public.merchants.currency IS 'Devise principale du restaurant: EUR (€) ou DZD (DA)';
COMMENT ON COLUMN public.merchants.license_type IS 'Type de licence: recurring (mensuel), lifetime (à vie one-shot), free (freemium)';
COMMENT ON COLUMN public.merchants.delivery_payment_mode IS 'Mode de paiement: cash_on_delivery, online_only, both';
COMMENT ON COLUMN public.merchants.min_order_amount IS 'Montant minimum requis pour valider une commande de livraison';
COMMENT ON COLUMN public.merchants.delivery_fee IS 'Frais ajoutés automatiquement pour la livraison';
COMMENT ON COLUMN public.merchants.delivery_hours IS 'Plages horaires d ouverture à la commande au format JSON';
COMMENT ON COLUMN public.merchants.orders_paused IS 'Bouton d urgence rush/pause pour suspendre les commandes';

-- 2. Création de la table delivery_drivers (Portail Livreur Mobile)
CREATE TABLE IF NOT EXISTS public.delivery_drivers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    name text NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    phone text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT unique_driver_username_per_merchant UNIQUE (merchant_id, username)
);

CREATE INDEX IF NOT EXISTS idx_delivery_drivers_merchant 
ON public.delivery_drivers (merchant_id, is_active);

-- 3. Création de la table orders
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    order_number text NOT NULL,
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    customer_email text,
    customer_address text,
    delivery_notes text,
    order_type text NOT NULL DEFAULT 'delivery',
    items jsonb NOT NULL DEFAULT '[]'::jsonb,
    subtotal numeric NOT NULL DEFAULT 0,
    delivery_fee numeric NOT NULL DEFAULT 0,
    total_amount numeric NOT NULL DEFAULT 0,
    currency text NOT NULL DEFAULT 'EUR',
    payment_method text NOT NULL DEFAULT 'cash_on_delivery',
    payment_status text NOT NULL DEFAULT 'pending',
    order_status text NOT NULL DEFAULT 'pending',
    assigned_driver_id uuid REFERENCES public.delivery_drivers(id) ON DELETE SET NULL,
    points_awarded boolean DEFAULT false,
    driver_cash_collected boolean DEFAULT false,
    tracking_token uuid DEFAULT gen_random_uuid(),
    stripe_payment_intent_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Extensions si la table existait déjà
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS assigned_driver_id uuid REFERENCES public.delivery_drivers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS points_awarded boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS driver_cash_collected boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tracking_token uuid DEFAULT gen_random_uuid();

-- Index pour requêtes rapides du tableau de bord et du portail livreur
CREATE INDEX IF NOT EXISTS idx_orders_merchant_status 
ON public.orders (merchant_id, order_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_driver 
ON public.orders (assigned_driver_id, order_status);

CREATE INDEX IF NOT EXISTS idx_orders_tracking 
ON public.orders (tracking_token);

CREATE INDEX IF NOT EXISTS idx_orders_created_at 
ON public.orders (created_at DESC);

-- 4. Création de la table restaurant_reviews (Avis & Commentaires Restaurateurs)
CREATE TABLE IF NOT EXISTS public.restaurant_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id uuid REFERENCES public.merchants(id) ON DELETE CASCADE,
    restaurant_name text NOT NULL,
    owner_name text,
    city text,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text NOT NULL,
    is_approved boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT unique_merchant_review UNIQUE (merchant_id)
);

CREATE INDEX IF NOT EXISTS idx_restaurant_reviews_approved 
ON public.restaurant_reviews (is_approved, created_at DESC);

-- 5. Permissions globales
GRANT ALL ON TABLE public.merchants TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.delivery_drivers TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.orders TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.restaurant_reviews TO postgres, anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 6. Sécurité Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_reviews ENABLE ROW LEVEL SECURITY;

-- Politiques RLS Orders
DROP POLICY IF EXISTS "Merchants can read own orders" ON public.orders;
CREATE POLICY "Merchants can read own orders"
ON public.orders FOR SELECT
USING (auth.uid() = merchant_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Merchants can update own orders" ON public.orders;
CREATE POLICY "Merchants can update own orders"
ON public.orders FOR UPDATE
USING (auth.uid() = merchant_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role and customers can insert orders" ON public.orders;
CREATE POLICY "Service role and customers can insert orders"
ON public.orders FOR INSERT
WITH CHECK (true);

-- Politiques RLS Delivery Drivers
DROP POLICY IF EXISTS "Merchants can manage own drivers" ON public.delivery_drivers;
CREATE POLICY "Merchants can manage own drivers"
ON public.delivery_drivers FOR ALL
USING (auth.uid() = merchant_id OR auth.role() = 'service_role');

-- Politiques RLS Reviews
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.restaurant_reviews;
CREATE POLICY "Public can view approved reviews"
ON public.restaurant_reviews FOR SELECT
USING (is_approved = true OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Merchants can manage own review" ON public.restaurant_reviews;
CREATE POLICY "Merchants can manage own review"
ON public.restaurant_reviews FOR ALL
USING (auth.uid() = merchant_id OR auth.role() = 'service_role');

-- 7. Publication Realtime
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
END $$;

-- Forcer le rafraîchissement du cache de schéma PostgREST
NOTIFY pgrst, 'reload schema';
