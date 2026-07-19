"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { acceptInvite } from "./actions";

export function AcceptInviteButton({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onAccept = () => {
    setError(null);
    startTransition(async () => {
      const result = await acceptInvite(token);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <Button
        type="button"
        disabled={isPending}
        className="w-full"
        onClick={onAccept}
      >
        {isPending ? "Aceitando..." : "Aceitar convite"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
