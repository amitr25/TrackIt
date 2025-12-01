-- Add quiz_score column to student_courses table
ALTER TABLE student_courses 
  ADD COLUMN quiz_score numeric DEFAULT 0 CHECK (quiz_score >= 0 AND quiz_score <= 100);