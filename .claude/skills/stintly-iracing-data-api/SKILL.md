---
name: stintly-iracing-data-api
description: Use when adding a feature that reads iRacing driver stats, track/car reference data, or race results in Stintly — the service layer is fully mocked via MSW today; read this before touching lib/iracing/ or building anything that depends on it.
---

# iRacing Data API service layer

> **Caveat, read first:** the team doesn't have iRacing Data API authorization
> yet. Every endpoint path, field name, and the link-indirection shape below
> is a best-effort reconstruction from public community documentation
> (open-source wrappers, `oauth.iracing.com`'s published OAuth2 workflow
> docs) — not iRacing's official authenticated docs, which weren't
> accessible while this was built. Expect Zod `.parse()` to throw on real
> field mismatches the first time real credentials are wired in (see
> "Cutover" below) — that's the expected signal for what to fix, not a bug
> in this scaffolding.

## Why this exists

The schema already anticipates iRacing data (`drivers.iracingId`,
`drivers.irating`, `drivers.safetyRating`, `tracks.iracingTrackId`,
`cars.iracingCarId` in `drizzle/schema.ts`), but until the team has API
access there's nothing to sync it with. Rather than let the first feature
that needs iRacing data (driver stat sync, track/car lookups, results
import) invent an ad hoc `fetch` call, this module gives it a realistic,
typed interface to build against today — mocked underneath, but shaped
exactly like the real thing. When real API access lands, only the transport
changes.

## Module layout

```
lib/iracing/
  env.ts          # scoped env validation + mock-vs-real decision (single source of truth)
  errors.ts        # IracingAuthError, IracingApiError
  hosts.ts          # IRACING_AUTH_HOST / IRACING_DATA_HOST — shared with mocks/iracing/*
  client.ts          # low-level: OAuth2 token mgmt + link-indirection fetch-through
  schemas/            # Zod schemas per domain
  services/             # per-domain functions built on client.ts
  index.ts                # the ONLY import path consumer code should use

mocks/iracing/
  server.ts         # setupServer(...handlers) — started only by instrumentation.ts
  handlers.ts         # barrel of all handlers
  handlers/             # two handlers per endpoint (envelope hop + payload hop)
  fixtures/               # small, hand-written, plausible fictitious data

instrumentation.ts    # repo root — starts the mock server once per process, mock mode only
```

**Rule:** consumer code only ever does `import { getMemberSummary } from
"@/lib/iracing"` (the barrel in `lib/iracing/index.ts`). Never import
`lib/iracing/client`, `lib/iracing/schemas/*`, or anything under `mocks/`
directly.

## Endpoints mocked today, and their real analogues

| Service function | Real Data API endpoint | Keyed by |
|---|---|---|
| `getMemberSummary(custId)` | `/data/member/summary` | `drivers.iracingId` |
| `getTrack(trackId)` | `/data/track/get` | `tracks.iracingTrackId` |
| `getCar(carId)` | `/data/car/get` | `cars.iracingCarId` |
| `getSubsessionResult(subsessionId)` | `/data/results/get` | (future results-import feature — no table yet) |

Other Data API domains (season/series, league, hosted, time_attack,
stats-by-category, etc.) are **not** mocked — out of scope until a feature
actually needs them. Add a new `schemas/`, `services/`, and
`mocks/iracing/handlers/` file per new domain, following the same pattern.

## The link-indirection pattern

Most real `/data/...` GET endpoints don't return the payload directly — they
return a small envelope:

```json
{ "link": "https://<cdn-cached-storage-url>/...", "expires": "..." }
```

...and the client must issue a second, **unauthenticated** GET to `link` to
get the actual (often large, CDN-cached) JSON. `lib/iracing/client.ts`'s
`fetchIracingData()` does both hops and returns the final, Zod-parsed
payload — callers never see the envelope. The mocks in
`mocks/iracing/handlers/*.ts` reproduce this exact two-hop shape (a handler
for the real endpoint path returning `{link, expires}`, plus a second
handler for a `/mock-cdn/...` path serving the fixture) specifically so
`client.ts` doesn't need to change shape when the mock is swapped for the
real network.

## Auth model: OAuth2

Modeled on iRacing's documented OAuth2 flow (`oauth.iracing.com`): a
registered client (audience `data-server`, scope `iracing.auth`) exchanges a
refresh token at `/token` for a short-lived access token, sent as
`Authorization: Bearer <token>` on `/data/...` calls. Chosen over legacy
email/password + cookie auth (what most open-source community wrappers use)
because it's iRacing's current documented path and doesn't require disabling
2FA on the account used.

**Open uncertainty, confirm before real cutover:** this assumes one
team-owned iRacing account provides API access for the whole app (a shared
refresh token), not a per-user "connect your iRacing account" flow. Also,
if iRacing rotates refresh tokens on every use (common in modern OAuth2),
the in-memory-only token cache in `client.ts` loses the latest refresh token
on every server restart/redeploy — persisting rotated tokens durably is real
follow-up work, not solved here.

## Env vars

```
IRACING_USE_MOCK=              # true/false; unset = auto (mock on local dev + Vercel Preview, never Production)
IRACING_OAUTH_CLIENT_ID=
IRACING_OAUTH_CLIENT_SECRET=
IRACING_OAUTH_REDIRECT_URI=
IRACING_OAUTH_REFRESH_TOKEN=
```

`lib/iracing/env.ts` is the single source of truth for the mock-vs-real
decision — it's imported by both `instrumentation.ts` (whether to start the
MSW server) and `client.ts` (which credentials to use), so the two can never
drift apart. It throws at boot only if `IRACING_USE_MOCK=false` is set
explicitly without all four OAuth vars complete (a deliberate
misconfiguration worth failing loudly on) — it never crashes app boot just
because Vercel has no iRacing credentials configured yet with no explicit
opt-out, since nothing consumes `lib/iracing` today; that case only errors
if/when a future feature actually calls it.

**Never let the mock run in production.** MSW patches `fetch`/`http`
globally for the *entire* Node.js process — not scoped to iRacing hosts —
so any request, matched or not, goes through it, including unrelated ones
like Supabase Auth calls from Server Actions. Both `instrumentation.ts`
(`if (process.env.VERCEL_ENV === "production") return;`) and
`lib/iracing/env.ts` (`useMock` factors in `!isProductionVercel`)
independently refuse to activate the mock in production, regardless of
credential state — this is belt-and-suspenders on purpose. Preview
deployments and local dev *are* allowed to mock (as of 2026-07-19, once
local dev and Preview started pointing at a separate staging Supabase
project instead of sharing production's — see the `stintly-qa-testing`
skill) — this used to be blocked on all of Vercel after an incident where a
missing environment guard broke login in preview/production. At the time,
`onUnhandledRequest` was set to the `"error"` preset, which **rejects** any
request without a matching handler — including the Supabase auth call,
since only iRacing hosts have handlers. `instrumentation.ts` now uses a
custom `onUnhandledRequest` callback instead: it only logs (`print.error()`)
when the request's hostname is one of the iRacing hosts, so a real gap in
mock coverage is still loud and visible, while every other request
(Supabase, anything else) passes through untouched, exactly as if MSW
weren't running — this is what actually makes preview mocking safe now,
and is required even in normal local dev, not just as a safeguard.

## Cutover: switching from mock to the real API

1. Register the OAuth2 client with iRacing (audience `data-server`, scope
   `iracing.auth`), get `client_id`/`client_secret`, register a redirect
   URI.
2. One-time, out-of-band: complete the interactive `/authorize` consent flow
   once (a team-owned iRacing account) to obtain the first `refresh_token`.
3. Set the four `IRACING_OAUTH_*` env vars in the real environment.
4. Leave `IRACING_USE_MOCK` unset (or `false` — equivalent once credentials
   are complete).
5. Restart the server. `instrumentation.ts` skips starting the mock;
   `client.ts`'s `fetch()` calls hit the real iRacing hosts instead.
6. **Delete nothing** — `mocks/iracing/` keeps serving any environment
   without real credentials (new contributors' machines, preview deploys).
7. **No file under `app/`, `lib/iracing/services/`, `lib/iracing/schemas/`,
   or `lib/iracing/index.ts` changes.**
8. Immediately exercise all four service functions against real known IDs.
   Expect `.parse()` to throw on field mismatches — fix schema fields as
   they surface; this is expected, not a sign the scaffolding is broken.

## Related

See `iracing-endurance-domain` for the domain vocabulary (iRating, Safety
Rating, stint, etc.) this data ultimately feeds.
