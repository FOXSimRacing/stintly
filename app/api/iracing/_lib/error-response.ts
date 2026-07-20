import { NextResponse } from "next/server";
import { IracingApiError, IracingAuthError } from "@/lib/iracing";

// Shared by the app/api/iracing/*/route.ts debug endpoints — see
// stintly-iracing-data-api skill. Anything else (e.g. a Zod parse error from
// a fixture that doesn't match the schema) is left to bubble as a 500, since
// that's a real bug worth seeing loudly rather than masking.
export function iracingErrorResponse(error: unknown) {
  if (error instanceof IracingApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status ?? 502 });
  }
  if (error instanceof IracingAuthError) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
  throw error;
}
