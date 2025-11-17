-- Create student_courses table to store course data uploaded by faculty
CREATE TABLE public.student_courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id text NOT NULL,
  student_name text NOT NULL,
  student_email text NOT NULL,
  course_name text NOT NULL,
  course_id text NOT NULL,
  credits integer NOT NULL,
  mid_term_marks numeric NOT NULL,
  attendance numeric NOT NULL,
  assignments numeric NOT NULL,
  predicted_end_term_marks numeric,
  predicted_grade text,
  faculty_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_courses ENABLE ROW LEVEL SECURITY;

-- Students can view their own course records
CREATE POLICY "Students can view their own courses"
ON public.student_courses
FOR SELECT
TO authenticated
USING (
  student_id = (
    SELECT split_part(email, '@', 1)
    FROM public.profiles
    WHERE user_id = auth.uid()
  )
);

-- Faculty can view courses they uploaded
CREATE POLICY "Faculty can view their uploaded courses"
ON public.student_courses
FOR SELECT
TO authenticated
USING (
  faculty_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'faculty'
  )
);

-- Faculty can insert course records
CREATE POLICY "Faculty can insert courses"
ON public.student_courses
FOR INSERT
TO authenticated
WITH CHECK (
  faculty_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'faculty'
  )
);

-- Faculty can update their own course records
CREATE POLICY "Faculty can update their courses"
ON public.student_courses
FOR UPDATE
TO authenticated
USING (
  faculty_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'faculty'
  )
);

-- Faculty can delete their own course records
CREATE POLICY "Faculty can delete their courses"
ON public.student_courses
FOR DELETE
TO authenticated
USING (
  faculty_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'faculty'
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_student_courses_updated_at
BEFORE UPDATE ON public.student_courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_student_courses_student_id ON public.student_courses(student_id);
CREATE INDEX idx_student_courses_faculty_id ON public.student_courses(faculty_id);