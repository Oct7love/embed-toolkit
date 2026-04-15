import { describe, it, expect } from "vitest";
import { simulateSchedule } from "./scheduler";
import { checkSchedulability, isRateMonotonic } from "./analysis";
import type { RTOSTask } from "@/types/task-scheduler";

function task(overrides: Partial<RTOSTask>): RTOSTask {
  return {
    id: overrides.id ?? "t",
    name: overrides.name ?? "T",
    priority: overrides.priority ?? 1,
    period: overrides.period ?? 100,
    executionTime: overrides.executionTime ?? 10,
    color: overrides.color ?? "#3b82f6",
  };
}

describe("simulateSchedule - basic", () => {
  it("single task runs to completion each period", () => {
    const r = simulateSchedule([task({ id: "t1", period: 10, executionTime: 3 })], 30);
    const running = r.timeline.filter((s) => s.state === "running" && s.taskId === "t1");
    const totalRun = running.reduce((a, s) => a + (s.end - s.start), 0);
    expect(totalRun).toBe(9); // 3 per period × 3 periods
    expect(r.missedDeadlines).toHaveLength(0);
  });

  it("higher priority preempts lower priority", () => {
    const tasks = [
      task({ id: "low", priority: 1, period: 100, executionTime: 50 }),
      task({ id: "high", priority: 5, period: 20, executionTime: 5 }),
    ];
    const r = simulateSchedule(tasks, 40);
    // high priority should run in its period regardless of low priority state
    const highRuns = r.timeline.filter((s) => s.state === "running" && s.taskId === "high");
    expect(highRuns.length).toBeGreaterThan(0);
    const highTotal = highRuns.reduce((a, s) => a + (s.end - s.start), 0);
    expect(highTotal).toBeGreaterThanOrEqual(5);
  });

  it("detects missed deadline when CPU overloaded", () => {
    const tasks = [
      task({ id: "a", priority: 1, period: 10, executionTime: 15 }),
    ];
    const r = simulateSchedule(tasks, 30);
    expect(r.missedDeadlines.length).toBeGreaterThan(0);
  });

  it("records unfinished instance at simulation end (Bug 5 regression)", () => {
    // Execution time larger than remaining simulation → unfinished at end
    const tasks = [task({ id: "x", priority: 1, period: 200, executionTime: 50 })];
    // Sim = 20, instance released at 0, deadline 200, but only 20ms run
    const r = simulateSchedule(tasks, 20);
    // At t=20 the instance isn't done yet but deadline hasn't passed either;
    // our new code records it in missedDeadlines with completedAt: null
    expect(r.missedDeadlines.some((m) => m.taskId === "x")).toBe(true);
  });

  it("empty task list returns empty result", () => {
    const r = simulateSchedule([], 100);
    expect(r.timeline).toEqual([]);
    expect(r.missedDeadlines).toEqual([]);
  });
});

describe("checkSchedulability", () => {
  it("returns rmSufficientMet true for low utilization under RM", () => {
    const tasks = [
      task({ id: "a", priority: 2, period: 10, executionTime: 2 }),
      task({ id: "b", priority: 1, period: 100, executionTime: 5 }),
    ];
    const r = checkSchedulability(tasks);
    expect(r.utilization).toBeCloseTo(0.25, 2);
    expect(r.rmSufficientMet).toBe(true);
    expect(r.isRateMonotonic).toBe(true);
  });

  it("rejects RM when shorter-period task has lower priority", () => {
    const tasks = [
      task({ id: "a", priority: 1, period: 10, executionTime: 2 }),
      task({ id: "b", priority: 5, period: 100, executionTime: 5 }),
    ];
    expect(isRateMonotonic(tasks)).toBe(false);
  });

  it("returns isRateMonotonic true for single task", () => {
    expect(isRateMonotonic([task({})])).toBe(true);
  });
});
