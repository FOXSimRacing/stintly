// Starts the iRacing Data API mock server once per Node.js server instance,
// before it accepts requests, on a developer's own machine, whenever no real
// iRacing OAuth2 credentials are configured. See
// .claude/skills/stintly-iracing-data-api/SKILL.md.
export async function register() {
  // MSW's node interceptor only makes sense in the Node.js runtime.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // MSW patches fetch/http globally for the whole process — not just
  // iRacing hosts. Never let it start on Vercel (preview or production):
  // it would intercept unrelated requests too (e.g. Supabase auth calls
  // from Server Actions) and reject them as "unhandled". `VERCEL` is set to
  // "1" in every Vercel build/runtime, unset locally — see the incident
  // where this exact gap broke login in preview/production.
  if (process.env.VERCEL) return;

  const { iracingEnv } = await import("@/lib/iracing/env");
  if (!iracingEnv.useMock) return;

  const { server } = await import("@/mocks/iracing/server");
  const { IRACING_AUTH_HOST, IRACING_DATA_HOST } = await import("@/lib/iracing/hosts");
  const iracingHostnames = [new URL(IRACING_AUTH_HOST).hostname, new URL(IRACING_DATA_HOST).hostname];

  server.listen({
    // A custom callback, not "error"/"warn"/"bypass": MSW intercepts every
    // outgoing request in this process, not just iRacing ones (Supabase
    // Auth calls from Server Actions go through the same fetch). Calling
    // print.error() only logs — it doesn't block the request, so every
    // request (matched or not) still passes through to the real network by
    // default, exactly as if MSW weren't running. That's required for
    // Supabase/other traffic to work at all; for iRacing-hostname requests
    // specifically, logging still makes a coverage gap in mocks/iracing/
    // visible instead of silently hitting the real (unauthenticated) API.
    onUnhandledRequest(request, print) {
      if (iracingHostnames.includes(new URL(request.url).hostname)) {
        print.error();
      }
    },
  });
}
