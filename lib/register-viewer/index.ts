import type { BitField } from "@/types/register-viewer";

/**
 * Parse a hex string to a 32-bit unsigned integer.
 */
export function parseHexValue(hex: string): number | null {
  const clean = hex.replace(/^0x/i, "").replace(/\s+/g, "");
  if (clean.length === 0 || clean.length > 8) return null;
  if (!/^[0-9a-fA-F]+$/.test(clean)) return null;
  return parseInt(clean, 16) >>> 0;
}

/**
 * Parse a binary string to a 32-bit unsigned integer.
 */
export function parseBinValue(bin: string): number | null {
  const clean = bin.replace(/[\s_]/g, "");
  if (clean.length === 0 || clean.length > 32) return null;
  if (!/^[01]+$/.test(clean)) return null;
  return parseInt(clean, 2) >>> 0;
}

/**
 * Format a number as a hex string with the given width.
 */
export function toHex(value: number, width: 8 | 16 | 32 = 32): string {
  const hexLen = width / 4;
  return (value >>> 0).toString(16).toUpperCase().padStart(hexLen, "0");
}

/**
 * Format a number as a binary string with the given width.
 */
export function toBin(value: number, width: 8 | 16 | 32 = 32): string {
  return (value >>> 0).toString(2).padStart(width, "0");
}

/**
 * Extract the value of a bit field from a register value.
 */
export function getFieldValue(
  registerValue: number,
  startBit: number,
  endBit: number
): number {
  const low = Math.min(startBit, endBit);
  const high = Math.max(startBit, endBit);
  const width = high - low + 1;
  // width === 32 时 (1<<32)-1 在 JS 中等于 0，需要特判
  const mask = width >= 32 ? 0xFFFFFFFF : (1 << width) - 1;
  return ((registerValue >>> low) & mask) >>> 0;
}

/**
 * Set the value of a bit field in a register value.
 */
export function setFieldValue(
  registerValue: number,
  startBit: number,
  endBit: number,
  fieldValue: number
): number {
  const low = Math.min(startBit, endBit);
  const high = Math.max(startBit, endBit);
  const width = high - low + 1;
  // width === 32 时 (1<<32)-1 在 JS 中等于 0，需要特判
  const widthMask = width >= 32 ? 0xFFFFFFFF : (1 << width) - 1;
  const mask = (widthMask << low) >>> 0;
  const cleared = (registerValue & ~mask) >>> 0;
  const clamped = fieldValue & widthMask;
  return (cleared | ((clamped << low) >>> 0)) >>> 0;
}

/**
 * Build color map from bit fields for BitGrid.
 */
export function buildFieldColorMap(
  fields: BitField[]
): Record<number, string> {
  const result: Record<number, string> = {};
  for (const field of fields) {
    const low = Math.min(field.startBit, field.endBit);
    const high = Math.max(field.startBit, field.endBit);
    for (let i = low; i <= high; i++) {
      result[i] = field.color;
    }
  }
  return result;
}

/**
 * Build label map from bit fields for BitGrid tooltips.
 */
export function buildFieldLabelMap(
  fields: BitField[]
): Record<number, string> {
  const result: Record<number, string> = {};
  for (const field of fields) {
    const low = Math.min(field.startBit, field.endBit);
    const high = Math.max(field.startBit, field.endBit);
    for (let i = low; i <= high; i++) {
      result[i] = `${field.name} [${high}:${low}]${field.description ? " — " + field.description : ""}`;
    }
  }
  return result;
}

/**
 * Validate bit fields: check for overlapping ranges.
 */
export function validateFields(fields: BitField[], width: number): string[] {
  const errors: string[] = [];
  const used = new Set<number>();

  for (const field of fields) {
    const low = Math.min(field.startBit, field.endBit);
    const high = Math.max(field.startBit, field.endBit);

    if (low < 0 || high >= width) {
      errors.push(`"${field.name}" 位域范围 [${high}:${low}] 超出寄存器宽度 ${width}`);
      continue;
    }

    for (let i = low; i <= high; i++) {
      if (used.has(i)) {
        errors.push(`"${field.name}" 的 bit ${i} 与其他位域重叠`);
        break;
      }
      used.add(i);
    }
  }

  return errors;
}

/** Preset field colors for user convenience. */
export const FIELD_COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#f97316", // orange
];
