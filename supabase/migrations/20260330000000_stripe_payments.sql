-- Add Stripe fields to bookings table
alter table public.bookings
  add column if not exists client_id uuid references auth.users(id),
  add column if not exists product_id uuid,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists amount_cents integer,
  add column if not exists currency text default 'cad';

-- Update booking status to include payment states
-- (existing: pending, confirmed, cancelled — adding payment_failed, pending_payment)
comment on column public.bookings.status is
  'pending_payment | pending | confirmed | payment_failed | cancelled';

-- Add Stripe + subscription fields to profiles table
alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists subscription_status text,
  add column if not exists subscription_tier text,
  add column if not exists subscription_id text,
  add column if not exists subscription_current_period_end timestamptz;

-- Add price_cents to coach_products (replacing text pricing_band for real payments)
alter table public.coach_products
  add column if not exists price_cents integer;

-- Index for fast webhook lookups
create index if not exists bookings_stripe_payment_intent_id_idx
  on public.bookings (stripe_payment_intent_id);

create index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id);

create index if not exists profiles_subscription_id_idx
  on public.profiles (subscription_id);
