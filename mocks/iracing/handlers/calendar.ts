import { http, HttpResponse } from "msw";
import { IRACING_DATA_HOST } from "@/lib/iracing/hosts";
import { enduranceRaceGuideFixture } from "../fixtures/calendar";

export const calendarHandlers = [
  http.get(`${IRACING_DATA_HOST}/data/season/race_guide`, () => {
    return HttpResponse.json({
      link: `${IRACING_DATA_HOST}/mock-cdn/race-guide.json`,
      expires: new Date(Date.now() + 60_000).toISOString(),
    });
  }),
  http.get(`${IRACING_DATA_HOST}/mock-cdn/race-guide.json`, () => {
    return HttpResponse.json(enduranceRaceGuideFixture);
  }),
];
