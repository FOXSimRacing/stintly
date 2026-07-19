import Link from "next/link";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
});

type NextRace = {
  id: string;
  name: string;
  startTimeUtc: Date;
  totalDurationMinutes: number;
  trackName: string | null;
  carName: string | null;
};

export function NextRaceCard({ race }: { race: NextRace | null }) {
  if (!race) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma corrida planejada.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{race.name}</CardTitle>
        <CardDescription>{dateFormatter.format(race.startTimeUtc)}</CardDescription>
        <CardAction>
          <Button
            render={<Link href={`/races/${race.id}/plan`} />}
            nativeButton={false}
          >
            Planejar stints
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
        <span>Pista: {race.trackName ?? "A definir"}</span>
        <span>Carro: {race.carName ?? "A definir"}</span>
        <span>Duração: {race.totalDurationMinutes} min</span>
      </CardContent>
    </Card>
  );
}
