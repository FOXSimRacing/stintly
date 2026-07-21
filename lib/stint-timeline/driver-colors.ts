// Stable driver -> color assignment. Derived from driver.id (not roster
// index) so a driver keeps the same color across roster changes — see
// "Driver color coding" in the stintly-frontend-conventions skill.
const SLOT_COUNT = 8;

const SWATCH_CLASSES = [
  "bg-driver-1",
  "bg-driver-2",
  "bg-driver-3",
  "bg-driver-4",
  "bg-driver-5",
  "bg-driver-6",
  "bg-driver-7",
  "bg-driver-8",
] as const;

const BLOCK_CLASSES = [
  "bg-driver-1/20 border-driver-1",
  "bg-driver-2/20 border-driver-2",
  "bg-driver-3/20 border-driver-3",
  "bg-driver-4/20 border-driver-4",
  "bg-driver-5/20 border-driver-5",
  "bg-driver-6/20 border-driver-6",
  "bg-driver-7/20 border-driver-7",
  "bg-driver-8/20 border-driver-8",
] as const;

const TEXT_CLASSES = [
  "text-driver-1",
  "text-driver-2",
  "text-driver-3",
  "text-driver-4",
  "text-driver-5",
  "text-driver-6",
  "text-driver-7",
  "text-driver-8",
] as const;

const BORDER_CLASSES = [
  "border-driver-1",
  "border-driver-2",
  "border-driver-3",
  "border-driver-4",
  "border-driver-5",
  "border-driver-6",
  "border-driver-7",
  "border-driver-8",
] as const;

function slotFor(driverId: string) {
  let hash = 0;
  for (let i = 0; i < driverId.length; i++) {
    hash = (hash * 31 + driverId.charCodeAt(i)) >>> 0;
  }
  return hash % SLOT_COUNT;
}

export function getDriverColor(driverId: string) {
  const slot = slotFor(driverId);
  return {
    swatch: SWATCH_CLASSES[slot],
    block: BLOCK_CLASSES[slot],
    text: TEXT_CLASSES[slot],
    border: BORDER_CLASSES[slot],
  };
}
