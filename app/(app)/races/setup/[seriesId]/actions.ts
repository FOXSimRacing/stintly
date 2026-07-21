"use server";

import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { cars, drivers, raceDrivers, races, stintPlans, stints, teamMembers, tracks } from "@/drizzle/schema";
import { createClient } from "@/lib/supabase/server";
import { getUpcomingEnduranceRaces } from "@/lib/iracing";
import { generateDefaultStints } from "@/lib/stint-timeline/generate-default-stints";
import {
  createRaceFromCalendarEventSchema,
  type CreateRaceFromCalendarEventInput,
} from "./schema";

export async function createRaceFromCalendarEvent(
  input: CreateRaceFromCalendarEventInput,
) {
  const { seriesId, teamId, carId, driverIds } =
    createRaceFromCalendarEventSchema.parse(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Você precisa estar autenticado." };

  const [membership] = await db
    .select({ role: teamMembers.role })
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, user.id)));

  if (!membership || !["owner", "strategist"].includes(membership.role)) {
    return { error: "Você não tem permissão para criar provas para este time." };
  }

  const events = await getUpcomingEnduranceRaces();
  const event = events.find((race) => race.series_id === seriesId);
  if (!event) return { error: "Evento do calendário não encontrado." };

  const [car] = await db.select().from(cars).where(eq(cars.id, carId));
  if (!car || !car.class || !event.allowed_classes.includes(car.class)) {
    return { error: "Carro não permitido para este evento." };
  }

  const teamDrivers = await db
    .select({ id: drivers.id })
    .from(drivers)
    .where(and(eq(drivers.teamId, teamId), inArray(drivers.id, driverIds)));

  if (teamDrivers.length !== driverIds.length) {
    return { error: "Um dos pilotos selecionados não pertence a este time." };
  }

  const [track] = await db
    .select({ id: tracks.id })
    .from(tracks)
    .where(eq(tracks.iracingTrackId, event.track.track_id));

  const raceId = await db.transaction(async (tx) => {
    const [race] = await tx
      .insert(races)
      .values({
        teamId,
        trackId: track?.id ?? null,
        carId,
        name: event.series_name,
        eventClass: car.class,
        startTimeUtc: new Date(event.start_time),
        totalDurationMinutes: event.duration_minutes,
        status: "planned",
        createdBy: user.id,
      })
      .returning({ id: races.id });

    await tx
      .insert(raceDrivers)
      .values(driverIds.map((driverId) => ({ raceId: race.id, driverId })));

    const [stintPlan] = await tx
      .insert(stintPlans)
      .values({
        raceId: race.id,
        name: "Plano inicial",
        status: "draft",
        createdBy: user.id,
      })
      .returning({ id: stintPlans.id });

    // driverIds here is form-submission order, not the alphabetical order
    // getRosterForRace uses for the retroactive "gerar sugestão" action —
    // intentionally different, not a bug to reconcile.
    const generatedStints = generateDefaultStints({
      raceStartUtc: new Date(event.start_time),
      totalDurationMinutes: event.duration_minutes,
      driverIds,
    });
    if (generatedStints.length > 0) {
      await tx.insert(stints).values(
        generatedStints.map((stint, index) => ({
          stintPlanId: stintPlan.id,
          driverId: stint.driverId,
          orderIndex: index,
          plannedStartTime: stint.plannedStartTime,
          plannedEndTime: stint.plannedEndTime,
        })),
      );
    }

    return race.id;
  });

  redirect(`/races/${raceId}/plan`);
}
