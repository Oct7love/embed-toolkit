import type { ADCConfig, ADCResult } from "@/types/adc-calculator";

/**
 * Calculate all ADC timing and voltage parameters.
 *
 * Formulas:
 *   singleConvTime = (sampleCycles + conversionCycles) / adcClock
 *   totalScanTime  = singleConvTime * channels
 *   maxSampleRate  = 1 / totalScanTime
 *   lsbVoltage     = vref / 2^resolution
 *   dmaBufferSize  = channels * dmaBufferMultiplier (half/full transfer)
 */
export function calculateADC(config: ADCConfig): ADCResult {
  const {
    adcClock,
    sampleCycles,
    conversionCycles,
    resolution,
    channels,
    dmaEnabled,
    vref,
    dmaBufferMultiplier,
  } = config;

  // Guard against division by zero
  if (adcClock <= 0) {
    return {
      singleConvTime: 0,
      totalScanTime: 0,
      maxSampleRate: 0,
      lsbVoltage: 0,
      dmaBufferSize: 0,
    };
  }

  const totalCycles = sampleCycles + conversionCycles;
  const singleConvTime = totalCycles / adcClock;

  const effectiveChannels = Math.max(1, channels);
  const totalScanTime = singleConvTime * effectiveChannels;

  const maxSampleRate = totalScanTime > 0 ? 1 / totalScanTime : 0;

  const lsbVoltage = vref / Math.pow(2, resolution);

  const dmaBufferSize = dmaEnabled
    ? effectiveChannels * dmaBufferMultiplier
    : 0;

  return {
    singleConvTime,
    totalScanTime,
    maxSampleRate,
    lsbVoltage,
    dmaBufferSize,
  };
}

/**
 * Format a time value with appropriate unit (ns, us, ms, s).
 */
export function formatTime(seconds: number): string {
  if (seconds <= 0 || !isFinite(seconds)) return "0 s";
  if (seconds < 1e-6) return `${(seconds * 1e9).toPrecision(4)} ns`;
  if (seconds < 1e-3) return `${(seconds * 1e6).toPrecision(4)} \u00b5s`;
  if (seconds < 1) return `${(seconds * 1e3).toPrecision(4)} ms`;
  return `${seconds.toPrecision(4)} s`;
}

/**
 * Format a frequency/rate value with appropriate unit (Hz, kHz, MHz, MSPS).
 */
export function formatRate(hz: number): string {
  if (hz <= 0 || !isFinite(hz)) return "0 SPS";
  if (hz >= 1e6) return `${(hz / 1e6).toPrecision(4)} MSPS`;
  if (hz >= 1e3) return `${(hz / 1e3).toPrecision(4)} kSPS`;
  return `${hz.toPrecision(4)} SPS`;
}

/**
 * Format a voltage value with appropriate unit (V, mV, uV).
 */
export function formatVoltage(volts: number): string {
  if (volts <= 0 || !isFinite(volts)) return "0 V";
  if (volts < 1e-3) return `${(volts * 1e6).toPrecision(4)} \u00b5V`;
  if (volts < 1) return `${(volts * 1e3).toPrecision(4)} mV`;
  return `${volts.toPrecision(4)} V`;
}

/**
 * Format a frequency value for clock display (MHz, kHz, Hz).
 */
export function formatClockFreq(hz: number): string {
  if (hz <= 0 || !isFinite(hz)) return "0 Hz";
  if (hz >= 1e6) return `${(hz / 1e6).toPrecision(4)} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toPrecision(4)} kHz`;
  return `${hz.toPrecision(4)} Hz`;
}
