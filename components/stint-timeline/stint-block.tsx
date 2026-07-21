import { cn } from "@/lib/utils";
import { getDriverColor } from "@/lib/stint-timeline/driver-colors";
import { formatElapsedMinutes } from "@/lib/stint-timeline/format-elapsed";
import { formatMinutes } from "@/lib/stint-timeline/pilot-totals";
import type { TimelineScale } from "@/lib/stint-timeline/scale";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type StintBlockData = {
  id: string;
  driverId: string | null;
  driverDisplayName: string | null;
  plannedStartTime: Date;
  plannedEndTime: Date;
};

export function StintBlock({
  stint,
  scale,
  restViolationMinutes,
  onClick,
}: {
  stint: StintBlockData;
  scale: TimelineScale;
  /** Set when this stint starts too soon after the same driver's previous one. */
  restViolationMinutes?: number;
  onClick?: () => void;
}) {
  const startMinutes = scale.minutesFromStart(stint.plannedStartTime);
  const endMinutes = scale.minutesFromStart(stint.plannedEndTime);
  const durationMinutes = endMinutes - startMinutes;
  const colors = stint.driverId ? getDriverColor(stint.driverId) : null;
  const driverLabel = stint.driverDisplayName ?? "Sem piloto";

  const label = `${driverLabel} · ${formatElapsedMinutes(startMinutes)}–${formatElapsedMinutes(endMinutes)} · ${formatMinutes(durationMinutes)}`;

  const className = cn(
    "absolute top-0 h-10 rounded-sm border",
    colors ? cn(colors.swatch, colors.border) : "border-border bg-muted",
    restViolationMinutes !== undefined && "ring-2 ring-inset ring-warning",
    onClick ? "cursor-pointer hover:brightness-90" : "cursor-default",
  );
  const style = {
    left: `${scale.timeToPercent(stint.plannedStartTime)}%`,
    width: `${scale.durationToPercent(durationMinutes)}%`,
  };

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={className}
        style={style}
        aria-label={label}
      />
      <TooltipContent>
        {label}
        {restViolationMinutes !== undefined && (
          <>
            {" "}
            — descanso curto: {Math.max(0, Math.round(restViolationMinutes))}min desde o
            stint anterior deste piloto.
          </>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
