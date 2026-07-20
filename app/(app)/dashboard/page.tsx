import { createClient } from "@/lib/supabase/server";
import { getNextUpcomingRace, getPastRaces } from "@/lib/races/queries";
import { getUpcomingEnduranceRaces } from "@/lib/iracing";
import { NextRaceCard } from "@/components/races/next-race-card";
import { PastRacesList } from "@/components/races/past-races-list";
import { EnduranceCalendarList } from "@/components/races/endurance-calendar-list";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reason?: string }>;
}) {
  const { error, reason } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0] ??
    "piloto";

  const [nextRace, pastRaces] = user
    ? await Promise.all([getNextUpcomingRace(user.id), getPastRaces(user.id)])
    : [null, []];
  const enduranceRaces = await getUpcomingEnduranceRaces();

  return (
    <div className="grid flex-1 grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        {error === "discord_link" && (
          <p className="text-sm text-destructive">
            {reason === "identity_already_exists"
              ? "Essa conta do Discord já está vinculada a outro usuário Stintly."
              : "Não foi possível vincular sua conta do Discord. Tente de novo."}
          </p>
        )}

        <h1 className="text-2xl font-semibold tracking-tight">
          Olá, {displayName}!
        </h1>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium tracking-tight">
            Próximas Corridas
          </h2>
          <NextRaceCard race={nextRace} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium tracking-tight">
            Corridas Passadas
          </h2>
          <PastRacesList races={pastRaces} />
        </section>
      </div>

      <EnduranceCalendarList races={enduranceRaces} />
    </div>
  );
}
