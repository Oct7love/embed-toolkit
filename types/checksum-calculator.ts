export interface CRCPreset {
  name: string;
  width: 8 | 16 | 32;
  polynomial: number;
  init: number;
  refIn: boolean;
  refOut: boolean;
  xorOut: number;
}

export type ChecksumAlgorithm = "crc" | "xor" | "sum";
export type InputMode = "hex" | "ascii";

export interface ChecksumConfig {
  algorithm: ChecksumAlgorithm;
  crcPreset: string;
  inputMode: InputMode;
}

export interface ChecksumResult {
  hex: string;
  dec: string;
  bin: string;
}
