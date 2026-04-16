import type { TimerResult } from "@/types/timer-calculator";
import { TIMER_16BIT_MAX } from "@/types/timer-calculator";

/**
 * Calculate all valid PSC+ARR combinations for a given clock and target frequency.
 *
 * Formula: f_out = f_clk / ((PSC+1) * (ARR+1))
 *
 * Strategy: iterate over PSC from 0 to 65535, compute the ideal ARR for each,
 * keep only results where ARR is within 16-bit range, and sort by error.
 *
 * @param clockFreq  System clock frequency in Hz
 * @param targetFreq Target output frequency in Hz
 * @param dutyCycle  PWM duty cycle percentage (0-100), used to compute CCR
 * @param maxResults Maximum number of results to return (default 20)
 * @returns Array of TimerResult sorted by ascending error percentage
 */
export function calculateTimerParams(
  clockFreq: number,
  targetFreq: number,
  dutyCycle: number = 50,
  maxResults: number = 20
): TimerResult[] {
  if (clockFreq <= 0 || targetFreq <= 0 || !isFinite(clockFreq) || !isFinite(targetFreq)) {
    return [];
  }

  // The total divisor needed: f_clk / f_target = (PSC+1) * (ARR+1)
  const totalDivisor = clockFreq / targetFreq;

  // If the divisor is less than 1, target frequency is too high
  if (totalDivisor < 1) {
    return [];
  }

  // If the divisor exceeds (65536 * 65536), it's impossible with 16-bit registers
  const maxDivisor = (TIMER_16BIT_MAX + 1) * (TIMER_16BIT_MAX + 1);
  if (totalDivisor > maxDivisor) {
    return [];
  }

  const results: TimerResult[] = [];
  const seen = new Set<string>();

  // Iterate PSC values, compute ideal ARR
  const maxPsc = Math.min(TIMER_16BIT_MAX, Math.ceil(Math.sqrt(totalDivisor)) + 1);

  for (let psc = 0; psc <= TIMER_16BIT_MAX; psc++) {
    const idealArr = totalDivisor / (psc + 1) - 1;

    // Round to nearest integer and check range
    const arrRounded = Math.round(idealArr);

    // Try both floor and ceil for better accuracy
    const candidates = [arrRounded, Math.floor(idealArr), Math.ceil(idealArr)];

    for (const arr of candidates) {
      if (arr < 0 || arr > TIMER_16BIT_MAX) continue;

      const key = `${psc}-${arr}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const actualFreq = clockFreq / ((psc + 1) * (arr + 1));
      const error = Math.abs(actualFreq - targetFreq) / targetFreq * 100;

      // CCR=ARR 时占空比 100%（CCR 不应超过 ARR，ARR+1 会导致硬件溢出）
      const ccr = Math.round((dutyCycle / 100) * (arr + 1));
      const clampedCcr = Math.max(0, Math.min(arr, ccr));

      results.push({
        psc,
        arr,
        ccr: clampedCcr,
        actualFreq,
        error,
      });
    }

    // Optimization: stop early if we have many exact/near-exact matches
    // and PSC is beyond the useful range
    if (psc > maxPsc && results.length >= maxResults * 2) {
      break;
    }
  }

  // Sort by error (ascending), then by PSC (ascending) for stability
  results.sort((a, b) => {
    if (Math.abs(a.error - b.error) < 1e-12) {
      return a.psc - b.psc;
    }
    return a.error - b.error;
  });

  return results.slice(0, maxResults);
}

/**
 * Convert a period (in seconds) to frequency (in Hz).
 */
export function periodToFreq(periodSeconds: number): number {
  if (periodSeconds <= 0 || !isFinite(periodSeconds)) return 0;
  return 1 / periodSeconds;
}

/**
 * Convert frequency (Hz) to period (seconds).
 */
export function freqToPeriod(freqHz: number): number {
  if (freqHz <= 0 || !isFinite(freqHz)) return 0;
  return 1 / freqHz;
}

/**
 * Format frequency with appropriate unit.
 */
export function formatFrequency(hz: number): string {
  if (hz <= 0 || !isFinite(hz)) return "0 Hz";
  if (hz >= 1e6) return `${(hz / 1e6).toPrecision(6)} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toPrecision(6)} kHz`;
  return `${hz.toPrecision(6)} Hz`;
}

/**
 * Format period with appropriate unit.
 */
export function formatPeriod(seconds: number): string {
  if (seconds <= 0 || !isFinite(seconds)) return "0 s";
  if (seconds >= 1) return `${seconds.toPrecision(6)} s`;
  if (seconds >= 1e-3) return `${(seconds * 1e3).toPrecision(6)} ms`;
  if (seconds >= 1e-6) return `${(seconds * 1e6).toPrecision(6)} us`;
  return `${(seconds * 1e9).toPrecision(6)} ns`;
}

/**
 * Format error percentage.
 */
export function formatError(errorPercent: number): string {
  if (errorPercent === 0) return "0%";
  if (errorPercent < 0.001) return "<0.001%";
  return `${errorPercent.toFixed(3)}%`;
}
