-- Migration 01: Resolve Booking Architecture Conflict
-- This migration ensures we use the bookings table approach (System B)
-- and removes the old direct booking via sessions.student_id

-- 1. Ensure bookings table exists (from convert_to_group_sessions.sql)
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')) DEFAULT 'CONFIRMED',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(session_id, student_id)
);

-- 2. Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 3. Drop old policies that depend on sessions.student_id
DROP POLICY IF EXISTS "Students can view their booked sessions." ON public.sessions;
DROP POLICY IF EXISTS "Students can book available sessions." ON public.sessions;

-- 4. Remove student_id column from sessions if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sessions' AND column_name = 'student_id'
    ) THEN
        ALTER TABLE public.sessions DROP COLUMN student_id CASCADE;
    END IF;
END $$;

-- 5. Create/Update bookings RLS policies

-- Students can view their own bookings
DROP POLICY IF EXISTS "Students can view their own bookings" ON public.bookings;
CREATE POLICY "Students can view their own bookings"
ON public.bookings FOR SELECT
USING ( auth.uid() = student_id );

-- Tutors can view bookings for their sessions
DROP POLICY IF EXISTS "Tutors can view bookings for their sessions" ON public.bookings;
CREATE POLICY "Tutors can view bookings for their sessions"
ON public.bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sessions
    WHERE sessions.id = bookings.session_id
    AND sessions.tutor_id = auth.uid()
  )
);

-- Students can create bookings
DROP POLICY IF EXISTS "Students can create bookings" ON public.bookings;
CREATE POLICY "Students can create bookings"
ON public.bookings FOR INSERT
WITH CHECK ( auth.uid() = student_id );

-- Students can delete their own bookings (cancel)
DROP POLICY IF EXISTS "Students can delete their own bookings" ON public.bookings;
CREATE POLICY "Students can delete their own bookings"
ON public.bookings FOR DELETE
USING ( auth.uid() = student_id );

-- Tutors can delete bookings for their sessions (admin cancel)
DROP POLICY IF EXISTS "Tutors can cancel bookings for their sessions" ON public.bookings;
CREATE POLICY "Tutors can cancel bookings for their sessions"
ON public.bookings FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.sessions
    WHERE sessions.id = bookings.session_id
    AND sessions.tutor_id = auth.uid()
  )
);

-- 6. Update sessions policies for new architecture

-- Students can view sessions they have booked via bookings table
DROP POLICY IF EXISTS "Students can view sessions they have booked" ON public.sessions;
CREATE POLICY "Students can view sessions they have booked"
ON public.sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.session_id = sessions.id
    AND bookings.student_id = auth.uid()
  )
);

-- ROLLBACK INSTRUCTIONS:
-- This migration is one-way. Reverting would require manual data migration
-- from bookings table back to sessions.student_id, which is not recommended.
