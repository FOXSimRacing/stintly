import { http, HttpResponse } from "msw";
import { IRACING_AUTH_HOST } from "@/lib/iracing/hosts";

// Mocks the OAuth2 token exchange unconditionally — its only job is to make
// client.ts's auth handshake succeed, not to validate OAuth2 semantics.
export const oauthHandlers = [
  http.post(`${IRACING_AUTH_HOST}/token`, async () => {
    return HttpResponse.json({
      access_token: "mock-access-token",
      refresh_token: "mock-refresh-token",
      expires_in: 3600,
      token_type: "Bearer",
    });
  }),
];
