import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EnduranceRace } from "@/lib/iracing";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatDuration(minutes: number) {
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
}

export function EnduranceCalendarList({ races }: { races: EnduranceRace[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendário Endurance iRacing</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {races.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma corrida endurance divulgada.
          </p>
        ) : (
          races.map((race) => (
            <Link
              key={race.series_id}
              href={`/races/setup/${race.series_id}`}
              className="flex flex-col gap-0.5 rounded-lg px-3 py-2 ring-1 ring-foreground/10 transition-colors hover:bg-foreground/5"
            >
              <span className="text-sm font-medium">{race.series_name}</span>
              <span className="text-xs text-muted-foreground">
                {race.track.track_name}
              </span>
              <span className="text-xs text-muted-foreground">
                {dateFormatter.format(new Date(race.start_time))} ·{" "}
                {formatDuration(race.duration_minutes)}
              </span>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
