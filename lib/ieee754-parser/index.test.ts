import { describe, it, expect } from "vitest";
import {
  parseHexToIEEE754,
  hexToFloat,
  floatToHex,
} from "./index";

describe("hexToFloat - float32", () => {
  it("0x41200000 → 10.0 (Bug 1 regression: 0s not swallowed)", () => {
    expect(hexToFloat("41200000", "float32")).toBe(10.0);
    expect(hexToFloat("0x41200000", "float32")).toBe(10.0);
    expect(hexToFloat("41 20 00 00", "float32")).toBe(10.0);
  });

  it("0x00000000 → 0", () => {
    expect(hexToFloat("00000000", "float32")).toBe(0);
  });

  it("0x7F800000 → +Infinity", () => {
    expect(hexToFloat("7F800000", "float32")).toBe(Infinity);
  });

  it("0xFF800000 → -Infinity", () => {
    expect(hexToFloat("FF800000", "float32")).toBe(-Infinity);
  });

  it("0xFFC00000 → NaN", () => {
    const v = hexToFloat("FFC00000", "float32");
    expect(Number.isNaN(v)).toBe(true);
  });

  it("0xBF800000 → -1.0", () => {
    expect(hexToFloat("BF800000", "float32")).toBe(-1.0);
  });

  it("rejects too-short / too-long input", () => {
    expect(hexToFloat("41", "float32")).not.toBe(null); // padded OK
    expect(hexToFloat("412000000", "float32")).toBe(null); // too long
  });

  it("rejects non-hex characters", () => {
    expect(hexToFloat("41200G00", "float32")).toBe(null);
  });
});

describe("hexToFloat - float64", () => {
  it("0x4024000000000000 → 10.0", () => {
    expect(hexToFloat("4024000000000000", "float64")).toBe(10.0);
  });

  it("0x0000000000000000 → 0", () => {
    expect(hexToFloat("0000000000000000", "float64")).toBe(0);
  });
});

describe("parseHexToIEEE754 sign/exponent/mantissa breakdown", () => {
  it("0x40490FDB (≈π) decomposes correctly", () => {
    const r = parseHexToIEEE754("40490FDB", "float32");
    expect(r).not.toBeNull();
    expect(r!.sign).toBe(0);
    expect(Math.abs(r!.floatValue - Math.PI)).toBeLessThan(1e-6);
  });

  it("negative number has sign=1", () => {
    const r = parseHexToIEEE754("BF800000", "float32");
    expect(r!.sign).toBe(1);
  });

  it("detects special: NaN", () => {
    const r = parseHexToIEEE754("FFC00000", "float32");
    expect(r!.special).toBe("nan");
  });

  it("detects special: infinity", () => {
    const r = parseHexToIEEE754("7F800000", "float32");
    expect(r!.special).toBe("infinity");
  });
});

describe("floatToHex round-trip", () => {
  it("3.14 → hex → back to ≈3.14", () => {
    const h = floatToHex(3.14, "float32");
    const back = hexToFloat(h, "float32")!;
    expect(Math.abs(back - 3.14)).toBeLessThan(1e-5);
  });

  it("Infinity round-trips", () => {
    const h = floatToHex(Infinity, "float32");
    expect(hexToFloat(h, "float32")).toBe(Infinity);
  });
});
