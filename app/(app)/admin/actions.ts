"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin/queries";
import { inviteUserSchema, type InviteUserInput } from "./schema";

export async function inviteUser(input: InviteUserInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(user.id))) {
    return { error: "Você não tem permissão para convidar usuários." };
  }

  const { email } = inviteUserSchema.parse(input);

  const origin = (await headers()).get("origin");
  const { error } = await createAdminClient().auth.admin.inviteUserByEmail(
    email,
    { redirectTo: `${origin}/auth/callback` },
  );

  if (error) {
    if (error.code === "email_exists") {
      return { error: "Esse e-mail já está cadastrado." };
    }
    return { error: "Não foi possível enviar o convite. Tente de novo." };
  }

  revalidatePath("/admin");
  return { success: true };
}
