// There's no single official minimum rest gap in endurance racing — teams set
// their own policy. This is a default used to *surface a warning*, never to
// block: strategists sometimes schedule tight turnarounds on purpose.
export const DEFAULT_MIN_REST_MINUTES = 45;

export type StintForRestCheck = {
  id: string;
  driverId: string | null;
  plannedStartTime: Date;
  plannedEndTime: Date;
};

export type RestViolation = {
  previousStintId: string;
  gapMinutes: number;
};

export function findRestViolations(
  stints: StintForRestCheck[],
  minRestMinutes = DEFAULT_MIN_REST_MINUTES,
): Map<string, RestViolation> {
  const violations = new Map<string, RestViolation>();
  const byDriver = new Map<string, StintForRestCheck[]>();

  for (const stint of stints) {
    if (!stint.driverId) continue;
    const list = byDriver.get(stint.driverId) ?? [];
    list.push(stint);
    byDriver.set(stint.driverId, list);
  }

  for (const driverStints of byDriver.values()) {
    const sorted = [...driverStints].sort(
      (a, b) => a.plannedStartTime.getTime() - b.plannedStartTime.getTime(),
    );

    for (let i = 1; i < sorted.length; i++) {
      const previous = sorted[i - 1];
      const current = sorted[i];
      const gapMinutes =
        (current.plannedStartTime.getTime() - previous.plannedEndTime.getTime()) / 60_000;

      if (gapMinutes < minRestMinutes) {
        violations.set(current.id, { previousStintId: previous.id, gapMinutes });
      }
    }
  }

  return violations;
}
