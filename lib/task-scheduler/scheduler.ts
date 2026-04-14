import type {
  RTOSTask,
  TimeSlot,
  ScheduleResult,
  MissedDeadline,
} from "@/types/task-scheduler";
import { computeCpuUtilization } from "./analysis";

interface TaskInstance {
  taskId: string;
  priority: number;
  remainingExec: number;
  releaseTime: number;
  deadline: number;
}

/**
 * Simulates FreeRTOS-style fixed-priority preemptive scheduling.
 *
 * Algorithm:
 *  - At each tick, check for newly released task instances.
 *  - Among all ready instances, the one with the highest priority runs.
 *  - A running task is preempted if a higher-priority task becomes ready.
 *  - A task instance that does not finish by its deadline is a missed deadline.
 */
export function simulateSchedule(
  tasks: RTOSTask[],
  simulationTime: number
): ScheduleResult {
  if (tasks.length === 0) {
    return { timeline: [], cpuUtilization: 0, missedDeadlines: [] };
  }

  const timeline: TimeSlot[] = [];
  const missedDeadlines: MissedDeadline[] = [];
  const readyQueue: TaskInstance[] = [];

  // Pre-compute all release events
  const releaseEvents: { time: number; task: RTOSTask }[] = [];
  for (const task of tasks) {
    if (task.period <= 0 || task.executionTime <= 0) continue;
    for (let t = 0; t < simulationTime; t += task.period) {
      releaseEvents.push({ time: t, task });
    }
  }
  releaseEvents.sort((a, b) => a.time - b.time);

  let currentRunning: TaskInstance | null = null;
  let currentSlotStart = 0;
  let eventIdx = 0;

  for (let t = 0; t < simulationTime; t++) {
    // Release new task instances at time t
    while (eventIdx < releaseEvents.length && releaseEvents[eventIdx].time === t) {
      const { task } = releaseEvents[eventIdx];
      readyQueue.push({
        taskId: task.id,
        priority: task.priority,
        remainingExec: task.executionTime,
        releaseTime: t,
        deadline: t + task.period,
      });
      eventIdx++;
    }

    // Check for missed deadlines (instances whose deadline has passed but still not done)
    for (let i = readyQueue.length - 1; i >= 0; i--) {
      const inst = readyQueue[i];
      if (inst.deadline <= t && inst.remainingExec > 0) {
        const taskDef = tasks.find((tk) => tk.id === inst.taskId);
        missedDeadlines.push({
          taskId: inst.taskId,
          taskName: taskDef?.name ?? inst.taskId,
          deadline: inst.deadline,
          completedAt: null,
        });
        readyQueue.splice(i, 1);
        // If this was the running task, stop it
        if (currentRunning === inst) {
          if (t > currentSlotStart) {
            timeline.push({
              taskId: inst.taskId,
              start: currentSlotStart,
              end: t,
              state: "running",
            });
          }
          currentRunning = null;
        }
      }
    }

    // Pick highest priority task from ready queue
    let highestPriority = -1;
    let candidate: TaskInstance | null = null;
    for (const inst of readyQueue) {
      if (inst.remainingExec > 0 && inst.priority > highestPriority) {
        highestPriority = inst.priority;
        candidate = inst;
      }
    }

    // Context switch check
    if (candidate !== currentRunning) {
      // Finish current running slot
      if (currentRunning && t > currentSlotStart) {
        timeline.push({
          taskId: currentRunning.taskId,
          start: currentSlotStart,
          end: t,
          state: "running",
        });
      }
      currentRunning = candidate;
      currentSlotStart = t;
    }

    // Execute one tick
    if (currentRunning) {
      currentRunning.remainingExec--;

      // Task finished
      if (currentRunning.remainingExec === 0) {
        timeline.push({
          taskId: currentRunning.taskId,
          start: currentSlotStart,
          end: t + 1,
          state: "running",
        });
        // Remove from ready queue
        const idx = readyQueue.indexOf(currentRunning);
        if (idx !== -1) readyQueue.splice(idx, 1);
        currentRunning = null;
        currentSlotStart = t + 1;
      }
    }
  }

  // Flush last running slot
  if (currentRunning && simulationTime > currentSlotStart) {
    timeline.push({
      taskId: currentRunning.taskId,
      start: currentSlotStart,
      end: simulationTime,
      state: "running",
    });
  }

  // Add "ready" slots for tasks that were waiting (not running) during their ready period
  const readySlots = computeReadySlots(tasks, timeline, simulationTime);
  timeline.push(...readySlots);

  // Sort by start time
  timeline.sort((a, b) => a.start - b.start || a.taskId.localeCompare(b.taskId));

  const cpuUtilization = computeCpuUtilization(tasks);

  return { timeline, cpuUtilization, missedDeadlines };
}

/**
 * Compute ready slots: periods where a task is released but not running.
 * A task is "ready" between its release and when it actually executes/completes.
 */
function computeReadySlots(
  tasks: RTOSTask[],
  runningSlots: TimeSlot[],
  simulationTime: number
): TimeSlot[] {
  const readySlots: TimeSlot[] = [];

  for (const task of tasks) {
    if (task.period <= 0 || task.executionTime <= 0) continue;

    // For each period instance
    for (let release = 0; release < simulationTime; release += task.period) {
      const deadline = Math.min(release + task.period, simulationTime);

      // Find all running slots for this task in this period
      const periodRunSlots = runningSlots.filter(
        (s) =>
          s.taskId === task.id &&
          s.state === "running" &&
          s.start < deadline &&
          s.end > release
      );

      // Calculate when the task finished in this period
      let totalRun = 0;
      for (const slot of periodRunSlots) {
        const slotStart = Math.max(slot.start, release);
        const slotEnd = Math.min(slot.end, deadline);
        totalRun += slotEnd - slotStart;
      }

      // Only mark ready if the task was released and has not yet been running
      if (totalRun > 0) {
        // Find gaps between release and running slots
        const sortedRuns = periodRunSlots
          .map((s) => ({
            start: Math.max(s.start, release),
            end: Math.min(s.end, deadline),
          }))
          .sort((a, b) => a.start - b.start);

        let cursor = release;
        for (const run of sortedRuns) {
          if (run.start > cursor) {
            readySlots.push({
              taskId: task.id,
              start: cursor,
              end: run.start,
              state: "ready",
            });
          }
          cursor = Math.max(cursor, run.end);
        }
      }
    }
  }

  return readySlots;
}
