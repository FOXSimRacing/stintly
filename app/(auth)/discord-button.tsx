"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function useDiscordOAuth(mode: "sign-in" | "link", next?: string) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const trigger = () => {
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback${
        next ? `?next=${encodeURIComponent(next)}` : ""
      }`;
      const { error } =
        mode === "link"
          ? await supabase.auth.linkIdentity({
              provider: "discord",
              options: { redirectTo },
            })
          : await supabase.auth.signInWithOAuth({
              provider: "discord",
              options: { redirectTo },
            });
      if (error) {
        setError(
          mode === "link"
            ? "Não foi possível vincular o Discord. Tente de novo."
            : "Não foi possível conectar com o Discord. Tente de novo.",
        );
      }
      // On success, Supabase redirects the browser to Discord — nothing
      // else to do here.
    });
  };

  return { trigger, isPending, error };
}

export function DiscordButton() {
  const { trigger, isPending, error } = useDiscordOAuth("sign-in");

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isPending}
        onClick={trigger}
      >
        {isPending ? "Redirecionando..." : "Continuar com Discord"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
