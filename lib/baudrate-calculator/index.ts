import type { BaudrateConfig, BaudrateResult } from "@/types/baudrate-calculator";
import { BAUDRATE_PRESETS } from "@/types/baudrate-calculator";

/**
 * 计算 UART 波特率误差（STM32 BRR 模型）。
 *
 * STM32 OVER16 模式：
 *   USARTDIV = f_clk / baudrate（16 位定点数：12 位整数 + 4 位小数）
 *   BRR = round(USARTDIV × 16) ÷ 16 取整编码（mantissa[15:4] + fraction[3:0]）
 *   实际波特率 = f_clk / (16 × (mantissa + fraction/16))
 *
 * STM32 OVER8 模式：
 *   USARTDIV = 2 × f_clk / baudrate
 *   BRR[15:4] = mantissa，BRR[2:0] = fraction（3 位），BRR[3] 必须为 0
 *   实际波特率 = f_clk / (8 × (mantissa + fraction/8))
 */
export function calculateBaudrate(config: BaudrateConfig): BaudrateResult {
  const { clockFreq, targetBaudrate, oversampling } = config;

  if (clockFreq <= 0 || targetBaudrate <= 0) {
    return { divider: 0, brrValue: 0, mantissa: 0, fraction: 0, actualBaudrate: 0, errorPercent: 0, isAcceptable: false };
  }

  if (oversampling === 16) {
    // USARTDIV 是 16 位定点数，精度 1/16
    // BRR 直接按 USARTDIV × 16 四舍五入后编码
    const usartdiv16 = Math.round(clockFreq / targetBaudrate); // = USARTDIV × 16 的近似
    if (usartdiv16 <= 0) {
      return { divider: 0, brrValue: 0, mantissa: 0, fraction: 0, actualBaudrate: 0, errorPercent: 100, isAcceptable: false };
    }
    const mantissa = usartdiv16 >> 4;
    const fraction = usartdiv16 & 0xF;
    const brrValue = usartdiv16; // BRR = mantissa[15:4] | fraction[3:0]
    const actualBaudrate = clockFreq / usartdiv16; // = f_clk / (16 * (mantissa + fraction/16))

    const errorPercent = Math.abs(actualBaudrate - targetBaudrate) / targetBaudrate * 100;

    return {
      divider: usartdiv16,
      brrValue,
      mantissa,
      fraction,
      actualBaudrate,
      errorPercent,
      isAcceptable: errorPercent < 2.5,
    };
  } else {
    // OVER8: USARTDIV = 2 × f_clk / (baudrate × 8) = f_clk / (4 × baudrate)
    // 但 STM32 RM：USARTDIV = f_clk / (8 × baudrate)
    // BRR 编码：mantissa[15:4]，fraction 只用 BRR[2:0]（3 位），BRR[3]=0
    const usartdiv8 = clockFreq / (8 * targetBaudrate);
    const mantissa = Math.floor(usartdiv8);
    // fraction（3 位）：取 USARTDIV 小数部分 × 8 四舍五入
    const fractionExact = (usartdiv8 - mantissa) * 8;
    let fraction = Math.round(fractionExact);
    // fraction 溢出到 8 → mantissa +1
    let finalMantissa = mantissa;
    if (fraction >= 8) {
      fraction = 0;
      finalMantissa += 1;
    }
    const brrValue = (finalMantissa << 4) | (fraction & 0x07);
    const divider = brrValue;
    // 实际波特率 = f_clk / (8 × (mantissa + fraction/8))
    const actualBaudrate = clockFreq / (8 * (finalMantissa + fraction / 8));

    const errorPercent = Math.abs(actualBaudrate - targetBaudrate) / targetBaudrate * 100;

    return {
      divider,
      brrValue,
      mantissa: finalMantissa,
      fraction,
      actualBaudrate,
      errorPercent,
      isAcceptable: errorPercent < 2.5,
    };
  }
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
