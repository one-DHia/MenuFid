-- ========================================================
-- MIGRATION : Système de Commande Directe, Livraison, Licences & Devises
-- Tables: public.merchants, public.orders
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

-- 2. Création de la table orders
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
    stripe_payment_intent_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Index pour requêtes rapides du tableau de bord
CREATE INDEX IF NOT EXISTS idx_orders_merchant_status 
ON public.orders (merchant_id, order_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_created_at 
ON public.orders (created_at DESC);

-- 3. Permissions globales (Résolution de l'erreur "permission denied for table orders")
GRANT ALL ON TABLE public.merchants TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.orders TO postgres, anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 4. Sécurité Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

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

-- 5. Publication Realtime pour notification sonore en direct
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

