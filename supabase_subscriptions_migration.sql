-- ========================================================
-- MIGRATION : Abonnements Stripe, Expiration & Rétention
-- Table: public.merchants
-- ========================================================

ALTER TABLE public.merchants
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS deactivated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS payment_method text default 'manual';

-- Index pour optimiser la vérification quotidienne des abonnements expirés
CREATE INDEX IF NOT EXISTS idx_merchants_subscription_expires 
ON public.merchants (subscription_expires_at) 
WHERE is_suspended = false;

-- Index pour la purge automatique après 90 jours
CREATE INDEX IF NOT EXISTS idx_merchants_deactivated_at 
ON public.merchants (deactivated_at) 
WHERE is_suspended = true;

COMMENT ON COLUMN public.merchants.subscription_expires_at IS 'Date de fin de validité de l abonnement payé';
COMMENT ON COLUMN public.merchants.deactivated_at IS 'Date de première suspension pour le calcul des 90 jours de rétention';
COMMENT ON COLUMN public.merchants.stripe_customer_id IS 'ID client Stripe (cus_xxx)';
COMMENT ON COLUMN public.merchants.stripe_subscription_id IS 'ID abonnement Stripe (sub_xxx)';
COMMENT ON COLUMN public.merchants.payment_method IS 'Méthode de règlement: stripe, manual, distributor';
