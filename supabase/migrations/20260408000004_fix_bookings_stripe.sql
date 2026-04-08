-- ============================================================
-- MIGRATION — Fix bookings table for Stripe payments
-- 2026-04-08
-- ============================================================
-- The bookings table was created by Lovable with an unknown
-- status CHECK constraint. Drop it so pending_payment works.
-- Also ensure all required Stripe columns exist.
-- ============================================================

-- Drop any CHECK constraint on bookings.status (whatever it is named)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT conname
    FROM   pg_constraint
    WHERE  conrelid = 'public.bookings'::regclass
      AND  contype  = 'c'
      AND  conname LIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END;
$$;

-- Ensure Stripe columns exist (idempotent)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS client_id                 UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS product_id                UUID,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id  TEXT,
  ADD COLUMN IF NOT EXISTS amount_cents              INTEGER,
  ADD COLUMN IF NOT EXISTS currency                  TEXT DEFAULT 'cad';

-- Ensure RLS is enabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow the service role (edge function) to insert bookings
-- (The existing user/coach/admin policies handle SELECT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'bookings'
      AND policyname = 'Service role can insert bookings'
  ) THEN
    CREATE POLICY "Service role can insert bookings"
      ON public.bookings FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'bookings'
      AND policyname = 'Service role can update bookings'
  ) THEN
    CREATE POLICY "Service role can update bookings"
      ON public.bookings FOR UPDATE
      TO service_role
      USING (true);
  END IF;
END;
$$;
