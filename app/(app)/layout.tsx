import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { teamMembers } from "@/drizzle/schema";
import { AccountMenu } from "@/components/account-menu";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [membership] = await db
    .select({ id: teamMembers.id })
    .from(teamMembers)
    .where(eq(teamMembers.userId, user.id))
    .limit(1);

  if (!membership) {
    redirect("/onboarding");
  }

  const hasDiscord =
    user.identities?.some((i) => i.provider === "discord") ?? false;
  // updateUser({ password }) doesn't add an "email" identities entry (that
  // only happens via signup), so we also check the has_password metadata
  // flag stamped by app/(app)/actions.ts's setPassword action.
  const hasPassword =
    user.user_metadata?.has_password === true ||
    (user.identities?.some((i) => i.provider === "email") ?? false);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex h-14 items-center justify-between border-b px-6">
        <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
          Stintly
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground">
            Provas
          </Link>
          <Link href="/roster" className="hover:text-foreground">
            Elenco
          </Link>
          <Link href="/settings" className="hover:text-foreground">
            Time
          </Link>
        </nav>
        <AccountMenu
          email={user.email ?? ""}
          hasPassword={hasPassword}
          hasDiscord={hasDiscord}
        />
      </header>
      <main className="flex flex-1 flex-col p-6">{children}</main>
    </div>
  );
}
