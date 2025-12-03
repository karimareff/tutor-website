-- 1. Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(session_id, student_id) -- Prevent double booking
);

-- 2. Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 3. Migrate existing data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'student_id') THEN
        INSERT INTO public.bookings (session_id, student_id)
        SELECT id, student_id
        FROM public.sessions
        WHERE student_id IS NOT NULL
        ON CONFLICT (session_id, student_id) DO NOTHING;
    END IF;
END $$;

-- 4. Drop old policies that depend on student_id BEFORE dropping the column
DROP POLICY IF EXISTS "Students can view their booked sessions." ON public.sessions;
DROP POLICY IF EXISTS "Students can book available sessions." ON public.sessions;
DROP POLICY IF EXISTS "Students can cancel their own bookings" ON public.sessions;
-- Also drop any other potential policies that might reference it
DROP POLICY IF EXISTS "Available sessions are viewable by everyone." ON public.sessions;

-- Recreate "Available sessions" policy (it might have used status='AVAILABLE' which is fine, but let's be safe)
CREATE POLICY "Available sessions are viewable by everyone."
  ON public.sessions FOR SELECT
  USING ( status = 'AVAILABLE' );

-- 5. Modify sessions table
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS capacity integer DEFAULT 10;

-- Drop student_id if it exists (CASCADE will remove any lingering dependent objects)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'student_id') THEN
        ALTER TABLE public.sessions DROP COLUMN student_id CASCADE;
    END IF;
END $$;

-- 6. RLS Policies for bookings

-- Students can view their own bookings
CREATE POLICY "Students can view their own bookings"
ON public.bookings FOR SELECT
USING ( auth.uid() = student_id );

-- Tutors can view bookings for their sessions
CREATE POLICY "Tutors can view bookings for their sessions"
ON public.bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sessions
    WHERE sessions.id = bookings.session_id
    AND sessions.tutor_id = auth.uid()
  )
);

-- Students can create bookings (if they are the student)
CREATE POLICY "Students can create bookings"
ON public.bookings FOR INSERT
WITH CHECK ( auth.uid() = student_id );

-- Students can delete their own bookings
CREATE POLICY "Students can delete their own bookings"
ON public.bookings FOR DELETE
USING ( auth.uid() = student_id );

-- 7. New Sessions Policies

-- Students can view sessions they have booked (via join)
CREATE POLICY "Students can view sessions they have booked"
ON public.sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.session_id = sessions.id
    AND bookings.student_id = auth.uid()
  )
);
