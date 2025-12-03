-- Fix RLS Infinite Recursion
-- The issue is:
-- 1. "Students can view sessions they have booked" (on sessions) queries 'bookings'.
-- 2. "Tutors can view bookings for their sessions" (on bookings) queries 'sessions'.
-- This creates a cycle: sessions -> bookings -> sessions.

-- Solution: Use a SECURITY DEFINER function for the Tutor check to bypass RLS on 'sessions' when querying from 'bookings'.

-- 1. Create the helper function
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

-- 2. Drop the problematic policy
DROP POLICY IF EXISTS "Tutors can view bookings for their sessions" ON public.bookings;

-- 3. Recreate the policy using the function
CREATE POLICY "Tutors can view bookings for their sessions"
ON public.bookings FOR SELECT
USING (
  public.is_session_creator(session_id)
);

-- 4. Just in case, let's optimize the Student session view policy too, though strictly not needed if the cycle is broken.
-- But to be safe and performant, let's leave it as is for now. The cycle break above should suffice.
