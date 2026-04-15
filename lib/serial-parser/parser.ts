import type {
  ProtocolField,
  ProtocolTemplate,
  ParsedField,
  ParseResult,
  ChecksumMethod,
} from "@/types/serial-parser";
import { calculateXOR, calculateSum } from "@/lib/checksum-calculator";

/**
 * Parse a hex data frame using the given protocol template.
 */
export function parseFrame(
  hexInput: string,
  template: ProtocolTemplate
): ParseResult {
  const bytes = hexToBytes(hexInput);
  const errors: string[] = [];
  const parsedFields: ParsedField[] = [];

  if (bytes.length === 0) {
    return { fields: [], valid: false, unmatchedBytes: [], errors: ["输入数据为空"] };
  }

  // Sort fields by offset
  const sortedFields = [...template.fields].sort((a, b) => a.offset - b.offset);

  for (const field of sortedFields) {
    // 校验模板字段合法性（拒绝负偏移、非正长度）
    if (field.offset < 0 || field.length <= 0) {
      errors.push(
        `字段 "${field.name}" 参数非法: offset=${field.offset}, length=${field.length}`
      );
      parsedFields.push({
        field,
        bytes: [],
        hex: "",
        valid: false,
        error: "字段参数非法",
      });
      continue;
    }

    const endOffset = field.offset + field.length;

    if (field.offset >= bytes.length) {
      errors.push(`字段 "${field.name}" 超出数据范围 (偏移 ${field.offset}, 数据长度 ${bytes.length})`);
      parsedFields.push({
        field,
        bytes: [],
        hex: "",
        valid: false,
        error: "超出数据范围",
      });
      continue;
    }

    // 直接用 endOffset > bytes.length 判断部分越界
    const isPartiallyOutOfRange = endOffset > bytes.length;
    const actualEnd = Math.min(endOffset, bytes.length);
    const fieldBytes = bytes.slice(field.offset, actualEnd);
    const hex = fieldBytes.map((b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ");

    if (isPartiallyOutOfRange) {
      errors.push(`字段 "${field.name}" 部分超出数据范围`);
    }

    let valid = true;
    let error: string | undefined;

    // Validate header fields
    if (field.type === "header" && field.expectedValue) {
      const expected = field.expectedValue.replace(/\s+/g, "").toUpperCase();
      const actual = fieldBytes.map((b) => b.toString(16).toUpperCase().padStart(2, "0")).join("");
      if (actual !== expected) {
        valid = false;
        error = `帧头不匹配: 期望 ${expected}, 实际 ${actual}`;
        errors.push(error);
      }
    }

    // Validate checksum fields
    if (field.type === "checksum" && field.checksumMethod && field.checksumMethod !== "none") {
      const checksumResult = validateChecksum(
        bytes,
        fieldBytes,
        field.checksumMethod,
        field.checksumRange
      );
      if (!checksumResult.valid) {
        valid = false;
        error = checksumResult.error;
        errors.push(error);
      }
    }

    parsedFields.push({ field, bytes: fieldBytes, hex, valid, error });
  }

  // Find unmatched bytes
  const coveredOffsets = new Set<number>();
  for (const field of sortedFields) {
    for (let i = field.offset; i < field.offset + field.length && i < bytes.length; i++) {
      coveredOffsets.add(i);
    }
  }
  const unmatchedBytes: number[] = [];
  for (let i = 0; i < bytes.length; i++) {
    if (!coveredOffsets.has(i)) {
      unmatchedBytes.push(bytes[i]);
    }
  }

  const valid = errors.length === 0 && unmatchedBytes.length === 0;

  return { fields: parsedFields, valid, unmatchedBytes, errors };
}

/**
 * Validate a checksum field against computed value.
 */
function validateChecksum(
  allBytes: number[],
  checksumBytes: number[],
  method: ChecksumMethod,
  range?: [number, number]
): { valid: boolean; error: string } {
  if (!range) {
    return { valid: false, error: "校验字段未配置计算范围" };
  }

  const [start, end] = range;
  if (start < 0 || end > allBytes.length || start >= end) {
    return { valid: false, error: `校验范围无效: [${start}, ${end})` };
  }

  const dataSlice = new Uint8Array(allBytes.slice(start, end));
  let expected: number;

  switch (method) {
    case "xor":
      expected = calculateXOR(dataSlice);
      break;
    case "sum":
      expected = calculateSum(dataSlice);
      break;
    case "crc8":
      // Simple CRC-8 (polynomial 0x07)
      expected = calculateCRC8(dataSlice);
      break;
    case "crc16-modbus": {
      // CRC-16/MODBUS produces 2 bytes
      const crc = calculateCRC16Modbus(dataSlice);
      const actualValue = checksumBytes.length >= 2
        ? (checksumBytes[0] | (checksumBytes[1] << 8))
        : checksumBytes[0];
      if (crc !== actualValue) {
        const expectedHex = crc.toString(16).toUpperCase().padStart(4, "0");
        const actualHex = actualValue.toString(16).toUpperCase().padStart(4, "0");
        return { valid: false, error: `CRC-16 校验失败: 期望 ${expectedHex}, 实际 ${actualHex}` };
      }
      return { valid: true, error: "" };
    }
    default:
      return { valid: true, error: "" };
  }

  const actual = checksumBytes[0];
  if (expected !== actual) {
    const expectedHex = expected.toString(16).toUpperCase().padStart(2, "0");
    const actualHex = actual.toString(16).toUpperCase().padStart(2, "0");
    return { valid: false, error: `校验失败: 期望 ${expectedHex}, 实际 ${actualHex}` };
  }

  return { valid: true, error: "" };
}

/**
 * Simple CRC-8 (polynomial 0x07, init 0x00).
 */
function calculateCRC8(data: Uint8Array): number {
  let crc = 0x00;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 0x80) {
        crc = ((crc << 1) ^ 0x07) & 0xff;
      } else {
        crc = (crc << 1) & 0xff;
      }
    }
  }
  return crc;
}

/**
 * CRC-16/MODBUS calculation.
 */
function calculateCRC16Modbus(data: Uint8Array): number {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 0x0001) {
        crc = (crc >> 1) ^ 0xa001;
      } else {
        crc = crc >> 1;
      }
    }
  }
  return crc & 0xffff;
}

/**
 * Convert hex string to byte array.
 */
function hexToBytes(hex: string): number[] {
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
