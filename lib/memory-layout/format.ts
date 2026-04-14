/**
 * Format a number as a hex address string (e.g., 0x08000000).
 */
export function formatAddress(address: number): string {
  return `0x${address.toString(16).toUpperCase().padStart(8, "0")}`;
}

/**
 * Format a byte size to a human-readable string.
 */
export function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return kb % 1 === 0 ? `${kb} KB` : `${kb.toFixed(1)} KB`;
  }
  const mb = bytes / (1024 * 1024);
  return mb % 1 === 0 ? `${mb} MB` : `${mb.toFixed(2)} MB`;
}

/**
 * Parse a hex address string to a number.
 * Supports "0x08000000" and "08000000" formats.
 */
export function parseAddress(input: string): number | null {
  const cleaned = input.trim().replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]+$/.test(cleaned)) return null;
  const value = parseInt(cleaned, 16);
  if (isNaN(value)) return null;
  return value;
}

/**
 * Parse a size string that may include units (e.g., "512KB", "128K", "1024").
 */
export function parseSize(input: string): number | null {
  const cleaned = input.trim().toUpperCase();

  // Try hex
  if (cleaned.startsWith("0X")) {
    const val = parseInt(cleaned, 16);
    return isNaN(val) ? null : val;
  }

  // Try with units
  const unitMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*(KB|K|MB|M|B)?$/);
  if (!unitMatch) return null;

  const value = parseFloat(unitMatch[1]);
  if (isNaN(value)) return null;

  const unit = unitMatch[2] || "B";
  switch (unit) {
    case "KB":
    case "K":
      return Math.round(value * 1024);
    case "MB":
    case "M":
      return Math.round(value * 1024 * 1024);
    default:
      return Math.round(value);
  }
}
