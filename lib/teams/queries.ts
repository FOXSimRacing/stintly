import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { teamMembers, teams } from "@/drizzle/schema";

export async function getUserTeams(userId: string) {
  return db
    .select({
      id: teams.id,
      name: teams.name,
      slug: teams.slug,
      role: teamMembers.role,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, userId))
    .orderBy(teams.name);
}
