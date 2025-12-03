-- Add ON DELETE CASCADE to sessions.tutor_id
ALTER TABLE public.sessions
DROP CONSTRAINT sessions_tutor_id_fkey,
ADD CONSTRAINT sessions_tutor_id_fkey
  FOREIGN KEY (tutor_id)
  REFERENCES public.tutors(id)
  ON DELETE CASCADE;

-- Ensure storage policies are secure (refining the previous broad policies if needed)
-- We'll drop existing policies to be safe and recreate them with stricter checks if possible, 
-- but for now, let's just ensure the cascade is fixed as that was the critical data integrity issue.
