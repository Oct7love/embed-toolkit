import { describe, it, expect } from "vitest";
import {
  calculateFrequencies,
  checkViolations,
  generateCode,
  createDefaultConfig,
} from "./index";
import { getConstraintsById, getFlashLatency } from "./constraints";

describe("calculateFrequencies - F1", () => {
  it("default F1 config produces 72MHz SYSCLK", () => {
    const config = createDefaultConfig("stm32f1");
    const freqs = calculateFrequencies(config);
    // HSE 8MHz × 9 = 72MHz
    expect(freqs.sysclk).toBe(72_000_000);
    expect(freqs.ahb).toBe(72_000_000);
    expect(freqs.apb1).toBe(36_000_000); // /2
    expect(freqs.apb2).toBe(72_000_000); // /1
  });
});

describe("checkViolations", () => {
  it("default F1 config has no violations", () => {
    const config = createDefaultConfig("stm32f1");
    const freqs = calculateFrequencies(config);
    const constraints = getConstraintsById("stm32f1");
    const violations = checkViolations(freqs, constraints);
    expect(violations).toHaveLength(0);
  });

  it("F4 SYSCLK > 200MHz violates max", () => {
    const constraints = getConstraintsById("stm32f4");
    // Force a config that produces SYSCLK > 168MHz
    const freqs = {
      hsi: 16_000_000,
      hse: 8_000_000,
      pllInput: 1_000_000,
      pllOutput: 200_000_000,
      sysclk: 200_000_000,
      ahb: 200_000_000,
      apb1: 50_000_000,
      apb2: 100_000_000,
    };
    const violations = checkViolations(freqs, constraints);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations.some((v) => v.node === "SYSCLK")).toBe(true);
  });

  it("F4 PLLM=1 produces too-high PLL input → violation", () => {
    // F4 PLL input range is 1-2MHz, HSE 8MHz / PLLM=1 = 8MHz violates
    const config = createDefaultConfig("stm32f4");
    config.pll = { type: "f4", pllM: 1, pllN: 168, pllP: 2, pllQ: 7, pllSrc: "HSE" };
    const freqs = calculateFrequencies(config);
    const constraints = getConstraintsById("stm32f4");
    const violations = checkViolations(freqs, constraints);
    // PLL input = 8MHz / 1 = 8MHz, exceeds [1, 2]MHz range
    expect(violations.some((v) => v.node === "PLL Input")).toBe(true);
  });
});

describe("generateCode - violation enforcement", () => {
  it("returns error when violations exist", () => {
    const config = createDefaultConfig("stm32f4");
    const freqs = calculateFrequencies(config);
    const fakeViolations = [
      { node: "SYSCLK", actual: 200_000_000, max: 168_000_000, message: "test violation" },
    ];
    const result = generateCode(config, freqs, fakeViolations);
    expect(result.code).toBe("");
    expect(result.error).toContain("配置违规");
  });

  it("generates code when no violations", () => {
    const config = createDefaultConfig("stm32f1");
    const freqs = calculateFrequencies(config);
    const result = generateCode(config, freqs, []);
    expect(result.error).toBeUndefined();
    expect(result.code).toContain("SystemClock_Config");
    expect(result.code).toContain("HAL_RCC_OscConfig");
  });

  it("flash latency in code matches getFlashLatency", () => {
    const config = createDefaultConfig("stm32f4");
    const freqs = calculateFrequencies(config);
    const constraints = getConstraintsById("stm32f4");
    const expectedLatency = getFlashLatency(constraints, freqs.ahb);
    const result = generateCode(config, freqs, []);
    expect(result.code).toContain(`FLASH_LATENCY_${expectedLatency}`);
  });
});

describe("getFlashLatency", () => {
  it("F1 at 24MHz → 0 WS", () => {
    const c = getConstraintsById("stm32f1");
    expect(getFlashLatency(c, 24_000_000)).toBe(0);
  });

  it("F1 at 72MHz → 2 WS", () => {
    const c = getConstraintsById("stm32f1");
    expect(getFlashLatency(c, 72_000_000)).toBe(2);
  });

  it("F4 at 168MHz → 5 WS", () => {
    const c = getConstraintsById("stm32f4");
    expect(getFlashLatency(c, 168_000_000)).toBe(5);
  });

  it("H7 at 480MHz → 4 WS", () => {
    const c = getConstraintsById("stm32h7");
    expect(getFlashLatency(c, 480_000_000)).toBe(4);
  });
});
