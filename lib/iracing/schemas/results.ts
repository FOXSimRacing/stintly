import { z } from "zod";

// Best-effort reconstruction of /data/results/get from public community
// docs — not iRacing's official authenticated docs. Expect field
// corrections once real API access is available (see
// stintly-iracing-data-api skill).
export const subsessionResultSchema = z.object({
  subsession_id: z.number().int(),
  series_name: z.string(),
  track: z.object({
    track_id: z.number().int(),
    track_name: z.string(),
  }),
  results: z.array(
    z.object({
      cust_id: z.number().int(),
      display_name: z.string(),
      finish_position: z.number().int(),
      laps_complete: z.number().int().nonnegative(),
      average_lap: z.number().nonnegative(),
    }),
  ),
});

export type SubsessionResult = z.infer<typeof subsessionResultSchema>;
