-- Check if the current user is actually a tutor in the profiles table
select * from public.profiles where id = auth.uid();

-- Check if the current user exists in the tutors table
select * from public.tutors where id = auth.uid();

-- Force insert the tutor record for the current user (if you are logged in SQL editor)
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID if running manually, 
-- otherwise this script relies on auth.uid() which works in RLS context but might not in raw SQL editor without impersonation.

-- SAFEST FIX:
-- Run this to insert ALL missing tutors based on profiles
insert into public.tutors (id, hourly_rate)
select id, 300
from public.profiles
where role = 'tutor'
and id not in (select id from public.tutors)
on conflict (id) do nothing;
