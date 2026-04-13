import type {
  BandCount,
  ColorName,
  ColorInfo,
  ResistorResult,
  ReverseLookupResult,
} from "@/types/resistor-calculator";

/** 色环颜色定义 */
export const COLOR_DATA: ColorInfo[] = [
  { name: "black",  label: "黑", hex: "#1a1a1a", digit: 0, multiplier: 1 },
  { name: "brown",  label: "棕", hex: "#8B4513", digit: 1, multiplier: 10, tolerance: 1, tempCoeff: 100 },
  { name: "red",    label: "红", hex: "#FF0000", digit: 2, multiplier: 100, tolerance: 2, tempCoeff: 50 },
  { name: "orange", label: "橙", hex: "#FF8C00", digit: 3, multiplier: 1_000, tempCoeff: 15 },
  { name: "yellow", label: "黄", hex: "#FFD700", digit: 4, multiplier: 10_000, tempCoeff: 25 },
  { name: "green",  label: "绿", hex: "#228B22", digit: 5, multiplier: 100_000, tolerance: 0.5 },
  { name: "blue",   label: "蓝", hex: "#0000FF", digit: 6, multiplier: 1_000_000, tolerance: 0.25, tempCoeff: 10 },
  { name: "violet", label: "紫", hex: "#8B008B", digit: 7, multiplier: 10_000_000, tolerance: 0.1, tempCoeff: 5 },
  { name: "grey",   label: "灰", hex: "#808080", digit: 8, multiplier: 100_000_000, tolerance: 0.05 },
  { name: "white",  label: "白", hex: "#F5F5F5", digit: 9, multiplier: 1_000_000_000 },
  { name: "gold",   label: "金", hex: "#CFB53B", multiplier: 0.1, tolerance: 5 },
  { name: "silver", label: "银", hex: "#C0C0C0", multiplier: 0.01, tolerance: 10 },
];

/** 获取可用于数字环的颜色 (有 digit 属性) */
export function getDigitColors(): ColorInfo[] {
  return COLOR_DATA.filter((c) => c.digit !== undefined);
}

/** 获取可用于乘数环的颜色 (有 multiplier 属性) */
export function getMultiplierColors(): ColorInfo[] {
  return COLOR_DATA.filter((c) => c.multiplier !== undefined);
}

/** 获取可用于精度环的颜色 (有 tolerance 属性) */
export function getToleranceColors(): ColorInfo[] {
  return COLOR_DATA.filter((c) => c.tolerance !== undefined);
}

/** 获取可用于温度系数环的颜色 (有 tempCoeff 属性) */
export function getTempCoeffColors(): ColorInfo[] {
  return COLOR_DATA.filter((c) => c.tempCoeff !== undefined);
}

/** 根据颜色名称查找颜色信息 */
export function getColorByName(name: ColorName): ColorInfo {
  const found = COLOR_DATA.find((c) => c.name === name);
  if (!found) throw new Error(`Unknown color: ${name}`);
  return found;
}

/** 格式化电阻值 */
export function formatResistance(ohms: number): string {
  if (ohms >= 1_000_000_000) {
    return `${(ohms / 1_000_000_000).toFixed(ohms % 1_000_000_000 === 0 ? 0 : 2)} G\u03A9`;
  }
  if (ohms >= 1_000_000) {
    return `${(ohms / 1_000_000).toFixed(ohms % 1_000_000 === 0 ? 0 : 2)} M\u03A9`;
  }
  if (ohms >= 1_000) {
    return `${(ohms / 1_000).toFixed(ohms % 1_000 === 0 ? 0 : 2)} k\u03A9`;
  }
  if (ohms < 1) {
    return `${(ohms * 1000).toFixed(ohms * 1000 % 1 === 0 ? 0 : 2)} m\u03A9`;
  }
  return `${Number(ohms.toFixed(2))} \u03A9`;
}

/** 正向计算：色环颜色 → 阻值 */
export function calculateResistance(
  bands: ColorName[],
  bandCount: BandCount
): ResistorResult | null {
  if (bands.length < bandCount) return null;

  const colors = bands.map(getColorByName);

  let significantDigits: number;
  let multiplierIndex: number;
  let toleranceIndex: number;

  if (bandCount === 4) {
    significantDigits = (colors[0].digit ?? 0) * 10 + (colors[1].digit ?? 0);
    multiplierIndex = 2;
    toleranceIndex = 3;
  } else if (bandCount === 5) {
    significantDigits =
      (colors[0].digit ?? 0) * 100 +
      (colors[1].digit ?? 0) * 10 +
      (colors[2].digit ?? 0);
    multiplierIndex = 3;
    toleranceIndex = 4;
  } else {
    // 6 bands
    significantDigits =
      (colors[0].digit ?? 0) * 100 +
      (colors[1].digit ?? 0) * 10 +
      (colors[2].digit ?? 0);
    multiplierIndex = 3;
    toleranceIndex = 4;
  }

  const multiplier = colors[multiplierIndex].multiplier ?? 1;
  const tolerance = colors[toleranceIndex].tolerance ?? 20;
  const resistance = significantDigits * multiplier;

  const result: ResistorResult = {
    resistance,
    tolerance,
    formattedResistance: formatResistance(resistance),
    formattedTolerance: `\u00B1${tolerance}%`,
    minResistance: resistance * (1 - tolerance / 100),
    maxResistance: resistance * (1 + tolerance / 100),
  };

  if (bandCount === 6) {
    result.tempCoeff = colors[5].tempCoeff;
  }

  return result;
}

/** E24 标准阻值系列 (每十倍频内的 24 个值) */
const E24_VALUES = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0,
  3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1,
];

/** 生成完整 E24 阻值列表 (0.1 ohm 到 10G ohm) */
function generateE24Series(): number[] {
  const values: number[] = [];
  for (let decade = -1; decade <= 9; decade++) {
    const multiplier = Math.pow(10, decade);
    for (const base of E24_VALUES) {
      const value = base * multiplier;
      if (value >= 0.1 && value <= 10_000_000_000) {
        values.push(parseFloat(value.toPrecision(3)));
      }
    }
  }
  return values;
}

const E24_SERIES = generateE24Series();

/** 查找 E24 系列中最接近的标准阻值 */
export function findNearestE24(ohms: number): number {
  if (ohms <= 0) return E24_SERIES[0];

  let closest = E24_SERIES[0];
  let minDiff = Math.abs(ohms - closest);

  for (const val of E24_SERIES) {
    const diff = Math.abs(ohms - val);
    if (diff < minDiff) {
      minDiff = diff;
      closest = val;
    }
  }

  return closest;
}

/** 将阻值分解为有效数字和乘数 */
function decomposeResistance(
  ohms: number,
  digitCount: 2 | 3
): { digits: number; multiplier: number } | null {
  if (ohms <= 0) return null;

  // 找到合适的乘数
  const multipliers = COLOR_DATA
    .filter((c) => c.multiplier !== undefined)
    .map((c) => c.multiplier as number)
    .sort((a, b) => a - b);

  for (const mult of multipliers) {
    const digits = Math.round(ohms / mult);
    const minDigits = digitCount === 2 ? 10 : 100;
    const maxDigits = digitCount === 2 ? 99 : 999;

    if (digits >= minDigits && digits <= maxDigits) {
      // 验证计算回来是否接近
      if (Math.abs(digits * mult - ohms) / ohms < 0.001) {
        return { digits, multiplier: mult };
      }
    }
    // 特殊处理：digits 为 1-9 时 (单个数字的两位数意味着像 10-99)
    if (digitCount === 2 && digits >= 1 && digits <= 9 && mult >= 1) {
      // 不适用于两位模式
    }
  }

  return null;
}

/** 根据值查找对应颜色 */
function findDigitColor(digit: number): ColorName | null {
  const color = COLOR_DATA.find((c) => c.digit === digit);
  return color ? color.name : null;
}

function findMultiplierColor(multiplier: number): ColorName | null {
  const color = COLOR_DATA.find(
    (c) => c.multiplier !== undefined && Math.abs(c.multiplier - multiplier) < multiplier * 0.001
  );
  return color ? color.name : null;
}

/** 反向查询：阻值 → 色环颜色组合 */
export function reverseLookup(
  ohms: number,
  bandCount: BandCount = 4
): ReverseLookupResult | null {
  if (ohms <= 0) return null;

  const nearestE24 = findNearestE24(ohms);
  const targetOhms = nearestE24;

  const digitCount = bandCount === 4 ? 2 : 3;
  const decomposed = decomposeResistance(targetOhms, digitCount as 2 | 3);

  if (!decomposed) return null;

  const { digits, multiplier } = decomposed;
  const bands: ColorName[] = [];

  if (digitCount === 2) {
    const d1 = Math.floor(digits / 10);
    const d2 = digits % 10;
    const c1 = findDigitColor(d1);
    const c2 = findDigitColor(d2);
    if (!c1 || !c2) return null;
    bands.push(c1, c2);
  } else {
    const d1 = Math.floor(digits / 100);
    const d2 = Math.floor((digits % 100) / 10);
    const d3 = digits % 10;
    const c1 = findDigitColor(d1);
    const c2 = findDigitColor(d2);
    const c3 = findDigitColor(d3);
    if (!c1 || !c2 || !c3) return null;
    bands.push(c1, c2, c3);
  }

  const multColor = findMultiplierColor(multiplier);
  if (!multColor) return null;
  bands.push(multColor);

  // 默认精度：4环金(5%)，5/6环棕(1%)
  if (bandCount === 4) {
    bands.push("gold");
  } else {
    bands.push("brown");
  }

  // 6环加温度系数(棕 100ppm)
  if (bandCount === 6) {
    bands.push("brown");
  }

  return {
    bands,
    bandCount,
    exactMatch: Math.abs(ohms - nearestE24) < 0.001,
    nearestE24,
    formattedE24: formatResistance(nearestE24),
  };
}

/** 获取默认色环 */
export function getDefaultBands(bandCount: BandCount): ColorName[] {
  if (bandCount === 4) return ["brown", "black", "red", "gold"];
  if (bandCount === 5) return ["brown", "black", "black", "red", "brown"];
  return ["brown", "black", "black", "red", "brown", "brown"];
}
