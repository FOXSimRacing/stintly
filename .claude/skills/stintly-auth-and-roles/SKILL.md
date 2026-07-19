---
name: stintly-auth-and-roles
description: Use when implementing team membership, invite flows, or role-gated features (owner/strategist/driver) in Stintly — to keep authorization logic and Supabase Auth integration consistent.
---

# Auth & team roles

## Roles

Exactly three roles, defined by the `team_member_role` Postgres enum and mirrored nowhere else — don't introduce a parallel role string anywhere in app code:

- **`owner`** — created the team (or was promoted); can manage roster, roles, races, and delete the team.
- **`strategist`** — can manage roster, races, and stint plans; cannot delete the team or remove other members' owner status.
- **`driver`** — read access to everything on their team (races, stint plans, roster); cannot create/edit races or stint plans.

Role semantics must stay identical between RLS policies (`has_team_role` in `supabase/migrations/0001_rls_policies.sql`) and app-layer checks (see stintly-api-conventions) — if you add a permission distinction, update both places in the same change.

## Identity linking

- `auth.users` (Supabase-managed) is the identity source. `team_members.user_id` links a user to a team with a role.
- `drivers.user_id` is **nullable** — a roster entry can exist as a placeholder (a driver who hasn't signed up yet, added by a strategist by name only) before being linked to a real account. Any UI or query touching `drivers` must handle `user_id IS NULL` gracefully (e.g. don't assume you can always resolve a driver to an email/avatar).
- A `TeamMember` row (team + role) and a `Driver` row (roster profile: iRacing ID, timezone, notes) are separate concepts — a team owner or strategist might not be a `Driver` at all (pure strategist role), and a placeholder `Driver` might not yet have a `TeamMember` row. Don't assume a 1:1 relationship between them.

## Invite flow

1. Owner/strategist creates an `invites` row (`team_id`, `email`, `role`, a generated `token`, `expires_at`).
2. An email (out of scope for this skill's mechanics — whatever transport is wired up) sends a link containing the token.
3. On acceptance, the invited user authenticates (sign up or log in), then the accept handler validates the token (matches, unexpired, `status = 'pending'`), creates the corresponding `team_members` row with the invite's role, and marks the invite `accepted`.
4. The invite's RLS policy lets the invited user read their own pending invite via `email = auth.jwt() ->> 'email'` — so the accept page can look up invite details before the user has any `team_members` row yet (bootstrapping problem, same shape as the "team creator becomes owner" bootstrap policy on `team_members`).

## Route protection

- `app/(app)/layout.tsx` is the single choke point for "must be logged in" — it checks `supabase.auth.getUser()` and redirects to `/login` if absent. Don't duplicate that check in every page under `(app)/`.
- Role-gating for a specific action (e.g. hiding the "create race" button for `driver`-role users) happens in the component/action itself by reading the caller's `team_members.role` — there is no separate route-level role gate, because the same route (e.g. a race page) is visible to all roles, just with different available actions.
- Never rely on hiding a button as the actual security boundary — the Server Action or route handler behind it must independently re-check the role (see stintly-api-conventions' authorization-before-mutation pattern), since RLS and app-layer checks are the real boundary, not UI visibility.
