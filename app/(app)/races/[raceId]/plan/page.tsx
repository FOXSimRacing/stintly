import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRaceForUser } from "@/lib/races/queries";
import { getRosterForRace, getStintPlanForRace, getStintsForPlan } from "@/lib/stint-plans/queries";
import { StintPlanEditor } from "./stint-plan-editor";

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

  const [plan, roster] = await Promise.all([
    getStintPlanForRace(raceId),
    getRosterForRace(raceId),
  ]);
  const stints = plan ? await getStintsForPlan(plan.id) : [];
  const canEdit = race.role === "owner" || race.role === "strategist";

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">{race.name}</h1>
      <p className="text-sm text-muted-foreground">
        {dateFormatter.format(race.startTimeUtc)} · {race.trackName ?? "Pista a definir"} ·{" "}
        {race.carName ?? "Carro a definir"}
      </p>

      <div className="mt-4 min-w-0">
        {plan ? (
          <StintPlanEditor
            stintPlanId={plan.id}
            raceStartUtc={race.startTimeUtc}
            totalDurationMinutes={race.totalDurationMinutes}
            stints={stints}
            roster={roster}
            canEdit={canEdit}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Esta prova ainda não tem um plano de stints.
          </p>
        )}
      </div>
    </div>
  );
}
