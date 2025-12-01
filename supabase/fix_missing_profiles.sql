-- 1. Fix missing profiles
-- Insert profiles for any user in auth.users that doesn't have a profile
insert into public.profiles (id, email, full_name, role, avatar_url)
select 
  id, 
  email, 
  coalesce(raw_user_meta_data->>'full_name', 'User ' || substr(email, 1, 4)),
  coalesce(raw_user_meta_data->>'role', 'student'),
  'https://api.dicebear.com/7.x/avataaars/svg?seed=' || coalesce(raw_user_meta_data->>'full_name', email)
from auth.users
where id not in (select id from public.profiles);

-- 2. Fix missing tutors
-- Insert tutor records for any profile with role 'tutor' that doesn't have a tutor record
insert into public.tutors (id, hourly_rate)
select id, 300
from public.profiles
where role = 'tutor'
and id not in (select id from public.tutors);
