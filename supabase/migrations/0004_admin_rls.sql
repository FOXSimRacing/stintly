-- Platform-admin access control. `admins` is a simple membership table
-- (platform-wide, not team-scoped) — same SECURITY DEFINER pattern as
-- is_team_member/has_team_role in 0001_rls_policies.sql to avoid recursive
-- RLS checks.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from admins where user_id = auth.uid()
  );
$$;

-- No insert/update/delete policy: this table is only written via migration
-- or the service role (which bypasses RLS) for now — there's no in-app
-- admin promotion/demotion UI yet.
create policy "admins can view admin list" on admins
for select using (is_admin());

insert into admins (user_id)
select id from auth.users where email = 'gusribeiro@gmail.com'
on conflict (user_id) do nothing;
