"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { teams, teamMembers } from "@/drizzle/schema";
import { createTeamSchema, type CreateTeamInput } from "./schema";

const DIACRITICS_PATTERN = /[̀-ͯ]/g;

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(DIACRITICS_PATTERN, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  return base || "time";
}

function isUniqueSlugViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export async function createTeam(input: CreateTeamInput) {
  const parsed = createTeamSchema.parse(input);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sua sessão expirou. Entre novamente." };
  }

  const iracingTeamId = parsed.source === "iracing" ? parsed.iracingTeamId : null;
  const baseSlug = slugify(parsed.name);

  let created = false;
  for (let attempt = 0; attempt < 3 && !created; attempt++) {
    const slug =
      attempt === 0
        ? baseSlug
        : `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

    try {
      await db.transaction(async (tx) => {
        const [team] = await tx
          .insert(teams)
          .values({ name: parsed.name, slug, iracingTeamId, createdBy: user.id })
          .returning({ id: teams.id });

        await tx.insert(teamMembers).values({
          teamId: team.id,
          userId: user.id,
          role: "owner",
        });
      });
      created = true;
    } catch (error) {
      if (isUniqueSlugViolation(error) && attempt < 2) {
        continue;
      }
      return { error: "Não foi possível criar o time. Tente de novo." };
    }
  }

  redirect("/dashboard");
}
