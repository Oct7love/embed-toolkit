/** 任务角色 */
export type TaskRole = "high" | "mid" | "low";

/** 单个任务配置 */
export interface TaskConfig {
  /** 任务角色 */
  role: TaskRole;
  /** 显示名称 */
  name: string;
  /** 基础优先级（数字越大优先级越高） */
  priority: number;
  /** 到达时间（ms，第一次 ready 的时刻） */
  arrival: number;
  /** 执行时长（ms，CPU 执行总量） */
  duration: number;
  /**
   * 是否持锁；仅 low 角色可设为 true（制造反转场景），
   * high 任务固定需要 mutex（硬编码于仿真器），
   * mid 任务不使用 mutex
   */
  holdsMutex: boolean;
  /**
   * 持锁在执行期内的偏移（ms）：从开始执行算起第几 ms 获取锁
   * 仅 holdsMutex=true 生效
   */
  mutexAcquireOffset: number;
  /**
   * 持锁时长（ms）
   * 仅 holdsMutex=true 生效
   */
  mutexHoldDuration: number;
}

/** 仿真配置 */
export interface SimulationConfig {
  tasks: TaskConfig[];
  /** 是否启用优先级继承（PIP） */
  enablePriorityInheritance: boolean;
  /** 仿真总时长（ms） */
  simulationTime: number;
}

/** 单个 tick 的事件（只记录关键状态跃迁） */
export interface ScheduleEvent {
  time: number;
  type: "run" | "block" | "inherit" | "release" | "acquire" | "finish";
  /** 涉及的任务角色 */
  role: TaskRole;
  /** 人类可读描述 */
  message: string;
}

/** 任务在时间轴上的一段执行区间 */
export interface RunSegment {
  role: TaskRole;
  start: number;
  end: number;
  /** 该段是否持有 mutex */
  holdingMutex: boolean;
}

/** 仿真结果 */
export interface SimulationResult {
  /** 每个任务的执行段列表 */
  segments: RunSegment[];
  /** 关键事件日志 */
  events: ScheduleEvent[];
  /** 每个任务的等待时间（从 arrival 到 finish 减 duration） */
  waitTimes: Record<TaskRole, number>;
  /** 每个任务的完成时间（finish tick，未完成为 null） */
  finishTimes: Record<TaskRole, number | null>;
}
