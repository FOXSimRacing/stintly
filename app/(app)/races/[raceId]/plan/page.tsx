import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRaceForUser } from "@/lib/races/queries";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
});

export default async function RacePlanPage({
  params,
}: {
  params: Promise<{ raceId: string }>;
}) {
  const { raceId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const race = user ? await getRaceForUser(raceId, user.id) : null;

  if (!race) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">{race.name}</h1>
      <p className="text-sm text-muted-foreground">
        {dateFormatter.format(race.startTimeUtc)} · {race.trackName ?? "Pista a definir"} ·{" "}
        {race.carName ?? "Carro a definir"}
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Planejamento de stints em breve.
      </p>
    </div>
  );
}
