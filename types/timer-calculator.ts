/** Timer configuration input */
export interface TimerConfig {
  clockFreq: number;
  targetFreq: number;
  targetPeriod: number;
  mode: "frequency" | "period";
  pwmEnabled: boolean;
  dutyCycle: number;
}

/** Timer calculation result */
export interface TimerResult {
  psc: number;
  arr: number;
  ccr: number;
  actualFreq: number;
  error: number;
}

/** Clock preset definition */
export interface ClockPreset {
  label: string;
  freq: number;
}

/** Available clock presets */
export const CLOCK_PRESETS: ClockPreset[] = [
  { label: "STM32F1 — 72 MHz", freq: 72_000_000 },
  { label: "STM32F4 — 168 MHz", freq: 168_000_000 },
  { label: "STM32H7 — 480 MHz", freq: 480_000_000 },
  { label: "ESP32 — 80 MHz", freq: 80_000_000 },
  { label: "Custom", freq: 0 },
];

/** Max 16-bit value for PSC/ARR */
export const TIMER_16BIT_MAX = 65535;
