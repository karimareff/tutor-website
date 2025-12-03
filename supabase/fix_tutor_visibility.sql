-- Fix Tutor Visibility Policies
-- Tutors need to be able to view, update, and delete their own sessions regardless of status.

-- 1. Tutors can view their own sessions
CREATE POLICY "Tutors can view their own sessions"
ON public.sessions FOR SELECT
USING ( tutor_id = auth.uid() );

-- 2. Tutors can insert their own sessions
-- (This might already exist, but ensuring it's there)
CREATE POLICY "Tutors can insert their own sessions"
ON public.sessions FOR INSERT
WITH CHECK ( tutor_id = auth.uid() );

-- 3. Tutors can update their own sessions
CREATE POLICY "Tutors can update their own sessions"
ON public.sessions FOR UPDATE
USING ( tutor_id = auth.uid() );

-- 4. Tutors can delete their own sessions
CREATE POLICY "Tutors can delete their own sessions"
ON public.sessions FOR DELETE
USING ( tutor_id = auth.uid() );

-- 5. Ensure "Available sessions" are viewable by everyone (Students)
-- This was added in the previous script, but let's make sure it doesn't conflict.
-- RLS policies are OR-ed together, so:
-- (status = 'AVAILABLE') OR (tutor_id = auth.uid()) OR (booked by student)
-- This covers all bases.
