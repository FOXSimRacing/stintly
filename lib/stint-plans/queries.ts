import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { drivers, races, raceDrivers, stintPlans, stints } from "@/drizzle/schema";

export async function getStintPlanForRace(raceId: string) {
  const [plan] = await db
    .select()
    .from(stintPlans)
    .where(eq(stintPlans.raceId, raceId))
    .orderBy(asc(stintPlans.updatedAt))
    .limit(1);

  return plan ?? null;
}

export async function getStintsForPlan(stintPlanId: string) {
  return db
    .select({
      id: stints.id,
      stintPlanId: stints.stintPlanId,
      driverId: stints.driverId,
      orderIndex: stints.orderIndex,
      plannedStartTime: stints.plannedStartTime,
      plannedEndTime: stints.plannedEndTime,
      status: stints.status,
      notes: stints.notes,
      driverDisplayName: drivers.displayName,
    })
    .from(stints)
    .leftJoin(drivers, eq(drivers.id, stints.driverId))
    .where(eq(stints.stintPlanId, stintPlanId))
    .orderBy(asc(stints.orderIndex));
}

export async function getRaceForStintPlan(stintPlanId: string) {
  const [row] = await db
    .select({
      raceId: races.id,
      teamId: races.teamId,
      startTimeUtc: races.startTimeUtc,
      totalDurationMinutes: races.totalDurationMinutes,
    })
    .from(stintPlans)
    .innerJoin(races, eq(races.id, stintPlans.raceId))
    .where(eq(stintPlans.id, stintPlanId))
    .limit(1);

  return row ?? null;
}

export async function getRosterForRace(raceId: string) {
  return db
    .select({
      id: drivers.id,
      displayName: drivers.displayName,
    })
    .from(raceDrivers)
    .innerJoin(drivers, eq(drivers.id, raceDrivers.driverId))
    .where(eq(raceDrivers.raceId, raceId))
    .orderBy(asc(drivers.displayName));
}
