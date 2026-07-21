export type StintForTotals = {
  driverId: string | null;
  plannedStartTime: Date;
  plannedEndTime: Date;
};

export function computePilotMinutesByDriver(stints: StintForTotals[]): Map<string, number> {
  const totals = new Map<string, number>();

  for (const stint of stints) {
    if (!stint.driverId) continue;
    const minutes = (stint.plannedEndTime.getTime() - stint.plannedStartTime.getTime()) / 60_000;
    totals.set(stint.driverId, (totals.get(stint.driverId) ?? 0) + minutes);
  }

  return totals;
}

export function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return hours > 0 ? `${hours}h${minutes.toString().padStart(2, "0")}` : `${minutes}min`;
}
