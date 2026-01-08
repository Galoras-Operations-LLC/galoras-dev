-- Add display columns to coaches table for demo/display purposes
ALTER TABLE public.coaches 
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS avatar_url text;