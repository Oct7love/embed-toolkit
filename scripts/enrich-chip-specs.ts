/**
 * 一次性扩字段脚本：给 public/chips/index.json 每条 chip 追加 spec 字段。
 *
 * 设计原则：
 *  - 现有 6 字段（id/name/series/manufacturer/package/pinCount）保持不变（顺序、内容）
 *  - 新增字段统一追加在末尾：cpu / maxFreq / flashKB / ramKB / voltage / peripherals / features / priceRange
 *  - 缺数据填 null，绝不编造数字
 *  - peripherals 对象不允许整体省略；缺字段时所有子字段为 null
 *  - 可重入：再跑一次结果完全一致（hardcode → JSON.stringify 输出稳定）
 *
 * 数据来源：
 *  - STM32 系列：ST 官方 datasheet 摘要（DS5319 / DS8626 / DS12110 / DS12288 / DS11451 / DS10693）
 *  - ESP32 系列：Espressif 公开 datasheet
 *  - GD32/CH32/AT32：厂商公开 datasheet 摘要（与对标 STM 类似但需小心）
 *
 * 运行：npx tsx scripts/enrich-chip-specs.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface OldEntry {
  id: string;
  name: string;
  series: string;
  manufacturer: string;
  package: string;
  pinCount: number;
  // 既有的扩字段（如果脚本跑过会带）
  [k: string]: unknown;
}

type CpuArch =
  | "Cortex-M0"
  | "Cortex-M0+"
  | "Cortex-M3"
  | "Cortex-M4"
  | "Cortex-M7"
  | "Xtensa LX6"
  | "Xtensa LX7"
  | "RISC-V";

interface PeripheralCounts {
  uart: number | null;
  spi: number | null;
  i2c: number | null;
  can: number | null;
  usb: string | null;
  eth: boolean | null;
  adc: number | null;
  dac: number | null;
}

interface SpecPatch {
  cpu: CpuArch | null;
  maxFreq: number | null;
  flashKB: number | null;
  ramKB: number | null;
  voltage: { min: number; max: number } | null;
  peripherals: PeripheralCounts;
  features: string[];
  priceRange: "$" | "$$" | "$$$" | null;
}

const EMPTY_PERIPH: PeripheralCounts = {
  uart: null,
  spi: null,
  i2c: null,
  can: null,
  usb: null,
  eth: null,
  adc: null,
  dac: null,
};

function blankSpec(): SpecPatch {
  return {
    cpu: null,
    maxFreq: null,
    flashKB: null,
    ramKB: null,
    voltage: null,
    peripherals: { ...EMPTY_PERIPH },
    features: [],
    priceRange: null,
  };
}

/* ============== 主流芯片完整规格（手工核对） ============== */

const FULL_SPECS: Record<string, SpecPatch> = {
  // --- STM32F1 ---
  stm32f103c8t6: {
    cpu: "Cortex-M3",
    maxFreq: 72,
    flashKB: 64,
    ramKB: 20,
    voltage: { min: 2.0, max: 3.6 },
    peripherals: {
      uart: 3,
      spi: 2,
      i2c: 2,
      can: 1,
      usb: "FS",
      eth: false,
      adc: 2,
      dac: null,
    },
    features: ["USB-FS", "CAN"],
    priceRange: "$",
  },

  // --- STM32F4 ---
  stm32f407vgt6: {
    cpu: "Cortex-M4",
    maxFreq: 168,
    flashKB: 1024,
    ramKB: 192,
    voltage: { min: 1.8, max: 3.6 },
    peripherals: {
      uart: 6,
      spi: 3,
      i2c: 3,
      can: 2,
      usb: "OTG-HS",
      eth: true,
      adc: 3,
      dac: 2,
    },
    features: ["FPU", "DSP", "USB-OTG-HS", "Ethernet", "Camera-Interface"],
    priceRange: "$$",
  },

  // --- STM32H7 ---
  stm32h743vit6: {
    cpu: "Cortex-M7",
    maxFreq: 480,
    flashKB: 2048,
    ramKB: 1024,
    voltage: { min: 1.62, max: 3.6 },
    peripherals: {
      uart: 8,
      spi: 6,
      i2c: 4,
      can: 2,
      usb: "OTG-HS",
      eth: true,
      adc: 3,
      dac: 2,
    },
    features: ["FPU-DP", "DSP", "USB-OTG-HS", "Ethernet", "Cache", "Crypto"],
    priceRange: "$$$",
  },

  // --- STM32G4 ---
  stm32g431rbt6: {
    cpu: "Cortex-M4",
    maxFreq: 170,
    flashKB: 128,
    ramKB: 32,
    voltage: { min: 1.71, max: 3.6 },
    peripherals: {
      uart: 4,
      spi: 3,
      i2c: 3,
      can: 1,
      usb: "FS",
      eth: false,
      adc: 2,
      dac: 4,
    },
    features: ["FPU", "DSP", "Math-Accelerator", "HRTIM"],
    priceRange: "$$",
  },

  // --- STM32L4 ---
  stm32l476rgt6: {
    cpu: "Cortex-M4",
    maxFreq: 80,
    flashKB: 1024,
    ramKB: 128,
    voltage: { min: 1.71, max: 3.6 },
    peripherals: {
      uart: 5,
      spi: 3,
      i2c: 3,
      can: 1,
      usb: "FS",
      eth: false,
      adc: 3,
      dac: 2,
    },
    features: ["FPU", "DSP", "Low-Power", "LCD-Driver"],
    priceRange: "$$",
  },

  // --- ESP32 系列 ---
  "esp32-wroom-32": {
    cpu: "Xtensa LX6",
    maxFreq: 240,
    flashKB: 4096, // 模组 4MB SPI flash
    ramKB: 520,
    voltage: { min: 3.0, max: 3.6 },
    peripherals: {
      uart: 3,
      spi: 4,
      i2c: 2,
      can: 1,
      usb: null,
      eth: true, // EMAC
      adc: 2,
      dac: 2,
    },
    features: ["WiFi", "Bluetooth-Classic", "BLE", "Dual-Core"],
    priceRange: "$",
  },

  "esp32-s3": {
    cpu: "Xtensa LX7",
    maxFreq: 240,
    flashKB: null, // 取决于具体模组
    ramKB: 512,
    voltage: { min: 3.0, max: 3.6 },
    peripherals: {
      uart: 3,
      spi: 4,
      i2c: 2,
      can: 1,
      usb: "OTG-FS",
      eth: false,
      adc: 2,
      dac: null,
    },
    features: ["WiFi", "BLE-5", "Dual-Core", "AI-Acceleration"],
    priceRange: "$",
  },

  "esp32-c3": {
    cpu: "RISC-V",
    maxFreq: 160,
    flashKB: null,
    ramKB: 400,
    voltage: { min: 3.0, max: 3.6 },
    peripherals: {
      uart: 2,
      spi: 3,
      i2c: 1,
      can: 1,
      usb: "FS",
      eth: false,
      adc: 2,
      dac: null,
    },
    features: ["WiFi", "BLE-5", "Single-Core", "Low-Cost"],
    priceRange: "$",
  },

  // --- GigaDevice ---
  gd32f103c8t6: {
    cpu: "Cortex-M3",
    maxFreq: 108, // GD32 比 STM32F103 快 50%
    flashKB: 64,
    ramKB: 20,
    voltage: { min: 2.6, max: 3.6 },
    peripherals: {
      uart: 3,
      spi: 2,
      i2c: 2,
      can: 1,
      usb: "FS",
      eth: false,
      adc: 2,
      dac: null,
    },
    features: ["USB-FS", "CAN", "STM32F103-Compatible"],
    priceRange: "$",
  },
};

/* ============== 仅基础字段（CPU/主频/Flash/RAM）的次要芯片 ============== */

const BASIC_SPECS: Record<
  string,
  { cpu: CpuArch; maxFreq: number; flashKB: number | null; ramKB: number | null }
> = {
  // STM32F1 同系列
  stm32f103cbt6: { cpu: "Cortex-M3", maxFreq: 72, flashKB: 128, ramKB: 20 },
  stm32f103rbt6: { cpu: "Cortex-M3", maxFreq: 72, flashKB: 128, ramKB: 20 },
  stm32f103rct6: { cpu: "Cortex-M3", maxFreq: 72, flashKB: 256, ramKB: 48 },
  stm32f103ret6: { cpu: "Cortex-M3", maxFreq: 72, flashKB: 512, ramKB: 64 },
  stm32f103vct6: { cpu: "Cortex-M3", maxFreq: 72, flashKB: 256, ramKB: 48 },
  stm32f103vet6: { cpu: "Cortex-M3", maxFreq: 72, flashKB: 512, ramKB: 64 },
  stm32f103zct6: { cpu: "Cortex-M3", maxFreq: 72, flashKB: 256, ramKB: 48 },
  stm32f103zet6: { cpu: "Cortex-M3", maxFreq: 72, flashKB: 512, ramKB: 64 },
  stm32f103zgt6: { cpu: "Cortex-M3", maxFreq: 72, flashKB: 1024, ramKB: 96 },

  // STM32F4 同系列
  stm32f401ccu6: { cpu: "Cortex-M4", maxFreq: 84, flashKB: 256, ramKB: 64 },
  stm32f401ceu6: { cpu: "Cortex-M4", maxFreq: 84, flashKB: 512, ramKB: 96 },
  stm32f407vet6: { cpu: "Cortex-M4", maxFreq: 168, flashKB: 512, ramKB: 192 },
  stm32f407zet6: { cpu: "Cortex-M4", maxFreq: 168, flashKB: 512, ramKB: 192 },
  stm32f407zgt6: { cpu: "Cortex-M4", maxFreq: 168, flashKB: 1024, ramKB: 192 },
  stm32f411ceu6: { cpu: "Cortex-M4", maxFreq: 100, flashKB: 512, ramKB: 128 },
  stm32f411ret6: { cpu: "Cortex-M4", maxFreq: 100, flashKB: 512, ramKB: 128 },
  stm32f429zit6: { cpu: "Cortex-M4", maxFreq: 180, flashKB: 2048, ramKB: 256 },
  stm32f446ret6: { cpu: "Cortex-M4", maxFreq: 180, flashKB: 512, ramKB: 128 },

  // STM32H7 同系列
  stm32h743zit6: { cpu: "Cortex-M7", maxFreq: 480, flashKB: 2048, ramKB: 1024 },
  stm32h750vbt6: { cpu: "Cortex-M7", maxFreq: 480, flashKB: 128, ramKB: 1024 },
  stm32h723zet6: { cpu: "Cortex-M7", maxFreq: 550, flashKB: 512, ramKB: 564 },
  stm32h7a3zit6: { cpu: "Cortex-M7", maxFreq: 280, flashKB: 2048, ramKB: 1408 },

  // STM32G0 / G4
  stm32g030f6p6: { cpu: "Cortex-M0+", maxFreq: 64, flashKB: 32, ramKB: 8 },
  stm32g071rbt6: { cpu: "Cortex-M0+", maxFreq: 64, flashKB: 128, ramKB: 36 },
  stm32g474ret6: { cpu: "Cortex-M4", maxFreq: 170, flashKB: 512, ramKB: 128 },
  stm32g4a1ret6: { cpu: "Cortex-M4", maxFreq: 170, flashKB: 512, ramKB: 128 },

  // STM32L4
  stm32l431rct6: { cpu: "Cortex-M4", maxFreq: 80, flashKB: 256, ramKB: 64 },
  stm32l432kcu6: { cpu: "Cortex-M4", maxFreq: 80, flashKB: 256, ramKB: 64 },
  stm32l496zgt6: { cpu: "Cortex-M4", maxFreq: 80, flashKB: 1024, ramKB: 320 },
  stm32l4r5zit6: { cpu: "Cortex-M4", maxFreq: 120, flashKB: 2048, ramKB: 640 },

  // ESP32 其余
  "esp32-s2": { cpu: "Xtensa LX7", maxFreq: 240, flashKB: null, ramKB: 320 },
  "esp32-c6": { cpu: "RISC-V", maxFreq: 160, flashKB: null, ramKB: 512 },

  // 国产
  gd32f303cct6: { cpu: "Cortex-M4", maxFreq: 120, flashKB: 256, ramKB: 48 },
  ch32v307vct6: { cpu: "RISC-V", maxFreq: 144, flashKB: 256, ramKB: 64 },
  ch32v203c8t6: { cpu: "RISC-V", maxFreq: 144, flashKB: 64, ramKB: 20 },
  at32f403acgu7: { cpu: "Cortex-M4", maxFreq: 240, flashKB: 1024, ramKB: 224 },
};

function buildSpec(id: string): SpecPatch {
  if (FULL_SPECS[id]) return FULL_SPECS[id];
  const basic = BASIC_SPECS[id];
  if (basic) {
    return {
      cpu: basic.cpu,
      maxFreq: basic.maxFreq,
      flashKB: basic.flashKB,
      ramKB: basic.ramKB,
      voltage: null,
      peripherals: { ...EMPTY_PERIPH },
      features: [],
      priceRange: null,
    };
  }
  return blankSpec();
}

/* ============== 主流程 ============== */

const ROOT = join(__dirname, "..");
const INDEX_PATH = join(ROOT, "public", "chips", "index.json");

function main() {
  const raw = readFileSync(INDEX_PATH, "utf8");
  const data = JSON.parse(raw) as { chips: OldEntry[] };

  const enriched = data.chips.map((c) => {
    const spec = buildSpec(c.id);
    // 顺序：原 6 字段 → 新字段（保持稳定，可重入）
    return {
      id: c.id,
      name: c.name,
      series: c.series,
      manufacturer: c.manufacturer,
      package: c.package,
      pinCount: c.pinCount,
      cpu: spec.cpu,
      maxFreq: spec.maxFreq,
      flashKB: spec.flashKB,
      ramKB: spec.ramKB,
      voltage: spec.voltage,
      peripherals: spec.peripherals,
      features: spec.features,
      priceRange: spec.priceRange,
    };
  });

  const out = JSON.stringify({ chips: enriched }, null, 2) + "\n";
  writeFileSync(INDEX_PATH, out);

  const fullCount = enriched.filter((c) => FULL_SPECS[c.id]).length;
  const basicCount = enriched.filter(
    (c) => !FULL_SPECS[c.id] && BASIC_SPECS[c.id]
  ).length;
  const blankCount = enriched.length - fullCount - basicCount;

  console.log(`Wrote ${enriched.length} chips to ${INDEX_PATH}`);
  console.log(
    `  full spec: ${fullCount}, basic spec: ${basicCount}, blank: ${blankCount}`
  );
}

main();
