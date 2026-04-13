/** Resistance unit multipliers */
export type ResistanceUnit = "Ω" | "kΩ" | "MΩ";

/** Capacitance unit multipliers */
export type CapacitanceUnit = "pF" | "nF" | "μF";

/** Voltage divider calculation mode */
export type DividerMode = "forward" | "reverse";

/** Voltage divider input */
export interface VoltageDividerInput {
  mode: DividerMode;
  vin: number;
  r1: number;
  r1Unit: ResistanceUnit;
  /** In forward mode: R2 value. In reverse mode: target Vout */
  r2OrVout: number;
  r2Unit: ResistanceUnit;
}

/** Voltage divider result */
export interface VoltageDividerResult {
  vout: number;
  ratio: number;
  r2: number; // actual R2 in ohms
  r2Nearest: number | null; // nearest E24 value in ohms
}

/** RC filter input */
export interface RCFilterInput {
  resistance: number;
  resistanceUnit: ResistanceUnit;
  capacitance: number;
  capacitanceUnit: CapacitanceUnit;
}

/** RC filter result */
export interface RCFilterResult {
  cutoffFrequency: number; // in Hz
  cutoffFrequencyFormatted: string;
  timeConstant: number; // tau = RC in seconds
}

/** Bode plot data point */
export interface BodeDataPoint {
  frequency: number; // Hz
  frequencyLabel: string;
  gainDb: number;
}

/** E24 standard resistor series */
export const E24_VALUES: number[] = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0,
  2.2, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.3,
  4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1,
];

/** Unit multipliers for resistance */
export const RESISTANCE_MULTIPLIERS: Record<ResistanceUnit, number> = {
  "Ω": 1,
  "kΩ": 1e3,
  "MΩ": 1e6,
};

/** Unit multipliers for capacitance */
export const CAPACITANCE_MULTIPLIERS: Record<CapacitanceUnit, number> = {
  "pF": 1e-12,
  "nF": 1e-9,
  "μF": 1e-6,
};
