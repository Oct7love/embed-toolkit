import type { Base, BitWidth, SignMode, ConversionResult } from "@/types/base-converter";

const MAX_VALUES: Record<BitWidth, bigint> = {
  8: 0xFFn,
  16: 0xFFFFn,
  32: 0xFFFF_FFFFn,
  64: 0xFFFF_FFFF_FFFF_FFFFn,
};

const SIGNED_MIN: Record<BitWidth, bigint> = {
  8: -(1n << 7n),
  16: -(1n << 15n),
  32: -(1n << 31n),
  64: -(1n << 63n),
};

const SIGNED_MAX: Record<BitWidth, bigint> = {
  8: (1n << 7n) - 1n,
  16: (1n << 15n) - 1n,
  32: (1n << 31n) - 1n,
  64: (1n << 63n) - 1n,
};

const BASE_RADIX: Record<Base, number> = {
  hex: 16,
  dec: 10,
  oct: 8,
  bin: 2,
};

const BASE_REGEX: Record<Base, RegExp> = {
  hex: /^[0-9a-fA-F]+$/,
  dec: /^-?[0-9]+$/,
  oct: /^[0-7]+$/,
  bin: /^[01]+$/,
};

function errorResult(error: string): ConversionResult {
  return { hex: "", dec: "", oct: "", bin: "", error };
}

/** Strip common prefixes like 0x, 0b, 0o and whitespace */
function cleanInput(value: string, base: Base): string {
  let v = value.trim();
  if (base === "hex") v = v.replace(/^0x/i, "");
  if (base === "bin") v = v.replace(/^0b/i, "");
  if (base === "oct") v = v.replace(/^0o/i, "");
  // remove spaces/underscores used as visual separators
  v = v.replace(/[\s_]/g, "");
  return v;
}

/** Validate input characters for a given base */
export function validateInput(value: string, base: Base): string | null {
  const cleaned = cleanInput(value, base);
  if (cleaned === "") return null;
  if (!BASE_REGEX[base].test(cleaned)) {
    const allowed: Record<Base, string> = {
      hex: "0-9, A-F",
      dec: "0-9",
      oct: "0-7",
      bin: "0, 1",
    };
    return `无效字符，${base.toUpperCase()} 仅允许: ${allowed[base]}`;
  }
  return null;
}

/** Parse input string to unsigned bigint. Handles signed dec input. */
function parseToBigInt(
  value: string,
  base: Base,
  bitWidth: BitWidth,
  signMode: SignMode
): bigint | null {
  const cleaned = cleanInput(value, base);
  if (cleaned === "") return null;

  if (base === "dec" && signMode === "signed") {
    const n = BigInt(cleaned);
    if (n < SIGNED_MIN[bitWidth] || n > SIGNED_MAX[bitWidth]) return null;
    // Convert signed to unsigned representation
    if (n < 0n) {
      return (1n << BigInt(bitWidth)) + n;
    }
    return n;
  }

  const n = BigInt(`0x${cleaned.length ? cleaned : "0"}`).toString() === "NaN"
    ? null
    : (() => {
        try {
          const radix = BASE_RADIX[base];
          let result = 0n;
          for (const ch of cleaned) {
            result = result * BigInt(radix) + BigInt(parseInt(ch, radix));
          }
          return result;
        } catch {
          return null;
        }
      })();

  return n;
}

/** Convert an unsigned bigint to all bases */
function formatResult(
  n: bigint,
  bitWidth: BitWidth,
  signMode: SignMode
): ConversionResult {
  const maxUnsigned = MAX_VALUES[bitWidth];
  if (n < 0n || n > maxUnsigned) {
    return errorResult(`数值超出 ${bitWidth} 位范围`);
  }

  const hex = n.toString(16).toUpperCase();
  const oct = n.toString(8);
  const bin = n.toString(2);

  let dec: string;
  if (signMode === "signed") {
    const signBit = 1n << BigInt(bitWidth - 1);
    if (n >= signBit) {
      // negative in signed representation
      dec = (n - (1n << BigInt(bitWidth))).toString(10);
    } else {
      dec = n.toString(10);
    }
  } else {
    dec = n.toString(10);
  }

  // Pad bin to full width
  const paddedBin = bin.padStart(bitWidth, "0");
  // Pad hex to byte-aligned width
  const hexWidth = bitWidth / 4;
  const paddedHex = hex.padStart(hexWidth, "0");

  return {
    hex: paddedHex,
    dec,
    oct,
    bin: paddedBin,
  };
}

/** Main conversion: from one base, produce all four */
export function convert(
  value: string,
  fromBase: Base,
  bitWidth: BitWidth,
  signMode: SignMode
): ConversionResult {
  const cleaned = cleanInput(value, fromBase);
  if (cleaned === "" || (cleaned === "-" && fromBase === "dec")) {
    return { hex: "", dec: "", oct: "", bin: "" };
  }

  const validationError = validateInput(value, fromBase);
  if (validationError) {
    return errorResult(validationError);
  }

  const n = parseToBigInt(value, fromBase, bitWidth, signMode);
  if (n === null) {
    return errorResult(`数值超出 ${signMode === "signed" ? "有符号" : "无符号"} ${bitWidth} 位范围`);
  }

  const maxUnsigned = MAX_VALUES[bitWidth];
  if (n < 0n || n > maxUnsigned) {
    return errorResult(`数值超出 ${bitWidth} 位范围`);
  }

  return formatResult(n, bitWidth, signMode);
}

/** Batch convert: split by newlines, convert each line */
export function batchConvert(
  text: string,
  fromBase: Base,
  bitWidth: BitWidth,
  signMode: SignMode
): { input: string; result: ConversionResult }[] {
  const lines = text.split("\n").filter((line) => line.trim() !== "");
  return lines.map((line) => ({
    input: line.trim(),
    result: convert(line, fromBase, bitWidth, signMode),
  }));
}

/** Format binary with space every 4 bits for readability */
export function formatBinDisplay(bin: string): string {
  return bin.replace(/(.{4})(?=.)/g, "$1 ");
}

/** Format hex with space every 2 chars (bytes) for readability */
export function formatHexDisplay(hex: string): string {
  return hex.replace(/(.{2})(?=.)/g, "$1 ");
}
