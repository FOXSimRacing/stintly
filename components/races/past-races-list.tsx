import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
});

type PastRace = {
  id: string;
  name: string;
  startTimeUtc: Date;
  trackName: string | null;
};

export function PastRacesList({ races }: { races: PastRace[] }) {
  if (races.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma corrida registrada ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {races.map((race) => (
        <Link
          key={race.id}
          href={`/races/${race.id}`}
          className="rounded-xl ring-1 ring-foreground/10 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{race.name}</span>
              <span className="text-xs text-muted-foreground">
                {race.trackName ?? "Pista não definida"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {dateFormatter.format(race.startTimeUtc)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
