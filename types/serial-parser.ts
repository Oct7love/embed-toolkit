/** Field type in a protocol template */
export type FieldType =
  | "header"
  | "length"
  | "data"
  | "checksum"
  | "custom";

/** Checksum algorithm for verification */
export type ChecksumMethod = "xor" | "sum" | "crc8" | "crc16-modbus" | "none";

/** A single field definition in a protocol template */
export interface ProtocolField {
  /** Unique id for the field */
  id: string;
  /** Display name */
  name: string;
  /** Byte offset from frame start */
  offset: number;
  /** Number of bytes */
  length: number;
  /** Field type for coloring */
  type: FieldType;
  /** Expected hex value for header fields (e.g. "AA55") */
  expectedValue?: string;
  /** Checksum method (only for checksum fields) */
  checksumMethod?: ChecksumMethod;
  /** Range of bytes to calculate checksum over: [startOffset, endOffset) */
  checksumRange?: [number, number];
}

/** A saved protocol template */
export interface ProtocolTemplate {
  /** Unique id */
  id: string;
  /** Template name */
  name: string;
  /** Field definitions */
  fields: ProtocolField[];
  /** Creation timestamp */
  createdAt: number;
}

/** Parsed field result */
export interface ParsedField {
  /** Field definition */
  field: ProtocolField;
  /** Raw bytes of this field */
  bytes: number[];
  /** Hex string representation */
  hex: string;
  /** Whether the field is valid (header match, checksum pass) */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
}

/** Full parse result */
export interface ParseResult {
  /** All parsed fields */
  fields: ParsedField[];
  /** Whether the entire frame is valid */
  valid: boolean;
  /** Unmatched trailing bytes */
  unmatchedBytes: number[];
  /** Overall errors */
  errors: string[];
}

/** Colors for field types */
export const FIELD_COLORS: Record<FieldType, { bg: string; text: string; hex: string }> = {
  header:   { bg: "bg-blue-500/20",   text: "text-blue-600 dark:text-blue-400",   hex: "#3B82F6" },
  length:   { bg: "bg-orange-500/20", text: "text-orange-600 dark:text-orange-400", hex: "#F97316" },
  data:     { bg: "bg-green-500/20",  text: "text-green-600 dark:text-green-400",  hex: "#22C55E" },
  checksum: { bg: "bg-purple-500/20", text: "text-purple-600 dark:text-purple-400", hex: "#A855F7" },
  custom:   { bg: "bg-gray-500/20",   text: "text-gray-600 dark:text-gray-400",   hex: "#6B7280" },
};
