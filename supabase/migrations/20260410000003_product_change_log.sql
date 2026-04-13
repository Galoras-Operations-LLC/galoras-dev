-- Audit log for all product edits (pre-launch change tracking)
CREATE TABLE IF NOT EXISTS product_change_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid REFERENCES coach_products(id) ON DELETE SET NULL,
  product_title   text,
  coach_id        uuid,
  changed_by_id   uuid,
  changed_by_email text,
  changed_at      timestamptz NOT NULL DEFAULT now(),
  change_type     text NOT NULL DEFAULT 'update', -- 'create' | 'update' | 'delete'
  changes         jsonb NOT NULL DEFAULT '{}'
);

-- Admin-only read; only service role writes
ALTER TABLE product_change_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read change log"
  ON product_change_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
