-- Fix coaches.tier CHECK constraint: standard/premium/elite → pro/elite/master
ALTER TABLE coaches
  DROP CONSTRAINT IF EXISTS coaches_tier_check;

-- Migrate any existing wrong values before adding new constraint
UPDATE coaches SET tier = 'pro'    WHERE tier = 'standard';
UPDATE coaches SET tier = 'elite'  WHERE tier = 'premium';
-- 'elite' stays 'elite'

ALTER TABLE coaches
  ADD CONSTRAINT coaches_tier_check CHECK (tier IN ('pro','elite','master'));

-- Add NDA acceptance fields to coach_applications
ALTER TABLE coach_applications
  ADD COLUMN IF NOT EXISTS nda_accepted     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS nda_accepted_at  timestamptz;
