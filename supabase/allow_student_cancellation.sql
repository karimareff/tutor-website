-- Allow students to cancel their own bookings
-- This policy allows a user to update a session IF:
-- 1. They are currently the booked student (student_id = auth.uid())
-- 2. They are setting the status to 'CANCELLED' (or 'AVAILABLE' if you prefer they just release the slot)
--    Let's go with 'AVAILABLE' so the tutor can get re-booked, or 'CANCELLED' if we want to track it.
--    The user request mentioned "can a student cancel?". Usually this frees up the slot.
--    Let's set it back to AVAILABLE and clear the student_id.

CREATE POLICY "Students can cancel their own bookings"
ON public.sessions
FOR UPDATE
USING ( auth.uid() = student_id )
WITH CHECK (
  -- Allow resetting to AVAILABLE and clearing student_id
  status = 'AVAILABLE' AND student_id IS NULL
);
