import { http, HttpResponse } from "msw";
import { IRACING_DATA_HOST } from "@/lib/iracing/hosts";
import { subsessionResultFixtures } from "../fixtures/results";

export const resultsHandlers = [
  http.get(`${IRACING_DATA_HOST}/data/results/get`, ({ request }) => {
    const subsessionId = new URL(request.url).searchParams.get("subsession_id");
    return HttpResponse.json({
      link: `${IRACING_DATA_HOST}/mock-cdn/results/${subsessionId}.json`,
      expires: new Date(Date.now() + 60_000).toISOString(),
    });
  }),
  http.get(`${IRACING_DATA_HOST}/mock-cdn/results/:subsessionId`, ({ params }) => {
    const subsessionId = String(params.subsessionId).replace(/\.json$/, "");
    const fixture = subsessionResultFixtures[subsessionId];
    if (!fixture) {
      return HttpResponse.json({ error: "subsession not found in mock fixtures" }, { status: 404 });
    }
    return HttpResponse.json(fixture);
  }),
];
