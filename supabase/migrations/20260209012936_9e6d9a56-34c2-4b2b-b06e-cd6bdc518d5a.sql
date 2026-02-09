-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can view application by onboarding token" ON public.coach_applications;
DROP POLICY IF EXISTS "Anyone can update application via onboarding token" ON public.coach_applications;