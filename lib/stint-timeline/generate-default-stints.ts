// Target stint length used only to size the *suggested* default plan — not
// the same concept as DEFAULT_MIN_REST_MINUTES in rest-violations.ts (same
// value today by coincidence, keep them separate).
export const DEFAULT_TARGET_STINT_MINUTES = 45;

export type GeneratedStint = {
  driverId: string | null;
  plannedStartTime: Date;
  plannedEndTime: Date;
};

export function generateDefaultStints({
  raceStartUtc,
  totalDurationMinutes,
  driverIds,
  targetStintMinutes = DEFAULT_TARGET_STINT_MINUTES,
}: {
  raceStartUtc: Date;
  totalDurationMinutes: number;
  driverIds: string[];
  targetStintMinutes?: number;
}): GeneratedStint[] {
  if (totalDurationMinutes <= 0) return [];

  const stintCount = Math.max(1, Math.round(totalDurationMinutes / targetStintMinutes));
  const baseMinutes = Math.floor(totalDurationMinutes / stintCount);
  const remainder = totalDurationMinutes - baseMinutes * stintCount;

  const result: GeneratedStint[] = [];
  let cursor = 0;
  for (let i = 0; i < stintCount; i++) {
    const duration = baseMinutes + (i < remainder ? 1 : 0);
    const plannedStartTime = new Date(raceStartUtc.getTime() + cursor * 60_000);
    const plannedEndTime = new Date(raceStartUtc.getTime() + (cursor + duration) * 60_000);
    result.push({
      driverId: driverIds.length > 0 ? driverIds[i % driverIds.length] : null,
      plannedStartTime,
      plannedEndTime,
    });
    cursor += duration;
  }

  return result;
}
