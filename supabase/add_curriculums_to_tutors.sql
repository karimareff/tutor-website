-- Add curriculums column to tutors table
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS curriculums text[] DEFAULT '{}';

-- Add Social Proof columns
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS active_students INTEGER DEFAULT 0;
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS lessons_taught INTEGER DEFAULT 0;

-- Update existing tutors with some random data for demonstration
-- This ensures your UI won't look empty after the migration
UPDATE public.tutors 
SET 
  active_students = floor(random() * 20 + 5)::int,
  lessons_taught = floor(random() * 500 + 50)::int,
  curriculums = CASE 
    WHEN random() < 0.3 THEN ARRAY['IGCSE', 'SAT']
    WHEN random() < 0.6 THEN ARRAY['SAT', 'EST']
    ELSE ARRAY['IGCSE', 'American Diploma']
  END
WHERE active_students = 0;
