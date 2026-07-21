// Single source of truth for time↔position conversion in the stint timeline
// — the track and its blocks must all share this scale or they'll visually
// drift apart. Positions are expressed as a percentage of total race
// duration so the track always renders at 100% width.
export function createTimelineScale(raceStart: Date, totalDurationMinutes: number) {
  const raceStartMs = raceStart.getTime();
  const safeDuration = Math.max(totalDurationMinutes, 1);

  function minutesFromStart(date: Date) {
    return (date.getTime() - raceStartMs) / 60_000;
  }

  function clamp(value: number) {
    return Math.max(0, Math.min(100, value));
  }

  return {
    minutesFromStart,
    /** Left offset (%) for a given point in time, relative to race start. */
    timeToPercent(date: Date) {
      return clamp((minutesFromStart(date) / safeDuration) * 100);
    },
    /** Width (%) for a duration in minutes. */
    durationToPercent(minutes: number) {
      return clamp((minutes / safeDuration) * 100);
    },
  };
}

export type TimelineScale = ReturnType<typeof createTimelineScale>;
