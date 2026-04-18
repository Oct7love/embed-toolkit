/* ------------------------------------------------------------------ */
/*  MCU Compare — type definitions                                     */
/* ------------------------------------------------------------------ */

/** CPU 架构（用于雷达图 Performance 系数与 Badge 着色） */
export type CpuArch =
  | "Cortex-M0"
  | "Cortex-M0+"
  | "Cortex-M3"
  | "Cortex-M4"
  | "Cortex-M7"
  | "Xtensa LX6"
  | "Xtensa LX7"
  | "RISC-V";

/** 价位段（参考定位，非实时价格） */
export type PriceRange = "$" | "$$" | "$$$" | null;

/** 外设字段对象 — 任一字段缺失允许 null，但对象本身不可省略 */
export interface PeripheralCounts {
  uart: number | null;
  spi: number | null;
  i2c: number | null;
  can: number | null;
  /** USB 功能：null = 未收录，false = 无，"FS" / "HS" / "OTG-FS" / "OTG-HS" 等 */
  usb: string | null;
  /** 是否带 MAC 以太网 */
  eth: boolean | null;
  adc: number | null;
  dac: number | null;
}

/** 电压范围 */
export interface VoltageRange {
  min: number;
  max: number;
}

/**
 * 单条芯片的扩字段 spec（写入 public/chips/index.json 每条 chip 后追加）
 *
 * 现有 6 字段（id/name/series/manufacturer/package/pinCount）保持不动，
 * 下面这些追加在尾部。
 */
export interface ChipSpec {
  cpu: CpuArch | null;
  maxFreq: number | null; // MHz
  flashKB: number | null;
  ramKB: number | null;
  voltage: VoltageRange | null;
  /** 缺数据时必须整体为对象（每字段 null），不能省略整个对象 */
  peripherals: PeripheralCounts;
  features: string[]; // ["FPU", "DSP", "USB-OTG-HS", ...]
  priceRange: PriceRange;
}

/** index.json 中每条 chip 的完整 schema（旧 6 字段 + 新扩字段） */
export interface ChipEntry extends ChipSpec {
  id: string;
  name: string;
  series: string;
  manufacturer: string;
  package: string;
  pinCount: number;
}

/** 雷达图单轴（缺值轴 value 为 null） */
export interface RadarAxis {
  axis: "Performance" | "Flash" | "RAM" | "Peripherals";
  /** 0-100 归一化值，缺数据为 null */
  value: number | null;
  /** 原始值（用于 tooltip 显示），缺数据为 null */
  raw: number | null;
}

/** 一颗芯片在雷达图上的 4 轴数据 */
export interface RadarPayload {
  chipId: string;
  chipName: string;
  axes: RadarAxis[];
}

/** 字段差异（用于"差异表格"高亮） */
export interface FieldDiff {
  field: string;
  /** 各芯片在该字段的值（顺序与传入 chips 数组一致） */
  values: Array<string | number | null>;
  /** 是否所有值都相同 */
  identical: boolean;
}
