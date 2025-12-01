-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  role text check (role in ('student', 'tutor', 'admin')) default 'student',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Create tutors table (extends profiles)
create table public.tutors (
  id uuid references public.profiles(id) on delete cascade not null primary key,
  bio text,
  subjects text[], -- Array of subjects
  hourly_rate integer,
  rating numeric default 5.0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on tutors
alter table public.tutors enable row level security;

create policy "Tutors are viewable by everyone."
  on public.tutors for select
  using ( true );

create policy "Tutors can update their own info."
  on public.tutors for update
  using ( auth.uid() = id );

create policy "Tutors can insert their own info."
  on public.tutors for insert
  with check ( auth.uid() = id );

-- Create bookings table
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) not null,
  tutor_id uuid references public.tutors(id) not null,
  subject text not null,
  date date not null,
  time time not null,
  duration_minutes integer default 60,
  status text check (status in ('pending', 'confirmed', 'cancelled', 'completed')) default 'pending',
  type text check (type in ('online', 'offline')) default 'online',
  meeting_link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on bookings
alter table public.bookings enable row level security;

create policy "Users can view their own bookings (as student or tutor)."
  on public.bookings for select
  using ( auth.uid() = student_id or auth.uid() = tutor_id );

create policy "Students can create bookings."
  on public.bookings for insert
  with check ( auth.uid() = student_id );

create policy "Users can update their own bookings."
  on public.bookings for update
  using ( auth.uid() = student_id or auth.uid() = tutor_id );

-- Insert some dummy tutors for testing (Optional, requires existing user IDs, so skipping for now)
