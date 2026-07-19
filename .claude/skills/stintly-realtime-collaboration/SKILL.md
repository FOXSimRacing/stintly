---
name: stintly-realtime-collaboration
description: Use when implementing or debugging live-sync behavior for Stintly's stint plan editor — Supabase Realtime subscriptions, presence indicators, or conflict handling when multiple strategists edit the same plan simultaneously.
---

# Realtime collaboration conventions

Multiple strategists/drivers may view or edit the same `stint_plan` at once (see the iracing-endurance-domain and product context: 24h-race stint plans are built collaboratively). This is a first-class concern, not an afterthought bolted onto the timeline UI.

## Channel scoping

- One Supabase Realtime channel **per stint plan**, named deterministically, e.g. `stint-plan:${stintPlanId}` — don't subscribe to a team-wide or app-wide firehose channel for this; it wastes client bandwidth and forces unrelated filtering logic.
- Subscribe to Postgres changes on the `stints` table filtered by `stint_plan_id=eq.${stintPlanId}` via `postgres_changes`, and use the same channel's **Presence** API for "who's currently viewing/editing this plan."

## `broadcast` vs. `postgres_changes`

- Use `postgres_changes` for anything that must reflect the actual persisted database state (stint create/update/delete) — it's the source of truth and works even if a client missed intermediate steps.
- Use `broadcast` only for ephemeral, non-persisted signals: cursor position, "drag in progress" indicators, presence pings. Never use `broadcast` as the mechanism for propagating an actual data change — if the sender's connection drops mid-broadcast, other clients silently miss it, whereas `postgres_changes` self-heals on reconnect via a fresh fetch.

## Optimistic updates + reconciliation

- Client-side drag/resize/reassign operations on the timeline should apply optimistically (via TanStack Query's cache) immediately for responsiveness, then reconcile against the `postgres_changes` event once it arrives.
- On reconnect after a dropped connection, don't trust the optimistic cache — refetch the full stint list for the plan before resuming realtime updates, since `postgres_changes` only delivers events that occur *while subscribed*.

## Conflict handling

- `stint_plans.updated_at` is the version marker. Before writing a mutation that assumes a particular prior state (e.g. reordering stints), compare against the `updated_at` the client last saw; if it's moved, refetch and re-apply rather than blindly overwriting (last-write-wins is not acceptable here — two strategists editing the same 24h plan can easily clobber each other's work).
- While a stint block is actively being dragged by one user, broadcast a lightweight "locked" signal for that stint's id so other clients render it as temporarily non-interactive — release the lock on drag-end or after a short timeout (a dropped connection shouldn't permanently lock a stint).

## Presence

Use the channel's Presence API to show avatars/initials of who's currently on the stint-plan page — track at minimum `user_id` and a `viewing_since` timestamp per presence entry. This is read-only social awareness, not part of the locking mechanism above (locking is explicit per-stint, presence is just "who's here").
