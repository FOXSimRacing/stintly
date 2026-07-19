// Shared between the real client (lib/iracing/client.ts) and the MSW mocks
// (mocks/iracing/handlers/*.ts) so the mocked hosts can never drift from the
// ones the real client actually calls.
export const IRACING_AUTH_HOST = "https://oauth.iracing.com";
export const IRACING_DATA_HOST = "https://members-ng.iracing.com";
