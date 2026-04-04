-- Messages table for coach-to-prospect communication
-- Uses coach_id (FK to coaches) rather than receiver_id (FK to auth.users)
-- so coaches don't need auth accounts to receive messages.

CREATE TABLE public.messages (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id    uuid NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  sender_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_email text,
  subject     text,
  content     text NOT NULL,
  read_at     timestamptz,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Authenticated users can send messages
CREATE POLICY "Authenticated users can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Coaches can read messages addressed to them
CREATE POLICY "Coaches can read their messages"
  ON public.messages FOR SELECT
  USING (
    coach_id IN (
      SELECT id FROM public.coaches WHERE user_id = auth.uid()
    )
  );

-- Coaches can mark messages as read
CREATE POLICY "Coaches can update their messages"
  ON public.messages FOR UPDATE
  USING (
    coach_id IN (
      SELECT id FROM public.coaches WHERE user_id = auth.uid()
    )
  );
