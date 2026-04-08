-- ============================================================
-- MIGRATION — Coach Products: Spec Fields
-- 2026-04-08
-- ============================================================
-- 1. Drop old product_type CHECK constraint
-- 2. Add spec fields to coach_products
-- 3. Replace old product_type_definitions seed rows with spec types
-- ============================================================

-- ------------------------------------------------------------
-- 1. Drop old CHECK constraint on product_type
-- ------------------------------------------------------------

ALTER TABLE public.coach_products
  DROP CONSTRAINT IF EXISTS coach_products_product_type_check;

-- ------------------------------------------------------------
-- 2. Add new spec columns to coach_products
-- ------------------------------------------------------------

ALTER TABLE public.coach_products
  ADD COLUMN IF NOT EXISTS outcome_statement  TEXT,
  ADD COLUMN IF NOT EXISTS session_count      INTEGER,
  ADD COLUMN IF NOT EXISTS duration_weeks     INTEGER,
  ADD COLUMN IF NOT EXISTS price_type         TEXT        NOT NULL DEFAULT 'enquiry',
  ADD COLUMN IF NOT EXISTS price_range_min    INTEGER,
  ADD COLUMN IF NOT EXISTS price_range_max    INTEGER,
  ADD COLUMN IF NOT EXISTS enterprise_ready   BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS booking_mode       TEXT        NOT NULL DEFAULT 'enquiry',
  ADD COLUMN IF NOT EXISTS visibility_scope   TEXT        NOT NULL DEFAULT 'public';

-- ------------------------------------------------------------
-- 3. Remove old seed rows from product_type_definitions
-- ------------------------------------------------------------

DELETE FROM product_type_definitions
  WHERE slug IN ('diagnostic', 'block', 'program', 'enterprise');

-- ------------------------------------------------------------
-- 4. Insert the 6 spec product types
-- ------------------------------------------------------------

INSERT INTO product_type_definitions (slug, label, badge_color, sort_order) VALUES
  ('single_session',    'Single Session',       'bg-sky-500/10 border-sky-500/30 text-sky-400',       0),
  ('coaching_package',  'Coaching Package',     'bg-blue-500/10 border-blue-500/30 text-blue-400',    1),
  ('intensive',         'Intensive',            'bg-violet-500/10 border-violet-500/30 text-violet-400', 2),
  ('group_program',     'Group Program',        'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', 3),
  ('workshop_event',    'Workshop / Event',     'bg-amber-500/10 border-amber-500/30 text-amber-400', 4),
  ('corporate',         'Corporate Engagement', 'bg-orange-500/10 border-orange-500/30 text-orange-400', 5)
ON CONFLICT (slug) DO NOTHING;
