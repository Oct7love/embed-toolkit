/* ------------------------------------------------------------------ */
/*  MCU Compare — pure functions: diff / radar normalize / URL parse   */
/* ------------------------------------------------------------------ */
/*
 * DMIPS_PER_MHZ 系数来源：
 *   ARM Cortex 系列：ARM 官方产品页（Cortex-M0 / M0+ / M3 / M4 / M7 spec sheets）
 *   Espressif Xtensa LX6/LX7：ESP32/ESP32-S3 datasheet
 *   RISC-V：通用 RV32IMAC 平均估值（不同实现差异较大，仅作粗估）
 *
 * 数值仅用于雷达图 Performance 轴粗估（MHz × 系数），不做精确选型依据。
 */

import type {
  ChipEntry,
  FieldDiff,
  PeripheralCounts,
  RadarAxis,
  RadarPayload,
} from "@/types/mcu-compare";

export const MAX_COMPARE = 4;

export const DMIPS_PER_MHZ: Record<string, number> = {
  "Cortex-M0": 0.84,
  "Cortex-M0+": 0.93,
  "Cortex-M3": 1.25,
  "Cortex-M4": 1.25,
  "Cortex-M7": 2.14,
  "Xtensa LX6": 2.5,
  "Xtensa LX7": 2.6,
  "RISC-V": 1.6,
};

const RADAR_AXES: RadarAxis["axis"][] = [
  "Performance",
  "Flash",
  "RAM",
  "Peripherals",
];

/* =================== URL ids parsing =================== */

/**
 * 解析 URL `?ids=` 参数，返回去重 + 截断到 MAX_COMPARE 的合法 ID 列表。
 * - 空字符串 / null → 返回 []
 * - 多余空格、空 token 自动剔除
 * - 顺序保留首次出现位置
 */
export function parseUrlIds(input: string | null | undefined): string[] {
  if (!input) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input.split(",")) {
    const id = raw.trim();
    if (!id) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= MAX_COMPARE) break;
  }
  return out;
}

/** 用 ID 数组构建 URL ?ids= 参数值（不做截断校验，调用方先用 parseUrlIds 处理） */
export function serializeIds(ids: string[]): string {
  return ids.join(",");
}

/* =================== Performance estimation =================== */

/**
 * 估算 DMIPS：maxFreq (MHz) × DMIPS/MHz 系数。
 * cpu 或 maxFreq 缺失时返回 null。
 */
export function estimateDmips(chip: ChipEntry): number | null {
  if (!chip.cpu || chip.maxFreq == null) return null;
  const coef = DMIPS_PER_MHZ[chip.cpu];
  if (coef == null) return null;
  return chip.maxFreq * coef;
}

/**
 * 外设字段加权和（用于雷达图 Peripherals 轴）。
 * - 数字字段：取数值
 * - boolean true → 1, false → 0
 * - 字符串非空 → 1
 * - null → 不计入分母（避免缺数据导致整轴失真）
 *
 * 返回 null 表示所有字段都缺失。
 */
export function peripheralScore(p: PeripheralCounts): number | null {
  const parts: number[] = [];
  const push = (v: number | null) => {
    if (v != null) parts.push(v);
  };
  push(p.uart);
  push(p.spi);
  push(p.i2c);
  push(p.can);
  push(p.adc);
  push(p.dac);
  if (p.usb !== null) parts.push(p.usb === "" || p.usb === "false" ? 0 : 1);
  if (p.eth !== null) parts.push(p.eth ? 1 : 0);
  if (parts.length === 0) return null;
  return parts.reduce((a, b) => a + b, 0);
}

/* =================== Radar normalization =================== */

/**
 * 给一组 chip 计算雷达图数据。
 * 每轴归一到 0-100，参考最大值 = 参选 chip 中该轴的实际最大。
 * 缺值的 axis.value 为 null（UI 端用虚线/不连接渲染）。
 */
export function buildRadarPayloads(chips: ChipEntry[]): RadarPayload[] {
  if (chips.length === 0) return [];

  const rawByAxis: Record<RadarAxis["axis"], Array<number | null>> = {
    Performance: chips.map(estimateDmips),
    Flash: chips.map((c) => c.flashKB),
    RAM: chips.map((c) => c.ramKB),
    Peripherals: chips.map((c) => peripheralScore(c.peripherals)),
  };

  const maxByAxis: Record<RadarAxis["axis"], number> = {
    Performance: maxNonNull(rawByAxis.Performance),
    Flash: maxNonNull(rawByAxis.Flash),
    RAM: maxNonNull(rawByAxis.RAM),
    Peripherals: maxNonNull(rawByAxis.Peripherals),
  };

  return chips.map((chip, idx) => ({
    chipId: chip.id,
    chipName: chip.name,
    axes: RADAR_AXES.map((axis) => {
      const raw = rawByAxis[axis][idx];
      const max = maxByAxis[axis];
      const value =
        raw == null || max <= 0 ? null : Math.round((raw / max) * 100);
      return { axis, raw, value };
    }),
  }));
}

function maxNonNull(arr: Array<number | null>): number {
  let m = 0;
  for (const v of arr) if (v != null && v > m) m = v;
  return m;
}

/* =================== Field diff (compare table) =================== */

/** 用于差异表格的字段定义（除 features 外都按 deep equal 比较） */
const SCALAR_FIELDS: Array<keyof ChipEntry> = [
  "manufacturer",
  "series",
  "package",
  "pinCount",
  "cpu",
  "maxFreq",
  "flashKB",
  "ramKB",
  "priceRange",
];

/**
 * 计算多颗芯片在各字段上的差异。
 * - identical=true：所有值都相同（UI 可折叠或淡化）
 * - identical=false：高亮
 * - voltage / peripherals / features 用专门的 diff 处理
 */
export function diffChips(chips: ChipEntry[]): FieldDiff[] {
  if (chips.length === 0) return [];

  const out: FieldDiff[] = [];

  for (const f of SCALAR_FIELDS) {
    const values = chips.map((c) => {
      const v = c[f];
      if (v == null) return null;
      return typeof v === "object" ? JSON.stringify(v) : (v as string | number);
    });
    out.push({ field: f as string, values, identical: allEqual(values) });
  }

  // voltage 单独 diff
  const voltageStrs = chips.map((c) =>
    c.voltage ? `${c.voltage.min}-${c.voltage.max} V` : null
  );
  out.push({
    field: "voltage",
    values: voltageStrs,
    identical: allEqual(voltageStrs),
  });

  // peripherals 子字段展开
  const periphFields: Array<keyof PeripheralCounts> = [
    "uart",
    "spi",
    "i2c",
    "can",
    "usb",
    "eth",
    "adc",
    "dac",
  ];
  for (const pf of periphFields) {
    const values = chips.map((c) => {
      const v = c.peripherals?.[pf];
      if (v == null) return null;
      if (typeof v === "boolean") return v ? "Yes" : "No";
      return v as string | number;
    });
    out.push({
      field: `peripheral:${pf}`,
      values,
      identical: allEqual(values),
    });
  }

  // features 用排序后的 join 字符串比较
  const featuresStrs = chips.map((c) =>
    c.features && c.features.length > 0
      ? [...c.features].sort().join(",")
      : null
  );
  out.push({
    field: "features",
    values: featuresStrs,
    identical: allEqual(featuresStrs),
  });

  return out;
}

function allEqual<T>(arr: T[]): boolean {
  if (arr.length <= 1) return true;
  const first = arr[0];
  return arr.every((v) => v === first);
}

/* =================== Pair-wise diff (for tests/labels) =================== */

/**
 * 两两对比，返回不同字段的列表（only non-identical）。
 * 用于"两款芯片有 N 处差异"的提示。
 */
export function comparePair(a: ChipEntry, b: ChipEntry): FieldDiff[] {
  return diffChips([a, b]).filter((d) => !d.identical);
}

/* =================== Lookup helpers =================== */

/**
 * 按 ID 顺序查 chips。未匹配的 ID 自动跳过（不抛错）。
 */
export function pickChipsByIds(
  index: ChipEntry[],
  ids: string[]
): ChipEntry[] {
  const map = new Map(index.map((c) => [c.id, c]));
  const out: ChipEntry[] = [];
  for (const id of ids) {
    const c = map.get(id);
    if (c) out.push(c);
  }
  return out;
}
