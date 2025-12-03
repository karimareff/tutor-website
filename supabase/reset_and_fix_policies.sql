-- COMPLETE RESET AND FIX OF RLS POLICIES
-- Run this script to completely reset and fix visibility issues for Tutors and Students.

-- 1. Helper Function to prevent Infinite Recursion
CREATE OR REPLACE FUNCTION public.is_session_creator(_session_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM sessions
    WHERE id = _session_id
    AND tutor_id = auth.uid()
  );
$$;

-- 2. Reset SESSIONS Policies
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Available sessions are viewable by everyone." ON public.sessions;
DROP POLICY IF EXISTS "Students can view sessions they have booked" ON public.sessions;
DROP POLICY IF EXISTS "Tutors can view their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Tutors can insert their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Tutors can update their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Tutors can delete their own sessions" ON public.sessions;
-- Drop old/legacy policies if they still exist
DROP POLICY IF EXISTS "Students can view their booked sessions." ON public.sessions;
DROP POLICY IF EXISTS "Students can book available sessions." ON public.sessions;
DROP POLICY IF EXISTS "Students can cancel their own bookings" ON public.sessions;

-- Re-create Policies
-- A. Public/Students: View Available Sessions
CREATE POLICY "Public view available sessions"
ON public.sessions FOR SELECT
USING ( status = 'AVAILABLE' );

-- B. Students: View Sessions they are booked in
CREATE POLICY "Students view booked sessions"
ON public.sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.session_id = sessions.id
    AND bookings.student_id = auth.uid()
  )
);

-- C. Tutors: Full control over their own sessions
CREATE POLICY "Tutors manage own sessions"
ON public.sessions FOR ALL
USING ( tutor_id = auth.uid() )
WITH CHECK ( tutor_id = auth.uid() );


-- 3. Reset BOOKINGS Policies
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Students can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Tutors can view bookings for their sessions" ON public.bookings;
DROP POLICY IF EXISTS "Students can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Students can delete their own bookings" ON public.bookings;

-- Re-create Policies
-- A. Students: View/Create/Delete their own bookings
CREATE POLICY "Students manage own bookings"
ON public.bookings FOR ALL
USING ( student_id = auth.uid() )
WITH CHECK ( student_id = auth.uid() );

-- B. Tutors: View bookings for their sessions (using the secure function)
CREATE POLICY "Tutors view session bookings"
ON public.bookings FOR SELECT
USING (
  public.is_session_creator(session_id)
);
