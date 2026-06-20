-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================
-- Production‑grade schema setup for SaaS platform
-- All changes are idempotent and safe for fresh or existing projects
-- ============================================

-- ============================================
-- 1. Users table (supports phone‑only users)
-- ============================================
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,                     -- now nullable, but at least one of email/phone must exist
  name text,
  google_id text unique,
  stripe_customer_id text,
  phone text unique,
  created_at timestamptz default now()
);

-- Ensure at least one contact method exists (professional integrity)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'users_email_or_phone_check'
      and table_name = 'users'
  ) then
    alter table users
      add constraint users_email_or_phone_check
      check ( email is not null or phone is not null );
  end if;
end $$;

-- ============================================
-- 2. Instances table – core + companion + channel fields
-- ============================================
create table if not exists instances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  ec2_instance_id text,
  public_ip text,
  status text default 'pending_payment',
  model_provider text,
  model_name text,
  channel text default 'telegram',
  telegram_bot_token text,
  llm_api_key text,
  gateway_token text,
  region text default 'ap-south-1',
  created_at timestamptz default now(),
  last_health_check timestamptz
);

-- Add companion (v2) columns
alter table instances add column if not exists bot_id text;
alter table instances add column if not exists companion_name text;
alter table instances add column if not exists companion_role text;
alter table instances add column if not exists companion_color text;
alter table instances add column if not exists companion_avatar text;

-- Add channel credential (v4) columns
alter table instances add column if not exists teams_app_id text;
alter table instances add column if not exists teams_app_password text;
alter table instances add column if not exists whatsapp_phone_id text;
alter table instances add column if not exists whatsapp_access_token text;

-- Add JSONB field for uploaded character files
alter table instances add column if not exists character_files jsonb;

-- Add status constraint (idempotent)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'instances_status_check'
      and table_name = 'instances'
  ) then
    alter table instances
      add constraint instances_status_check
      check (status in (
        'pending_payment',
        'provisioning',
        'running',
        'stopped',
        'terminated',
        'failed',
        'payment_failed'
      ));
  end if;
end $$;

-- Index for efficient querying
create index if not exists idx_instances_user_status
  on instances(user_id, status);

-- ============================================
-- 2b. Safely enforce NOT NULL on critical columns
--     (update any existing NULLs first)
-- ============================================
update instances set model_provider = 'unknown' where model_provider is null;
update instances set model_name = 'unknown' where model_name is null;

-- Now set NOT NULL constraints (idempotent via DO block)
do $$
begin
  alter table instances alter column user_id set not null;
exception
  when others then null;
end $$;

do $$
begin
  alter table instances alter column model_provider set not null;
exception
  when others then null;
end $$;

do $$
begin
  alter table instances alter column model_name set not null;
exception
  when others then null;
end $$;

-- ============================================
-- 2c. Enforce single active instance per user
--     (unique partial index – will fail if duplicates exist, forcing cleanup)
-- ============================================
create unique index if not exists idx_one_active_instance_per_user
  on instances(user_id)
  where status in ('pending_payment', 'provisioning', 'running');

-- ============================================
-- 3. Subscriptions table (unchanged except CASCADE)
-- ============================================
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  stripe_subscription_id text unique,
  status text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- ============================================
-- 4. Companion reviews table (community feedback)
-- ============================================
create table if not exists companion_reviews (
  id uuid primary key default gen_random_uuid(),
  bot_id text not null,
  user_id uuid not null references users(id) on delete cascade,
  user_name text,
  user_avatar text,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  created_at timestamptz default now()
);

create index if not exists idx_reviews_bot_id on companion_reviews(bot_id);
create index if not exists idx_reviews_created on companion_reviews(created_at desc);

-- ============================================
-- 5. Ensure all foreign keys have ON DELETE CASCADE
--    (even if tables existed before)
-- ============================================

-- instances.user_id
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'instances_user_id_fkey'
      and table_name = 'instances'
  ) then
    alter table instances drop constraint instances_user_id_fkey;
  end if;
end $$;

alter table instances
  add constraint instances_user_id_fkey
  foreign key (user_id) references users(id) on delete cascade;

-- subscriptions.user_id
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'subscriptions_user_id_fkey'
      and table_name = 'subscriptions'
  ) then
    alter table subscriptions drop constraint subscriptions_user_id_fkey;
  end if;
end $$;

alter table subscriptions
  add constraint subscriptions_user_id_fkey
  foreign key (user_id) references users(id) on delete cascade;

-- companion_reviews.user_id
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'companion_reviews_user_id_fkey'
      and table_name = 'companion_reviews'
  ) then
    alter table companion_reviews drop constraint companion_reviews_user_id_fkey;
  end if;
end $$;

alter table companion_reviews
  add constraint companion_reviews_user_id_fkey
  foreign key (user_id) references users(id) on delete cascade;

-- ============================================
-- End of script
-- ============================================