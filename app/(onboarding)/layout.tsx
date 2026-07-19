import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Choke point for "must be logged in" for the onboarding/invite flow —
// deliberately separate from app/(app)/layout.tsx, which also requires an
// existing team_members row. Routes in this group are exactly the ones a
// team-less logged-in user needs to reach, so they can't share that gate.
export default async function OnboardingLayout({
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
    <div className="flex min-h-full flex-1 items-center justify-center p-6">
      {children}
    </div>
  );
}
