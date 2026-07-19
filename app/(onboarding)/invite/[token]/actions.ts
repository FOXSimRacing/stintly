"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { invites, teamMembers } from "@/drizzle/schema";

function isUniqueMembershipViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export async function acceptInvite(token: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sua sessão expirou. Entre novamente." };
  }

  const [invite] = await db
    .select()
    .from(invites)
    .where(eq(invites.token, token))
    .limit(1);

  if (
    !invite ||
    invite.status !== "pending" ||
    invite.expiresAt <= new Date() ||
    invite.email.toLowerCase() !== (user.email ?? "").toLowerCase()
  ) {
    return { error: "Esse convite não é mais válido." };
  }

  try {
    await db.transaction(async (tx) => {
      await tx.insert(teamMembers).values({
        teamId: invite.teamId,
        userId: user.id,
        role: invite.role,
      });
      await tx
        .update(invites)
        .set({ status: "accepted" })
        .where(eq(invites.id, invite.id));
    });
  } catch (error) {
    if (isUniqueMembershipViolation(error)) {
      return { error: "Você já faz parte desse time." };
    }
    return { error: "Não foi possível aceitar o convite. Tente de novo." };
  }

  redirect("/dashboard");
}
