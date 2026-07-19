import { http, HttpResponse } from "msw";
import { IRACING_DATA_HOST } from "@/lib/iracing/hosts";
import { memberSummaryFixtures } from "../fixtures/members";
import { synthesizeMemberSummary } from "../fixtures/synthetic-member";

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
    const custIdParam = String(params.custId).replace(/\.json$/, "");
    const custId = Number(custIdParam);

    // Curated fixtures win when present (stable data for demos/tests); any
    // other numeric cust_id — i.e. any real driver a team registers — falls
    // back to a deterministic synthetic member instead of 404ing, so the
    // mock works for every registered user, not just the five hand-written
    // ones.
    const fixture =
      memberSummaryFixtures[custIdParam] ??
      (Number.isFinite(custId) ? synthesizeMemberSummary(custId) : null);

    if (!fixture) {
      return HttpResponse.json({ error: "member not found in mock fixtures" }, { status: 404 });
    }
    return HttpResponse.json(fixture);
  }),
];
