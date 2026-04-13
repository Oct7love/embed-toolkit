/**
 * Decode MQTT remaining length (variable-length encoding).
 * Returns [decodedLength, bytesUsed] or null if invalid.
 */
export function decodeRemainingLength(
  bytes: number[],
  startIndex: number
): { value: number; bytesUsed: number } | null {
  let multiplier = 1;
  let value = 0;
  let index = startIndex;

  for (let i = 0; i < 4; i++) {
    if (index >= bytes.length) return null;
    const encodedByte = bytes[index];
    value += (encodedByte & 0x7f) * multiplier;
    multiplier *= 128;
    index++;
    if ((encodedByte & 0x80) === 0) {
      return { value, bytesUsed: index - startIndex };
    }
  }

  return null; // More than 4 bytes for remaining length is invalid
}

/**
 * Decode a UTF-8 string prefixed with 2-byte length from MQTT payload.
 * Returns [string, bytesConsumed] or null if invalid.
 */
export function decodeMqttString(
  bytes: number[],
  offset: number
): { value: string; bytesConsumed: number } | null {
  if (offset + 2 > bytes.length) return null;
  const strLen = (bytes[offset] << 8) | bytes[offset + 1];
  if (offset + 2 + strLen > bytes.length) return null;

  const strBytes = bytes.slice(offset + 2, offset + 2 + strLen);
  const value = new TextDecoder("utf-8", { fatal: false }).decode(
    new Uint8Array(strBytes)
  );
  return { value, bytesConsumed: 2 + strLen };
}

/**
 * Convert hex string to byte array.
 */
export function hexToBytes(hex: string): number[] {
  const clean = hex.replace(/[\s,;:]/g, "");
  if (clean.length === 0) return [];
  if (clean.length % 2 !== 0) return [];
  if (!/^[0-9a-fA-F]+$/.test(clean)) return [];

  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    bytes.push(parseInt(clean.substring(i, i + 2), 16));
  }
  return bytes;
}

/**
 * Format bytes as hex string with spaces.
 */
export function bytesToHexString(bytes: number[]): string {
  return bytes.map((b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ");
}
