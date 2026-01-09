-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage coach avatars" ON storage.objects;

-- Create a more specific policy for updates (service role uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS anyway)
-- So we just need policies for regular users - the service role in edge functions already bypasses RLS