import { and, desc, asc, eq, gt, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { cars, races, teamMembers, tracks } from "@/drizzle/schema";

const raceSelection = {
  id: races.id,
  teamId: races.teamId,
  name: races.name,
  eventClass: races.eventClass,
  startTimeUtc: races.startTimeUtc,
  totalDurationMinutes: races.totalDurationMinutes,
  status: races.status,
  trackName: tracks.name,
  carName: cars.name,
  // Role of the requesting user (from the teamMembers join below) — lets
  // callers gate edit UI without a second query.
  role: teamMembers.role,
};

function raceQuery() {
  return db
    .select(raceSelection)
    .from(races)
    .innerJoin(teamMembers, eq(teamMembers.teamId, races.teamId))
    .leftJoin(tracks, eq(tracks.id, races.trackId))
    .leftJoin(cars, eq(cars.id, races.carId));
}

export async function getNextUpcomingRace(userId: string) {
  const [race] = await raceQuery()
    .where(and(eq(teamMembers.userId, userId), gt(races.startTimeUtc, new Date())))
    .orderBy(asc(races.startTimeUtc))
    .limit(1);

  return race ?? null;
}

export async function getPastRaces(userId: string) {
  return raceQuery()
    .where(and(eq(teamMembers.userId, userId), lte(races.startTimeUtc, new Date())))
    .orderBy(desc(races.startTimeUtc));
}

export async function getRaceForUser(raceId: string, userId: string) {
  const [race] = await raceQuery()
    .where(and(eq(races.id, raceId), eq(teamMembers.userId, userId)))
    .limit(1);

  return race ?? null;
}
