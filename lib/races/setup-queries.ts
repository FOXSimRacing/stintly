import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { cars, drivers, teamMembers, teams } from "@/drizzle/schema";

export async function getEligibleTeamsForRaceSetup(userId: string) {
  const memberships = await db
    .select({ teamId: teams.id, teamName: teams.name, role: teamMembers.role })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(
      and(
        eq(teamMembers.userId, userId),
        inArray(teamMembers.role, ["owner", "strategist"]),
      ),
    )
    .orderBy(teams.name);

  if (memberships.length === 0) return [];

  const teamIds = memberships.map((membership) => membership.teamId);
  const teamDrivers = await db
    .select({ id: drivers.id, teamId: drivers.teamId, displayName: drivers.displayName })
    .from(drivers)
    .where(inArray(drivers.teamId, teamIds))
    .orderBy(drivers.displayName);

  return memberships.map((membership) => ({
    ...membership,
    drivers: teamDrivers.filter((driver) => driver.teamId === membership.teamId),
  }));
}

export async function getCarsForClasses(classes: string[]) {
  if (classes.length === 0) return [];
  return db.select().from(cars).where(inArray(cars.class, classes)).orderBy(cars.name);
}
