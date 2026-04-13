import type { ByteWidth, EndianResult } from "@/types/endian-converter";

const BYTE_COUNTS: Record<ByteWidth, number> = {
  16: 2,
  32: 4,
  64: 8,
};

/** Validate hex input string */
export function validateHexInput(value: string): string | null {
  const cleaned = cleanHex(value);
  if (cleaned === "") return null;
  if (!/^[0-9a-fA-F]+$/.test(cleaned)) {
    return "无效字符，仅允许: 0-9, A-F";
  }
  return null;
}

/** Strip prefix, spaces, underscores */
function cleanHex(value: string): string {
  return value.trim().replace(/^0x/i, "").replace(/[\s_]/g, "");
}

/** Swap endianness of a hex string for a given byte width */
export function swapEndian(hexInput: string, byteWidth: ByteWidth): EndianResult | null {
  const cleaned = cleanHex(hexInput).toUpperCase();
  if (cleaned === "") return null;

  const byteCount = BYTE_COUNTS[byteWidth];
  const expectedChars = byteCount * 2;

  // Pad to full width if shorter
  const padded = cleaned.padStart(expectedChars, "0");

  // If input is longer than expected, take the last N chars
  const truncated = padded.length > expectedChars
    ? padded.slice(padded.length - expectedChars)
    : padded;

  // Split into bytes
  const bytes: string[] = [];
  for (let i = 0; i < truncated.length; i += 2) {
    bytes.push(truncated.slice(i, i + 2));
  }

  // Reverse for endian swap
  const reversedBytes = [...bytes].reverse();

  return {
    bigEndian: bytes.join(""),
    littleEndian: reversedBytes.join(""),
    bytes: bytes.map((value, index) => ({ index, value })),
  };
}

/** Check if input was auto-padded (shorter than expected width) */
export function needsPadding(hexInput: string, byteWidth: ByteWidth): boolean {
  const cleaned = cleanHex(hexInput);
  if (cleaned === "") return false;
  const expectedChars = BYTE_COUNTS[byteWidth] * 2;
  return cleaned.length < expectedChars;
}

/** Get the padded character count */
export function getPaddedCount(hexInput: string, byteWidth: ByteWidth): number {
  const cleaned = cleanHex(hexInput);
  if (cleaned === "") return 0;
  const expectedChars = BYTE_COUNTS[byteWidth] * 2;
  return Math.max(0, expectedChars - cleaned.length);
}

/** Batch convert: split by newlines, convert each line */
export function batchSwapEndian(
  text: string,
  byteWidth: ByteWidth
): { input: string; result: EndianResult | null; error?: string }[] {
  const lines = text.split("\n").filter((line) => line.trim() !== "");
  return lines.map((line) => {
    const trimmed = line.trim();
    const validationError = validateHexInput(trimmed);
    if (validationError) {
      return { input: trimmed, result: null, error: validationError };
    }
    const result = swapEndian(trimmed, byteWidth);
    return { input: trimmed, result };
  });
}

/** Format hex with space between bytes for display */
export function formatBytesDisplay(hex: string): string {
  const upper = hex.toUpperCase();
  return upper.replace(/(.{2})(?=.)/g, "$1 ");
}
