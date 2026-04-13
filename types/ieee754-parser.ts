export type FloatType = "float32" | "float64";

export type SpecialKind = "normal" | "subnormal" | "zero" | "infinity" | "nan";

export interface IEEE754Result {
  sign: number; // 0 or 1
  exponent: string; // binary string
  mantissa: string; // binary string
  exponentValue: number; // biased exponent integer
  exponentBias: number; // bias (127 for float32, 1023 for float64)
  exponentActual: number; // unbiased exponent
  mantissaValue: number; // decoded mantissa (1.xxxxx)
  floatValue: number; // final decimal value
  special: SpecialKind;
  hexString: string; // full hex representation
  binaryString: string; // full binary representation
}

export interface IEEE754Config {
  signBits: 1;
  exponentBits: number; // 8 for float32, 11 for float64
  mantissaBits: number; // 23 for float32, 52 for float64
  bias: number; // 127 for float32, 1023 for float64
  totalBits: number; // 32 or 64
}

export const FLOAT32_CONFIG: IEEE754Config = {
  signBits: 1,
  exponentBits: 8,
  mantissaBits: 23,
  bias: 127,
  totalBits: 32,
};

export const FLOAT64_CONFIG: IEEE754Config = {
  signBits: 1,
  exponentBits: 11,
  mantissaBits: 52,
  bias: 1023,
  totalBits: 64,
};
