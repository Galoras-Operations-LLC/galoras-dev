-- Create storage bucket for coach images
INSERT INTO storage.buckets (id, name, public)
VALUES ('coach-images', 'coach-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for coach-images bucket
CREATE POLICY "Coaches can upload their own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'coach-images' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN ('avatars', 'cutouts') AND
  (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Coaches can update their own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'coach-images' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Coaches can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'coach-images' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Anyone can view coach images"
ON storage.objects FOR SELECT
USING (bucket_id = 'coach-images');