/* ------------------------------------------------------------------ */
/*  Clock-Tree Configurator — Data Model                              */
/* ------------------------------------------------------------------ */

/** PLL architecture variant per chip family */
export type PllType = "f1" | "f4" | "h7";

/** SYSCLK source mux selection */
export type SysclkSource = "HSI" | "HSE" | "PLL";

/** PLL input source */
export type PllSource = "HSI" | "HSE";

/* ---------- Chip constraints ---------- */

export interface ClockConstraints {
  id: string;
  name: string;
  /** Internal high-speed oscillator frequency (Hz) */
  hsiFreq: number;
  /** Default HSE crystal frequency (Hz) */
  defaultHseFreq: number;
  maxSysclk: number;
  maxAhb: number;
  maxApb1: number;
  maxApb2: number;
  pllType: PllType;
  /** F1 only: multiplier range [min, max] inclusive */
  pllMulRange?: [number, number];
  /** F4 only */
  pllMRange?: [number, number];
  pllNRange?: [number, number];
  pllPOptions?: number[];
  pllQRange?: [number, number];
  /** H7 only */
  divMRange?: [number, number];
  divNRange?: [number, number];
  divPRange?: [number, number];

  /** PLL input frequency constraints (Hz) */
  pllInputRange?: [number, number]; // F4: 1-2MHz, H7: 1-16MHz
  /** VCO output range (Hz) */
  vcoRange?: [number, number]; // F4: 192-432MHz, H7: 192-836MHz

  /** Flash wait-state table: [[maxFreq, waitStates], ...] sorted ascending */
  flashLatencyTable?: [number, number][];
}

/* ---------- PLL params per family ---------- */

export interface PllParamsF1 {
  type: "f1";
  pllMul: number; // 2-16
  pllSrc: PllSource;
}

export interface PllParamsF4 {
  type: "f4";
  pllM: number;
  pllN: number;
  pllP: number;
  pllQ: number;
  pllSrc: PllSource;
}

export interface PllParamsH7 {
  type: "h7";
  divM: number;
  divN: number;
  divP: number;
  pllSrc: PllSource;
}

export type PllParams = PllParamsF1 | PllParamsF4 | PllParamsH7;

/* ---------- Full clock config state ---------- */

export interface ClockConfig {
  chipId: string;
  hseFreq: number;
  sysclkSource: SysclkSource;
  pll: PllParams;
  ahbDiv: number;
  apb1Div: number;
  apb2Div: number;
}

/* ---------- Calculated frequencies ---------- */

export interface ClockFrequencies {
  hsi: number;
  hse: number;
  pllInput: number;
  pllOutput: number;
  sysclk: number;
  ahb: number;
  apb1: number;
  apb2: number;
}

/* ---------- Violation warnings ---------- */

export interface ClockViolation {
  node: string;
  actual: number;
  max: number;
  message: string;
}

/* ---------- Divider option sets ---------- */

export const AHB_DIVIDERS = [1, 2, 4, 8, 16, 64, 128, 256, 512] as const;
export const APB_DIVIDERS = [1, 2, 4, 8, 16] as const;
