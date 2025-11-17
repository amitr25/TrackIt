-- First, clean up duplicate records by keeping only the most recent entry for each student-course combination
DELETE FROM student_courses
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY student_id, course_id 
             ORDER BY updated_at DESC, created_at DESC
           ) as row_num
    FROM student_courses
  ) t
  WHERE row_num > 1
);

-- Now add the unique constraint on student_id and course_id
ALTER TABLE student_courses 
  DROP CONSTRAINT IF EXISTS unique_student_course_faculty;

ALTER TABLE student_courses 
  ADD CONSTRAINT unique_student_course UNIQUE (student_id, course_id);