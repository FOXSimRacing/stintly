-- The original SELECT policy on `teams` only let existing team members see
-- a team. That made team creation itself unusable: the team_members
-- bootstrap policy in 0001 ("team creator can add themself as owner")
-- checks `exists (select 1 from teams where id = team_id and created_by =
-- auth.uid())`, and that subquery is filtered by this same SELECT policy —
-- a brand new team has no members yet, so its own creator couldn't see the
-- team they just created, the EXISTS check always evaluated false, and no
-- one could ever become a team's first owner. Found by RLS validation
-- (issue #1): reproduced with a real authenticated-role session, not the
-- superuser migration connection, which had been masking the bug.
--
-- Fix: let the creator see their own team even before joining as a member,
-- breaking the circular dependency. This also fixes `insert().select()`
-- (Supabase's default insert-and-return-the-row pattern) on `teams`, which
-- failed for the same reason.

drop policy "team members can view their team" on teams;

create policy "team members can view their team" on teams
for select using (is_team_member(id) or created_by = auth.uid());
