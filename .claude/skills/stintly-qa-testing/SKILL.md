---
name: stintly-qa-testing
description: Use when manually testing Stintly in the browser (auth flow, dashboard, any new UI) — reuse the fixed QA account instead of creating/deleting throwaway users, and follow the checks below before calling a change verified.
---

# QA testing workflow

## Fixed test account — always reuse it, never delete it

```
email:    qa@stintly.test
password: StintlyQA!2026
```

This user already exists in the real Supabase project (`auth.users`) and is
email-confirmed. **Do not delete it, ever** — future sessions rely on it
being there. If it's ever missing, recreate it exactly like this (anon
client `signUp`, same shape the app itself uses, then confirm via SQL if
"Confirm email" is on):

```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
supabase.auth.signUp({ email: 'qa@stintly.test', password: 'StintlyQA!2026' })
  .then(({data,error}) => console.log(error?.message ?? data.user?.id));
"
node -e "
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL, {prepare:false});
sql\`update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where email = 'qa@stintly.test'\`.then(()=>process.exit(0));
"
```

(Load `.env.local` into the shell first — `set -a; source .env.local; set +a` on
bash, or the PowerShell equivalent.)

If a test needs a **second** distinct account (e.g. testing multi-user team
collaboration), create a throwaway one (`qa+<scenario>@stintly.test`) and
delete it when done — the "always reuse, never delete" rule is specifically
for the one fixed `qa@stintly.test` account above. Never create or delete
accounts using the developer's personal email or an alias of it.

## Direct DB access for test setup

`DATABASE_URL` in `.env.local` is a real connection to the project's
Supabase Postgres (via the session pooler). It's fine to run one-off `node
-e` scripts with the `postgres` package against it to seed or inspect state
for a test (e.g. confirming a user's email, checking RLS policies applied,
seeding a `teams` row for the QA user) — this project has no separate local/
staging DB. Clean up anything you seed beyond the fixed QA user itself once
the test is done.

## Running the app to test it

- `npm run dev` — if port 3000 is taken by something else on the machine
  (check with `Get-NetTCPConnection -LocalPort 3000` before assuming it's a
  stale instance of this app), Next.js falls back to 3001 automatically;
  read the dev server's own log output for the actual port rather than
  assuming.
- Stop only the process you started (match it by port + `node.exe`), never
  kill everything listening on nearby ports — other unrelated local services
  may be running.
- Drive the browser with the `claude-in-chrome` tools. `app/(app)/layout.tsx`
  is the single auth gate — routes under `(app)/` need a logged-in session,
  routes under `(auth)/` (`/login`, `/signup`) redirect away if already
  logged in.

## Known Base UI quirks hit during testing (watch for these)

- **Synthetic clicks on Base UI `Menu`/`Select` triggers can silently no-op**
  if the underlying popup throws during render — the trigger's
  `aria-expanded` reverts to `false` and nothing visibly opens, which looks
  like "the click didn't register." Before assuming an interaction is
  broken, check the console for a Next.js runtime error overlay screenshot,
  or dispatch `.click()` via `javascript_tool` and read `aria-expanded`
  directly to isolate whether it's an input problem or a render crash.
- **`DropdownMenuLabel`/`Menu.GroupLabel` must be inside a `DropdownMenuGroup`**
  — using it directly inside `DropdownMenuContent` throws `MenuGroupContext
  is missing` at open time.
- Base UI's `Button` uses a `render` prop (not `asChild`) to swap the
  rendered element (e.g. `render={<Link href="/x">Text</Link>}`), and needs
  `nativeButton={false}` set whenever the replacement isn't a real
  `<button>` — otherwise it logs an accessibility warning every render.

## Before calling a change verified

1. `npx tsc --noEmit -p .` and `npx eslint .` — both clean.
2. Actually drive the affected flow in the browser with the QA account
   (see above), not just a visual screenshot of a static page — click
   through, submit forms, check the resulting state.
3. Stop the dev server you started when done, unless the user asked to
   leave it running.
