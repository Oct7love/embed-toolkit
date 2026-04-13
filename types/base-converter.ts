export type Base = "hex" | "dec" | "oct" | "bin";
export type BitWidth = 8 | 16 | 32 | 64;
export type SignMode = "unsigned" | "signed";

export interface BaseConverterConfig {
  bitWidth: BitWidth;
  signMode: SignMode;
  batchMode: boolean;
}

export interface ConversionResult {
  hex: string;
  dec: string;
  oct: string;
  bin: string;
  error?: string;
}

export interface BatchConversionRow {
  input: string;
  result: ConversionResult;
}
