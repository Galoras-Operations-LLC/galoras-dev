-- Add phone number to profiles (for future SMS OTP)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Index for phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles (phone) WHERE phone IS NOT NULL;

-- Comment
COMMENT ON COLUMN public.profiles.phone IS 'User phone number for SMS OTP verification. Format: E.164 (e.g. +15551234567)';
