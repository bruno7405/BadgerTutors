-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Policy: Users can view their own full profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Create a secure view for public tutor browsing with only non-sensitive fields
CREATE OR REPLACE VIEW public.tutor_profiles_public AS
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

-- Enable RLS on the view
ALTER VIEW public.tutor_profiles_public SET (security_invoker = true);

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.tutor_profiles_public TO authenticated;
GRANT SELECT ON public.tutor_profiles_public TO anon;

-- Add a comment explaining the security model
COMMENT ON POLICY "Users can view their own profile" ON public.profiles IS 
'Users can only view their complete profile including sensitive data like email, phone, student_id, and wallet_public_key. Use tutor_profiles_public view for browsing tutors.';

COMMENT ON VIEW public.tutor_profiles_public IS 
'Public-safe view of tutor profiles that excludes sensitive personal information (email, phone, student_id, wallet_public_key). Anyone can browse this to find tutors without exposing private data.';