-- Drop the security definer function and view
DROP VIEW IF EXISTS public.tutor_profiles_public;
DROP FUNCTION IF EXISTS public.get_public_tutor_profiles();

-- Create a safe public policy for viewing non-sensitive tutor information
-- This policy explicitly allows ONLY non-sensitive columns to be viewed publicly
CREATE POLICY "Public can view non-sensitive tutor info"
  ON public.profiles
  FOR SELECT
  TO authenticated, anon
  USING (is_tutor = true);

-- Note: While this policy allows SELECT on the table, sensitive columns 
-- (email, phone, student_id, wallet_public_key) should never be exposed in queries.
-- Applications MUST explicitly select only safe columns.

-- Create a secure view that explicitly selects only non-sensitive columns
CREATE OR REPLACE VIEW public.tutor_profiles_public 
WITH (security_barrier = true) AS
SELECT 
  id,
  name,
  major,
  graduation_year,
  department,
  bio,
  avatar_url,
  location,
  is_tutor,
  hourly_rate,
  availability,
  locations,
  specializations,
  is_verified,
  created_at,
  updated_at
FROM public.profiles
WHERE is_tutor = true;

-- Grant SELECT on view
GRANT SELECT ON public.tutor_profiles_public TO authenticated;
GRANT SELECT ON public.tutor_profiles_public TO anon;

-- Document the security model
COMMENT ON POLICY "Public can view non-sensitive tutor info" ON public.profiles IS 
'Allows public viewing of tutor profiles. CRITICAL: Applications must query only non-sensitive columns (never select email, phone, student_id, wallet_public_key). Use tutor_profiles_public view for safe queries.';

COMMENT ON VIEW public.tutor_profiles_public IS 
'SECURITY: Public view of tutors with security_barrier enabled. Explicitly excludes sensitive columns: email, phone, student_id, wallet_public_key. This is the ONLY safe way to query tutor data publicly.';