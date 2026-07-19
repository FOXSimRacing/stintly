import { fetchIracingData } from "../client";
import { subsessionResultSchema, type SubsessionResult } from "../schemas/results";

export async function getSubsessionResult(subsessionId: number): Promise<SubsessionResult> {
  return fetchIracingData(
    "/data/results/get",
    { subsession_id: subsessionId },
    subsessionResultSchema,
  );
}
