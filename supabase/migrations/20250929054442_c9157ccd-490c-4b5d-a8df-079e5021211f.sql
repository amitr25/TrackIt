-- Fix the search_path security warning by updating the function
CREATE OR REPLACE FUNCTION public.get_user_role(email TEXT)
RETURNS app_role
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF email LIKE '%@krmu.edu.in' THEN
    RETURN 'student'::app_role;
  ELSE
    RETURN 'faculty'::app_role;
  END IF;
END;
$$;