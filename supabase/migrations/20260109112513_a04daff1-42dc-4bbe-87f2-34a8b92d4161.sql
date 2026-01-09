-- Create coach-avatars storage bucket for storing coach images
INSERT INTO storage.buckets (id, name, public)
VALUES ('coach-avatars', 'coach-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to coach avatars
CREATE POLICY "Coach avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'coach-avatars');

-- Allow authenticated users to upload coach avatars
CREATE POLICY "Authenticated users can upload coach avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'coach-avatars' AND auth.role() = 'authenticated');

-- Allow service role to manage all coach avatars (for edge functions)
CREATE POLICY "Service role can manage coach avatars"
ON storage.objects FOR ALL
USING (bucket_id = 'coach-avatars')
WITH CHECK (bucket_id = 'coach-avatars');