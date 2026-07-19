import { z } from "zod";

// Best-effort reconstruction of /data/member/summary from public community
// docs — not iRacing's official authenticated docs. Expect field corrections
// once real API access is available (see stintly-iracing-data-api skill).
export const memberSummarySchema = z.object({
  cust_id: z.number().int(),
  display_name: z.string(),
  irating: z.number().int().nonnegative(),
  safety_rating: z.string(),
});

export type MemberSummary = z.infer<typeof memberSummarySchema>;
