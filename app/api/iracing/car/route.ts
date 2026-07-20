import { NextResponse } from "next/server";
import { getCar } from "@/lib/iracing";
import { iracingErrorResponse } from "../_lib/error-response";

// Debug endpoint to exercise lib/iracing against the MSW mock (or the real
// API once credentials are configured) without a UI feature built yet — see
// stintly-iracing-data-api skill. Fixture car_ids: 70001-70006.
export async function GET(request: Request) {
  const carIdParam = new URL(request.url).searchParams.get("car_id");
  const carId = Number(carIdParam);
  if (carIdParam === null || !Number.isFinite(carId)) {
    return NextResponse.json({ error: "car_id query param is required" }, { status: 400 });
  }

  try {
    return NextResponse.json(await getCar(carId));
  } catch (error) {
    return iracingErrorResponse(error);
  }
}
