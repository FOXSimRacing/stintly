import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRaceForUser } from "@/lib/races/queries";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
});

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  planned: "Planejada",
  completed: "Concluída",
};

export default async function RaceDetailPage({
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
        {dateFormatter.format(race.startTimeUtc)} · {statusLabels[race.status]}
      </p>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-muted-foreground">Pista</dt>
        <dd>{race.trackName ?? "A definir"}</dd>
        <dt className="text-muted-foreground">Carro</dt>
        <dd>{race.carName ?? "A definir"}</dd>
        <dt className="text-muted-foreground">Duração</dt>
        <dd>{race.totalDurationMinutes} min</dd>
      </dl>
      <h2 className="mt-6 text-lg font-medium tracking-tight">Resultados</h2>
      <p className="text-sm text-muted-foreground">Resultados em breve.</p>
    </div>
  );
}
