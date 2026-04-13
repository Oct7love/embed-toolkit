import type {
  ResistanceUnit,
  CapacitanceUnit,
  VoltageDividerResult,
  RCFilterResult,
  BodeDataPoint,
} from "@/types/rc-calculator";
import {
  E24_VALUES,
  RESISTANCE_MULTIPLIERS,
  CAPACITANCE_MULTIPLIERS,
} from "@/types/rc-calculator";

/**
 * Convert resistance value to ohms.
 */
export function toOhms(value: number, unit: ResistanceUnit): number {
  return value * RESISTANCE_MULTIPLIERS[unit];
}

/**
 * Convert capacitance value to farads.
 */
export function toFarads(value: number, unit: CapacitanceUnit): number {
  return value * CAPACITANCE_MULTIPLIERS[unit];
}

/**
 * Find the nearest E24 standard resistor value for a given ohm value.
 * Searches across all decades from 1 ohm to 10M ohm.
 */
export function findNearestE24(ohms: number): number {
  if (ohms <= 0 || !isFinite(ohms)) return E24_VALUES[0];

  let bestValue = E24_VALUES[0];
  let bestRatio = Infinity;

  // Search decades from 10^0 to 10^6
  for (let decade = 0; decade <= 6; decade++) {
    const multiplier = Math.pow(10, decade);
    for (const base of E24_VALUES) {
      const candidate = base * multiplier;
      const ratio = Math.max(candidate / ohms, ohms / candidate);
      if (ratio < bestRatio) {
        bestRatio = ratio;
        bestValue = candidate;
      }
    }
  }

  return bestValue;
}

/**
 * Get all E24 values within a decade range for display.
 */
export function getE24ValuesInRange(
  minOhms: number,
  maxOhms: number
): number[] {
  const results: number[] = [];
  for (let decade = 0; decade <= 6; decade++) {
    const multiplier = Math.pow(10, decade);
    for (const base of E24_VALUES) {
      const value = base * multiplier;
      if (value >= minOhms && value <= maxOhms) {
        results.push(value);
      }
    }
  }
  return results;
}

/**
 * Calculate voltage divider output.
 * Forward mode: Vout = Vin * R2 / (R1 + R2)
 */
export function calculateVoltageDividerForward(
  vin: number,
  r1Ohms: number,
  r2Ohms: number
): VoltageDividerResult {
  if (r1Ohms + r2Ohms === 0) {
    return { vout: 0, ratio: 0, r2: r2Ohms, r2Nearest: null };
  }

  const ratio = r2Ohms / (r1Ohms + r2Ohms);
  const vout = vin * ratio;

  return {
    vout,
    ratio,
    r2: r2Ohms,
    r2Nearest: findNearestE24(r2Ohms),
  };
}

/**
 * Reverse voltage divider: given Vin, Vout, R1, calculate R2.
 * R2 = R1 * Vout / (Vin - Vout)
 */
export function calculateVoltageDividerReverse(
  vin: number,
  targetVout: number,
  r1Ohms: number
): VoltageDividerResult {
  if (vin <= targetVout || vin === 0) {
    return { vout: targetVout, ratio: 0, r2: 0, r2Nearest: null };
  }

  const r2 = (r1Ohms * targetVout) / (vin - targetVout);
  const ratio = targetVout / vin;
  const r2Nearest = findNearestE24(r2);

  return {
    vout: targetVout,
    ratio,
    r2,
    r2Nearest,
  };
}

/**
 * Calculate RC filter cutoff frequency.
 * fc = 1 / (2 * pi * R * C)
 */
export function calculateCutoffFrequency(
  resistanceOhms: number,
  capacitanceFarads: number
): RCFilterResult {
  if (resistanceOhms <= 0 || capacitanceFarads <= 0) {
    return {
      cutoffFrequency: 0,
      cutoffFrequencyFormatted: "0 Hz",
      timeConstant: 0,
    };
  }

  const timeConstant = resistanceOhms * capacitanceFarads;
  const cutoffFrequency = 1 / (2 * Math.PI * timeConstant);

  return {
    cutoffFrequency,
    cutoffFrequencyFormatted: formatFrequency(cutoffFrequency),
    timeConstant,
  };
}

/**
 * Format a frequency value with appropriate unit.
 */
export function formatFrequency(hz: number): string {
  if (hz <= 0 || !isFinite(hz)) return "0 Hz";
  if (hz >= 1e9) return `${(hz / 1e9).toPrecision(4)} GHz`;
  if (hz >= 1e6) return `${(hz / 1e6).toPrecision(4)} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toPrecision(4)} kHz`;
  return `${hz.toPrecision(4)} Hz`;
}

/**
 * Format a resistance value with appropriate unit.
 */
export function formatResistance(ohms: number): string {
  if (ohms >= 1e6) return `${(ohms / 1e6).toPrecision(3)} MΩ`;
  if (ohms >= 1e3) return `${(ohms / 1e3).toPrecision(3)} kΩ`;
  return `${ohms.toPrecision(3)} Ω`;
}

/**
 * Generate Bode plot data for low-pass RC filter.
 * H(f) = 1 / sqrt(1 + (f/fc)^2)
 * Gain(dB) = 20 * log10(|H(f)|) = -10 * log10(1 + (f/fc)^2)
 */
export function generateLowPassBodeData(
  cutoffFrequencyHz: number,
  decades: number = 5
): BodeDataPoint[] {
  if (cutoffFrequencyHz <= 0) return [];

  const points: BodeDataPoint[] = [];
  const startDecade = Math.floor(Math.log10(cutoffFrequencyHz)) - 2;
  const endDecade = startDecade + decades;

  for (let d = startDecade; d <= endDecade; d++) {
    // 10 points per decade for smooth curve
    for (let i = 0; i < 10; i++) {
      const frequency = Math.pow(10, d + i / 10);
      const ratio = frequency / cutoffFrequencyHz;
      const gainDb = -10 * Math.log10(1 + ratio * ratio);

      points.push({
        frequency,
        frequencyLabel: formatFrequencyShort(frequency),
        gainDb: Math.round(gainDb * 100) / 100,
      });
    }
  }

  return points;
}

/**
 * Generate Bode plot data for high-pass RC filter.
 * H(f) = (f/fc) / sqrt(1 + (f/fc)^2)
 * Gain(dB) = 20 * log10(f/fc) - 10 * log10(1 + (f/fc)^2)
 */
export function generateHighPassBodeData(
  cutoffFrequencyHz: number,
  decades: number = 5
): BodeDataPoint[] {
  if (cutoffFrequencyHz <= 0) return [];

  const points: BodeDataPoint[] = [];
  const startDecade = Math.floor(Math.log10(cutoffFrequencyHz)) - 2;
  const endDecade = startDecade + decades;

  for (let d = startDecade; d <= endDecade; d++) {
    for (let i = 0; i < 10; i++) {
      const frequency = Math.pow(10, d + i / 10);
      const ratio = frequency / cutoffFrequencyHz;
      const gainDb = 20 * Math.log10(ratio) - 10 * Math.log10(1 + ratio * ratio);

      points.push({
        frequency,
        frequencyLabel: formatFrequencyShort(frequency),
        gainDb: Math.round(gainDb * 100) / 100,
      });
    }
  }

  return points;
}

/**
 * Short frequency label for chart axes.
 */
function formatFrequencyShort(hz: number): string {
  if (hz >= 1e9) return `${+(hz / 1e9).toPrecision(3)}G`;
  if (hz >= 1e6) return `${+(hz / 1e6).toPrecision(3)}M`;
  if (hz >= 1e3) return `${+(hz / 1e3).toPrecision(3)}k`;
  return `${+hz.toPrecision(3)}`;
}
