import { describe, it, expect } from "vitest";
import { simulatePID, calculateMetrics } from "./index";
import type { PIDConfig } from "@/types/pid-simulator";

function makeConfig(overrides: Partial<PIDConfig> = {}): PIDConfig {
  return {
    kp: 2,
    ki: 1,
    kd: 0.1,
    setpoint: 100,
    initialValue: 0,
    simulationTime: 5,
    samplePeriod: 10,
    plantModel: "first-order",
    plantParams: { tau: 0.5, gain: 1 },
    ...overrides,
  };
}

describe("simulatePID", () => {
  it("default config produces data with correct length", () => {
    const r = simulatePID(makeConfig());
    // 5 seconds / 0.01s step = 500 steps + 1
    expect(r.data.length).toBe(501);
    expect(r.data[0].time).toBe(0);
    expect(r.data[0].processVariable).toBe(0);
  });

  it("first-order system approaches setpoint", () => {
    const r = simulatePID(makeConfig());
    const lastPv = r.data[r.data.length - 1].processVariable;
    expect(lastPv).toBeGreaterThan(90);
    expect(lastPv).toBeLessThan(110);
  });

  it("second-order system with reasonable params doesn't blow up", () => {
    const r = simulatePID(makeConfig({
      plantModel: "second-order",
      plantParams: { wn: 10, zeta: 0.5, gain: 1 },
    }));
    const maxPv = Math.max(...r.data.map((p) => p.processVariable));
    expect(maxPv).toBeLessThan(1000);
    expect(maxPv).toBeGreaterThan(50);
  });

  it("integrator accumulates correctly", () => {
    const r = simulatePID(makeConfig({
      kp: 1,
      ki: 0,
      kd: 0,
      plantModel: "integrator",
      plantParams: { gain: 1 },
      simulationTime: 1,
    }));
    // With pure P control on integrator, output ramps up
    expect(r.data[r.data.length - 1].processVariable).toBeGreaterThan(0);
  });
});

describe("calculateMetrics - settlingTime", () => {
  it("returns Infinity for unconverged system (Fix B)", () => {
    const r = simulatePID(makeConfig({
      kp: 0.01,
      ki: 0,
      kd: 0,
      simulationTime: 2,
    }));
    // Kp=0.01 is too weak — system barely moves from 0
    expect(r.metrics.settlingTime).toBe(Infinity);
  });

  it("returns finite time for well-tuned system", () => {
    // Use gentle gains + slow system to guarantee convergence
    const r = simulatePID(makeConfig({
      kp: 2,
      ki: 1,
      kd: 0.1,
      plantParams: { tau: 0.5, gain: 1 },
      simulationTime: 20, // longer to ensure settling
    }));
    expect(r.metrics.settlingTime).toBeLessThan(20);
    expect(r.metrics.settlingTime).toBeGreaterThan(0);
  });

  it("setpoint=0 uses absolute tolerance", () => {
    const metrics = calculateMetrics(
      [{ time: 0, setpoint: 0, processVariable: 0, error: 0, controlOutput: 0 }],
      0
    );
    expect(metrics.settlingTime).toBe(0);
  });
});
