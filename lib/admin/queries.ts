import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { admins } from "@/drizzle/schema";

export async function isAdmin(userId: string) {
  const rows = await db
    .select({ userId: admins.userId })
    .from(admins)
    .where(eq(admins.userId, userId))
    .limit(1);

  return rows.length > 0;
}
