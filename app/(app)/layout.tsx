import { redirect } from "next/navigation";
import packageJson from "@/package.json";
import { createClient } from "@/lib/supabase/server";
import { getUserTeams } from "@/lib/teams/queries";
import { isAdmin } from "@/lib/admin/queries";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

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

  const hasDiscord =
    user.identities?.some((i) => i.provider === "discord") ?? false;
  // updateUser({ password }) doesn't add an "email" identities entry (that
  // only happens via signup), so we also check the has_password metadata
  // flag stamped by app/(app)/actions.ts's setPassword action.
  const hasPassword =
    user.user_metadata?.has_password === true ||
    (user.identities?.some((i) => i.provider === "email") ?? false);

  const [teams, userIsAdmin] = await Promise.all([
    getUserTeams(user.id),
    isAdmin(user.id),
  ]);

  return (
    <SidebarProvider>
      <AppSidebar
        teams={teams}
        email={user.email ?? ""}
        hasPassword={hasPassword}
        hasDiscord={hasDiscord}
        isAdmin={userIsAdmin}
        version={packageJson.version}
      />
      <SidebarInset>
        <main className="flex min-w-0 flex-1 flex-col p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
