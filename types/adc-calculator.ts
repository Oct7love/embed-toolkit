/** ADC resolution in bits */
export type ADCResolution = 8 | 10 | 12 | 16;

/** Chip preset identifier */
export type ChipPreset = "stm32f1" | "stm32f4" | "custom";

/** ADC configuration input */
export interface ADCConfig {
  /** ADC clock frequency in Hz */
  adcClock: number;
  /** Sample time in cycles */
  sampleCycles: number;
  /** Conversion cycles (fixed per chip family) */
  conversionCycles: number;
  /** ADC resolution in bits */
  resolution: ADCResolution;
  /** Number of channels in scan group */
  channels: number;
  /** Whether DMA continuous mode is enabled */
  dmaEnabled: boolean;
  /** Reference voltage in volts */
  vref: number;
  /** DMA buffer multiplier (N for half/full transfer) */
  dmaBufferMultiplier: number;
}

/** ADC calculation result */
export interface ADCResult {
  /** Single channel conversion time in seconds */
  singleConvTime: number;
  /** Total scan time for all channels in seconds */
  totalScanTime: number;
  /** Maximum sampling rate in Hz */
  maxSampleRate: number;
  /** LSB voltage in volts */
  lsbVoltage: number;
  /** Recommended DMA buffer size in samples */
  dmaBufferSize: number;
}

/** Chip preset configuration */
export interface ChipPresetConfig {
  label: string;
  adcClock: number;
  conversionCycles: number;
  sampleCyclesOptions: number[];
  defaultSampleCycles: number;
  defaultResolution: ADCResolution;
}

/** Available sample cycle options for STM32F1/F4 */
export const SAMPLE_CYCLES_OPTIONS_F1: number[] = [
  1.5, 7.5, 13.5, 28.5, 41.5, 55.5, 71.5, 239.5,
];

export const SAMPLE_CYCLES_OPTIONS_F4: number[] = [
  3, 15, 28, 56, 84, 112, 144, 480,
];

/** Chip preset definitions */
export const CHIP_PRESETS: Record<ChipPreset, ChipPresetConfig> = {
  stm32f1: {
    label: "STM32F1 (14 MHz)",
    adcClock: 14_000_000,
    conversionCycles: 12.5,
    sampleCyclesOptions: SAMPLE_CYCLES_OPTIONS_F1,
    defaultSampleCycles: 1.5,
    defaultResolution: 12,
  },
  stm32f4: {
    label: "STM32F4 (36 MHz)",
    adcClock: 36_000_000,
    conversionCycles: 12,
    sampleCyclesOptions: SAMPLE_CYCLES_OPTIONS_F4,
    defaultSampleCycles: 3,
    defaultResolution: 12,
  },
  custom: {
    label: "Custom",
    adcClock: 14_000_000,
    conversionCycles: 12.5,
    sampleCyclesOptions: SAMPLE_CYCLES_OPTIONS_F1,
    defaultSampleCycles: 1.5,
    defaultResolution: 12,
  },
};

/** Available ADC resolutions */
export const RESOLUTION_OPTIONS: ADCResolution[] = [8, 10, 12, 16];
