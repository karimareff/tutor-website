-- Drop the old bookings table if it exists
drop table if exists public.bookings;

-- Drop the sessions table if it exists (to ensure we create it with the correct schema)
drop table if exists public.sessions;

-- Create sessions table (Tutor Inventory)
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  tutor_id uuid references public.tutors(id) not null,
  student_id uuid references public.profiles(id), -- Nullable, filled when booked
  subject text not null,
  location text check (location in ('online', 'in-person')) default 'online',
  price integer not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text check (status in ('AVAILABLE', 'BOOKED', 'COMPLETED', 'CANCELLED')) default 'AVAILABLE',
  meeting_link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on sessions
alter table public.sessions enable row level security;

-- Policies

-- Everyone can view available sessions
create policy "Available sessions are viewable by everyone."
  on public.sessions for select
  using ( status = 'AVAILABLE' );

-- Tutors can view all their own sessions
create policy "Tutors can view their own sessions."
  on public.sessions for select
  using ( auth.uid() = tutor_id );

-- Students can view sessions they have booked
create policy "Students can view their booked sessions."
  on public.sessions for select
  using ( auth.uid() = student_id );

-- Tutors can insert their own sessions
create policy "Tutors can create sessions."
  on public.sessions for insert
  with check ( auth.uid() = tutor_id );

-- Tutors can update their own sessions
create policy "Tutors can update their own sessions."
  on public.sessions for update
  using ( auth.uid() = tutor_id );

-- Students can book a session (update student_id and status)
create policy "Students can book available sessions."
  on public.sessions for update
  using ( status = 'AVAILABLE' )
  with check ( status = 'BOOKED' and auth.uid() = student_id );
