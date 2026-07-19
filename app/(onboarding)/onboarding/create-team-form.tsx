"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTeam } from "./actions";
import type { IracingTeamOption } from "@/lib/iracing/teams";

const manualNameSchema = z.object({
  name: z
    .string()
    .min(2, "O nome precisa ter pelo menos 2 caracteres.")
    .max(60, "O nome pode ter no máximo 60 caracteres."),
});

// Base UI's Select displays this shape's `label` in the trigger
// automatically (see itemToStringLabel in its docs) — a plain string value
// would otherwise show the raw value instead of the team name.
type IracingSelectValue = { value: string; label: string };

export function CreateTeamForm({
  iracingTeams,
}: {
  iracingTeams: IracingTeamOption[];
}) {
  const [mode, setMode] = useState<"iracing" | "manual">("iracing");
  const [selectedTeam, setSelectedTeam] = useState<IracingSelectValue | null>(
    null,
  );
  const [selectError, setSelectError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof manualNameSchema>>({
    resolver: zodResolver(manualNameSchema),
  });

  const submitIracing = () => {
    setServerError(null);
    if (!selectedTeam) {
      setSelectError("Escolha um time da lista.");
      return;
    }
    setSelectError(null);
    startTransition(async () => {
      const result = await createTeam({
        source: "iracing",
        iracingTeamId: Number(selectedTeam.value),
        name: selectedTeam.label,
      });
      if (result?.error) setServerError(result.error);
    });
  };

  const submitManual = handleSubmit((data) => {
    setServerError(null);
    startTransition(async () => {
      const result = await createTeam({ source: "manual", name: data.name });
      if (result?.error) setServerError(result.error);
    });
  });

  if (mode === "manual") {
    return (
      <form onSubmit={submitManual} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nome do time</Label>
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        {serverError && <p className="text-sm text-destructive">{serverError}</p>}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Criando time..." : "Criar time"}
        </Button>
        <button
          type="button"
          onClick={() => setMode("iracing")}
          className="text-center text-sm text-muted-foreground underline underline-offset-4"
        >
          Voltar para a lista de times do iRacing
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="iracing-team">Seu time no iRacing</Label>
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger id="iracing-team" className="w-full">
            <SelectValue placeholder="Selecione um time" />
          </SelectTrigger>
          <SelectContent>
            {iracingTeams.map((team) => (
              <SelectItem
                key={team.iracingTeamId}
                value={{ value: String(team.iracingTeamId), label: team.name }}
              >
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectError && <p className="text-sm text-destructive">{selectError}</p>}
      </div>
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <Button
        type="button"
        disabled={isPending}
        className="w-full"
        onClick={submitIracing}
      >
        {isPending ? "Criando time..." : "Criar time"}
      </Button>
      <button
        type="button"
        onClick={() => setMode("manual")}
        className="text-center text-sm text-muted-foreground underline underline-offset-4"
      >
        Não achei meu time, criar manualmente
      </button>
    </div>
  );
}
