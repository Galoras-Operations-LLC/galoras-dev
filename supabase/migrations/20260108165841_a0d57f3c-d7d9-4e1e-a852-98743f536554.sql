-- Create storage bucket for brand images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('brand-images', 'brand-images', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp']);

-- Allow public read access to brand images
CREATE POLICY "Brand images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-images');

-- Allow authenticated users to upload brand images (for admin)
CREATE POLICY "Authenticated users can upload brand images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'brand-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update brand images
CREATE POLICY "Authenticated users can update brand images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'brand-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete brand images
CREATE POLICY "Authenticated users can delete brand images"
ON storage.objects FOR DELETE
USING (bucket_id = 'brand-images' AND auth.role() = 'authenticated');

-- Create table to track generated images
CREATE TABLE public.brand_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name TEXT NOT NULL UNIQUE,
  storage_path TEXT NOT NULL,
  prompt TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brand_images ENABLE ROW LEVEL SECURITY;

-- Anyone can read brand images (they're public assets)
CREATE POLICY "Brand images metadata is publicly readable"
ON public.brand_images FOR SELECT
USING (true);

-- Only authenticated users can manage
CREATE POLICY "Authenticated users can insert brand images"
ON public.brand_images FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update brand images"
ON public.brand_images FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete brand images"
ON public.brand_images FOR DELETE
USING (auth.role() = 'authenticated');