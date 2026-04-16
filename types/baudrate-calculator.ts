export interface BaudrateConfig {
  clockFreq: number;
  targetBaudrate: number;
  oversampling: 8 | 16;
}

export interface BaudrateResult {
  divider: number;
  actualBaudrate: number;
  errorPercent: number;
  isAcceptable: boolean;
}

export interface ClockPreset {
  label: string;
  freq: number;
}

export const CLOCK_PRESETS: ClockPreset[] = [
  { label: "STM32F1 (72 MHz)", freq: 72_000_000 },
  { label: "STM32F4 (84 MHz APB1)", freq: 84_000_000 },
  { label: "STM32F4 (168 MHz APB2)", freq: 168_000_000 },
  { label: "STM32H7 (100 MHz)", freq: 100_000_000 },
  { label: "ESP32 (80 MHz)", freq: 80_000_000 },
  { label: "STM32G4 (170 MHz)", freq: 170_000_000 },
];

export const BAUDRATE_PRESETS: number[] = [
  9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600, 1_000_000, 2_000_000,
];
