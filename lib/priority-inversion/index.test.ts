import { describe, it, expect } from "vitest";
import { simulateSchedule, DEFAULT_TASKS } from "./index";
import type {
  SimulationConfig,
  TaskConfig,
} from "@/types/priority-inversion";

function makeConfig(
  overrides: Partial<SimulationConfig> = {},
  taskOverrides: Partial<Record<"high" | "mid" | "low", Partial<TaskConfig>>> = {}
): SimulationConfig {
  const tasks: TaskConfig[] = DEFAULT_TASKS.map((t) => {
    const o = taskOverrides[t.role];
    return o ? { ...t, ...o } : { ...t };
  });
  return {
    tasks,
    enablePriorityInheritance: false,
    simulationTime: 30,
    ...overrides,
  };
}

describe("simulateSchedule - basic preemption (no mutex)", () => {
  it("high preempts low when no mutex involved", () => {
    const config = makeConfig(
      {},
      {
        low: { holdsMutex: false, duration: 8 },
        high: { arrival: 3, duration: 3 },
        mid: { arrival: 100, duration: 1 }, // mid 不出现
      }
    );
    // 但 high 在仿真器里固定需要 mutex —— 没人持锁，所以可立即获取
    const r = simulateSchedule(config);
    // high 应在 arrival=3 立即开始，executes 3ms 完成于 t=6
    expect(r.finishTimes.high).toBe(6);
    // high 几乎无等待
    expect(r.waitTimes.high).toBe(0);
  });
});

describe("simulateSchedule - classic priority inversion (no PIP)", () => {
  it("mid preempts low while high blocked → high waits longer than mid duration", () => {
    const r = simulateSchedule(makeConfig({ enablePriorityInheritance: false }));
    // 经典反转：high 应等到 mid (6ms) 跑完且 low 释放锁后才能运行
    expect(r.waitTimes.high).toBeGreaterThan(6);
    // 事件日志应包含 high 阻塞
    expect(r.events.some((e) => e.type === "block" && e.role === "high")).toBe(
      true
    );
    // 不应有 inherit 事件
    expect(r.events.some((e) => e.type === "inherit")).toBe(false);
  });

  it("high finishes after both mid and low have effectively used CPU", () => {
    const r = simulateSchedule(makeConfig({ enablePriorityInheritance: false }));
    expect(r.finishTimes.high).not.toBeNull();
    expect(r.finishTimes.mid).not.toBeNull();
    // mid 完成早于 high（反转特征）
    expect(r.finishTimes.mid!).toBeLessThan(r.finishTimes.high!);
  });
});

describe("simulateSchedule - priority inheritance protocol (PIP on)", () => {
  it("low inherits high priority and blocks mid → high waits much less", () => {
    const r = simulateSchedule(makeConfig({ enablePriorityInheritance: true }));
    // PIP 修复后 high 等待时间应小于 mid 执行时长
    expect(r.waitTimes.high).toBeLessThan(6);
    // 应触发继承事件
    expect(
      r.events.some((e) => e.type === "inherit" && e.role === "low")
    ).toBe(true);
  });

  it("mutex release triggers low priority fallback event", () => {
    const r = simulateSchedule(makeConfig({ enablePriorityInheritance: true }));
    const inheritEvents = r.events.filter(
      (e) => e.type === "inherit" && e.role === "low"
    );
    // 至少 2 个 inherit 事件：一次提升、一次回落
    expect(inheritEvents.length).toBeGreaterThanOrEqual(2);
    // 应有 release 事件
    expect(r.events.some((e) => e.type === "release" && e.role === "low")).toBe(
      true
    );
  });
});

describe("simulateSchedule - PIP comparison", () => {
  it("PIP on yields strictly smaller high wait time than PIP off", () => {
    const off = simulateSchedule(
      makeConfig({ enablePriorityInheritance: false })
    );
    const on = simulateSchedule(
      makeConfig({ enablePriorityInheritance: true })
    );
    expect(on.waitTimes.high).toBeLessThan(off.waitTimes.high);
  });
});

describe("simulateSchedule - segments and finish bookkeeping", () => {
  it("produces non-overlapping segments covering only executed time", () => {
    const r = simulateSchedule(makeConfig());
    // 段按 start 排序后应不重叠
    const sorted = [...r.segments].sort((a, b) => a.start - b.start);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].start).toBeGreaterThanOrEqual(sorted[i - 1].end);
    }
    // 段总时长 = 三个任务 duration 之和（4 + 6 + 8 = 18）
    const totalRun = r.segments.reduce((sum, s) => sum + (s.end - s.start), 0);
    expect(totalRun).toBe(18);
  });
});
