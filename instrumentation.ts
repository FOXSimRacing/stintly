// Starts the iRacing Data API mock server once per Node.js server instance,
// before it accepts requests, whenever no real iRacing OAuth2 credentials
// are configured. See .claude/skills/stintly-iracing-data-api/SKILL.md.
export async function register() {
  // MSW's node interceptor only makes sense in the Node.js runtime.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { iracingEnv } = await import("@/lib/iracing/env");
  if (!iracingEnv.useMock) return;

  const { server } = await import("@/mocks/iracing/server");
  // "error" (not "warn"/"bypass"): in mock mode there are no real
  // credentials configured, so any request that isn't mocked should fail
  // loudly and immediately naming the gap — never silently leak a real
  // network call to iracing.com from a dev machine.
  server.listen({ onUnhandledRequest: "error" });
}
