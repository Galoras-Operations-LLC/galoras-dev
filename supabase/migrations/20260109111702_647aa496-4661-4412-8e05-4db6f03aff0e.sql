-- Create storage bucket for coach application photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('coach-photos', 'coach-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload photos to the applications folder
CREATE POLICY "Anyone can upload application photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'coach-photos' AND (storage.foldername(name))[1] = 'applications');

-- Allow public read access to coach photos
CREATE POLICY "Coach photos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'coach-photos');