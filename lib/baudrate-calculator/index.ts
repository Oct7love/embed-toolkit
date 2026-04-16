import type { BaudrateConfig, BaudrateResult } from "@/types/baudrate-calculator";
import { BAUDRATE_PRESETS } from "@/types/baudrate-calculator";

/**
 * 计算 UART 波特率误差。
 *
 * 公式：USARTDIV = f_clk / (oversampling × baudrate)
 * 整数截断后：actualBaud = f_clk / (oversampling × round(USARTDIV))
 */
export function calculateBaudrate(config: BaudrateConfig): BaudrateResult {
  const { clockFreq, targetBaudrate, oversampling } = config;

  if (clockFreq <= 0 || targetBaudrate <= 0) {
    return { divider: 0, actualBaudrate: 0, errorPercent: 0, isAcceptable: false };
  }

  const exactDiv = clockFreq / (oversampling * targetBaudrate);
  const divider = Math.round(exactDiv);

  if (divider <= 0) {
    return { divider: 0, actualBaudrate: 0, errorPercent: 100, isAcceptable: false };
  }

  const actualBaudrate = clockFreq / (oversampling * divider);
  const errorPercent = Math.abs(actualBaudrate - targetBaudrate) / targetBaudrate * 100;

  return {
    divider,
    actualBaudrate,
    errorPercent,
    isAcceptable: errorPercent < 2.5,
  };
}

/**
 * 批量计算所有常见波特率的误差。
 */
export function calculateBatchBaudrates(
  clockFreq: number,
  oversampling: 8 | 16,
  baudrates: number[] = BAUDRATE_PRESETS
): { baudrate: number; result: BaudrateResult }[] {
  return baudrates.map((baudrate) => ({
    baudrate,
    result: calculateBaudrate({ clockFreq, targetBaudrate: baudrate, oversampling }),
  }));
}

/** 格式化波特率数字显示 */
export function formatBaudrate(baud: number): string {
  if (baud >= 1_000_000) return `${(baud / 1_000_000).toFixed(baud % 1_000_000 === 0 ? 0 : 1)}M`;
  if (baud >= 1000) return `${(baud / 1000).toFixed(baud % 1000 === 0 ? 0 : 1)}k`;
  return String(baud);
}

/** 误差百分比对应的颜色 class */
export function getErrorColorClass(errorPercent: number): string {
  if (errorPercent < 1) return "text-green-500";
  if (errorPercent < 3) return "text-yellow-500";
  return "text-red-500";
}
