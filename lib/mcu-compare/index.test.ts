import { describe, it, expect } from "vitest";
import {
  parseUrlIds,
  serializeIds,
  estimateDmips,
  peripheralScore,
  buildRadarPayloads,
  diffChips,
  comparePair,
  pickChipsByIds,
  MAX_COMPARE,
  DMIPS_PER_MHZ,
} from "./index";
import type { ChipEntry, PeripheralCounts } from "@/types/mcu-compare";

/* ---------------- Fixtures ---------------- */

const emptyPeriph: PeripheralCounts = {
  uart: null,
  spi: null,
  i2c: null,
  can: null,
  usb: null,
  eth: null,
  adc: null,
  dac: null,
};

function fixture(overrides: Partial<ChipEntry> = {}): ChipEntry {
  return {
    id: "test-chip",
    name: "Test Chip",
    series: "test",
    manufacturer: "ST",
    package: "LQFP48",
    pinCount: 48,
    cpu: "Cortex-M3",
    maxFreq: 72,
    flashKB: 64,
    ramKB: 20,
    voltage: { min: 2.0, max: 3.6 },
    peripherals: { ...emptyPeriph, uart: 3, spi: 2, i2c: 2, can: 1, usb: "FS" },
    features: ["DSP"],
    priceRange: "$",
    ...overrides,
  };
}

const f103 = fixture({
  id: "stm32f103c8t6",
  name: "STM32F103C8T6",
  series: "stm32f1",
  cpu: "Cortex-M3",
  maxFreq: 72,
  flashKB: 64,
  ramKB: 20,
  features: [],
  peripherals: {
    ...emptyPeriph,
    uart: 3,
    spi: 2,
    i2c: 2,
    can: 1,
    usb: "FS",
  },
});

const f407 = fixture({
  id: "stm32f407vgt6",
  name: "STM32F407VGT6",
  series: "stm32f4",
  package: "LQFP100",
  pinCount: 100,
  cpu: "Cortex-M4",
  maxFreq: 168,
  flashKB: 1024,
  ramKB: 192,
  voltage: { min: 1.8, max: 3.6 },
  peripherals: {
    ...emptyPeriph,
    uart: 6,
    spi: 3,
    i2c: 3,
    can: 2,
    usb: "OTG-HS",
    eth: true,
    adc: 3,
    dac: 2,
  },
  features: ["FPU", "DSP", "USB-OTG-HS", "Ethernet"],
  priceRange: "$$",
});

/* ---------------- Tests ---------------- */

describe("parseUrlIds", () => {
  it("returns empty for null/empty", () => {
    expect(parseUrlIds(null)).toEqual([]);
    expect(parseUrlIds(undefined)).toEqual([]);
    expect(parseUrlIds("")).toEqual([]);
    expect(parseUrlIds("   ")).toEqual([]);
  });

  it("splits comma-separated ids and trims whitespace", () => {
    expect(parseUrlIds("a,b , c")).toEqual(["a", "b", "c"]);
  });

  it("dedupes while preserving first occurrence order", () => {
    expect(parseUrlIds("a,b,a,c,b")).toEqual(["a", "b", "c"]);
  });

  it(`caps to MAX_COMPARE (${MAX_COMPARE}) entries`, () => {
    const ids = ["a", "b", "c", "d", "e", "f"];
    expect(parseUrlIds(ids.join(","))).toHaveLength(MAX_COMPARE);
    expect(parseUrlIds(ids.join(","))).toEqual(ids.slice(0, MAX_COMPARE));
  });

  it("filters out empty tokens (e.g. trailing commas)", () => {
    expect(parseUrlIds(",,a,,b,")).toEqual(["a", "b"]);
  });

  it("serializeIds round-trips", () => {
    const ids = ["x", "y", "z"];
    expect(parseUrlIds(serializeIds(ids))).toEqual(ids);
  });
});

describe("estimateDmips", () => {
  it("multiplies maxFreq by DMIPS_PER_MHZ coefficient", () => {
    expect(estimateDmips(f103)).toBeCloseTo(72 * DMIPS_PER_MHZ["Cortex-M3"]);
    expect(estimateDmips(f407)).toBeCloseTo(168 * DMIPS_PER_MHZ["Cortex-M4"]);
  });

  it("returns null when cpu is missing", () => {
    expect(estimateDmips(fixture({ cpu: null }))).toBeNull();
  });

  it("returns null when maxFreq is missing", () => {
    expect(estimateDmips(fixture({ maxFreq: null }))).toBeNull();
  });
});

describe("peripheralScore", () => {
  it("sums numeric counts and boolean/string flags", () => {
    const score = peripheralScore({
      ...emptyPeriph,
      uart: 3,
      spi: 2,
      i2c: 2,
      can: 1,
      usb: "FS",
      eth: false,
      adc: 1,
      dac: 0,
    });
    expect(score).toBe(3 + 2 + 2 + 1 + 1 /*usb*/ + 0 /*eth*/ + 1 + 0);
  });

  it("returns null when all fields missing", () => {
    expect(peripheralScore(emptyPeriph)).toBeNull();
  });
});

describe("buildRadarPayloads", () => {
  it("normalizes each axis to 0-100 with max from selected chips", () => {
    const payloads = buildRadarPayloads([f103, f407]);
    expect(payloads).toHaveLength(2);
    // F407 应该在所有轴上接近 100（它每项都更大）
    const f407Axes = payloads[1].axes;
    for (const a of f407Axes) {
      expect(a.value).toBe(100);
    }
    // F103 应在所有轴 < 100
    const f103Axes = payloads[0].axes;
    for (const a of f103Axes) {
      expect(a.value).not.toBeNull();
      expect(a.value!).toBeLessThan(100);
      expect(a.value!).toBeGreaterThanOrEqual(0);
    }
  });

  it("returns null axis values when chip lacks data (no fabrication)", () => {
    const naked = fixture({
      id: "naked",
      cpu: null,
      maxFreq: null,
      flashKB: null,
      ramKB: null,
      peripherals: emptyPeriph,
    });
    const payloads = buildRadarPayloads([naked, f407]);
    const nakedAxes = payloads[0].axes;
    for (const a of nakedAxes) {
      expect(a.value).toBeNull();
      expect(a.raw).toBeNull();
    }
  });

  it("returns [] for empty input", () => {
    expect(buildRadarPayloads([])).toEqual([]);
  });
});

describe("diffChips", () => {
  it("flags scalar differences (cpu / maxFreq / flashKB)", () => {
    const diffs = diffChips([f103, f407]);
    const cpu = diffs.find((d) => d.field === "cpu");
    const maxFreq = diffs.find((d) => d.field === "maxFreq");
    const flash = diffs.find((d) => d.field === "flashKB");
    expect(cpu?.identical).toBe(false);
    expect(maxFreq?.identical).toBe(false);
    expect(flash?.identical).toBe(false);
  });

  it("marks identical fields when values match across chips", () => {
    const diffs = diffChips([f103, fixture({ ...f103, id: "clone" })]);
    const cpu = diffs.find((d) => d.field === "cpu");
    expect(cpu?.identical).toBe(true);
  });

  it("expands peripherals into per-field rows", () => {
    const diffs = diffChips([f103, f407]);
    expect(diffs.find((d) => d.field === "peripheral:uart")).toBeDefined();
    expect(diffs.find((d) => d.field === "peripheral:eth")).toBeDefined();
  });

  it("features field tracks set difference", () => {
    const diffs = diffChips([f103, f407]);
    const feat = diffs.find((d) => d.field === "features");
    expect(feat?.identical).toBe(false);
  });

  it("comparePair returns only non-identical fields", () => {
    const same = fixture({ id: "clone" });
    const diffs = comparePair(fixture(), same);
    expect(diffs.every((d) => !d.identical)).toBe(true);
    // 完全相同的两颗芯片，差异列表应为空
    expect(diffs).toHaveLength(0);
  });
});

describe("pickChipsByIds", () => {
  it("returns chips in the order of requested ids", () => {
    const out = pickChipsByIds([f103, f407], ["stm32f407vgt6", "stm32f103c8t6"]);
    expect(out.map((c) => c.id)).toEqual(["stm32f407vgt6", "stm32f103c8t6"]);
  });

  it("silently skips ids not in the index", () => {
    const out = pickChipsByIds([f103, f407], ["does-not-exist", "stm32f103c8t6"]);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("stm32f103c8t6");
  });
});

describe("priceRange handling", () => {
  it("treats null priceRange as identical missing across chips", () => {
    const a = fixture({ id: "a", priceRange: null });
    const b = fixture({ id: "b", priceRange: null });
    const diffs = diffChips([a, b]);
    const price = diffs.find((d) => d.field === "priceRange");
    expect(price?.identical).toBe(true);
    expect(price?.values).toEqual([null, null]);
  });
});
