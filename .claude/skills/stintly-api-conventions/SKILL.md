---
name: stintly-api-conventions
description: Use when adding or modifying server-side logic in Stintly — Next.js Server Actions or route handlers — to keep validation, authorization, and business-logic organization consistent.
---

# Stintly server-side conventions

## Where logic lives

- **Server Actions** (`"use server"`) are the default for mutations triggered from a form or a client interaction within the app (creating a race, editing a stint, sending an invite). They colocate with the feature (e.g. `app/(app)/races/[raceId]/plan/actions.ts`), not in one global `actions.ts`.
- **Route Handlers** (`app/api/.../route.ts`) are only for things that aren't a same-origin form/UI action: webhooks, OAuth callbacks, anything a non-browser client needs to call, or endpoints that must return non-HTML responses.
- Database queries for **reads** happen directly in Server Components via `lib/db` (Drizzle) or the Supabase server client — don't wrap every read in a Server Action just for consistency; Server Actions are for mutations.

## Next.js 16 Server Action behavior to account for

- Actions dispatched from the same client run **sequentially**, not in parallel — don't design a flow that expects two actions from one form submit to race each other.
- Calling `revalidatePath`, `updateTag`, `redirect`, or mutating cookies inside an action triggers an automatic re-render folded into the same response — you don't need a manual client-side refetch after those.
- Prefer **`updateTag`** (from `next/cache`) over `revalidateTag` inside Server Actions when the user needs to immediately see their own write reflected (read-your-own-writes) — e.g. after publishing a stint plan.
- The framework enforces an Origin/Host CSRF check and a request body size limit on Server Actions, but that is not a substitute for authorization — every action must still check the caller's role itself (see below).

## Validation

- One Zod schema per entity, colocated with the feature (e.g. `app/(app)/races/[raceId]/plan/schema.ts`), imported by both the client form (via `@hookform/resolvers/zod`) and the Server Action that receives the submission. Never trust client-side validation alone — re-validate with the same schema inside the action.

## Authorization-before-mutation pattern

RLS (see supabase-data-modeling) is the last line of defense, not the only check. Every mutation should still explicitly verify the caller's role for that team **before** attempting the write, and return a clear error rather than relying on the DB silently rejecting rows via RLS:

```ts
"use server";
// 1. get the authenticated user (lib/supabase/server.ts)
// 2. look up their team_members role for the relevant team_id
// 3. reject early with a typed error if role isn't sufficient
// 4. validate input with the entity's Zod schema
// 5. perform the write via Drizzle (lib/db)
```

This mirrors the `has_team_role` roles used in RLS policies (`owner`, `strategist`, `driver`) — keep the role names and semantics identical between app-layer checks and RLS so they never drift apart.

## Multi-row stint mutations

Reordering, splitting, or bulk-reassigning stints touches several `stints` rows at once (`order_index` shifts, time windows shift). Wrap these in a single Drizzle transaction (`db.transaction(async (tx) => { ... })`) so a partial failure never leaves a stint plan with overlapping or out-of-order stints. Recompute and persist `order_index` and adjacent `planned_start_time`/`planned_end_time` values together in the same transaction rather than issuing one update per affected row from the client.
