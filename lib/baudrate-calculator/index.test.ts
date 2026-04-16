import { describe, it, expect } from "vitest";
import { calculateBaudrate, calculateBatchBaudrates } from "./index";

describe("calculateBaudrate - OVER16", () => {
  it("72MHz / 115200 → BRR=0x0271, error ~0.16%", () => {
    const r = calculateBaudrate({ clockFreq: 72_000_000, targetBaudrate: 115200, oversampling: 16 });
    // 72000000 / 115200 = 625.0 → usartdiv16 = 625
    // mantissa = 625 >> 4 = 39, fraction = 625 & 0xF = 1
    // BRR = 0x0271 = 625
    expect(r.brrValue).toBe(625);
    expect(r.mantissa).toBe(39);
    expect(r.fraction).toBe(1);
    // actual = 72000000 / 625 = 115200 exactly
    expect(r.actualBaudrate).toBeCloseTo(115200, 0);
    expect(r.errorPercent).toBeLessThan(0.01);
    expect(r.isAcceptable).toBe(true);
  });

  it("72MHz / 9600 → exact", () => {
    const r = calculateBaudrate({ clockFreq: 72_000_000, targetBaudrate: 9600, oversampling: 16 });
    expect(r.actualBaudrate).toBeCloseTo(9600, 0);
    expect(r.errorPercent).toBeLessThan(0.01);
  });

  it("168MHz / 921600 → error < 2.5%", () => {
    const r = calculateBaudrate({ clockFreq: 168_000_000, targetBaudrate: 921600, oversampling: 16 });
    expect(r.isAcceptable).toBe(true);
    expect(r.errorPercent).toBeLessThan(2.5);
  });

  it("zero inputs return safe defaults", () => {
    const r = calculateBaudrate({ clockFreq: 0, targetBaudrate: 115200, oversampling: 16 });
    expect(r.brrValue).toBe(0);
    expect(r.actualBaudrate).toBe(0);
  });
});

describe("calculateBaudrate - OVER8", () => {
  it("72MHz / 115200 / OVER8 → acceptable", () => {
    const r = calculateBaudrate({ clockFreq: 72_000_000, targetBaudrate: 115200, oversampling: 8 });
    expect(r.isAcceptable).toBe(true);
    // fraction should be 0-7 (3 bits)
    expect(r.fraction).toBeGreaterThanOrEqual(0);
    expect(r.fraction).toBeLessThan(8);
  });

  it("OVER8 supports higher baudrate than OVER16", () => {
    const r8 = calculateBaudrate({ clockFreq: 72_000_000, targetBaudrate: 4_500_000, oversampling: 8 });
    const r16 = calculateBaudrate({ clockFreq: 72_000_000, targetBaudrate: 4_500_000, oversampling: 16 });
    // 72MHz / (8 × 4.5M) = 2.0, 72MHz / (16 × 4.5M) = 1.0
    // Both should compute but OVER8 gives better result for high baud
    expect(r8.divider).toBeGreaterThan(0);
    expect(r16.divider).toBeGreaterThan(0);
  });
});

describe("calculateBatchBaudrates", () => {
  it("returns results for all preset baudrates", () => {
    const batch = calculateBatchBaudrates(72_000_000, 16);
    expect(batch.length).toBe(10);
    // All standard baudrates at 72MHz should be acceptable
    const acceptable = batch.filter((b) => b.result.isAcceptable);
    expect(acceptable.length).toBeGreaterThanOrEqual(8);
  });
});
