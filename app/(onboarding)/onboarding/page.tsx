import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { invites, teams } from "@/drizzle/schema";
import { getIracingTeamOptions } from "@/lib/iracing/teams";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateTeamForm } from "./create-team-form";

const ROLE_LABELS = {
  owner: "dono",
  strategist: "estrategista",
  driver: "piloto",
} as const;

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // (onboarding)/layout.tsx already redirects unauthenticated users to
  // /login, but Supabase types getUser()'s result as nullable regardless.
  if (!user) {
    redirect("/login");
  }

  const [iracingTeams, pendingInvites] = await Promise.all([
    getIracingTeamOptions(),
    user.email
      ? db
          .select({
            token: invites.token,
            role: invites.role,
            teamName: teams.name,
          })
          .from(invites)
          .innerJoin(teams, eq(teams.id, invites.teamId))
          .where(
            and(
              eq(invites.email, user.email),
              eq(invites.status, "pending"),
              gt(invites.expiresAt, new Date()),
            ),
          )
      : Promise.resolve([]),
  ]);

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Bem-vindo ao Stintly
        </h1>
        <p className="text-sm text-muted-foreground">
          Crie um time para começar a planejar suas provas.
        </p>
      </div>

      {pendingInvites.length > 0 && (
        <div className="flex flex-col gap-2">
          {pendingInvites.map((invite) => (
            <Card key={invite.token}>
              <CardHeader>
                <CardTitle>Convite pendente</CardTitle>
                <CardDescription>
                  Você foi convidado para {invite.teamName} como{" "}
                  {ROLE_LABELS[invite.role]}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/invite/${invite.token}`}
                  className="text-sm font-medium underline underline-offset-4"
                >
                  Ver convite
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateTeamForm iracingTeams={iracingTeams} />
    </div>
  );
}
