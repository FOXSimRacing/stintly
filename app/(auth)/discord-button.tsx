"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function DiscordButton() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError("Não foi possível conectar com o Discord. Tente de novo.");
      }
      // On success, Supabase redirects the browser to Discord — nothing
      // else to do here.
    });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isPending}
        onClick={handleClick}
      >
        {isPending ? "Redirecionando..." : "Continuar com Discord"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
