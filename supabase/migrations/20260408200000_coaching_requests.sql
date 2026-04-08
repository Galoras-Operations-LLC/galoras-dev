-- Coaching requests: captures Request (B2C) and Enterprise Proposal (B2B) flows
-- Spec: end-to-end commercial workflow, section 4B + 4C

CREATE TABLE IF NOT EXISTS coaching_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id        uuid NOT NULL REFERENCES coaches(id),
  product_id      uuid REFERENCES coach_products(id),
  request_type    text NOT NULL CHECK (request_type IN ('request', 'enterprise')),

  -- Requester info
  requester_name  text NOT NULL,
  requester_email text NOT NULL,
  requester_phone text,

  -- Request details
  goal            text,
  context         text,
  urgency         text CHECK (urgency IS NULL OR urgency IN ('low', 'medium', 'high', 'urgent')),

  -- Enterprise-specific
  company_name    text,
  team_size       text,
  problem_statement text,

  -- Product context
  product_title   text,
  product_type    text,

  -- Status
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'accepted', 'declined', 'completed')),
  coach_response  text,
  responded_at    timestamptz,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_coaching_requests_coach ON coaching_requests(coach_id);
CREATE INDEX idx_coaching_requests_status ON coaching_requests(status);

-- RLS
ALTER TABLE coaching_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a request"
  ON coaching_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Coaches can view their own requests"
  ON coaching_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coaches c
      WHERE c.id = coaching_requests.coach_id
      AND c.user_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "Coaches can update their own requests"
  ON coaching_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM coaches c
      WHERE c.id = coaching_requests.coach_id
      AND c.user_id = auth.uid()
    )
    OR is_admin()
  );
