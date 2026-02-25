ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS featured_rank integer;
ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS featured_at timestamptz;