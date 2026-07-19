import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Exchanges the OAuth `code` (Discord, etc.) for a session cookie. Not a
// same-origin form/UI action, so it's a Route Handler rather than a
// Server Action — see stintly-api-conventions.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    // If a session already exists, this was a link-identity flow (the user
    // was authenticated before this redirect) rather than a sign-in — bounce
    // back into the app with the error instead of /login, since an
    // authenticated user hitting /login is redirected straight to /dashboard
    // by app/(auth)/layout.tsx, which would silently drop this error.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const failureUrl = new URL(next, origin);
      failureUrl.searchParams.set("error", "discord_link");
      failureUrl.searchParams.set("reason", error.code ?? "unknown");
      return NextResponse.redirect(failureUrl);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
