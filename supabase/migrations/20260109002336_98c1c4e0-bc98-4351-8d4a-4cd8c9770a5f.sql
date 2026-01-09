-- Create coach_availability table for scheduling
CREATE TABLE public.coach_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(coach_id, day_of_week)
);

-- Create session_bookings table
CREATE TABLE public.session_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
  client_id UUID NOT NULL,
  client_email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  google_calendar_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.coach_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_bookings ENABLE ROW LEVEL SECURITY;

-- Coach availability policies
CREATE POLICY "Coach availability is viewable by everyone"
ON public.coach_availability FOR SELECT
USING (true);

CREATE POLICY "Coaches can manage own availability"
ON public.coach_availability FOR ALL
USING (coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid()));

-- Session bookings policies
CREATE POLICY "Clients can view own bookings"
ON public.session_bookings FOR SELECT
USING (client_id = auth.uid());

CREATE POLICY "Coaches can view their bookings"
ON public.session_bookings FOR SELECT
USING (coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can create bookings"
ON public.session_bookings FOR INSERT
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own bookings"
ON public.session_bookings FOR UPDATE
USING (client_id = auth.uid());

CREATE POLICY "Coaches can update their session bookings"
ON public.session_bookings FOR UPDATE
USING (coach_id IN (SELECT id FROM public.coaches WHERE user_id = auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_session_bookings_updated_at
BEFORE UPDATE ON public.session_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default availability for existing coaches (Mon-Fri 9am-5pm)
INSERT INTO public.coach_availability (coach_id, day_of_week, start_time, end_time)
SELECT c.id, d.day, '09:00:00'::TIME, '17:00:00'::TIME
FROM public.coaches c
CROSS JOIN (VALUES (1), (2), (3), (4), (5)) AS d(day)
ON CONFLICT (coach_id, day_of_week) DO NOTHING;