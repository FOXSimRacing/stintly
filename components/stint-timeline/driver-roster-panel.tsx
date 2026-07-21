import { getDriverColor } from "@/lib/stint-timeline/driver-colors";
import { formatMinutes } from "@/lib/stint-timeline/pilot-totals";
import { cn } from "@/lib/utils";

export function DriverRosterPanel({
  roster,
  pilotMinutes,
}: {
  roster: { id: string; displayName: string }[];
  pilotMinutes: Map<string, number>;
}) {
  if (roster.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum piloto na escalação desta prova.
      </p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {roster.map((driver) => {
        const colors = getDriverColor(driver.id);
        const minutes = pilotMinutes.get(driver.id) ?? 0;
        return (
          <li
            key={driver.id}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ring-1 ring-foreground/10"
          >
            <span className={cn("size-2.5 rounded-full", colors.swatch)} />
            <span className="font-medium">{driver.displayName}</span>
            <span className="text-muted-foreground">{formatMinutes(minutes)}</span>
          </li>
        );
      })}
    </ul>
  );
}
