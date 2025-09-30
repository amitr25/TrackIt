-- Update the role detection function to handle special faculty ID
CREATE OR REPLACE FUNCTION public.get_user_role(email TEXT)
RETURNS app_role
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if email ends with @krmu.edu.in
  IF email LIKE '%@krmu.edu.in' THEN
    -- Extract the part before @krmu.edu.in
    DECLARE
      username TEXT;
    BEGIN
      username := split_part(email, '@', 1);
      
      -- Special case: 2201010055 is faculty despite numeric format
      IF username = '2201010055' THEN
        RETURN 'faculty'::app_role;
      END IF;
      
      -- Check if username contains only digits (student ID format)
      IF username ~ '^[0-9]+$' THEN
        RETURN 'student'::app_role;
      ELSE
        RETURN 'faculty'::app_role;
      END IF;
    END;
  ELSE
    -- Non-KRMU emails default to faculty
    RETURN 'faculty'::app_role;
  END IF;
END;
$$;