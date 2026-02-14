-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  google_id text unique,
  stripe_customer_id text,
  created_at timestamptz default now()
);

create table if not exists instances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  ec2_instance_id text,
  public_ip text,
  status text default 'provisioning',
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

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  stripe_subscription_id text unique,
  status text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);
