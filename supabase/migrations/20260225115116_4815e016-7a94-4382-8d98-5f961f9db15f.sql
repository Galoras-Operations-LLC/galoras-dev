
-- Add booking_url to coach_applications
ALTER TABLE public.coach_applications ADD COLUMN IF NOT EXISTS booking_url TEXT NULL;

-- Add booking_url to coaches
ALTER TABLE public.coaches ADD COLUMN IF NOT EXISTS booking_url TEXT NULL;

-- Create booking_click_events table
CREATE TABLE IF NOT EXISTS public.booking_click_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  user_id UUID NULL,
  session_id TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.booking_click_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public click logging)
CREATE POLICY "Anyone can log booking clicks"
  ON public.booking_click_events
  FOR INSERT
  WITH CHECK (true);

-- Only admins can read click events
CREATE POLICY "Admins can view booking click events"
  ON public.booking_click_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
