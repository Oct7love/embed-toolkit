import { describe, it, expect } from "vitest";
import { calculateADC } from "./index";
import { CHIP_PRESETS } from "@/types/adc-calculator";

describe("calculateADC - basic", () => {
  it("F4 preset + 12 bit resolution: normal calculation", () => {
    const f4 = CHIP_PRESETS.stm32f4;
    const r = calculateADC({
      adcClock: f4.adcClock,
      sampleCycles: 3,
      conversionCycles: f4.conversionCycles,
      resolution: 12,
      channels: 1,
      dmaEnabled: false,
      vref: 3.3,
      dmaBufferMultiplier: 1,
    });
    expect(r.error).toBeUndefined();
    // (3 + 12) / 36MHz = 0.4167 us, rate = 2.4 MSPS
    expect(r.singleConvTime).toBeGreaterThan(0);
    expect(r.maxSampleRate).toBeGreaterThan(2_000_000);
    expect(r.lsbVoltage).toBeCloseTo(3.3 / 4096, 6);
  });

  it("F1 preset + 12 bit resolution: normal calculation", () => {
    const f1 = CHIP_PRESETS.stm32f1;
    const r = calculateADC({
      adcClock: f1.adcClock,
      sampleCycles: 1.5,
      conversionCycles: f1.conversionCycles,
      resolution: 12,
      channels: 4,
      dmaEnabled: true,
      vref: 3.3,
      dmaBufferMultiplier: 2,
    });
    expect(r.error).toBeUndefined();
    expect(r.singleConvTime).toBeCloseTo(14 / 14_000_000, 9);
    expect(r.totalScanTime).toBeCloseTo(4 * 14 / 14_000_000, 9);
    expect(r.dmaBufferSize).toBe(8); // channels × multiplier = 4×2
  });

  it("channels=0 returns error", () => {
    const r = calculateADC({
      adcClock: 14_000_000,
      sampleCycles: 1.5,
      conversionCycles: 12.5,
      resolution: 12,
      channels: 0,
      dmaEnabled: false,
      vref: 3.3,
      dmaBufferMultiplier: 1,
    });
    expect(r.error).toBeDefined();
    expect(r.error).toContain("通道数");
  });

  it("adcClock <= 0 returns error", () => {
    const r = calculateADC({
      adcClock: 0,
      sampleCycles: 1.5,
      conversionCycles: 12.5,
      resolution: 12,
      channels: 1,
      dmaEnabled: false,
      vref: 3.3,
      dmaBufferMultiplier: 1,
    });
    expect(r.error).toBeDefined();
    expect(r.error).toContain("时钟");
  });

  it("LSB voltage scales with resolution", () => {
    const base = {
      adcClock: 36_000_000,
      sampleCycles: 3,
      conversionCycles: 12,
      channels: 1,
      dmaEnabled: false,
      vref: 3.3,
      dmaBufferMultiplier: 1,
    };
    const r8 = calculateADC({ ...base, resolution: 8 });
    const r12 = calculateADC({ ...base, resolution: 12 });
    const r16 = calculateADC({ ...base, resolution: 16 });
    expect(r8.lsbVoltage).toBeCloseTo(3.3 / 256, 6);
    expect(r12.lsbVoltage).toBeCloseTo(3.3 / 4096, 6);
    expect(r16.lsbVoltage).toBeCloseTo(3.3 / 65536, 9);
  });
});

describe("CHIP_PRESETS.supportedResolutions", () => {
  it("F1 only supports 12-bit", () => {
    expect(CHIP_PRESETS.stm32f1.supportedResolutions).toEqual([12]);
  });

  it("F4 supports 8/10/12-bit (no 16-bit)", () => {
    expect(CHIP_PRESETS.stm32f4.supportedResolutions).toEqual([8, 10, 12]);
    expect(CHIP_PRESETS.stm32f4.supportedResolutions).not.toContain(16);
  });

  it("Custom supports all resolutions", () => {
    expect(CHIP_PRESETS.custom.supportedResolutions).toContain(16);
  });
});
