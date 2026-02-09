-- Add onboarding columns to coach_applications table
ALTER TABLE public.coach_applications
ADD COLUMN onboarding_token TEXT UNIQUE,
ADD COLUMN onboarding_status TEXT DEFAULT NULL;

-- Create index for token lookups
CREATE INDEX idx_coach_applications_onboarding_token ON public.coach_applications(onboarding_token);

-- Add RLS policy for token-based access (for onboarding page)
CREATE POLICY "Anyone can view application by onboarding token"
ON public.coach_applications
FOR SELECT
USING (onboarding_token IS NOT NULL AND onboarding_status = 'pending');

-- Allow updates via onboarding token
CREATE POLICY "Anyone can update application via onboarding token"
ON public.coach_applications
FOR UPDATE
USING (onboarding_token IS NOT NULL AND onboarding_status = 'pending');