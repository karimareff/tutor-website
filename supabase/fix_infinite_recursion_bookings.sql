-- Fix Infinite Recursion in Bookings Policies
-- This happens when: bookings policy checks sessions, sessions policy checks bookings = infinite loop

-- Step 1: Create security definer function to check session ownership
CREATE OR REPLACE FUNCTION public.is_session_owner(_session_id uuid)
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

-- Step 2: Drop ALL existing policies on bookings
DROP POLICY IF EXISTS "Students can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Tutors can view bookings for their sessions" ON public.bookings;
DROP POLICY IF EXISTS "Students can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Students can delete their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Students manage own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Tutors view session bookings" ON public.bookings;

-- Step 3: Re-create policies using the security definer function

-- Students can view their own bookings
CREATE POLICY "Students can view their own bookings"
ON public.bookings FOR SELECT
USING ( student_id = auth.uid() );

-- Tutors can view bookings for their sessions (using security definer function)
CREATE POLICY "Tutors can view bookings for their sessions"
ON public.bookings FOR SELECT
USING ( public.is_session_owner(session_id) );

-- Students can create bookings
CREATE POLICY "Students can create bookings"
ON public.bookings FOR INSERT
WITH CHECK ( student_id = auth.uid() );

-- Students can delete their own bookings
CREATE POLICY "Students can delete their own bookings"
ON public.bookings FOR DELETE
USING ( student_id = auth.uid() );

-- Step 4: Ensure RLS is enabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Step 5: Verify the function was created
SELECT proname, prosecdef FROM pg_proc WHERE proname = 'is_session_owner';
