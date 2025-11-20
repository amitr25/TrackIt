-- Add semester column to student_courses table
ALTER TABLE public.student_courses 
ADD COLUMN semester integer NOT NULL DEFAULT 1 CHECK (semester >= 1 AND semester <= 8);