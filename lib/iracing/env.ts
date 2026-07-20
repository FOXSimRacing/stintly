import { z } from "zod";

// Blank env var declarations (`KEY=`, the .env.example placeholder
// convention) load as an empty string, not undefined — treat those as
// absent too, so an unfilled-in .env.local/.env doesn't crash app boot.
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

const rawSchema = z.object({
  IRACING_USE_MOCK: z.preprocess(emptyToUndefined, z.enum(["true", "false"]).optional()),
  IRACING_OAUTH_CLIENT_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  IRACING_OAUTH_CLIENT_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  IRACING_OAUTH_REDIRECT_URI: z.preprocess(emptyToUndefined, z.string().url().optional()),
  IRACING_OAUTH_REFRESH_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
});

const raw = rawSchema.parse({
  IRACING_USE_MOCK: process.env.IRACING_USE_MOCK,
  IRACING_OAUTH_CLIENT_ID: process.env.IRACING_OAUTH_CLIENT_ID,
  IRACING_OAUTH_CLIENT_SECRET: process.env.IRACING_OAUTH_CLIENT_SECRET,
  IRACING_OAUTH_REDIRECT_URI: process.env.IRACING_OAUTH_REDIRECT_URI,
  IRACING_OAUTH_REFRESH_TOKEN: process.env.IRACING_OAUTH_REFRESH_TOKEN,
});

const hasRealCredentials = Boolean(
  raw.IRACING_OAUTH_CLIENT_ID &&
    raw.IRACING_OAUTH_CLIENT_SECRET &&
    raw.IRACING_OAUTH_REDIRECT_URI &&
    raw.IRACING_OAUTH_REFRESH_TOKEN,
);

// Mocking is a local-dev-and-preview concept, never production: MSW patches
// fetch/http globally for the whole process, so it must never run where
// real user traffic lands — see instrumentation.ts, which also
// independently refuses to start in production as defense in depth.
// `VERCEL_ENV` is "production" | "preview" | "development" on Vercel,
// unset on a developer's machine.
const isProductionVercel = process.env.VERCEL_ENV === "production";

const useMock =
  raw.IRACING_USE_MOCK === "false"
    ? false
    : raw.IRACING_USE_MOCK === "true"
      ? true
      : !isProductionVercel && !hasRealCredentials;

// Only hard-fail app boot when mocking was EXPLICITLY turned off without
// complete credentials — a deliberate misconfiguration worth crashing loud
// on. Never crash boot just because Vercel has no iRacing credentials yet
// with no explicit opt-out: nothing consumes lib/iracing today, so that
// should only fail if/when something actually calls it (client.ts throws
// IracingAuthError at call time in that case).
if (raw.IRACING_USE_MOCK === "false" && !hasRealCredentials) {
  throw new Error(
    "IRACING_USE_MOCK=false but IRACING_OAUTH_CLIENT_ID/SECRET/REDIRECT_URI/REFRESH_TOKEN " +
      "are not all set. Either finish configuring real iRacing OAuth2 credentials or remove " +
      "IRACING_USE_MOCK=false to fall back to the mock.",
  );
}

// In mock mode, client.ts still runs the real OAuth2 handshake shape (POST
// /token, Bearer header) so it doesn't need mock-mode branching — MSW
// intercepts and answers it unconditionally (mocks/iracing/handlers/oauth.ts).
// These placeholders just satisfy client.ts's "are credentials configured"
// guard; they're never sent anywhere real.
const mockCredentials = {
  clientId: "mock-client-id",
  clientSecret: "mock-client-secret",
  redirectUri: "http://localhost:3000/auth/iracing/callback",
  refreshToken: "mock-refresh-token",
};

// Single source of truth for the mock-vs-real decision — read by both
// instrumentation.ts (whether to start the MSW server) and client.ts
// (which credentials to use), so the two can never drift apart.
export const iracingEnv = {
  useMock,
  clientId: raw.IRACING_OAUTH_CLIENT_ID ?? (useMock ? mockCredentials.clientId : undefined),
  clientSecret: raw.IRACING_OAUTH_CLIENT_SECRET ?? (useMock ? mockCredentials.clientSecret : undefined),
  redirectUri: raw.IRACING_OAUTH_REDIRECT_URI ?? (useMock ? mockCredentials.redirectUri : undefined),
  refreshToken: raw.IRACING_OAUTH_REFRESH_TOKEN ?? (useMock ? mockCredentials.refreshToken : undefined),
};
