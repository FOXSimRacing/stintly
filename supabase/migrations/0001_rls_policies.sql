-- Team-scoped access control. Every table below is already RLS-enabled by
-- the 0000 migration; this migration adds the policies that grant access.
--
-- Pattern: two SECURITY DEFINER helper functions avoid recursive RLS checks
-- (a policy on team_members that queries team_members directly would
-- recurse). All per-table policies are expressed in terms of these.

create or replace function public.is_team_member(p_team_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from team_members
    where team_id = p_team_id and user_id = auth.uid()
  );
$$;

create or replace function public.has_team_role(p_team_id uuid, p_roles team_member_role[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from team_members
    where team_id = p_team_id and user_id = auth.uid() and role = any(p_roles)
  );
$$;

-- teams -----------------------------------------------------------------

create policy "team members can view their team" on teams
for select using (is_team_member(id));

create policy "authenticated users can create a team" on teams
for insert with check (created_by = auth.uid());

create policy "owners can update their team" on teams
for update using (has_team_role(id, array['owner']::team_member_role[]));

create policy "owners can delete their team" on teams
for delete using (has_team_role(id, array['owner']::team_member_role[]));

-- team_members ------------------------------------------------------------

create policy "team members can view roster" on team_members
for select using (is_team_member(team_id));

-- Bootstraps the very first membership row (the creator becomes owner)
-- before any team_members row exists to satisfy has_team_role.
create policy "team creator can add themself as owner" on team_members
for insert with check (
  user_id = auth.uid()
  and role = 'owner'
  and exists (select 1 from teams where id = team_id and created_by = auth.uid())
);

create policy "owners and strategists can add members" on team_members
for insert with check (has_team_role(team_id, array['owner', 'strategist']::team_member_role[]));

create policy "owners and strategists can update roster" on team_members
for update using (has_team_role(team_id, array['owner', 'strategist']::team_member_role[]));

create policy "owners can remove members" on team_members
for delete using (has_team_role(team_id, array['owner']::team_member_role[]));

-- drivers -------------------------------------------------------------------

create policy "team members can view drivers" on drivers
for select using (is_team_member(team_id));

create policy "owners and strategists manage drivers" on drivers
for all using (has_team_role(team_id, array['owner', 'strategist']::team_member_role[]))
with check (has_team_role(team_id, array['owner', 'strategist']::team_member_role[]));

-- driver_availability ---------------------------------------------------

create policy "team members can view availability" on driver_availability
for select using (
  exists (
    select 1 from drivers d
    where d.id = driver_availability.driver_id and is_team_member(d.team_id)
  )
);

create policy "owners and strategists manage availability" on driver_availability
for all using (
  exists (
    select 1 from drivers d
    where d.id = driver_availability.driver_id
      and has_team_role(d.team_id, array['owner', 'strategist']::team_member_role[])
  )
)
with check (
  exists (
    select 1 from drivers d
    where d.id = driver_availability.driver_id
      and has_team_role(d.team_id, array['owner', 'strategist']::team_member_role[])
  )
);

-- tracks / cars (shared reference data, managed by admins via service role) --

create policy "authenticated users can view tracks" on tracks
for select using (auth.role() = 'authenticated');

create policy "authenticated users can view cars" on cars
for select using (auth.role() = 'authenticated');

-- races -----------------------------------------------------------------

create policy "team members can view races" on races
for select using (is_team_member(team_id));

create policy "owners and strategists manage races" on races
for all using (has_team_role(team_id, array['owner', 'strategist']::team_member_role[]))
with check (has_team_role(team_id, array['owner', 'strategist']::team_member_role[]));

-- stint_plans -------------------------------------------------------------

create policy "team members can view stint plans" on stint_plans
for select using (
  exists (select 1 from races r where r.id = stint_plans.race_id and is_team_member(r.team_id))
);

create policy "owners and strategists manage stint plans" on stint_plans
for all using (
  exists (
    select 1 from races r
    where r.id = stint_plans.race_id
      and has_team_role(r.team_id, array['owner', 'strategist']::team_member_role[])
  )
)
with check (
  exists (
    select 1 from races r
    where r.id = stint_plans.race_id
      and has_team_role(r.team_id, array['owner', 'strategist']::team_member_role[])
  )
);

-- stints ------------------------------------------------------------------

create policy "team members can view stints" on stints
for select using (
  exists (
    select 1 from stint_plans sp
    join races r on r.id = sp.race_id
    where sp.id = stints.stint_plan_id and is_team_member(r.team_id)
  )
);

create policy "owners and strategists manage stints" on stints
for all using (
  exists (
    select 1 from stint_plans sp
    join races r on r.id = sp.race_id
    where sp.id = stints.stint_plan_id
      and has_team_role(r.team_id, array['owner', 'strategist']::team_member_role[])
  )
)
with check (
  exists (
    select 1 from stint_plans sp
    join races r on r.id = sp.race_id
    where sp.id = stints.stint_plan_id
      and has_team_role(r.team_id, array['owner', 'strategist']::team_member_role[])
  )
);

-- invites -----------------------------------------------------------------

create policy "owners and strategists manage invites" on invites
for all using (has_team_role(team_id, array['owner', 'strategist']::team_member_role[]))
with check (has_team_role(team_id, array['owner', 'strategist']::team_member_role[]));

create policy "invited user can view their own invite" on invites
for select using (email = (auth.jwt() ->> 'email'));
