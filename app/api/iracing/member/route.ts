import { NextResponse } from "next/server";
import { getMemberSummary } from "@/lib/iracing";
import { iracingErrorResponse } from "../_lib/error-response";

// Debug endpoint to exercise lib/iracing against the MSW mock (or the real
// API once credentials are configured) without a UI feature built yet — see
// stintly-iracing-data-api skill. Try cust_id 100001-100005 (curated
// fixtures) or any other numeric id (synthetic fixture).
export async function GET(request: Request) {
  const custIdParam = new URL(request.url).searchParams.get("cust_id");
  const custId = Number(custIdParam);
  if (custIdParam === null || !Number.isFinite(custId)) {
    return NextResponse.json({ error: "cust_id query param is required" }, { status: 400 });
  }

  try {
    return NextResponse.json(await getMemberSummary(custId));
  } catch (error) {
    return iracingErrorResponse(error);
  }
}
