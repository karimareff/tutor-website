-- 1. Update the handle_new_user function to create a tutor record if the role is 'tutor'
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Insert into profiles
  insert into public.profiles (id, email, full_name, role, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || (new.raw_user_meta_data->>'full_name')
  );

  -- If the role is 'tutor', also insert into tutors table
  if (new.raw_user_meta_data->>'role') = 'tutor' then
    insert into public.tutors (id, hourly_rate)
    values (new.id, 300); -- Default hourly rate
  end if;

  return new;
end;
$$;

-- 2. Backfill: Insert missing tutor records for existing users who have role 'tutor'
insert into public.tutors (id, hourly_rate)
select id, 300
from public.profiles
where role = 'tutor'
and id not in (select id from public.tutors);
