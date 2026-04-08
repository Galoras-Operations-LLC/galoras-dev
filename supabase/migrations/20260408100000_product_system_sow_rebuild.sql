-- ============================================================================
-- Product System SOW Rebuild
-- Aligns coach_products schema with Galoras_SOW_Product_System.docx
-- Strips Stripe, migrates legacy types, renames columns per spec
-- ============================================================================

BEGIN;

-- ── 0. Drop existing check constraints that conflict with migration ──────────

ALTER TABLE coach_products DROP CONSTRAINT IF EXISTS coach_products_type_check;
ALTER TABLE coach_products DROP CONSTRAINT IF EXISTS coach_products_format_check;

-- ── 1. Reset product_type_definitions to SOW spec ────────────────────────────

TRUNCATE product_type_definitions;
INSERT INTO product_type_definitions (slug, label, badge_color, sort_order) VALUES
  ('single_session',   'Single Session',        'bg-sky-500/10 border-sky-500/30 text-sky-400',       0),
  ('coaching_package', 'Coaching Package',       'bg-blue-500/10 border-blue-500/30 text-blue-400',    1),
  ('intensive',        'Intensive',              'bg-violet-500/10 border-violet-500/30 text-violet-400', 2),
  ('group_program',    'Group Program',          'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', 3),
  ('workshop_event',   'Workshop / Event',       'bg-amber-500/10 border-amber-500/30 text-amber-400', 4),
  ('corporate',        'Corporate Engagement',   'bg-orange-500/10 border-orange-500/30 text-orange-400', 5);

-- ── 2. Migrate legacy product_type values ────────────────────────────────────

UPDATE coach_products SET product_type = 'single_session'   WHERE product_type = 'diagnostic';
UPDATE coach_products SET product_type = 'coaching_package'  WHERE product_type IN ('program', 'block');
UPDATE coach_products SET product_type = 'corporate'         WHERE product_type = 'enterprise';

-- ── 3. Rename columns per SOW ────────────────────────────────────────────────

-- who_its_for (text) → target_audience (text[])
ALTER TABLE coach_products ADD COLUMN target_audience text[];
UPDATE coach_products SET target_audience = ARRAY[who_its_for] WHERE who_its_for IS NOT NULL AND who_its_for <> '';
ALTER TABLE coach_products DROP COLUMN who_its_for;

-- format → delivery_format
ALTER TABLE coach_products RENAME COLUMN format TO delivery_format;

-- price_cents → price_amount (keep as integer, in cents)
ALTER TABLE coach_products RENAME COLUMN price_cents TO price_amount;

-- ── 4. Strip Stripe / non-SOW columns ────────────────────────────────────────

ALTER TABLE coach_products DROP COLUMN IF EXISTS summary;
ALTER TABLE coach_products DROP COLUMN IF EXISTS what_you_get;
ALTER TABLE coach_products DROP COLUMN IF EXISTS pricing_band;
ALTER TABLE coach_products DROP COLUMN IF EXISTS price_display;
ALTER TABLE coach_products DROP COLUMN IF EXISTS cta_label;
ALTER TABLE coach_products DROP COLUMN IF EXISTS cta_url;
ALTER TABLE coach_products DROP COLUMN IF EXISTS duration_label;

-- ── 5. Reset all products to enquiry mode, strip prices ──────────────────────

UPDATE coach_products SET
  booking_mode = 'enquiry',
  price_type   = 'enquiry',
  price_amount = NULL;

-- ── 6. Add check constraints for enums ───────────────────────────────────────

ALTER TABLE coach_products DROP CONSTRAINT IF EXISTS chk_booking_mode;
ALTER TABLE coach_products ADD CONSTRAINT chk_booking_mode
  CHECK (booking_mode IN ('enquiry', 'stripe'));

ALTER TABLE coach_products DROP CONSTRAINT IF EXISTS chk_price_type;
ALTER TABLE coach_products ADD CONSTRAINT chk_price_type
  CHECK (price_type IN ('fixed', 'range', 'enquiry'));

ALTER TABLE coach_products DROP CONSTRAINT IF EXISTS chk_delivery_format;
ALTER TABLE coach_products ADD CONSTRAINT chk_delivery_format
  CHECK (delivery_format IS NULL OR delivery_format IN ('online', 'in_person', 'hybrid'));

ALTER TABLE coach_products DROP CONSTRAINT IF EXISTS chk_visibility_scope;
ALTER TABLE coach_products ADD CONSTRAINT chk_visibility_scope
  CHECK (visibility_scope IN ('public', 'unlisted', 'private'));

ALTER TABLE coach_products DROP CONSTRAINT IF EXISTS chk_product_type;
ALTER TABLE coach_products ADD CONSTRAINT chk_product_type
  CHECK (product_type IN ('single_session', 'coaching_package', 'intensive', 'group_program', 'workshop_event', 'corporate'));

COMMIT;
