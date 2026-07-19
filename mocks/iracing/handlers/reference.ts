import { http, HttpResponse } from "msw";
import { IRACING_DATA_HOST } from "@/lib/iracing/hosts";
import { trackFixtures } from "../fixtures/tracks";
import { carFixtures } from "../fixtures/cars";

export const referenceHandlers = [
  http.get(`${IRACING_DATA_HOST}/data/track/get`, ({ request }) => {
    const trackId = new URL(request.url).searchParams.get("track_id");
    return HttpResponse.json({
      link: `${IRACING_DATA_HOST}/mock-cdn/track/${trackId}.json`,
      expires: new Date(Date.now() + 60_000).toISOString(),
    });
  }),
  http.get(`${IRACING_DATA_HOST}/mock-cdn/track/:trackId`, ({ params }) => {
    const trackId = String(params.trackId).replace(/\.json$/, "");
    const fixture = trackFixtures[trackId];
    if (!fixture) {
      return HttpResponse.json({ error: "track not found in mock fixtures" }, { status: 404 });
    }
    return HttpResponse.json(fixture);
  }),

  http.get(`${IRACING_DATA_HOST}/data/car/get`, ({ request }) => {
    const carId = new URL(request.url).searchParams.get("car_id");
    return HttpResponse.json({
      link: `${IRACING_DATA_HOST}/mock-cdn/car/${carId}.json`,
      expires: new Date(Date.now() + 60_000).toISOString(),
    });
  }),
  http.get(`${IRACING_DATA_HOST}/mock-cdn/car/:carId`, ({ params }) => {
    const carId = String(params.carId).replace(/\.json$/, "");
    const fixture = carFixtures[carId];
    if (!fixture) {
      return HttpResponse.json({ error: "car not found in mock fixtures" }, { status: 404 });
    }
    return HttpResponse.json(fixture);
  }),
];
