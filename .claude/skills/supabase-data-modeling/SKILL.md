---
name: supabase-data-modeling
description: Use when adding or changing database tables, writing Drizzle migrations, or defining Supabase RLS policies in Stintly — to keep the schema, migrations, and access-control rules consistent with the existing conventions.
---

# Supabase + Drizzle data modeling conventions

Schema lives in `drizzle/schema.ts`. Migrations are generated into `supabase/migrations/` via `npx drizzle-kit generate` and applied with the Supabase CLI (`supabase db push` / `supabase db reset`) — both tools point at the same folder on purpose, don't change `drizzle.config.ts`'s `out` path.

## Naming & typing conventions

- `snake_case` column names, achieved automatically via `casing: "snake_case"` in `drizzle.config.ts` and `lib/db/index.ts` — write TS fields in `camelCase` in `schema.ts`, Drizzle converts.
- Every table's primary key is `id: uuid("id").primaryKey().default(sql\`gen_random_uuid()\`)`.
- Every table calls `.enableRLS()` — a table with RLS enabled and **no policies** denies all access by default, which is the safe starting state. Never ship a new table without RLS enabled, and never enable RLS without also writing its policies in the same PR.
- Enums use `pgEnum` (e.g. `teamMemberRole`, `raceStatus`, `stintPlanStatus`, `stintStatus`, `inviteStatus`) — add new statuses to the existing enum rather than inventing a parallel `text` status column.

## The `auth.users` reference pattern

Supabase's `auth.users` table already exists and is managed by Supabase Auth — never let drizzle-kit generate a `CREATE TABLE` for it. The pattern already in `schema.ts`:

```ts
const authSchema = pgSchema("auth");
export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});
```

This gives Drizzle a typed FK target without owning the table. **After running `drizzle-kit generate`, always check the new migration file for a stray `CREATE TABLE "auth"."users"` statement and delete it** (replace with a one-line comment noting it already exists) — drizzle-kit doesn't know the table is externally managed and will try to create it every time the auth-users reference is touched.

## Team-scoped RLS is mandatory

Stintly is multi-tenant by `team_id`. Every table that isn't global reference data (`tracks`, `cars`) must be reachable only by members of the owning team. Don't write ad-hoc per-table logic — reuse the two `SECURITY DEFINER` helper functions defined in `supabase/migrations/0001_rls_policies.sql`:

- `is_team_member(p_team_id uuid)` — any role, read access.
- `has_team_role(p_team_id uuid, p_roles team_member_role[])` — role-gated write access, e.g. `has_team_role(team_id, array['owner','strategist']::team_member_role[])`.

These are `SECURITY DEFINER` specifically to avoid infinite recursion (a plain policy on `team_members` that queries `team_members` would recurse). When a new table doesn't have `team_id` directly (e.g. it hangs off `stints` which hangs off `stint_plans` which hangs off `races`), write the policy as an `exists (select 1 from ... join ... where ...)` chain up to a table that does — see the `stints` policies for the pattern of joining through two levels.

For a genuinely new top-level entity, always add both:
1. A `select` policy using `is_team_member`.
2. A `for all` (or split insert/update/delete) policy using `has_team_role` for the roles allowed to mutate it.

## Extending the model without breaking the core

Fuel, tire, and weather planning are explicitly future modules (see the iracing-endurance-domain skill). When they land, add new tables keyed by `stint_id` or `race_id` (e.g. `fuel_stint_detail(stint_id, ...)`, `tire_stint_detail(stint_id, ...)`, `weather_window(race_id, start_offset_minutes, end_offset_minutes, ...)`). Never add fuel/tire/weather columns directly onto `stints` or `races` — that couples unrelated modules and makes the core stint-planning schema harder to reason about.

## Workflow for a schema change

1. Edit `drizzle/schema.ts`.
2. `npx drizzle-kit generate` — creates a new numbered `.sql` file in `supabase/migrations/`.
3. Check the generated SQL for the `auth.users` gotcha above.
4. If the change needs new/updated RLS policies, add them as a separate hand-written migration file (`000N_description.sql`) immediately after the generated one — don't try to express policies inside `schema.ts`.
5. Apply locally with `supabase db reset` and verify cross-team access is actually blocked before merging (see the plan's verification section for the two-user test).
