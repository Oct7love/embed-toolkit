import { describe, it, expect } from "vitest";
import { convert, validateInput, batchConvert } from "./base-converter";

describe("validateInput", () => {
  it("accepts valid hex digits", () => {
    expect(validateInput("DEADBEEF", "hex")).toBeNull();
    expect(validateInput("0x1A2B", "hex")).toBeNull();
  });

  it("rejects invalid chars for each base", () => {
    expect(validateInput("G", "hex")).toMatch(/无效字符/);
    expect(validateInput("2", "bin")).toMatch(/无效字符/);
    expect(validateInput("8", "oct")).toMatch(/无效字符/);
    expect(validateInput("12A", "dec")).toMatch(/无效字符/);
  });

  it("rejects negative number in unsigned dec (Bug 2)", () => {
    expect(validateInput("-1", "dec", "unsigned")).toMatch(/无符号模式/);
  });

  it("accepts negative number in signed dec", () => {
    expect(validateInput("-1", "dec", "signed")).toBeNull();
  });

  it("returns null for empty input (no error)", () => {
    expect(validateInput("", "hex")).toBeNull();
    expect(validateInput("   ", "dec")).toBeNull();
  });
});

describe("convert - single value", () => {
  it("converts hex to all bases (32-bit unsigned)", () => {
    const r = convert("2A", "hex", 32, "unsigned");
    expect(r.error).toBeUndefined();
    expect(r.dec).toBe("42");
    expect(r.bin).toBe("0".repeat(26) + "101010");
    expect(r.oct).toBe("52");
  });

  it("handles -1 in signed 8-bit (rolls to 0xFF)", () => {
    const r = convert("-1", "dec", 8, "signed");
    expect(r.error).toBeUndefined();
    expect(r.hex).toBe("FF");
    expect(r.bin).toBe("11111111");
  });

  it("rejects out-of-range unsigned value", () => {
    const r = convert("256", "dec", 8, "unsigned");
    expect(r.error).toBeDefined();
  });

  it("does NOT crash on unsigned -1 (Bug 2 regression)", () => {
    const r = convert("-1", "dec", 32, "unsigned");
    expect(r.error).toBeDefined();
    // importantly, no throw
  });

  it("0x08000000 preserves all zeros (Bug 1 regression)", () => {
    const r = convert("08000000", "hex", 32, "unsigned");
    expect(r.hex).toBe("08000000");
    expect(r.dec).toBe("134217728");
  });

  it("batch converts multiple lines", () => {
    const results = batchConvert("2A\nFF\nGG", "hex", 8, "unsigned");
    expect(results).toHaveLength(3);
    expect(results[0].result.dec).toBe("42");
    expect(results[1].result.dec).toBe("255");
    expect(results[2].result.error).toBeDefined();
  });
});
