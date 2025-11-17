-- First, delete duplicate records keeping only the most recent one
DELETE FROM public.student_courses
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY student_id, course_id, faculty_id 
             ORDER BY created_at DESC
           ) as row_num
    FROM public.student_courses
  ) t
  WHERE row_num > 1
);

-- Now add the unique constraint
ALTER TABLE public.student_courses
ADD CONSTRAINT unique_student_course_faculty 
UNIQUE (student_id, course_id, faculty_id);