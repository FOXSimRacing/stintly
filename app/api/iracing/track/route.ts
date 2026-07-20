import { NextResponse } from "next/server";
import { getTrack } from "@/lib/iracing";
import { iracingErrorResponse } from "../_lib/error-response";

// Debug endpoint to exercise lib/iracing against the MSW mock (or the real
// API once credentials are configured) without a UI feature built yet — see
// stintly-iracing-data-api skill. Fixture track_ids: 50001-50006.
export async function GET(request: Request) {
  const trackIdParam = new URL(request.url).searchParams.get("track_id");
  const trackId = Number(trackIdParam);
  if (trackIdParam === null || !Number.isFinite(trackId)) {
    return NextResponse.json({ error: "track_id query param is required" }, { status: 400 });
  }

  try {
    return NextResponse.json(await getTrack(trackId));
  } catch (error) {
    return iracingErrorResponse(error);
  }
}
