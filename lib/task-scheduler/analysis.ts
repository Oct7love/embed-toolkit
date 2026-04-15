import type { RTOSTask } from "@/types/task-scheduler";

/**
 * Compute theoretical CPU utilization as sum of (executionTime / period).
 * Returns value between 0 and 1+ (can exceed 1 if overloaded).
 */
export function computeCpuUtilization(tasks: RTOSTask[]): number {
  let utilization = 0;
  for (const task of tasks) {
    if (task.period > 0) {
      utilization += task.executionTime / task.period;
    }
  }
  return utilization;
}

/**
 * 判断当前任务集优先级分配是否符合 Rate-Monotonic（RM）——周期短的任务优先级高。
 * 仅在 RM 下 Liu & Layland 的充分条件 U ≤ n(2^(1/n)-1) 才有意义。
 */
export function isRateMonotonic(tasks: RTOSTask[]): boolean {
  const candidates = tasks.filter((t) => t.period > 0);
  if (candidates.length < 2) return true;
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const a = candidates[i];
      const b = candidates[j];
      // 周期短的优先级应更高（数值更大，FreeRTOS 约定）
      if (a.period < b.period && a.priority <= b.priority) return false;
      if (b.period < a.period && b.priority <= a.priority) return false;
    }
  }
  return true;
}

/**
 * Rate-Monotonic Analysis (RMA) schedulability sufficient condition:
 *   n * (2^(1/n) - 1)
 * 注意：这是 *充分非必要* 条件，且仅当优先级按 RM（周期短→优先级高）分配时才适用。
 * 用户自定义优先级时，不能据此断言可调度。
 */
export function checkSchedulability(tasks: RTOSTask[]): {
  utilization: number;
  rmBound: number;
  /** 充分条件成立（仅在 RM 优先级下有效） */
  rmSufficientMet: boolean;
  /** 当前任务集的优先级分配是否符合 RM */
  isRateMonotonic: boolean;
} {
  const n = tasks.filter((t) => t.period > 0).length;
  const utilization = computeCpuUtilization(tasks);
  const rmBound = n > 0 ? n * (Math.pow(2, 1 / n) - 1) : 0;

  return {
    utilization,
    rmBound,
    rmSufficientMet: utilization <= rmBound,
    isRateMonotonic: isRateMonotonic(tasks),
  };
}
