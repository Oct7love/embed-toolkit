export interface RTOSTask {
  id: string;
  name: string;
  priority: number; // higher number = higher priority (FreeRTOS convention)
  period: number; // ms
  executionTime: number; // ms
  color: string;
}

export type TaskState = "running" | "ready" | "blocked";

export interface TimeSlot {
  taskId: string;
  start: number;
  end: number;
  state: TaskState;
}

export interface ScheduleResult {
  timeline: TimeSlot[];
  cpuUtilization: number;
  missedDeadlines: MissedDeadline[];
}

export interface MissedDeadline {
  taskId: string;
  taskName: string;
  deadline: number;
  completedAt: number | null;
}

export const DEFAULT_TASKS: RTOSTask[] = [
  {
    id: "task-1",
    name: "Task_High",
    priority: 3,
    period: 20,
    executionTime: 5,
    color: "#3B82F6",
  },
  {
    id: "task-2",
    name: "Task_Mid",
    priority: 2,
    period: 40,
    executionTime: 10,
    color: "#22C55E",
  },
  {
    id: "task-3",
    name: "Task_Low",
    priority: 1,
    period: 80,
    executionTime: 20,
    color: "#F97316",
  },
];

export const TASK_COLORS = [
  "#3B82F6",
  "#22C55E",
  "#F97316",
  "#A855F7",
  "#EF4444",
  "#06B6D4",
  "#F59E0B",
  "#EC4899",
];
