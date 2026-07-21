-- Access control for race_drivers (roster of who's entered in a race),
-- same join-through-races pattern already used for stint_plans/stints.

create policy "team members can view race drivers" on race_drivers
for select using (
  exists (select 1 from races r where r.id = race_drivers.race_id and is_team_member(r.team_id))
);

create policy "owners and strategists manage race drivers" on race_drivers
for all using (
  exists (
    select 1 from races r
    where r.id = race_drivers.race_id
      and has_team_role(r.team_id, array['owner', 'strategist']::team_member_role[])
  )
)
with check (
  exists (
    select 1 from races r
    where r.id = race_drivers.race_id
      and has_team_role(r.team_id, array['owner', 'strategist']::team_member_role[])
  )
);
