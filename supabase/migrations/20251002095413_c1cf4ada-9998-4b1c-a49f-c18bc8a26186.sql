-- Update the get_user_role function to handle new faculty domain and special cases
CREATE OR REPLACE FUNCTION public.get_user_role(email text)
RETURNS app_role
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DECLARE
    username TEXT;
  BEGIN
    -- Extract the part before @ symbol
    username := split_part(email, '@', 1);
    
    -- Special faculty cases with @krmu.edu.in domain
    IF email IN ('2201010055@krmu.edu.in', '2201010016@krmu.edu.in') THEN
      RETURN 'faculty'::app_role;
    END IF;
    
    -- Regular faculty with new domain
    IF email LIKE '%@krmangalam.edu.in' THEN
      RETURN 'faculty'::app_role;
    END IF;
    
    -- Students with @krmu.edu.in and numeric username
    IF email LIKE '%@krmu.edu.in' AND username ~ '^[0-9]+$' THEN
      RETURN 'student'::app_role;
    END IF;
    
    -- Default to faculty for any other email
    RETURN 'faculty'::app_role;
  END;
END;
$function$;