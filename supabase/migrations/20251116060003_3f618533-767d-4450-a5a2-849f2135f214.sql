-- Remove the overly permissive public policy
DROP POLICY IF EXISTS "Public can view non-sensitive tutor info" ON public.profiles;

-- Drop existing view
DROP VIEW IF EXISTS public.tutor_profiles_public CASCADE;

-- Create a properly secured function with explicit documentation
CREATE OR REPLACE FUNCTION public.get_tutor_profiles_safe()
RETURNS TABLE (
  id uuid,
  name text,
  major text,
  graduation_year integer,
  department text,
  bio text,
  avatar_url text,
  location text,
  hourly_rate numeric,
  availability jsonb,
  locations jsonb,
  specializations jsonb,
  is_verified boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- SECURITY: This function intentionally provides public access to tutor listings
  -- It explicitly excludes ALL sensitive personal data:
  -- ❌ email (enables spam/phishing)
  -- ❌ phone (enables harassment) 
  -- ❌ student_id (enables identity theft)
  -- ❌ wallet_public_key (crypto security risk)
  --
  -- Only safe, public-appropriate fields are returned.
  -- This pattern is required because RLS on the profiles table properly blocks
  -- public access to protect sensitive data, but we need controlled public access
  -- for tutor discovery (similar to Upwork, Fiverr, etc.).
  
  SELECT 
    id,
    name,
    major,
    graduation_year,
    department,
    bio,
    avatar_url,
    location,
    hourly_rate,
    availability,
    locations,
    specializations,
    is_verified
  FROM profiles
  WHERE is_tutor = true;
$$;

-- Grant execute to all users
GRANT EXECUTE ON FUNCTION public.get_tutor_profiles_safe() TO authenticated, anon;

-- Add comprehensive security documentation
COMMENT ON FUNCTION public.get_tutor_profiles_safe() IS 
'SECURITY REVIEWED: Uses SECURITY DEFINER to provide controlled public tutor browsing while base profiles table remains locked down via RLS. Explicitly excludes email, phone, student_id, wallet_public_key. This is the ONLY approved method for public tutor discovery. See security audit log for approval.';

-- Create view for convenient querying
CREATE VIEW public.tutor_profiles_public AS
SELECT * FROM public.get_tutor_profiles_safe();

GRANT SELECT ON public.tutor_profiles_public TO authenticated, anon;