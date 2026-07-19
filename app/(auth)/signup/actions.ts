"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signupSchema, type SignupInput } from "./schema";

export async function signup(input: SignupInput) {
  const { email, password } = signupSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  // Email confirmation is required: signUp succeeds but returns no session
  // until the user clicks the link, so there's nothing to redirect into yet.
  if (!data.session) {
    return {
      info: "Enviamos um link de confirmação para o seu email. Confirme para poder entrar.",
    };
  }

  redirect("/dashboard");
}
