"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createRaceFromCalendarEventSchema,
  type CreateRaceFromCalendarEventInput,
} from "./schema";
import { createRaceFromCalendarEvent } from "./actions";

type TeamOption = {
  teamId: string;
  teamName: string;
  role: "owner" | "strategist" | "driver";
  drivers: { id: string; displayName: string }[];
};

type CarOption = {
  id: string;
  name: string;
  class: string | null;
};

export function RaceSetupForm({
  seriesId,
  teams,
  cars,
}: {
  seriesId: number;
  teams: TeamOption[];
  cars: CarOption[];
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [isPending, startTransition] = useTransition();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateRaceFromCalendarEventInput>({
    resolver: zodResolver(createRaceFromCalendarEventSchema),
    defaultValues: { seriesId, teamId: "", carId: "", driverIds: [] },
  });

  const selectedTeam = teams.find((team) => team.teamId === selectedTeamId);
  const teamSelectItems = teams.map((team) => ({ value: team.teamId, label: team.teamName }));
  const carSelectItems = cars.map((car) => ({
    value: car.id,
    label: car.class ? `${car.name} (${car.class})` : car.name,
  }));

  const onSubmit = (data: CreateRaceFromCalendarEventInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await createRaceFromCalendarEvent(data);
      if (result?.error) setServerError(result.error);
    });
  };

  if (teams.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Você precisa ser owner ou strategist de um time pra criar uma prova.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex max-w-md flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label>Time</Label>
        <Controller
          control={control}
          name="teamId"
          render={({ field }) => (
            <Select
              value={field.value}
              items={teamSelectItems}
              onValueChange={(value) => {
                field.onChange(value ?? "");
                setSelectedTeamId(value ?? "");
                setValue("driverIds", []);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha um time" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.teamId} value={team.teamId}>
                    {team.teamName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.teamId && (
          <p className="text-sm text-destructive">{errors.teamId.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Carro</Label>
        <Controller
          control={control}
          name="carId"
          render={({ field }) => (
            <Select
              value={field.value}
              items={carSelectItems}
              onValueChange={(value) => field.onChange(value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha um carro" />
              </SelectTrigger>
              <SelectContent>
                {cars.map((car) => (
                  <SelectItem key={car.id} value={car.id}>
                    {car.name}
                    {car.class ? ` (${car.class})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.carId && (
          <p className="text-sm text-destructive">{errors.carId.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Pilotos</Label>
        {!selectedTeam || selectedTeam.drivers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {selectedTeam
              ? "Este time ainda não tem pilotos cadastrados."
              : "Escolha um time pra ver os pilotos."}
          </p>
        ) : (
          <Controller
            control={control}
            name="driverIds"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                {selectedTeam.drivers.map((driver) => {
                  const checked = field.value.includes(driver.id);
                  return (
                    <label
                      key={driver.id}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-foreground/10"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          field.onChange(
                            event.target.checked
                              ? [...field.value, driver.id]
                              : field.value.filter((id) => id !== driver.id),
                          );
                        }}
                      />
                      {driver.displayName}
                    </label>
                  );
                })}
              </div>
            )}
          />
        )}
        {errors.driverIds && (
          <p className="text-sm text-destructive">{errors.driverIds.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <Button type="submit" disabled={isPending} className="mt-1 w-full">
        {isPending ? "Criando prova..." : "Criar prova e ir pro planejamento"}
      </Button>
    </form>
  );
}
