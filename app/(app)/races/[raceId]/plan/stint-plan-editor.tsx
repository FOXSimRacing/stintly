"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StintBlock, type StintBlockData } from "@/components/stint-timeline/stint-block";
import { StintList } from "@/components/stint-timeline/stint-list";
import { DriverRosterPanel } from "@/components/stint-timeline/driver-roster-panel";
import { createTimelineScale } from "@/lib/stint-timeline/scale";
import { findRestViolations } from "@/lib/stint-timeline/rest-violations";
import { computePilotMinutesByDriver } from "@/lib/stint-timeline/pilot-totals";
import { generateDefaultStints } from "./actions";
import { StintFormDialog } from "./stint-form-dialog";

type RosterDriver = { id: string; displayName: string };

export function StintPlanEditor({
  stintPlanId,
  raceStartUtc,
  totalDurationMinutes,
  stints,
  roster,
  canEdit,
}: {
  stintPlanId: string;
  raceStartUtc: Date;
  totalDurationMinutes: number;
  stints: StintBlockData[];
  roster: RosterDriver[];
  canEdit: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStint, setEditingStint] = useState<StintBlockData | null>(null);
  // Forces StintFormDialog to remount on every open, so its form state
  // starts fresh instead of carrying over the previous stint's values.
  const [dialogSession, setDialogSession] = useState(0);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [isGenerating, startGenerating] = useTransition();

  const scale = useMemo(
    () => createTimelineScale(raceStartUtc, totalDurationMinutes),
    [raceStartUtc, totalDurationMinutes],
  );
  const restViolations = useMemo(() => findRestViolations(stints), [stints]);
  const pilotMinutes = useMemo(() => computePilotMinutesByDriver(stints), [stints]);

  const nextStartMinutes = useMemo(() => {
    if (stints.length === 0) return 0;
    const lastEnd = stints.reduce(
      (latest, stint) => Math.max(latest, scale.minutesFromStart(stint.plannedEndTime)),
      0,
    );
    return Math.round(lastEnd);
  }, [stints, scale]);

  function openCreateDialog() {
    setEditingStint(null);
    setDialogOpen(true);
    setDialogSession((session) => session + 1);
  }

  function openEditDialog(stint: StintBlockData) {
    setEditingStint(stint);
    setDialogOpen(true);
    setDialogSession((session) => session + 1);
  }

  function onGenerateDefaults() {
    setGenerateError(null);
    startGenerating(async () => {
      const result = await generateDefaultStints({ stintPlanId });
      if ("error" in result) setGenerateError(result.error);
    });
  }

  const editingFormValues = editingStint
    ? {
        id: editingStint.id,
        driverId: editingStint.driverId,
        startMinutes: Math.round(scale.minutesFromStart(editingStint.plannedStartTime)),
        durationMinutes: Math.round(
          scale.minutesFromStart(editingStint.plannedEndTime) -
            scale.minutesFromStart(editingStint.plannedStartTime),
        ),
      }
    : null;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DriverRosterPanel roster={roster} pilotMinutes={pilotMinutes} />
        {canEdit && roster.length > 0 && (
          <div className="flex items-center gap-2">
            {stints.length === 0 && (
              <Button size="sm" variant="outline" onClick={onGenerateDefaults} disabled={isGenerating}>
                <Sparkles /> {isGenerating ? "Gerando..." : "Gerar sugestão automática"}
              </Button>
            )}
            <Button size="sm" onClick={openCreateDialog}>
              <Plus /> Adicionar stint
            </Button>
          </div>
        )}
      </div>

      {generateError && <p className="text-sm text-destructive">{generateError}</p>}

      {stints.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {canEdit && roster.length > 0
            ? "Nenhum stint planejado ainda. Gere uma sugestão automática ou adicione o primeiro pra começar."
            : "Nenhum stint planejado ainda."}
        </p>
      ) : (
        <>
          <div className="relative h-10 w-full min-w-0 overflow-hidden rounded-lg bg-muted/30 ring-1 ring-foreground/10">
            {stints.map((stint) => (
              <StintBlock
                key={stint.id}
                stint={stint}
                scale={scale}
                restViolationMinutes={restViolations.get(stint.id)?.gapMinutes}
                onClick={canEdit ? () => openEditDialog(stint) : undefined}
              />
            ))}
          </div>

          <StintList
            stints={stints}
            scale={scale}
            restViolations={restViolations}
            onEditStint={canEdit ? openEditDialog : undefined}
          />
        </>
      )}

      {canEdit && (
        <StintFormDialog
          key={dialogSession}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          stintPlanId={stintPlanId}
          roster={roster}
          editing={editingFormValues}
          defaultStartMinutes={nextStartMinutes}
        />
      )}
    </div>
  );
}
