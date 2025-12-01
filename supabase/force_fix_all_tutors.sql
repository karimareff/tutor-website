-- 1. Ensure ALL users from auth.users have a profile
insert into public.profiles (id, email, full_name, role, avatar_url)
select 
  id, 
  email, 
  coalesce(raw_user_meta_data->>'full_name', 'User ' || substr(email, 1, 4)),
  'tutor', -- Force role to tutor for now to avoid issues
  'https://api.dicebear.com/7.x/avataaars/svg?seed=' || coalesce(raw_user_meta_data->>'full_name', email)
from auth.users
where id not in (select id from public.profiles);

-- 2. Ensure ALL profiles have a tutor record (Fixes the FK error)
insert into public.tutors (id, hourly_rate)
select id, 300
from public.profiles
where id not in (select id from public.tutors);

-- 3. Update all profiles to be tutors (Optional, but helps with UI logic)
update public.profiles set role = 'tutor' where role = 'student';
