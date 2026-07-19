"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signupSchema, type SignupInput } from "./schema";

const DUPLICATE_ACCOUNT_MESSAGE =
  "Você já tem uma conta com este email. Entre com sua senha ou use o Discord abaixo.";

export async function signup(input: SignupInput) {
  const { email, password } = signupSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    // "Confirm email" OFF: Supabase returns an explicit error for an email
    // that already belongs to a confirmed user instead of the obfuscated
    // empty-identities user handled below.
    const isDuplicate =
      error.code === "user_already_exists" ||
      /already registered/i.test(error.message);
    return { error: isDuplicate ? DUPLICATE_ACCOUNT_MESSAGE : error.message };
  }

  // "Confirm email" ON: signUp succeeds with no error, but returns a user
  // with an empty `identities` array specifically to avoid leaking account
  // existence via an error message — Supabase's documented signal that this
  // email already has a confirmed account. Without this check we'd show
  // "check your email" for an account that already exists.
  if (data.user && data.user.identities?.length === 0) {
    return { error: DUPLICATE_ACCOUNT_MESSAGE };
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
