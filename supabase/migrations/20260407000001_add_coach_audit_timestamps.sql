-- ============================================================
-- MIGRATION — Add audit timestamp columns to coaches table
-- SOW #1 · Galoras Platform
-- 2026-04-07
-- ============================================================
-- CoachEditorDetail already queries submitted_at, reviewed_at,
-- published_at, and suspended_at but these columns were never
-- added to the coaches table. This migration adds them safely.
-- ============================================================

ALTER TABLE public.coaches
  ADD COLUMN IF NOT EXISTS submitted_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_at  TIMESTAMPTZ;

COMMENT ON COLUMN public.coaches.submitted_at  IS 'When coach submitted their profile for review';
COMMENT ON COLUMN public.coaches.reviewed_at   IS 'When admin first opened the application for review';
COMMENT ON COLUMN public.coaches.published_at  IS 'When coach was set to published lifecycle status';
COMMENT ON COLUMN public.coaches.suspended_at  IS 'When coach was suspended (if applicable)';
