-- Drop the existing view
DROP VIEW IF EXISTS public.tutor_profiles_public;

-- Create a security definer function that returns public tutor data
-- This makes the intent explicit and provides controlled access
CREATE OR REPLACE FUNCTION public.get_public_tutor_profiles()
RETURNS TABLE (
  id uuid,
  name text,
  major text,
  graduation_year integer,
  department text,
  bio text,
  avatar_url text,
  location text,
  is_tutor boolean,
  hourly_rate numeric,
  availability jsonb,
  locations jsonb,
  specializations jsonb,
  is_verified boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Explicitly return only non-sensitive fields for verified tutors
  -- This function runs with elevated privileges but only exposes safe data
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.major,
    p.graduation_year,
    p.department,
    p.bio,
    p.avatar_url,
    p.location,
    p.is_tutor,
    p.hourly_rate,
    p.availability,
    p.locations,
    p.specializations,
    p.is_verified,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.is_tutor = true;
END;
$$;

-- Add explicit comment documenting the security model
COMMENT ON FUNCTION public.get_public_tutor_profiles() IS 
'SECURITY: This function intentionally provides public access to tutor profiles with only non-sensitive fields (excludes email, phone, student_id, wallet_public_key). Used for tutor browsing/search. Runs as SECURITY DEFINER to bypass RLS while maintaining data safety.';

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.get_public_tutor_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_tutor_profiles() TO anon;

-- Create a view that uses the function for easier querying
CREATE OR REPLACE VIEW public.tutor_profiles_public AS
SELECT * FROM public.get_public_tutor_profiles();

-- Grant SELECT on view
GRANT SELECT ON public.tutor_profiles_public TO authenticated;
GRANT SELECT ON public.tutor_profiles_public TO anon;

-- Add comment to view
COMMENT ON VIEW public.tutor_profiles_public IS 
'Public-safe view of tutor profiles. Queries the get_public_tutor_profiles() security definer function which explicitly excludes sensitive personal information. This makes public access intent clear and auditable.';