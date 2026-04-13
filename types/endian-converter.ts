export type ByteWidth = 16 | 32 | 64;
export type Endianness = "big" | "little";

export interface EndianResult {
  bigEndian: string;
  littleEndian: string;
  bytes: ByteInfo[];
}

export interface ByteInfo {
  index: number;
  value: string;
}

export interface BatchEndianRow {
  input: string;
  result: EndianResult | null;
  error?: string;
}
