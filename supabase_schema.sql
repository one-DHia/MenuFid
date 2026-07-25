-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. MERCHANTS TABLE
create table public.merchants (
    id uuid references auth.users on delete cascade primary key,
    business_name text not null,
    slug text not null unique,
    custom_domain text unique,
    plan_tier text not null default 'basic' check (plan_tier in ('basic', 'loyalty', 'premium')),
    logo_url text,
    primary_color text not null default '#4f46e5',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on merchants
alter table public.merchants enable row level security;

-- Policies for merchants
create policy "Merchants can view their own details" 
    on public.merchants for select 
    using (auth.uid() = id);

create policy "Merchants can update their own details" 
    on public.merchants for update 
    using (auth.uid() = id);

create policy "Public menu visitors can read merchant details"
    on public.merchants for select
    using (true);

-- 2. CATEGORIES TABLE
create table public.categories (
    id uuid default gen_random_uuid() primary key,
    merchant_id uuid references public.merchants(id) on delete cascade not null,
    name text not null,
    display_order integer default 0 not null,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on categories
alter table public.categories enable row level security;

-- Policies for categories
create policy "Merchants can manage their own categories"
    on public.categories for all
    using (auth.uid() = merchant_id);

create policy "Public menu visitors can read active categories"
    on public.categories for select
    using (is_active = true);

-- 3. MENU ITEMS TABLE
create table public.menu_items (
    id uuid default gen_random_uuid() primary key,
    category_id uuid references public.categories(id) on delete cascade not null,
    name text not null,
    description text,
    price numeric(10, 2) not null,
    image_url text,
    is_available boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on menu items
alter table public.menu_items enable row level security;

-- Policies for menu items
create policy "Merchants can manage their own menu items"
    on public.menu_items for all
    using (
        auth.uid() in (
            select merchant_id from public.categories where id = category_id
        )
    );

create policy "Public menu visitors can read available menu items"
    on public.menu_items for select
    using (
        is_available = true and category_id in (
            select id from public.categories where is_active = true
        )
    );

-- 4. CUSTOMERS TABLE
create table public.customers (
    id uuid default gen_random_uuid() primary key,
    merchant_id uuid references public.merchants(id) on delete cascade not null,
    name text not null,
    email text not null,
    phone text,
    wallet_pass_url text,
    points_balance integer default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_merchant_customer_email unique (merchant_id, email)
);

-- Enable RLS on customers
alter table public.customers enable row level security;

-- Policies for customers
create policy "Merchants can manage their own customers"
    on public.customers for all
    using (auth.uid() = merchant_id);

create policy "Customers can read their own profile"
    on public.customers for select
    using (true); -- Light auth: customers can fetch by their own ID/Slug

create policy "Customers can insert their own profile"
    on public.customers for insert
    with check (true); -- Light auth: anyone can sign up to loyalty program

-- 5. VISITS TABLE
create table public.visits (
    id uuid default gen_random_uuid() primary key,
    customer_id uuid references public.customers(id) on delete cascade not null,
    merchant_id uuid references public.merchants(id) on delete cascade not null,
    points_awarded integer default 1 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on visits
alter table public.visits enable row level security;

-- Policies for visits
create policy "Merchants can manage visits"
    on public.visits for all
    using (auth.uid() = merchant_id);

create policy "Customers can view their own visits"
    on public.visits for select
    using (customer_id in (select id from public.customers));

-- 6. REWARDS TABLE
create table public.rewards (
    id uuid default gen_random_uuid() primary key,
    merchant_id uuid references public.merchants(id) on delete cascade not null,
    title text not null,
    points_required integer not null,
    description text,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on rewards
alter table public.rewards enable row level security;

-- Policies for rewards
create policy "Merchants can manage their rewards"
    on public.rewards for all
    using (auth.uid() = merchant_id);

create policy "Public/Customers can view active rewards"
    on public.rewards for select
    using (is_active = true);
