-- Site visits analytics table
CREATE TABLE IF NOT EXISTS public.site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,          -- anonymous fingerprint (hashed, no PII)
  session_id TEXT NOT NULL,          -- unique per browser session
  page_path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_seconds INTEGER DEFAULT 0,
  is_authenticated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for daily report queries
CREATE INDEX idx_site_visits_entered_at ON public.site_visits (entered_at);
CREATE INDEX idx_site_visits_visitor_id ON public.site_visits (visitor_id);
CREATE INDEX idx_site_visits_session_id ON public.site_visits (session_id);

-- RLS: allow anonymous inserts (tracking), admin-only reads
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert visit records"
  ON public.site_visits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can read visit data"
  ON public.site_visits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

COMMENT ON TABLE public.site_visits IS 'Lightweight analytics: page views, unique visitors, session duration';
