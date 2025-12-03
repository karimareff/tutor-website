-- Verify and Fix Bookings RLS Policies

-- First, let's check what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'bookings';

-- Drop all existing policies on bookings
DROP POLICY IF EXISTS "Students can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Tutors can view bookings for their sessions" ON public.bookings;
DROP POLICY IF EXISTS "Students can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Students can delete their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Students manage own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Tutors view session bookings" ON public.bookings;

-- Re-create policies with proper permissions

-- 1. Students can view their own bookings
CREATE POLICY "Students can view their own bookings"
ON public.bookings FOR SELECT
USING ( student_id = auth.uid() );

-- 2. Tutors can view bookings for their sessions
CREATE POLICY "Tutors can view bookings for their sessions"
ON public.bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sessions
    WHERE sessions.id = bookings.session_id
    AND sessions.tutor_id = auth.uid()
  )
);

-- 3. Students can create bookings (INSERT)
CREATE POLICY "Students can create bookings"
ON public.bookings FOR INSERT
WITH CHECK ( student_id = auth.uid() );

-- 4. Students can delete their own bookings
CREATE POLICY "Students can delete their own bookings"
ON public.bookings FOR DELETE
USING ( student_id = auth.uid() );

-- Verify RLS is enabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Test query (replace with actual IDs)
-- SELECT * FROM bookings WHERE student_id = auth.uid();
