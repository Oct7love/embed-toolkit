/**
 * Parse hex string (e.g. "01 03 00 00 00 0A") to Uint8Array.
 */
export function parseHexInput(hex: string): Uint8Array {
  const clean = hex.replace(/\s+/g, "");
  if (clean.length === 0) return new Uint8Array(0);
  if (clean.length % 2 !== 0) {
    throw new Error("Hex 字符串长度必须为偶数");
  }
  if (!/^[0-9a-fA-F]+$/.test(clean)) {
    throw new Error("包含非法的 hex 字符");
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Parse ASCII text to Uint8Array.
 */
export function parseAsciiInput(text: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(text);
}

/**
 * Format a number to hex string with specified width.
 */
export function toHex(value: number, width: 8 | 16 | 32): string {
  const hexWidth = width / 4;
  return value.toString(16).toUpperCase().padStart(hexWidth, "0");
}

/**
 * Format a number to binary string with specified width.
 */
export function toBin(value: number, width: 8 | 16 | 32): string {
  return value.toString(2).padStart(width, "0");
}

/**
 * Format a byte array as spaced hex string.
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
    .join(" ");
}
