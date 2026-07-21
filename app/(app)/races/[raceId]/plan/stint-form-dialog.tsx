"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { createStint, deleteStint, updateStint } from "./actions";

const UNASSIGNED = "unassigned";

type FormValues = {
  driverId: string;
  startMinutes: number;
  durationMinutes: number;
};

type EditingStint = {
  id: string;
  driverId: string | null;
  startMinutes: number;
  durationMinutes: number;
};

export function StintFormDialog({
  open,
  onOpenChange,
  stintPlanId,
  roster,
  editing,
  defaultStartMinutes = 0,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stintPlanId: string;
  roster: { id: string; displayName: string }[];
  editing: EditingStint | null;
  defaultStartMinutes?: number;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    // The dialog unmounts on close (Base UI Dialog default), so every open
    // is a fresh mount — no effect needed to resync these on reopen.
    defaultValues: editing
      ? {
          driverId: editing.driverId ?? UNASSIGNED,
          startMinutes: editing.startMinutes,
          durationMinutes: editing.durationMinutes,
        }
      : { driverId: UNASSIGNED, startMinutes: defaultStartMinutes, durationMinutes: 55 },
  });

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    const driverId = values.driverId === UNASSIGNED ? null : values.driverId;

    startTransition(async () => {
      const result = editing
        ? await updateStint({
            stintId: editing.id,
            stintPlanId,
            driverId,
            startMinutes: values.startMinutes,
            durationMinutes: values.durationMinutes,
          })
        : await createStint({
            stintPlanId,
            driverId,
            startMinutes: values.startMinutes,
            durationMinutes: values.durationMinutes,
          });

      if ("error" in result) {
        setServerError(result.error);
        return;
      }
      onOpenChange(false);
    });
  };

  const onDelete = () => {
    if (!editing) return;
    setServerError(null);
    startTransition(async () => {
      const result = await deleteStint({ stintId: editing.id, stintPlanId });
      if ("error" in result) {
        setServerError(result.error);
        return;
      }
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar stint" : "Adicionar stint"}</DialogTitle>
          <DialogDescription>Horários em minutos desde a largada.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label>Piloto</Label>
            <Controller
              control={control}
              name="driverId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  items={[
                    { value: UNASSIGNED, label: "Sem piloto definido" },
                    ...roster.map((driver) => ({ value: driver.id, label: driver.displayName })),
                  ]}
                  onValueChange={(value) => field.onChange(value ?? UNASSIGNED)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Escolha um piloto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED}>Sem piloto definido</SelectItem>
                    {roster.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Início (min)</Label>
              <Controller
                control={control}
                name="startMinutes"
                rules={{ required: true, min: 0 }}
                render={({ field }) => (
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
                )}
              />
              {errors.startMinutes && <p className="text-sm text-destructive">Obrigatório.</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Duração (min)</Label>
              <Controller
                control={control}
                name="durationMinutes"
                rules={{ required: true, min: 5 }}
                render={({ field }) => (
                  <Input
                    type="number"
                    min={5}
                    step={1}
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
                )}
              />
              {errors.durationMinutes && (
                <p className="text-sm text-destructive">Mínimo de 5 minutos.</p>
              )}
            </div>
          </div>

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <DialogFooter className="items-center sm:justify-between">
            {editing ? (
              <Button type="button" variant="destructive" onClick={onDelete} disabled={isPending}>
                Excluir stint
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
