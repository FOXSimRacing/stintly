import { z } from "zod";

// Best-effort reconstruction of /data/track/get and /data/car/get from
// public community docs — not iRacing's official authenticated docs. Expect
// field corrections once real API access is available (see
// stintly-iracing-data-api skill).
export const trackSchema = z.object({
  track_id: z.number().int(),
  track_name: z.string(),
  config_name: z.string(),
  category: z.enum(["road", "oval", "dirt_road", "dirt_oval"]),
});

export const carSchema = z.object({
  car_id: z.number().int(),
  car_name: z.string(),
  car_name_abbreviated: z.string(),
});

export type Track = z.infer<typeof trackSchema>;
export type Car = z.infer<typeof carSchema>;
