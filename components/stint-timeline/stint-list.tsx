import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getDriverColor } from "@/lib/stint-timeline/driver-colors";
import { formatElapsedMinutes } from "@/lib/stint-timeline/format-elapsed";
import { formatMinutes } from "@/lib/stint-timeline/pilot-totals";
import type { RestViolation } from "@/lib/stint-timeline/rest-violations";
import type { TimelineScale } from "@/lib/stint-timeline/scale";
import { cn } from "@/lib/utils";
import type { StintBlockData } from "./stint-block";

export function StintList({
  stints,
  scale,
  restViolations,
  onEditStint,
}: {
  stints: StintBlockData[];
  scale: TimelineScale;
  restViolations: Map<string, RestViolation>;
  onEditStint?: (stint: StintBlockData) => void;
}) {
  // orderIndex and chronological order are only kept in sync by convention
  // (resequenceOrder) — sort defensively for display.
  const sorted = [...stints].sort(
    (a, b) => a.plannedStartTime.getTime() - b.plannedStartTime.getTime(),
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">#</TableHead>
          <TableHead>Piloto</TableHead>
          <TableHead>Início</TableHead>
          <TableHead>Fim</TableHead>
          <TableHead>Duração</TableHead>
          <TableHead>Descanso</TableHead>
          {onEditStint && <TableHead className="w-10" />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((stint, index) => {
          const colors = stint.driverId ? getDriverColor(stint.driverId) : null;
          const startMinutes = scale.minutesFromStart(stint.plannedStartTime);
          const endMinutes = scale.minutesFromStart(stint.plannedEndTime);
          const violation = restViolations.get(stint.id);

          return (
            <TableRow key={stint.id}>
              <TableCell className="text-muted-foreground">{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span
                    className={cn("size-2.5 shrink-0 rounded-full", colors?.swatch ?? "bg-muted-foreground/40")}
                  />
                  {stint.driverDisplayName ?? "Sem piloto"}
                </div>
              </TableCell>
              <TableCell>{formatElapsedMinutes(startMinutes)}</TableCell>
              <TableCell>{formatElapsedMinutes(endMinutes)}</TableCell>
              <TableCell>{formatMinutes(endMinutes - startMinutes)}</TableCell>
              <TableCell>
                {violation ? (
                  <span className="text-warning">
                    {Math.max(0, Math.round(violation.gapMinutes))}min de descanso
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              {onEditStint && (
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => onEditStint(stint)}>
                    Editar
                  </Button>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
