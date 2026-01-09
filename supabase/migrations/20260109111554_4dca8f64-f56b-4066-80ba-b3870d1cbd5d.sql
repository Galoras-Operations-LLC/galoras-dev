-- Add avatar_url column to coach_applications table for applicant photos
ALTER TABLE public.coach_applications 
ADD COLUMN avatar_url text;