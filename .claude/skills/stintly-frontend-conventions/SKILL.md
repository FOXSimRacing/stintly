---
name: stintly-frontend-conventions
description: Use when building or modifying any UI component, page, or the stint-timeline visualization in Stintly's Next.js app — to keep component structure, styling, and timeline UX consistent.
---

# Stintly frontend conventions

Next.js 16 (App Router, TypeScript) + Tailwind v4 + shadcn/ui (`base-nova` preset, Base UI primitives — not Radix; see `components.json`). Client state via TanStack Query + the Supabase JS client; forms via `react-hook-form` + Zod.

## Next.js 16 specifics — do not use stale App Router assumptions

- The root request-interception file is **`proxy.ts`**, not `middleware.ts` (renamed in Next 16). It exports `export default async function proxy(request: NextRequest)`, not `export function middleware`.
- Cache Components (the `"use cache"` directive / `cacheComponents` flag) is **off** in this project (`next.config.ts` has no `cacheComponents: true`). That means `fetch` and route rendering are dynamic/uncached by default — this is intentional, because Supabase data (races, stint plans) must always be fresh. Do not add `"use cache"` to pages that read team-scoped data. If a future page genuinely wants static caching, that's a deliberate opt-in decision, not a default.
- `cookies()` and `headers()` from `next/headers` are async — always `await` them (already the case in `lib/supabase/server.ts`).

## File/route structure

- `app/(app)/` is the authenticated shell — `app/(app)/layout.tsx` does the session check (redirects to `/login` if unauthenticated) and renders the nav header. Any new authenticated page goes under this group so it inherits that check for free; don't re-check auth in every page.
- Route params for entity-scoped pages follow `app/(app)/races/[raceId]/...` — the stint-plan builder lives at `app/(app)/races/[raceId]/plan/page.tsx`.
- Each route segment that fetches data should have a co-located `loading.tsx`; segments with meaningfully different error recovery get their own `error.tsx` (the `(app)` group already has baseline ones — only add more specific ones where the generic message/reset isn't good enough).

## Components

- shadcn/ui primitives live in `components/ui/` (generated, don't hand-edit beyond what `shadcn add` produces — re-run `npx shadcn@latest add <name>` to add more, add `-y` to skip prompts, use `--overwrite` deliberately if you need to update a customized primitive).
- App-specific composed components go in `components/` outside `ui/`, named for what they render (e.g. `components/stint-timeline/`), not for the page that uses them — they should be reusable if a second page ever needs the same view.
- Note: this project's shadcn registry (`base-nova`/Base UI) has **no bundled `form` wrapper component** (unlike the classic Radix-based shadcn `form.tsx`). Build forms directly with `react-hook-form`'s `useForm`/`Controller` plus the plain `Input`/`Select`/`Label` primitives and a Zod resolver (`@hookform/resolvers/zod`) — don't try to `shadcn add form`, it won't produce anything in this registry.

## The stint-timeline (flagship UI)

This is the highest-stakes UI in the app — the v1 differentiator. Conventions to keep consistent as it's built out:

- **Time-to-pixel scale**: a single shared scale function/hook, not per-component math — the timeline header, stint blocks, and any "current time" indicator must all agree on the same px-per-minute conversion or they'll visually drift.
- **Driver color coding**: assign each driver a stable color (e.g. derived from their `driver.id`, not array index — index-based colors reshuffle when the roster changes) and reuse that mapping everywhere a driver appears (timeline blocks, roster list, avatars).
- **Drag/resize**: use `@dnd-kit/core` + `@dnd-kit/sortable` (already installed) rather than a second drag library — keep one drag interaction model for the whole app.
- **Rest-violation indicators**: surface as a visual warning on the affected stint block (e.g. amber border/icon), not a blocking modal — per the iracing-endurance-domain skill, driver rest is a soft rule strategists may deliberately override.

## Data fetching pattern

- Server Components fetch initial data directly (via `lib/db` or the Supabase server client from `lib/supabase/server.ts`).
- Client-side mutations and any data that needs to stay live (e.g. the stint-plan builder while collaborators edit) go through TanStack Query, with realtime invalidation wired per the stintly-realtime-collaboration skill.
- Validate all form input with a Zod schema colocated with the feature (not a single giant shared schema file) — one schema per entity, reused between the client form and the Server Action/API route that receives it (see stintly-api-conventions).
