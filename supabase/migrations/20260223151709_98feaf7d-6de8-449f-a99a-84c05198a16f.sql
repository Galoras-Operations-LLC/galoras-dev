
-- Add new columns to coach_applications
ALTER TABLE public.coach_applications
  ADD COLUMN IF NOT EXISTS coach_background text,
  ADD COLUMN IF NOT EXISTS coach_background_detail text,
  ADD COLUMN IF NOT EXISTS certification_interest text,
  ADD COLUMN IF NOT EXISTS coaching_experience_years text,
  ADD COLUMN IF NOT EXISTS leadership_experience_years text,
  ADD COLUMN IF NOT EXISTS "current_role" text,
  ADD COLUMN IF NOT EXISTS coaching_experience_level text,
  ADD COLUMN IF NOT EXISTS primary_join_reason text,
  ADD COLUMN IF NOT EXISTS commitment_level text,
  ADD COLUMN IF NOT EXISTS start_timeline text,
  ADD COLUMN IF NOT EXISTS excitement_note text,
  ADD COLUMN IF NOT EXISTS pillar_specialties text[],
  ADD COLUMN IF NOT EXISTS coaching_philosophy text;

-- Add new columns to coaches
ALTER TABLE public.coaches
  ADD COLUMN IF NOT EXISTS coach_background text,
  ADD COLUMN IF NOT EXISTS coaching_experience_level text,
  ADD COLUMN IF NOT EXISTS leadership_experience_years text,
  ADD COLUMN IF NOT EXISTS pillar_specialties text[],
  ADD COLUMN IF NOT EXISTS "current_role" text,
  ADD COLUMN IF NOT EXISTS coaching_philosophy text;

-- Backfill Barnes Lam - coach_applications
UPDATE public.coach_applications
SET
  coach_background = 'Executive / Business Leader (Operator-Coach)',
  coach_background_detail = 'Founder & CEO, The Strategy Pitch',
  coaching_experience_years = '5-10 years',
  leadership_experience_years = '15+ years',
  "current_role" = 'Founder & CEO, The Strategy Pitch',
  coaching_experience_level = 'Executive / Operator Coach',
  pillar_specialties = ARRAY['Executive Leadership', 'Founder & Entrepreneur Coaching', 'Sport of Business Coaching'],
  primary_join_reason = 'Expand my existing coaching business',
  commitment_level = 'Building full-time coaching practice',
  start_timeline = 'Immediately',
  coaching_philosophy = 'Strategy meets execution -- helping leaders close the gap between vision and results.'
WHERE full_name = 'Barnes Lam';

-- Backfill Mitesh Kapadia - coach_applications
UPDATE public.coach_applications
SET
  coach_background = 'Certified Professional Coach',
  coach_background_detail = 'ICF PCC, CTI CPCC',
  coaching_experience_years = '10+ years',
  leadership_experience_years = '15+ years',
  "current_role" = 'Executive Coach',
  coaching_experience_level = 'Executive / Operator Coach',
  pillar_specialties = ARRAY['Executive Leadership', 'Peak Performance & Execution', 'Mindset & Resilience', 'Career Transitions'],
  primary_join_reason = 'Join a high-performance coaching network',
  commitment_level = 'Already coaching professionally',
  start_timeline = 'Immediately',
  coaching_philosophy = 'Unlocking human potential through deep self-awareness and purposeful action.'
WHERE full_name = 'Mitesh Kapadia';

-- Backfill Barnes Lam - coaches
UPDATE public.coaches
SET
  coach_background = 'Executive / Business Leader (Operator-Coach)',
  coaching_experience_level = 'Executive / Operator Coach',
  leadership_experience_years = '15+ years',
  pillar_specialties = ARRAY['Executive Leadership', 'Founder & Entrepreneur Coaching', 'Sport of Business Coaching'],
  "current_role" = 'Founder & CEO, The Strategy Pitch',
  coaching_philosophy = 'Strategy meets execution -- helping leaders close the gap between vision and results.'
WHERE display_name = 'Barnes Lam';

-- Backfill Mitesh Kapadia - coaches
UPDATE public.coaches
SET
  coach_background = 'Certified Professional Coach',
  coaching_experience_level = 'Executive / Operator Coach',
  leadership_experience_years = '15+ years',
  pillar_specialties = ARRAY['Executive Leadership', 'Peak Performance & Execution', 'Mindset & Resilience', 'Career Transitions'],
  "current_role" = 'Executive Coach',
  coaching_philosophy = 'Unlocking human potential through deep self-awareness and purposeful action.'
WHERE display_name = 'Mitesh Kapadia';
