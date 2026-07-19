import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { invites, teams } from "@/drizzle/schema";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AcceptInviteButton } from "./accept-invite-button";

const ROLE_LABELS = {
  owner: "dono",
  strategist: "estrategista",
  driver: "piloto",
} as const;

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [invite] = await db
    .select({
      token: invites.token,
      email: invites.email,
      role: invites.role,
      status: invites.status,
      expiresAt: invites.expiresAt,
      teamName: teams.name,
    })
    .from(invites)
    .innerJoin(teams, eq(teams.id, invites.teamId))
    .where(eq(invites.token, token))
    .limit(1);

  if (!invite || invite.status !== "pending" || invite.expiresAt <= new Date()) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Convite inválido</CardTitle>
          <CardDescription>
            Esse convite não existe mais, expirou ou já foi usado.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (invite.email.toLowerCase() !== (user.email ?? "").toLowerCase()) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Convite para outro email</CardTitle>
          <CardDescription>
            Esse convite foi enviado para {invite.email}. Entre com essa conta
            para aceitá-lo.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Convite para {invite.teamName}</CardTitle>
        <CardDescription>
          Você foi convidado como {ROLE_LABELS[invite.role]}.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <AcceptInviteButton token={invite.token} />
      </CardFooter>
    </Card>
  );
}
