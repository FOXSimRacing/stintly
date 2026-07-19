import { z } from "zod";
import { iracingEnv } from "./env";
import { IracingAuthError, IracingApiError } from "./errors";
import { IRACING_AUTH_HOST, IRACING_DATA_HOST } from "./hosts";

const linkEnvelopeSchema = z.object({
  link: z.string().url(),
  expires: z.string(),
});

interface TokenState {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
}

let tokenState: TokenState | null = null;

async function authenticate(): Promise<TokenState> {
  const { clientId, clientSecret, refreshToken } = iracingEnv;
  const currentRefreshToken = tokenState?.refreshToken ?? refreshToken;
  if (!clientId || !clientSecret || !currentRefreshToken) {
    throw new IracingAuthError("iRacing OAuth2 credentials/refresh token are not configured");
  }

  const res = await fetch(`${IRACING_AUTH_HOST}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: currentRefreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new IracingAuthError(`iRacing token exchange failed: ${res.status}`);
  }

  const json = await res.json();
  tokenState = {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return tokenState;
}

async function getValidToken(): Promise<string> {
  if (!tokenState || tokenState.expiresAt < Date.now() + 5_000) {
    await authenticate();
  }
  return tokenState!.accessToken;
}

/**
 * Fetches a /data/... endpoint and follows iRacing's link-indirection:
 * hop 1 returns a small {link, expires} envelope, hop 2 is an
 * unauthenticated GET to `link` that returns the real, CDN-cached payload.
 * Consumers never see the envelope — they get parsed, typed data back.
 */
export async function fetchIracingData<T>(
  path: string,
  params: Record<string, string | number>,
  schema: z.ZodType<T>,
  { retryOn401 = true }: { retryOn401?: boolean } = {},
): Promise<T> {
  const token = await getValidToken();
  const url = new URL(path, IRACING_DATA_HOST);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const envelopeRes = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store", // external live API — never let Next's Data Cache dedupe/cache this
  });

  if (envelopeRes.status === 401 && retryOn401) {
    tokenState = null;
    return fetchIracingData(path, params, schema, { retryOn401: false });
  }
  if (!envelopeRes.ok) {
    throw new IracingApiError(`iRacing API error ${envelopeRes.status} for ${path}`, envelopeRes.status);
  }

  const envelope = linkEnvelopeSchema.parse(await envelopeRes.json());
  const payloadRes = await fetch(envelope.link, { cache: "no-store" });
  if (!payloadRes.ok) {
    throw new IracingApiError(`failed to fetch linked payload for ${path}`, payloadRes.status);
  }
  return schema.parse(await payloadRes.json());
}
