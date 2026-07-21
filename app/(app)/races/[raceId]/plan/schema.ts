import { z } from "zod";

// Times are entered as minutes elapsed since race start rather than wall-clock
// timestamps — matches how strategists actually plan ("stint from minute 0 to
// 55") and how the timeline itself is labeled.
const baseStintFields = {
  driverId: z.string().uuid().nullable(),
  startMinutes: z.number().int().min(0, "O início não pode ser negativo."),
  durationMinutes: z.number().int().min(5, "Duração mínima de 5 minutos."),
};

export const createStintSchema = z.object({
  stintPlanId: z.string().uuid(),
  ...baseStintFields,
});
export type CreateStintInput = z.infer<typeof createStintSchema>;

export const updateStintSchema = z.object({
  stintId: z.string().uuid(),
  stintPlanId: z.string().uuid(),
  ...baseStintFields,
});
export type UpdateStintInput = z.infer<typeof updateStintSchema>;

export const deleteStintSchema = z.object({
  stintId: z.string().uuid(),
  stintPlanId: z.string().uuid(),
});
export type DeleteStintInput = z.infer<typeof deleteStintSchema>;

export const generateDefaultStintsSchema = z.object({
  stintPlanId: z.string().uuid(),
});
export type GenerateDefaultStintsInput = z.infer<typeof generateDefaultStintsSchema>;
