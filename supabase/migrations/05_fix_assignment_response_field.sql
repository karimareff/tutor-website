-- Migration 05: Fix Assignment Submissions Schema
-- Add separate fields for student response and teacher feedback

-- 1. Add student_response column (for student's text answer)
ALTER TABLE public.assignment_submissions 
ADD COLUMN IF NOT EXISTS student_response text;

-- 2. Migrate existing feedback data
-- Old "feedback" data is actually student responses, not teacher feedback
-- So we need to move it to the new column
UPDATE public.assignment_submissions 
SET student_response = feedback 
WHERE feedback IS NOT NULL AND grade IS NULL;
-- (Only move feedback if not yet graded - those are student responses)

-- 3. Keep feedback for teacher feedback ONLY
-- Already exists from migration 03

-- ROLLBACK:
-- ALTER TABLE public.assignment_submissions DROP COLUMN IF EXISTS student_response;
