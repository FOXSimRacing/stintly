import { http, HttpResponse } from "msw";
import { IRACING_DATA_HOST } from "@/lib/iracing/hosts";
import { memberSummaryFixtures } from "../fixtures/members";

// Reference implementation of the real Data API's two-hop "link
// indirection" pattern: hop 1 (the real endpoint path) returns a small
// {link, expires} envelope, never the payload; hop 2 (an unauthenticated GET
// to that link) returns the actual, CDN-cached-in-real-life JSON. Every
// other domain's handlers (reference.ts, results.ts) follow this same shape.
export const memberHandlers = [
  http.get(`${IRACING_DATA_HOST}/data/member/summary`, ({ request }) => {
    const custId = new URL(request.url).searchParams.get("cust_id");
    return HttpResponse.json({
      link: `${IRACING_DATA_HOST}/mock-cdn/member-summary/${custId}.json`,
      expires: new Date(Date.now() + 60_000).toISOString(),
    });
  }),

  http.get(`${IRACING_DATA_HOST}/mock-cdn/member-summary/:custId`, ({ params }) => {
    const custId = String(params.custId).replace(/\.json$/, "");
    const fixture = memberSummaryFixtures[custId];
    if (!fixture) {
      return HttpResponse.json({ error: "member not found in mock fixtures" }, { status: 404 });
    }
    return HttpResponse.json(fixture);
  }),
];
