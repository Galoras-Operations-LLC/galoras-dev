-- Fix coaches.tier default to match new constraint (standard is no longer valid)
ALTER TABLE coaches ALTER COLUMN tier SET DEFAULT 'pro';

-- Create Galoras platform entity for shared Master-level programs
WITH galoras AS (
  INSERT INTO coaches (
    display_name,
    slug,
    tier,
    lifecycle_status,
    status,
    headline,
    bio,
    published_at
  )
  VALUES (
    'Galoras',
    'galoras',
    'master',
    'published',
    'published',
    'Platform-level programs delivered by Galoras Master Coaches',
    'Galoras signature programs available for delivery by any certified Master-tier coach on the platform.',
    now()
  )
  RETURNING id
)
UPDATE coach_products
SET coach_id = (SELECT id FROM galoras)
WHERE id IN (
  'b0f3bc73-9a64-4ce1-8b8a-8d2d2a74fcd2',  -- Performance Diagnostic – Leadership Visibility & Influence
  'b965d465-590d-4812-bdf5-8533b8406432',  -- Leadership Visibility & Influence Program – Department
  '746d6d7a-2f5e-400d-bff0-3cdc27b48fd4'   -- Sport of Business – Leadership Performance Transformation
);
