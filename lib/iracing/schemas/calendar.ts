import { z } from "zod";

export const enduranceRaceSchema = z.object({
  series_id: z.number(),
  series_name: z.string(),
  track: z.object({
    track_id: z.number(),
    track_name: z.string(),
  }),
  start_time: z.string(),
  duration_minutes: z.number(),
  allowed_classes: z.array(z.string()),
});

export const enduranceRaceGuideSchema = z.array(enduranceRaceSchema);

export type EnduranceRace = z.infer<typeof enduranceRaceSchema>;
