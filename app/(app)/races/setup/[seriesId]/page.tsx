import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUpcomingEnduranceRaces } from "@/lib/iracing";
import { getCarsForClasses, getEligibleTeamsForRaceSetup } from "@/lib/races/setup-queries";
import { RaceSetupForm } from "./race-setup-form";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
});

function formatDuration(minutes: number) {
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
}

export default async function RaceSetupPage({
  params,
}: {
  params: Promise<{ seriesId: string }>;
}) {
  const { seriesId } = await params;
  const seriesIdNumber = Number(seriesId);
  if (!Number.isInteger(seriesIdNumber)) notFound();

  const events = await getUpcomingEnduranceRaces();
  const event = events.find((race) => race.series_id === seriesIdNumber);
  if (!event) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const [teams, cars] = await Promise.all([
    getEligibleTeamsForRaceSetup(user.id),
    getCarsForClasses(event.allowed_classes),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{event.series_name}</h1>
        <p className="text-sm text-muted-foreground">
          {event.track.track_name} · {dateFormatter.format(new Date(event.start_time))} ·{" "}
          {formatDuration(event.duration_minutes)}
        </p>
      </div>
      <RaceSetupForm seriesId={event.series_id} teams={teams} cars={cars} />
    </div>
  );
}
