-- Enable RLS
ALTER TABLE public.student_tutors ENABLE ROW LEVEL SECURITY;

-- Drop potentially conflicting or malformed policies
DROP POLICY IF EXISTS "Students can join tutors" ON public.student_tutors;
DROP POLICY IF EXISTS "Tutors can view their own students" ON public.student_tutors;
DROP POLICY IF EXISTS "Students can view their own tutor connections" ON public.student_tutors;
DROP POLICY IF EXISTS "Tutors can add students (invite)" ON public.student_tutors;

-- Re-create Policies

-- 1. Allow students to join (Insert themselves)
CREATE POLICY "Students can join tutors"
  ON public.student_tutors FOR INSERT
  WITH CHECK ( auth.uid() = student_id );

-- 2. Allow tutors to see their students
CREATE POLICY "Tutors can view their own students"
  ON public.student_tutors FOR SELECT
  USING ( auth.uid() = tutor_id );

-- 3. Allow students to see their own connections
CREATE POLICY "Students can view their own tutor connections"
  ON public.student_tutors FOR SELECT
  USING ( auth.uid() = student_id );

-- 4. Allow tutors to manually add students (if needed)
CREATE POLICY "Tutors can add students (invite)"
  ON public.student_tutors FOR INSERT
  WITH CHECK ( auth.uid() = tutor_id );
