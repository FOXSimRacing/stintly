import { createClient } from "@supabase/supabase-js";

// Service-role client for the Supabase Admin API (auth.admin.*) — listing
// all registered users and inviting new ones by email require privileges
// the anon key doesn't have. Server-only: never import this from a client
// component, and never expose SUPABASE_SERVICE_ROLE_KEY via NEXT_PUBLIC_*.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
