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
 * Rate-Monotonic Analysis (RMA) schedulability bound:
 *   n * (2^(1/n) - 1)
 * For n tasks, if total utilization <= this bound, the task set is
 * guaranteed schedulable under rate-monotonic (and thus under
 * fixed-priority preemptive scheduling when priorities are assigned
 * by rate-monotonic order).
 */
export function checkSchedulability(tasks: RTOSTask[]): {
  utilization: number;
  rmBound: number;
  isGuaranteed: boolean;
} {
  const n = tasks.filter((t) => t.period > 0).length;
  const utilization = computeCpuUtilization(tasks);
  const rmBound = n > 0 ? n * (Math.pow(2, 1 / n) - 1) : 0;

  return {
    utilization,
    rmBound,
    isGuaranteed: utilization <= rmBound,
  };
}
