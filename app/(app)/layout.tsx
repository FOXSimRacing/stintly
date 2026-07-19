import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
        <AccountMenu email={user.email ?? ""} />
      </header>
      <main className="flex flex-1 flex-col p-6">{children}</main>
    </div>
  );
}
