import { describe, it, expect } from "vitest";
import { calculateImpedance, solveWidth } from "./index";
import { MIL_TO_MM, milToMm, mmToMil } from "@/types/pcb-impedance";

/**
 * Reference values
 * ----------------
 * Each test cites both:
 *   • SI9000 — Polar Instruments' 2D field solver (industry reference).
 *   • IPC-2141 / Wadell — the closed-form formula this code implements.
 *
 * The two diverge by up to ~10% on microstrip when W/H > 1 (a documented
 * limitation of the IPC-2141 surface-microstrip equation). Tests therefore
 * use IPC-2141 outputs as the ground truth for assertions and note SI9000
 * for context. The ToolIntro warns users to use SI9000 for precision work.
 *
 * Hand-calculated reference table (FR-4, εr = 4.5, T = 1.4 mil):
 *
 *   Microstrip:
 *     W=7  H=5    -> ~52.0Ω   (IPC-2141)    | SI9000 ~ 56Ω
 *     W=10 H=5    -> ~41.4Ω   (IPC-2141)    | SI9000 ~ 50.3Ω
 *     W=17 H=10   -> ~49.5Ω   (IPC-2141)    | SI9000 ~ 52Ω
 *
 *   Stripline (H = total dielectric height between planes):
 *     W=6  H=20   -> ~51.3Ω   (IPC-2141)    | SI9000 ~ 50Ω
 *     W=8  H=20   -> ~44.8Ω   (IPC-2141)    | SI9000 ~ 45Ω
 *
 *   Differential (edge-coupled microstrip, Wadell approx):
 *     W=5 S=5  H=5  -> single ~63Ω, Zdiff ~99Ω (Wadell) | SI9000 ~100Ω
 */

describe("unit conversion", () => {
  it("1 mil = 0.0254 mm", () => {
    expect(milToMm(1)).toBeCloseTo(MIL_TO_MM, 10);
    expect(milToMm(10)).toBeCloseTo(0.254, 10);
  });

  it("mil <-> mm round-trip retains precision", () => {
    const original = 7.3;
    expect(mmToMil(milToMm(original))).toBeCloseTo(original, 10);
  });
});

describe("microstrip impedance", () => {
  // IPC-2141 closed-form: ~52Ω. SI9000 reports ~56Ω at this geometry.
  it("W=7mil T=1.4mil H=5mil er=4.5 -> Z0 ≈ 52Ω (IPC-2141 ±5%)", () => {
    const r = calculateImpedance("microstrip", {
      widthMm: milToMm(7),
      thicknessMm: milToMm(1.4),
      heightMm: milToMm(5),
      er: 4.5,
    });
    expect(r.z0).toBeGreaterThan(52 * 0.95);
    expect(r.z0).toBeLessThan(52 * 1.05);
    expect(r.epsEff).toBeGreaterThan(1);
    expect(r.epsEff).toBeLessThan(4.5);
    expect(r.propDelayPsPerInch).toBeGreaterThan(100);
    expect(r.propDelayPsPerInch).toBeLessThan(200);
  });

  // IPC-2141 closed-form: ~49.5Ω. SI9000 reports ~52Ω at this geometry.
  it("W=17mil T=1.4mil H=10mil er=4.5 -> Z0 ≈ 50Ω (IPC-2141 ±5%)", () => {
    const r = calculateImpedance("microstrip", {
      widthMm: milToMm(17),
      thicknessMm: milToMm(1.4),
      heightMm: milToMm(10),
      er: 4.5,
    });
    expect(r.z0).toBeGreaterThan(50 * 0.95);
    expect(r.z0).toBeLessThan(50 * 1.05);
  });

  // Wider trace -> lower Z0 (monotonic).
  it("wider W lowers Z0 (monotonic)", () => {
    const base = {
      thicknessMm: milToMm(1.4),
      heightMm: milToMm(5),
      er: 4.5,
    };
    const z1 = calculateImpedance("microstrip", { ...base, widthMm: milToMm(8) }).z0;
    const z2 = calculateImpedance("microstrip", { ...base, widthMm: milToMm(15) }).z0;
    expect(z1).toBeGreaterThan(z2);
  });
});

describe("stripline impedance", () => {
  // IPC-2141 closed-form: ~51.3Ω. SI9000 ~ 50Ω.
  it("W=6mil T=1.4mil H=20mil er=4.5 -> Z0 ≈ 51Ω (IPC-2141 ±5%)", () => {
    const r = calculateImpedance("stripline", {
      widthMm: milToMm(6),
      thicknessMm: milToMm(1.4),
      heightMm: milToMm(20),
      er: 4.5,
    });
    expect(r.z0).toBeGreaterThan(51 * 0.95);
    expect(r.z0).toBeLessThan(51 * 1.05);
    // Pure stripline: εeff equals εr.
    expect(r.epsEff).toBeCloseTo(4.5, 5);
  });
});

describe("differential pair impedance", () => {
  // Wadell closed-form Zdiff ≈ 99Ω. SI9000 ~ 100Ω.
  it("W=5 S=5 T=1.4 H=5 er=4.5 -> Zdiff ≈ 100Ω (Wadell ±10%)", () => {
    const r = calculateImpedance("diff", {
      widthMm: milToMm(5),
      spacingMm: milToMm(5),
      thicknessMm: milToMm(1.4),
      heightMm: milToMm(5),
      er: 4.5,
    });
    expect(r.zDiff).toBeDefined();
    expect(r.zDiff!).toBeGreaterThan(100 * 0.9);
    expect(r.zDiff!).toBeLessThan(100 * 1.1);
  });

  it("looser coupling (larger S) raises Zdiff toward 2*Z0", () => {
    const base = {
      widthMm: milToMm(5),
      thicknessMm: milToMm(1.4),
      heightMm: milToMm(5),
      er: 4.5,
    };
    const tight = calculateImpedance("diff", { ...base, spacingMm: milToMm(4) }).zDiff!;
    const loose = calculateImpedance("diff", { ...base, spacingMm: milToMm(50) }).zDiff!;
    const single = calculateImpedance("diff", { ...base, spacingMm: milToMm(50) }).z0;
    expect(loose).toBeGreaterThan(tight);
    expect(loose).toBeCloseTo(2 * single, 0);
  });
});

describe("solveWidth (reverse)", () => {
  it("microstrip target 50Ω, H=5 T=1.4 er=4.5 converges in <20 steps", () => {
    const r = solveWidth("microstrip", 50, {
      thicknessMm: milToMm(1.4),
      heightMm: milToMm(5),
      er: 4.5,
    });
    expect(r.converged).toBe(true);
    expect(r.iterations).toBeLessThan(20);
    const widthMil = mmToMil(r.widthMm);
    // For IPC-2141 with H=5, ~7-8 mil hits 50Ω.
    expect(widthMil).toBeGreaterThan(5);
    expect(widthMil).toBeLessThan(12);
    expect(Math.abs(r.achievedZ0 - 50)).toBeLessThan(0.5);
  });

  it("falls back to scan when target is unreachable in [3, 50] mil", () => {
    // 200Ω is unreachable: returns the closest width found via scan.
    const r = solveWidth("microstrip", 200, {
      thicknessMm: milToMm(1.4),
      heightMm: milToMm(5),
      er: 4.5,
    });
    expect(r.iterations).toBeGreaterThan(0);
    expect(r.widthMm).toBeGreaterThan(0);
    expect(typeof r.converged).toBe("boolean");
  });
});

describe("warnings (non-blocking)", () => {
  it("εr outside [2, 6] yields warning but still computes", () => {
    const r = calculateImpedance("microstrip", {
      widthMm: milToMm(10),
      thicknessMm: milToMm(1.4),
      heightMm: milToMm(5),
      er: 1.5,
    });
    expect(r.warnings.some((w) => w.includes("εr"))).toBe(true);
    expect(Number.isFinite(r.z0)).toBe(true);
  });

  it("W < 3 mil yields warning", () => {
    const r = calculateImpedance("microstrip", {
      widthMm: milToMm(2),
      thicknessMm: milToMm(1.4),
      heightMm: milToMm(5),
      er: 4.5,
    });
    expect(r.warnings.some((w) => w.includes("线宽"))).toBe(true);
  });

  it("T < 0.5 mil and H < 1 mil yield warnings", () => {
    const r = calculateImpedance("microstrip", {
      widthMm: milToMm(10),
      thicknessMm: milToMm(0.3),
      heightMm: milToMm(0.5),
      er: 4.5,
    });
    expect(r.warnings.length).toBeGreaterThanOrEqual(2);
  });
});

describe("purity & completeness", () => {
  it("calculateImpedance is pure (same input -> same output)", () => {
    const params = {
      widthMm: milToMm(10),
      thicknessMm: milToMm(1.4),
      heightMm: milToMm(5),
      er: 4.5,
    };
    const a = calculateImpedance("microstrip", params);
    const b = calculateImpedance("microstrip", params);
    expect(a.z0).toBe(b.z0);
    expect(a.epsEff).toBe(b.epsEff);
    expect(a.propDelayPsPerInch).toBe(b.propDelayPsPerInch);
  });

  it("result includes z0, epsEff, propDelayPsPerInch, warnings[]", () => {
    const r = calculateImpedance("microstrip", {
      widthMm: milToMm(10),
      thicknessMm: milToMm(1.4),
      heightMm: milToMm(5),
      er: 4.5,
    });
    expect(r.z0).toBeGreaterThan(0);
    expect(r.epsEff).toBeGreaterThan(0);
    expect(r.propDelayPsPerInch).toBeGreaterThan(0);
    expect(Array.isArray(r.warnings)).toBe(true);
  });
});
