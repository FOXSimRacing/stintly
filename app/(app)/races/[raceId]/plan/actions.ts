"use server";

import { revalidatePath } from "next/cache";
import { and, asc, count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { stints, teamMembers } from "@/drizzle/schema";
import { createClient } from "@/lib/supabase/server";
import { getRaceForStintPlan, getRosterForRace, getStintsForPlan } from "@/lib/stint-plans/queries";
import { generateDefaultStints as generateDefaultStintsPure } from "@/lib/stint-timeline/generate-default-stints";
import {
  createStintSchema,
  deleteStintSchema,
  generateDefaultStintsSchema,
  updateStintSchema,
  type CreateStintInput,
  type DeleteStintInput,
  type GenerateDefaultStintsInput,
  type UpdateStintInput,
} from "./schema";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type ActionResult = { error: string } | { success: true };
type RaceForPlan = NonNullable<Awaited<ReturnType<typeof getRaceForStintPlan>>>;

async function requireStrategistForPlan(
  stintPlanId: string,
): Promise<{ error: string } | { race: RaceForPlan }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Você precisa estar autenticado." };

  const race = await getRaceForStintPlan(stintPlanId);
  if (!race) return { error: "Plano de stints não encontrado." };

  const [membership] = await db
    .select({ role: teamMembers.role })
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, race.teamId), eq(teamMembers.userId, user.id)));

  if (!membership || !["owner", "strategist"].includes(membership.role)) {
    return { error: "Você não tem permissão para editar este plano." };
  }

  return { race };
}

function minutesToTime(raceStart: Date, offsetMinutes: number) {
  return new Date(raceStart.getTime() + offsetMinutes * 60_000);
}

async function hasOverlap(
  stintPlanId: string,
  start: Date,
  end: Date,
  excludeStintId?: string,
) {
  const existing = await getStintsForPlan(stintPlanId);
  return existing.some(
    (stint) =>
      stint.id !== excludeStintId &&
      start < stint.plannedEndTime &&
      end > stint.plannedStartTime,
  );
}

// Reorders order_index to match chronological start time. Runs inside the
// caller's transaction — see "Multi-row stint mutations" in the
// stintly-api-conventions skill.
async function resequenceOrder(tx: Tx, stintPlanId: string) {
  const rows = await tx
    .select({ id: stints.id })
    .from(stints)
    .where(eq(stints.stintPlanId, stintPlanId))
    .orderBy(asc(stints.plannedStartTime));

  for (const [index, row] of rows.entries()) {
    await tx.update(stints).set({ orderIndex: index }).where(eq(stints.id, row.id));
  }
}

export async function createStint(input: CreateStintInput): Promise<ActionResult> {
  const parsed = createStintSchema.parse(input);
  const check = await requireStrategistForPlan(parsed.stintPlanId);
  if ("error" in check) return check;
  const { race } = check;

  if (parsed.startMinutes + parsed.durationMinutes > race.totalDurationMinutes) {
    return { error: "Esse stint termina depois do fim da prova." };
  }

  const start = minutesToTime(race.startTimeUtc, parsed.startMinutes);
  const end = minutesToTime(race.startTimeUtc, parsed.startMinutes + parsed.durationMinutes);

  if (await hasOverlap(parsed.stintPlanId, start, end)) {
    return { error: "Esse horário sobrepõe outro stint já planejado." };
  }

  await db.transaction(async (tx) => {
    await tx.insert(stints).values({
      stintPlanId: parsed.stintPlanId,
      driverId: parsed.driverId,
      orderIndex: 0,
      plannedStartTime: start,
      plannedEndTime: end,
    });
    await resequenceOrder(tx, parsed.stintPlanId);
  });

  revalidatePath(`/races/${race.raceId}/plan`);
  return { success: true };
}

export async function updateStint(input: UpdateStintInput): Promise<ActionResult> {
  const parsed = updateStintSchema.parse(input);
  const check = await requireStrategistForPlan(parsed.stintPlanId);
  if ("error" in check) return check;
  const { race } = check;

  if (parsed.startMinutes + parsed.durationMinutes > race.totalDurationMinutes) {
    return { error: "Esse stint termina depois do fim da prova." };
  }

  const start = minutesToTime(race.startTimeUtc, parsed.startMinutes);
  const end = minutesToTime(race.startTimeUtc, parsed.startMinutes + parsed.durationMinutes);

  if (await hasOverlap(parsed.stintPlanId, start, end, parsed.stintId)) {
    return { error: "Esse horário sobrepõe outro stint já planejado." };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(stints)
      .set({ driverId: parsed.driverId, plannedStartTime: start, plannedEndTime: end })
      .where(eq(stints.id, parsed.stintId));
    await resequenceOrder(tx, parsed.stintPlanId);
  });

  revalidatePath(`/races/${race.raceId}/plan`);
  return { success: true };
}

export async function deleteStint(input: DeleteStintInput): Promise<ActionResult> {
  const parsed = deleteStintSchema.parse(input);
  const check = await requireStrategistForPlan(parsed.stintPlanId);
  if ("error" in check) return check;

  await db.delete(stints).where(eq(stints.id, parsed.stintId));

  revalidatePath(`/races/${check.race.raceId}/plan`);
  return { success: true };
}

export async function generateDefaultStints(
  input: GenerateDefaultStintsInput,
): Promise<ActionResult> {
  const parsed = generateDefaultStintsSchema.parse(input);
  const check = await requireStrategistForPlan(parsed.stintPlanId);
  if ("error" in check) return check;
  const { race } = check;

  const roster = await getRosterForRace(race.raceId);
  const generated = generateDefaultStintsPure({
    raceStartUtc: race.startTimeUtc,
    totalDurationMinutes: race.totalDurationMinutes,
    driverIds: roster.map((driver) => driver.id),
  });
  if (generated.length === 0) return { error: "Duração da prova inválida." };

  const result = await db.transaction(async (tx) => {
    // Re-check inside the transaction (not just before it) to close the race
    // window between two near-simultaneous clicks/strategists.
    const [{ existing }] = await tx
      .select({ existing: count() })
      .from(stints)
      .where(eq(stints.stintPlanId, parsed.stintPlanId));
    if (existing > 0) return { error: "Este plano já tem stints." } as const;

    await tx.insert(stints).values(
      generated.map((stint, index) => ({
        stintPlanId: parsed.stintPlanId,
        driverId: stint.driverId,
        orderIndex: index,
        plannedStartTime: stint.plannedStartTime,
        plannedEndTime: stint.plannedEndTime,
      })),
    );
    return { success: true } as const;
  });
  if ("error" in result) return result;

  revalidatePath(`/races/${race.raceId}/plan`);
  return { success: true };
}
