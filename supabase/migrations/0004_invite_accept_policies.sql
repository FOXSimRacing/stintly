-- Closes a gap found while implementing the accept-invite flow (issue #3):
-- the only existing insert policy on team_members that doesn't require the
-- caller to already be a team member is "team creator can add themself as
-- owner", which only covers role = 'owner' for the team's creator. An
-- invited user accepting an invite for a non-owner role (or any role, since
-- they aren't the team's creator) had no policy allowing their own
-- team_members insert, nor updating their own invites row to 'accepted'.

create policy "invited user can accept invite and join team" on team_members
for insert with check (
  user_id = auth.uid()
  and exists (
    select 1 from invites
    where invites.team_id = team_members.team_id
      and invites.role = team_members.role
      and invites.email = (auth.jwt() ->> 'email')
      and invites.status = 'pending'
      and invites.expires_at > now()
  )
);

create policy "invited user can accept their own invite" on invites
for update using (email = (auth.jwt() ->> 'email') and status = 'pending')
with check (email = (auth.jwt() ->> 'email') and status = 'accepted');
