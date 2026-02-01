-- Migration 03: Cleanup Unused Fields
-- This migration removes deprecated columns that are no longer used

-- 1. Drop rating column from tutors (reviews feature removed)
ALTER TABLE public.tutors 
DROP COLUMN IF EXISTS rating CASCADE;

-- 2. Drop hourly_rate column from tutors (not used in V1)
ALTER TABLE public.tutors 
DROP COLUMN IF EXISTS hourly_rate CASCADE;

-- 3. Rename comments to feedback in assignment_submissions for clarity
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assignment_submissions' AND column_name = 'comments'
    ) THEN
        ALTER TABLE public.assignment_submissions 
        RENAME COLUMN comments TO feedback;
    END IF;
END $$;

-- ROLLBACK (if needed):
-- ALTER TABLE public.tutors ADD COLUMN rating numeric DEFAULT 5.0;
-- ALTER TABLE public.tutors ADD COLUMN hourly_rate integer;
-- ALTER TABLE public.assignment_submissions RENAME COLUMN feedback TO comments;
