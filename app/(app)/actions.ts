"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setPasswordSchema, type SetPasswordInput } from "./set-password-schema";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function setPassword(input: SetPasswordInput) {
  const { password } = setPasswordSchema.parse(input);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sua sessão expirou. Entre novamente." };
  }

  // `updateUser` on an authenticated session attaches a password to the
  // existing auth.users row rather than creating a new identity/user — this
  // is what lets the account log in with either Discord or email/password
  // afterward. Supabase has no public "does this user have a password"
  // flag, so we stamp one into user_metadata ourselves: an account whose
  // password was set this way never gets an `identities` entry for
  // provider "email" (that only happens via signup), so this is the only
  // reliable way to hide "Definir senha" once it's already been used.
  const { error } = await supabase.auth.updateUser({
    password,
    data: { has_password: true },
  });

  if (error) {
    if (error.code === "same_password") {
      return { error: "A nova senha precisa ser diferente da atual." };
    }
    if (error.code === "weak_password") {
      return { error: "Essa senha é muito fraca. Tente uma senha com mais variedade." };
    }
    return { error: "Não foi possível definir a senha. Tente de novo." };
  }

  return { success: true };
}
