-- Update the policy to allow students to view sessions they have booked OR available sessions
drop policy if exists "Available sessions are viewable by everyone." on public.sessions;
drop policy if exists "Students can view their booked sessions." on public.sessions;

create policy "Sessions are viewable by everyone if available or booked by user."
  on public.sessions for select
  using ( 
    status = 'AVAILABLE' 
    or 
    (status = 'BOOKED' and auth.uid() = student_id)
    or
    (auth.uid() = tutor_id) -- Tutors can see all their sessions
  );
