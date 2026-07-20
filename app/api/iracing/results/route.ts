import { NextResponse } from "next/server";
import { getSubsessionResult } from "@/lib/iracing";
import { iracingErrorResponse } from "../_lib/error-response";

// Debug endpoint to exercise lib/iracing against the MSW mock (or the real
// API once credentials are configured) without a UI feature built yet — see
// stintly-iracing-data-api skill. Fixture subsession_id: 90001.
export async function GET(request: Request) {
  const subsessionIdParam = new URL(request.url).searchParams.get("subsession_id");
  const subsessionId = Number(subsessionIdParam);
  if (subsessionIdParam === null || !Number.isFinite(subsessionId)) {
    return NextResponse.json({ error: "subsession_id query param is required" }, { status: 400 });
  }

  try {
    return NextResponse.json(await getSubsessionResult(subsessionId));
  } catch (error) {
    return iracingErrorResponse(error);
  }
}
