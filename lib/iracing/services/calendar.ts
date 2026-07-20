import { fetchIracingData } from "../client";
import { enduranceRaceGuideSchema, type EnduranceRace } from "../schemas/calendar";

export async function getUpcomingEnduranceRaces(): Promise<EnduranceRace[]> {
  return fetchIracingData("/data/season/race_guide", {}, enduranceRaceGuideSchema);
}
