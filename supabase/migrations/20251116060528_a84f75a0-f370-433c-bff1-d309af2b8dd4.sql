-- Revoke anonymous access to the tutor profiles function
REVOKE EXECUTE ON FUNCTION public.get_tutor_profiles_safe() FROM anon;

-- Revoke anonymous access to the view
REVOKE SELECT ON public.tutor_profiles_public FROM anon;

-- Keep authenticated user access
-- (authenticated users already have EXECUTE and SELECT permissions)

-- Update security documentation
COMMENT ON FUNCTION public.get_tutor_profiles_safe() IS 
'SECURITY: Requires authentication to view tutor profiles. This prevents anonymous scraping, spam bots, and unauthorized data harvesting while allowing legitimate logged-in students to discover tutors. Explicitly excludes sensitive PII: email, phone, student_id, wallet_public_key.';

COMMENT ON VIEW public.tutor_profiles_public IS 
'AUTHENTICATION REQUIRED: Only authenticated users can browse tutor profiles. This prevents mass data scraping by anonymous bots while maintaining a functional marketplace for verified @wisc.edu students. View excludes all sensitive personal information.';

-- Add rate limiting comment for future implementation
COMMENT ON TABLE public.profiles IS 
'SECURITY: Base table with RLS enabled. Users can only SELECT their own profile. Public tutor discovery requires authentication and uses the get_tutor_profiles_safe() function which filters sensitive data.';