import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin/queries";

// Independent re-check of admin access: the /admin route is reachable by
// direct URL even when the sidebar item is hidden, so this can't rely on
// the sidebar's isAdmin prop alone.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(user.id))) {
    redirect("/dashboard");
  }

  return children;
}
