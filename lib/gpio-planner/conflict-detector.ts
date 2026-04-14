import type { ChipDefinition, PinConflict } from "@/types/gpio-planner";

/**
 * Functions that are generic and should NOT be flagged as conflicts
 * even if assigned to multiple pins (e.g. GPIO_Output, GPIO_Input).
 */
const GENERIC_FUNCTIONS = new Set([
  "GPIO_Output",
  "GPIO_Input",
]);

/**
 * Detect pin assignment conflicts.
 * A conflict occurs when two or more pins are assigned the same
 * non-generic peripheral function (e.g. USART1_TX on two pins).
 */
export function detectConflicts(
  chip: ChipDefinition,
  assignments: Record<number, string>
): PinConflict[] {
  const functionToPins = new Map<string, number[]>();

  for (const pin of chip.pins) {
    const assigned = assignments[pin.number];
    if (!assigned || GENERIC_FUNCTIONS.has(assigned)) continue;

    const existing = functionToPins.get(assigned);
    if (existing) {
      existing.push(pin.number);
    } else {
      functionToPins.set(assigned, [pin.number]);
    }
  }

  const conflicts: PinConflict[] = [];
  for (const [functionName, pinNumbers] of functionToPins) {
    if (pinNumbers.length > 1) {
      conflicts.push({ functionName, pinNumbers });
    }
  }

  return conflicts;
}

/**
 * Check if a specific pin is involved in any conflict.
 */
export function isPinInConflict(
  pinNumber: number,
  conflicts: PinConflict[]
): boolean {
  return conflicts.some((c) => c.pinNumbers.includes(pinNumber));
}
