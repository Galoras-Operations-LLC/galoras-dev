-- Allow admins to insert change log entries directly from the client
CREATE POLICY "Admins can insert change log"
  ON product_change_log FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
