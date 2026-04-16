import type { ClockConstraints } from "@/types/clock-tree";

export const CHIP_CONSTRAINTS: ClockConstraints[] = [
  {
    id: "stm32f1",
    name: "STM32F1",
    hsiFreq: 8_000_000,
    defaultHseFreq: 8_000_000,
    maxSysclk: 72_000_000,
    maxAhb: 72_000_000,
    maxApb1: 36_000_000,
    maxApb2: 72_000_000,
    pllType: "f1",
    pllMulRange: [2, 16],
    flashLatencyTable: [
      [24_000_000, 0],
      [48_000_000, 1],
      [72_000_000, 2],
    ],
  },
  {
    id: "stm32f4",
    name: "STM32F4",
    hsiFreq: 16_000_000,
    defaultHseFreq: 8_000_000,
    maxSysclk: 168_000_000,
    maxAhb: 168_000_000,
    maxApb1: 42_000_000,
    maxApb2: 84_000_000,
    pllType: "f4",
    pllMRange: [2, 63],
    pllNRange: [50, 432],
    pllPOptions: [2, 4, 6, 8],
    pllQRange: [2, 15],
    pllInputRange: [1_000_000, 2_000_000],
    vcoRange: [192_000_000, 432_000_000],
    flashLatencyTable: [
      [30_000_000, 0],
      [60_000_000, 1],
      [90_000_000, 2],
      [120_000_000, 3],
      [150_000_000, 4],
      [168_000_000, 5],
    ],
  },
  {
    id: "stm32h7",
    name: "STM32H7",
    hsiFreq: 64_000_000,
    defaultHseFreq: 25_000_000,
    maxSysclk: 480_000_000,
    maxAhb: 240_000_000,
    maxApb1: 120_000_000,
    maxApb2: 120_000_000,
    pllType: "h7",
    divMRange: [1, 63],
    divNRange: [4, 512],
    divPRange: [2, 128],
    pllInputRange: [1_000_000, 16_000_000],
    vcoRange: [192_000_000, 836_000_000],
    flashLatencyTable: [
      [70_000_000, 0],
      [140_000_000, 1],
      [210_000_000, 2],
      [275_000_000, 3],
      [480_000_000, 4],
    ],
  },
];

export function getConstraintsById(id: string): ClockConstraints {
  return CHIP_CONSTRAINTS.find((c) => c.id === id) ?? CHIP_CONSTRAINTS[0];
}

/** 根据频率和 flash latency 表返回所需等待周期 */
export function getFlashLatency(constraints: ClockConstraints, freqHz: number): number | null {
  if (!constraints.flashLatencyTable) return null;
  for (const [maxFreq, ws] of constraints.flashLatencyTable) {
    if (freqHz <= maxFreq) return ws;
  }
  return constraints.flashLatencyTable[constraints.flashLatencyTable.length - 1]?.[1] ?? null;
}
