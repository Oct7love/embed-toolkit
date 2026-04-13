import type {
  FloatType,
  IEEE754Result,
  IEEE754Config,
  SpecialKind,
} from "@/types/ieee754-parser";
import { FLOAT32_CONFIG, FLOAT64_CONFIG } from "@/types/ieee754-parser";

export function getConfig(type: FloatType): IEEE754Config {
  return type === "float32" ? FLOAT32_CONFIG : FLOAT64_CONFIG;
}

/**
 * Parse a hex string into IEEE 754 components.
 * For float32: expects up to 8 hex chars. For float64: up to 16.
 */
export function parseHexToIEEE754(
  hex: string,
  type: FloatType
): IEEE754Result | null {
  const config = getConfig(type);
  const clean = hex.replace(/[\s0x]/gi, "").toUpperCase();
  const expectedLen = config.totalBits / 4;

  if (clean.length === 0 || clean.length > expectedLen) return null;
  if (!/^[0-9A-F]+$/.test(clean)) return null;

  const padded = clean.padStart(expectedLen, "0");
  const binaryString = hexToBinary(padded, config.totalBits);

  const sign = parseInt(binaryString[0], 2);
  const exponentStr = binaryString.slice(1, 1 + config.exponentBits);
  const mantissaStr = binaryString.slice(1 + config.exponentBits);

  const exponentValue = parseInt(exponentStr, 2);
  const exponentBias = config.bias;

  let special: SpecialKind;
  let floatValue: number;
  let exponentActual: number;
  let mantissaValue: number;

  const allExponentOnes = exponentValue === (1 << config.exponentBits) - 1;
  const mantissaIsZero = /^0+$/.test(mantissaStr);

  if (exponentValue === 0 && mantissaIsZero) {
    // ±Zero
    special = "zero";
    floatValue = sign === 0 ? 0 : -0;
    exponentActual = 0;
    mantissaValue = 0;
  } else if (exponentValue === 0) {
    // Subnormal
    special = "subnormal";
    exponentActual = 1 - exponentBias;
    mantissaValue = parseMantissaBits(mantissaStr);
    floatValue = Math.pow(-1, sign) * mantissaValue * Math.pow(2, exponentActual);
  } else if (allExponentOnes && mantissaIsZero) {
    // ±Infinity
    special = "infinity";
    floatValue = sign === 0 ? Infinity : -Infinity;
    exponentActual = exponentValue - exponentBias;
    mantissaValue = 1;
  } else if (allExponentOnes) {
    // NaN
    special = "nan";
    floatValue = NaN;
    exponentActual = exponentValue - exponentBias;
    mantissaValue = 1 + parseMantissaBits(mantissaStr);
  } else {
    // Normal
    special = "normal";
    exponentActual = exponentValue - exponentBias;
    mantissaValue = 1 + parseMantissaBits(mantissaStr);
    floatValue = Math.pow(-1, sign) * mantissaValue * Math.pow(2, exponentActual);
  }

  return {
    sign,
    exponent: exponentStr,
    mantissa: mantissaStr,
    exponentValue,
    exponentBias,
    exponentActual,
    mantissaValue,
    floatValue,
    special,
    hexString: padded,
    binaryString,
  };
}

/**
 * Convert a decimal number to IEEE 754 hex string.
 */
export function floatToHex(value: number, type: FloatType): string {
  if (type === "float32") {
    const buf = new ArrayBuffer(4);
    new DataView(buf).setFloat32(0, value, false);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
      .join("");
  } else {
    const buf = new ArrayBuffer(8);
    new DataView(buf).setFloat64(0, value, false);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
      .join("");
  }
}

/**
 * Parse hex to the actual float value using DataView (ground truth).
 */
export function hexToFloat(hex: string, type: FloatType): number | null {
  const clean = hex.replace(/[\s0x]/gi, "");
  const expectedLen = type === "float32" ? 8 : 16;

  if (clean.length === 0 || clean.length > expectedLen) return null;
  if (!/^[0-9a-fA-F]+$/.test(clean)) return null;

  const padded = clean.padStart(expectedLen, "0");
  const bytes = [];
  for (let i = 0; i < padded.length; i += 2) {
    bytes.push(parseInt(padded.slice(i, i + 2), 16));
  }

  const buf = new ArrayBuffer(bytes.length);
  const view = new DataView(buf);
  bytes.forEach((b, i) => view.setUint8(i, b));

  return type === "float32" ? view.getFloat32(0, false) : view.getFloat64(0, false);
}

/**
 * Format a float value for display, handling special values.
 */
export function formatFloatValue(value: number, special: SpecialKind): string {
  if (special === "nan") return "NaN";
  if (special === "infinity") return value > 0 ? "+Infinity" : "-Infinity";
  if (special === "zero") return Object.is(value, -0) ? "-0" : "0";
  // Show enough precision
  return value.toPrecision(10).replace(/\.?0+$/, "");
}

/**
 * Build color map for BitGrid: sign=red, exponent=blue, mantissa=green.
 */
export function buildBitColorMap(
  type: FloatType
): Record<number, string> {
  const config = getConfig(type);
  const total = config.totalBits;
  const result: Record<number, string> = {};

  // Sign bit (highest bit)
  result[total - 1] = "#ef4444"; // red

  // Exponent bits
  for (let i = 0; i < config.exponentBits; i++) {
    result[total - 2 - i] = "#3b82f6"; // blue
  }

  // Mantissa bits
  for (let i = 0; i < config.mantissaBits; i++) {
    result[config.mantissaBits - 1 - i] = "#22c55e"; // green
  }

  return result;
}

/**
 * Build label map for BitGrid tooltips.
 */
export function buildBitLabelMap(
  type: FloatType
): Record<number, string> {
  const config = getConfig(type);
  const total = config.totalBits;
  const result: Record<number, string> = {};

  result[total - 1] = "符号位 (Sign)";

  for (let i = 0; i < config.exponentBits; i++) {
    const bitIndex = total - 2 - i;
    result[bitIndex] = `指数位 E${config.exponentBits - 1 - i}`;
  }

  for (let i = 0; i < config.mantissaBits; i++) {
    const bitIndex = config.mantissaBits - 1 - i;
    result[bitIndex] = `尾数位 M${config.mantissaBits - 1 - i}`;
  }

  return result;
}

// --- helpers ---

function hexToBinary(hex: string, totalBits: number): string {
  return hex
    .split("")
    .map((c) => parseInt(c, 16).toString(2).padStart(4, "0"))
    .join("")
    .slice(-totalBits)
    .padStart(totalBits, "0");
}

function parseMantissaBits(bits: string): number {
  let value = 0;
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === "1") {
      value += Math.pow(2, -(i + 1));
    }
  }
  return value;
}
