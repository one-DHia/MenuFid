-- ─────────────────────────────────────────────────────────────
-- RESET COMPLET ET CRÉATION DE LA BASE DE DONNÉES SUPABASE (V2.0 - Short Codes & Scoping)
-- Copiez-collez ce script directement dans le "SQL Editor" de Supabase
-- ─────────────────────────────────────────────────────────────

-- 1. SUPPRESSION DE TOUTES LES ANCIENNES TABLES ET SCHÉMA (RESET DE 0)
drop schema if exists public cascade;
create schema public;

-- Réattribution des permissions Supabase
grant all on schema public to postgres;
grant all on schema public to public;

-- Extensions requises
create extension if not exists "uuid-ossp" schema public;
create extension if not exists "pgcrypto" schema public;

-- Types Enums
create type public.plan_tier as enum ('basic', 'loyalty', 'premium');
create type public.plan_status as enum ('active', 'trialing', 'past_due', 'canceled');

-- 0. TABLE ADMINS (Super-Admin Access)
create table public.admins (
    id uuid references auth.users(id) on delete cascade primary key,
    email text not null unique,
    role text not null default 'superadmin',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.admins enable row level security;

create policy "Admins can view admins"
    on public.admins for select
    using (auth.uid() = id);

create policy "Admins can insert admins"
    on public.admins for insert
    with check (exists (select 1 from public.admins where id = auth.uid()));

create policy "Admins can delete admins"
    on public.admins for delete
    using (exists (select 1 from public.admins where id = auth.uid()));

create table public.admin_2fa_codes (
    id uuid default gen_random_uuid() primary key,
    admin_id uuid references public.admins(id) on delete cascade not null,
    code text not null,
    expires_at timestamp with time zone not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.admin_2fa_codes enable row level security;
-- Internal table, no RLS policies for public/admins needed, only accessible via service_role

create table public.admin_logs (
    id uuid default gen_random_uuid() primary key,
    admin_id uuid references public.admins(id) on delete set null,
    action text not null,
    target_id text,
    details jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.admin_logs enable row level security;

create policy "Admins can view logs"
    on public.admin_logs for select
    using (exists (select 1 from public.admins where id = auth.uid()));

-- 1. TABLE DISTRIBUTORS (Portail 3 : Distributeurs & Partenaires Régionaux)
create table public.distributors (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete set null,
    name text not null,
    email text not null unique,
    code text unique not null, -- ex: 'alger-centre', 'paris-nord'
    city text,
    country text,
    commission_rate numeric(5, 2) default 10.00 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.distributors enable row level security;

create policy "Allow all read distributors"
    on public.distributors for select
    using (true);

create policy "Admins can insert distributors"
    on public.distributors for insert
    with check (exists (select 1 from public.admins where id = auth.uid()));

create policy "Admins can update distributors"
    on public.distributors for update
    using (exists (select 1 from public.admins where id = auth.uid()));

create policy "Admins can delete distributors"
    on public.distributors for delete
    using (exists (select 1 from public.admins where id = auth.uid()));

-- 2. TABLE MERCHANTS (Portail 1 : SaaS Restaurateurs B2B)
create table public.merchants (
    id uuid references auth.users(id) on delete cascade primary key,
    distributor_id uuid references public.distributors(id) on delete set null,
    business_name text not null,
    slug text not null unique,
    short_code varchar(7) not null, -- ex: 'CAFE-99' ou 'REST-01' (Format: 4 lettres - 2 chiffres)
    city text,
    country text,
    plan_tier public.plan_tier not null default 'basic',
    plan_status public.plan_status not null default 'active',
    is_suspended boolean not null default false,
    monthly_price numeric(10, 2) default 0.00 not null,
    primary_color text not null default '#b45309',
    currency text not null default 'EUR',
    logo_url text,
    google_review_url text,
    google_maps_url text,
    instagram_url text,
    contact_email text,
    demo_start timestamp with time zone,
    demo_end timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Unicité du code restaurant par distributeur (Option A)
    constraint unique_merchant_code_per_distributor unique (distributor_id, short_code),
    -- Validation du format 4 lettres majuscules + tiret + 2 chiffres (ex: 'ABCD-12')
    constraint chk_short_code_format check (short_code ~ '^[A-Z]{4}-[0-9]{2}$')
);

alter table public.merchants enable row level security;

create policy "Public can view merchant profiles"
    on public.merchants for select
    using (true);

create policy "Merchants can insert profile"
    on public.merchants for insert
    with check (true);

create policy "Merchants can update own profile"
    on public.merchants for update
    using (auth.uid() = id);

-- 3. TABLE CATEGORIES (Menu QR Code)
create table public.categories (
    id uuid default gen_random_uuid() primary key,
    merchant_id uuid references public.merchants(id) on delete cascade not null,
    name text not null,
    image_url text,
    display_order integer default 0 not null,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;

create policy "Public read categories"
    on public.categories for select
    using (true);

create policy "Merchants manage categories"
    on public.categories for all
    using (true);

-- 4. TABLE MENU_ITEMS (Menu QR Code)
create table public.menu_items (
    id uuid default gen_random_uuid() primary key,
    merchant_id uuid references public.merchants(id) on delete cascade not null,
    category_id uuid references public.categories(id) on delete cascade not null,
    name text not null,
    description text,
    price numeric(10, 2) not null,
    image_url text,
    allergens text[] default '{}'::text[] not null,
    dietary_tags text[] default '{}'::text[] not null,
    is_available boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.menu_items enable row level security;

create policy "Public read menu items"
    on public.menu_items for select
    using (true);

create policy "Merchants manage menu items"
    on public.menu_items for all
    using (true);

-- 5. TABLE REWARDS (Catalogue de cadeaux par restaurant)
create table public.rewards (
    id uuid default gen_random_uuid() primary key,
    merchant_id uuid references public.merchants(id) on delete cascade not null,
    title text not null,
    description text,
    stamps_required integer not null default 10,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.rewards enable row level security;

create policy "Public read rewards"
    on public.rewards for select
    using (true);

create policy "Merchants manage rewards"
    on public.rewards for all
    using (true);

-- 6. TABLE CUSTOMERS (Portail 2 : Clients Grand Public B2C)
create table public.customers (
    id uuid references auth.users(id) on delete cascade primary key,
    phone text unique,
    email text unique,
    full_name text,
    loyalty_code varchar(7) unique, -- ex: 'XYZ-789' ou '4G5-6Y3' (Format: 3 alphanum - 3 alphanum)
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    constraint chk_loyalty_code_format check (loyalty_code ~ '^[A-Z0-9]{3}-[A-Z0-9]{3}$')
);

alter table public.customers enable row level security;

-- Générateur automatique de code de fidélité unique
create or replace function public.generate_loyalty_code()
returns text as $$
declare
    all_chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    new_code text;
    exists_code boolean;
begin
    loop
        new_code := 
            substr(all_chars, floor(random() * 36)::integer + 1, 1) ||
            substr(all_chars, floor(random() * 36)::integer + 1, 1) ||
            substr(all_chars, floor(random() * 36)::integer + 1, 1) ||
            '-' ||
            substr(all_chars, floor(random() * 36)::integer + 1, 1) ||
            substr(all_chars, floor(random() * 36)::integer + 1, 1) ||
            substr(all_chars, floor(random() * 36)::integer + 1, 1);
            
        select exists(select 1 from public.customers where loyalty_code = new_code) into exists_code;
        if not exists_code then
            return new_code;
        end if;
    end loop;
end;
$$ language plpgsql;

-- Trigger pour affecter automatiquement le code de fidélité à l'insertion
create or replace function public.set_customer_loyalty_code()
returns trigger as $$
begin
    if new.loyalty_code is null then
        new.loyalty_code := public.generate_loyalty_code();
    end if;
    return new;
end;
$$ language plpgsql;

create trigger trg_set_customer_loyalty_code
before insert on public.customers
for each row
execute function public.set_customer_loyalty_code();

create policy "Customers can view own profile"
    on public.customers for select
    using (auth.uid() = id);

create policy "Customers can update own profile"
    on public.customers for update
    using (auth.uid() = id);

create policy "Customers can insert own profile"
    on public.customers for insert
    with check (auth.uid() = id);

create policy "Merchants can view customers"
    on public.customers for select
    using (exists (select 1 from public.merchants where id = auth.uid()));

-- 7. TABLE LOYALTY_CARDS (Portefeuille Client - 1 Carte par Resto)
create table public.loyalty_cards (
    id uuid default gen_random_uuid() primary key,
    customer_id uuid references public.customers(id) on delete cascade not null,
    merchant_id uuid references public.merchants(id) on delete cascade not null,
    stamps_count integer default 0 not null,
    total_visits integer default 0 not null,
    last_visit_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_customer_merchant_card unique (customer_id, merchant_id)
);

alter table public.loyalty_cards enable row level security;

create policy "Customers can view own loyalty cards"
    on public.loyalty_cards for select
    using (auth.uid() = customer_id);

create policy "Merchants can view loyalty cards"
    on public.loyalty_cards for select
    using (auth.uid() = merchant_id);

create policy "Merchants can manage loyalty cards"
    on public.loyalty_cards for all
    using (auth.uid() = merchant_id);

-- 8. TABLE STAMP_TRANSACTIONS (Historique des tampons)
create table public.stamp_transactions (
    id uuid default gen_random_uuid() primary key,
    loyalty_card_id uuid references public.loyalty_cards(id) on delete cascade not null,
    merchant_id uuid references public.merchants(id) on delete cascade not null,
    stamps_change integer not null,
    reward_id uuid references public.rewards(id) on delete set null,
    note text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.stamp_transactions enable row level security;

create policy "Customers can view own stamp transactions"
    on public.stamp_transactions for select
    using (
        exists (
            select 1 from public.loyalty_cards lc 
            where lc.id = loyalty_card_id and lc.customer_id = auth.uid()
        )
    );

create policy "Merchants can view stamp transactions"
    on public.stamp_transactions for select
    using (auth.uid() = merchant_id);

create policy "Merchants can insert stamp transactions"
    on public.stamp_transactions for insert
    with check (auth.uid() = merchant_id);

-- 9. VUE STATISTIQUE & FINANCIÈRE POUR LE PORTAIL DISTRIBUTEUR
create or replace view public.distributor_revenue_summary as
select 
    d.id as distributor_id,
    d.name as distributor_name,
    d.email as distributor_email,
    d.code as distributor_code,
    d.city as distributor_city,
    d.country as distributor_country,
    d.commission_rate,
    count(m.id) as total_merchants,
    count(case when m.plan_status = 'active' then 1 end) as active_merchants,
    count(case when m.plan_tier = 'basic' then 1 end) as basic_count,
    count(case when m.plan_tier = 'loyalty' then 1 end) as loyalty_count,
    count(case when m.plan_tier = 'premium' then 1 end) as premium_count,
    coalesce(sum(case when m.plan_status = 'active' then m.monthly_price else 0 end), 0) as total_monthly_revenue,
    coalesce(sum(case when m.plan_status = 'active' then (m.monthly_price * (d.commission_rate / 100)) else 0 end), 0) as total_distributor_commission
from public.distributors d
left join public.merchants m on m.distributor_id = d.id
group by d.id, d.name, d.email, d.code, d.city, d.country, d.commission_rate;

-- Indexes pour optimiser les performances des requêtes (Sub-milliseconde)
create index if not exists idx_merchants_slug on public.merchants(slug);
create index if not exists idx_merchants_short_code on public.merchants(short_code);
create index if not exists idx_merchants_distributor on public.merchants(distributor_id);
create index if not exists idx_merchants_is_suspended on public.merchants(is_suspended);
create index if not exists idx_merchants_plan_status on public.merchants(plan_status);
create index if not exists idx_merchants_demo_end on public.merchants(demo_end);

create index if not exists idx_categories_merchant on public.categories(merchant_id, display_order);
create index if not exists idx_categories_active on public.categories(merchant_id, is_active);

create index if not exists idx_menu_items_merchant on public.menu_items(merchant_id);
create index if not exists idx_menu_items_category on public.menu_items(category_id);
create index if not exists idx_menu_items_available on public.menu_items(merchant_id, is_available);

create index if not exists idx_loyalty_cards_customer on public.loyalty_cards(customer_id);
create index if not exists idx_loyalty_cards_merchant on public.loyalty_cards(merchant_id);
create index if not exists idx_loyalty_cards_cust_merch on public.loyalty_cards(customer_id, merchant_id);

create index if not exists idx_customers_loyalty_code on public.customers(loyalty_code);
create index if not exists idx_customers_phone on public.customers(phone);

create index if not exists idx_distributors_user on public.distributors(user_id);
create index if not exists idx_distributors_code on public.distributors(code);

create index if not exists idx_stamp_tx_merchant on public.stamp_transactions(merchant_id, created_at desc);
create index if not exists idx_stamp_tx_card on public.stamp_transactions(loyalty_card_id, created_at desc);

-- 10. TABLE PUSH_SUBSCRIPTIONS (Pour les notifications Web Push des clients)
create table public.push_subscriptions (
    id uuid default gen_random_uuid() primary key,
    customer_id uuid references auth.users(id) on delete cascade,
    endpoint text not null unique,
    p256dh text not null,
    auth text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.push_subscriptions enable row level security;

create policy "Customers can manage own subscriptions"
    on public.push_subscriptions for all
    using (auth.uid() = customer_id);

-- Permissions de base pour Supabase
grant usage on schema public to anon, authenticated, service_role;
grant all privileges on all tables in schema public to anon, authenticated, service_role;
grant all privileges on all sequences in schema public to anon, authenticated, service_role;
grant all privileges on all routines in schema public to anon, authenticated, service_role;

-- 11. ENABLE REALTIME
-- Activer la publication pour les tables surveillées par l'Admin et les Distributeurs
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.distributors;
alter publication supabase_realtime add table public.merchants;
alter publication supabase_realtime add table public.stamp_transactions;
alter publication supabase_realtime add table public.admins;
alter publication supabase_realtime add table public.admin_logs;
