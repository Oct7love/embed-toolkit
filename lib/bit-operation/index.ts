import type { BitOperationType, CodeStyle, GeneratedCode } from "@/types/bit-operation";

/**
 * Build a hex mask string from selected bit positions.
 */
export function buildMask(selectedBits: number[]): number {
  let mask = 0;
  for (const bit of selectedBits) {
    mask |= 1 << bit;
  }
  return mask >>> 0;
}

/**
 * Format a 32-bit number as a C hex literal, e.g. 0x00000001U.
 */
export function toHexLiteral(value: number): string {
  return `0x${(value >>> 0).toString(16).toUpperCase().padStart(8, "0")}U`;
}

/**
 * Build a human-readable bit list string, e.g. "BIT0 | BIT3 | BIT7".
 */
export function buildBitList(selectedBits: number[]): string {
  const sorted = [...selectedBits].sort((a, b) => a - b);
  return sorted.map((b) => `BIT${b}`).join(" | ");
}

/**
 * Generate the operation expression for the given operation type.
 */
function generateExpression(
  registerName: string,
  mask: string,
  operation: BitOperationType
): string {
  switch (operation) {
    case "SET":
      return `${registerName} |= ${mask};`;
    case "CLR":
      return `${registerName} &= ~(${mask});`;
    case "TOGGLE":
      return `${registerName} ^= ${mask};`;
    case "READ":
      return `(${registerName} & ${mask})`;
  }
}

/**
 * Get a comment describing the operation.
 */
function getOperationComment(operation: BitOperationType): string {
  switch (operation) {
    case "SET":
      return "Set selected bits";
    case "CLR":
      return "Clear selected bits";
    case "TOGGLE":
      return "Toggle selected bits";
    case "READ":
      return "Read selected bits";
  }
}

/**
 * Generate C macro-style code.
 */
export function generateMacroCode(
  registerName: string,
  selectedBits: number[],
  operation: BitOperationType
): GeneratedCode {
  if (selectedBits.length === 0) {
    return { code: "// No bits selected", language: "c" };
  }

  const mask = buildMask(selectedBits);
  const hexMask = toHexLiteral(mask);
  const bitsComment = buildBitList(selectedBits);
  const comment = getOperationComment(operation);
  const safeName = registerName.replace(/[^a-zA-Z0-9_]/g, "_").toUpperCase();

  const lines: string[] = [];
  lines.push(`/* ${comment} */`);
  lines.push(`/* Bits: ${bitsComment} */`);
  lines.push("");
  lines.push(`#define ${safeName}_MASK  ${hexMask}`);
  lines.push("");

  switch (operation) {
    case "SET":
      lines.push(`#define ${safeName}_SET()  \\`);
      lines.push(`    (${registerName} |= ${safeName}_MASK)`);
      break;
    case "CLR":
      lines.push(`#define ${safeName}_CLR()  \\`);
      lines.push(`    (${registerName} &= ~${safeName}_MASK)`);
      break;
    case "TOGGLE":
      lines.push(`#define ${safeName}_TOGGLE()  \\`);
      lines.push(`    (${registerName} ^= ${safeName}_MASK)`);
      break;
    case "READ":
      lines.push(`#define ${safeName}_READ()  \\`);
      lines.push(`    (${registerName} & ${safeName}_MASK)`);
      break;
  }

  return { code: lines.join("\n"), language: "c" };
}

/**
 * Generate C inline function-style code.
 */
export function generateInlineCode(
  registerName: string,
  selectedBits: number[],
  operation: BitOperationType
): GeneratedCode {
  if (selectedBits.length === 0) {
    return { code: "// No bits selected", language: "c" };
  }

  const mask = buildMask(selectedBits);
  const hexMask = toHexLiteral(mask);
  const bitsComment = buildBitList(selectedBits);
  const comment = getOperationComment(operation);
  const safeName = registerName.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();

  const lines: string[] = [];
  lines.push(`/* ${comment} */`);
  lines.push(`/* Bits: ${bitsComment} */`);
  lines.push("");

  switch (operation) {
    case "SET":
      lines.push(`static inline void ${safeName}_set(void) {`);
      lines.push(`    ${registerName} |= ${hexMask};`);
      lines.push(`}`);
      break;
    case "CLR":
      lines.push(`static inline void ${safeName}_clr(void) {`);
      lines.push(`    ${registerName} &= ~(${hexMask});`);
      lines.push(`}`);
      break;
    case "TOGGLE":
      lines.push(`static inline void ${safeName}_toggle(void) {`);
      lines.push(`    ${registerName} ^= ${hexMask};`);
      lines.push(`}`);
      break;
    case "READ":
      lines.push(`static inline uint32_t ${safeName}_read(void) {`);
      lines.push(`    return ${registerName} & ${hexMask};`);
      lines.push(`}`);
      break;
  }

  return { code: lines.join("\n"), language: "c" };
}

/**
 * Generate code based on the selected style.
 */
export function generateCode(
  registerName: string,
  selectedBits: number[],
  operation: BitOperationType,
  style: CodeStyle
): GeneratedCode {
  if (style === "macro") {
    return generateMacroCode(registerName, selectedBits, operation);
  }
  return generateInlineCode(registerName, selectedBits, operation);
}

/**
 * Get the direct expression (one-liner) for quick reference.
 */
export function getDirectExpression(
  registerName: string,
  selectedBits: number[],
  operation: BitOperationType
): string {
  if (selectedBits.length === 0) return "";
  const mask = buildMask(selectedBits);
  const hexMask = toHexLiteral(mask);
  return generateExpression(registerName, hexMask, operation);
}
