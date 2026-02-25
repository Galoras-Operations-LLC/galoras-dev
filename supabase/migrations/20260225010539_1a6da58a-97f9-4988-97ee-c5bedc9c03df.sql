-- Add 10 new structured intake columns to coach_applications
ALTER TABLE public.coach_applications
  ADD COLUMN IF NOT EXISTS primary_pillar TEXT,
  ADD COLUMN IF NOT EXISTS secondary_pillars TEXT[],
  ADD COLUMN IF NOT EXISTS industry_focus TEXT[],
  ADD COLUMN IF NOT EXISTS coaching_style TEXT[],
  ADD COLUMN IF NOT EXISTS engagement_model TEXT,
  ADD COLUMN IF NOT EXISTS availability_status TEXT,
  ADD COLUMN IF NOT EXISTS founder_stage_focus TEXT[],
  ADD COLUMN IF NOT EXISTS founder_function_strength TEXT[],
  ADD COLUMN IF NOT EXISTS exec_level TEXT,
  ADD COLUMN IF NOT EXISTS exec_function TEXT[];

-- B-tree indexes for single-value filters
CREATE INDEX IF NOT EXISTS idx_coach_apps_background ON public.coach_applications (coach_background);
CREATE INDEX IF NOT EXISTS idx_coach_apps_primary_pillar ON public.coach_applications (primary_pillar);
CREATE INDEX IF NOT EXISTS idx_coach_apps_availability ON public.coach_applications (availability_status);
CREATE INDEX IF NOT EXISTS idx_coach_apps_engagement ON public.coach_applications (engagement_model);

-- GIN indexes for array filters
CREATE INDEX IF NOT EXISTS idx_coach_apps_secondary_pillars ON public.coach_applications USING GIN (secondary_pillars);
CREATE INDEX IF NOT EXISTS idx_coach_apps_industry_focus ON public.coach_applications USING GIN (industry_focus);
CREATE INDEX IF NOT EXISTS idx_coach_apps_coaching_style ON public.coach_applications USING GIN (coaching_style);
CREATE INDEX IF NOT EXISTS idx_coach_apps_founder_stage ON public.coach_applications USING GIN (founder_stage_focus);
CREATE INDEX IF NOT EXISTS idx_coach_apps_exec_function ON public.coach_applications USING GIN (exec_function);