import type {
  SimulationConfig,
  SimulationResult,
  ScheduleEvent,
  RunSegment,
  TaskRole,
  TaskConfig,
} from "@/types/priority-inversion";

/** 任务运行时状态 */
interface TaskState {
  config: TaskConfig;
  /** 已执行 ms 数（CPU 时间） */
  executed: number;
  /** 当前是否持有 mutex */
  holdingMutex: boolean;
  /** 是否已完成 */
  finished: boolean;
  /** 完成时刻 */
  finishedAt: number | null;
  /** 当前生效优先级（含继承） */
  effectivePriority: number;
}

/**
 * 仿真优先级反转（Priority Inversion）调度。
 *
 * 假设：
 *  - High 任务在其整个执行期内都需要持有共享 mutex
 *  - Low 任务可选择性持锁，持锁窗口由 mutexAcquireOffset/mutexHoldDuration 决定
 *  - Mid 任务不使用 mutex，仅按优先级抢占
 *
 * PIP（优先级继承协议）：
 *  - 当 high 想获取 mutex 但锁被 low 持有时，low 的生效优先级临时提升到 high 的优先级
 *  - low 释放锁后立即恢复基础优先级
 */
export function simulateSchedule(config: SimulationConfig): SimulationResult {
  const states: Record<TaskRole, TaskState | undefined> = {
    high: undefined,
    mid: undefined,
    low: undefined,
  };

  for (const t of config.tasks) {
    states[t.role] = {
      config: t,
      executed: 0,
      holdingMutex: false,
      finished: false,
      finishedAt: null,
      effectivePriority: t.priority,
    };
  }

  const events: ScheduleEvent[] = [];
  const segments: RunSegment[] = [];
  let currentSegment: RunSegment | null = null;

  /** 当前持锁者 */
  let mutexHolder: TaskRole | null = null;
  /** 上一 tick 是否记录过 high 阻塞事件（去重） */
  let highBlockedLogged = false;
  /** 上一 tick 是否已记录继承事件 */
  let inheritLogged = false;

  const pushEvent = (e: ScheduleEvent) => events.push(e);

  const closeSegmentAt = (t: number) => {
    if (currentSegment && t > currentSegment.start) {
      currentSegment.end = t;
      segments.push(currentSegment);
    }
    currentSegment = null;
  };

  const ticks = Math.max(1, Math.floor(config.simulationTime));

  for (let t = 0; t < ticks; t++) {
    // 1. 计算此 tick 哪些任务 ready / wantsMutex / blocked
    const ready: TaskRole[] = [];
    const wantsMutex: Partial<Record<TaskRole, boolean>> = {};
    const blockedOnMutex: Partial<Record<TaskRole, boolean>> = {};

    (Object.keys(states) as TaskRole[]).forEach((role) => {
      const s = states[role];
      if (!s || s.finished) return;
      if (t < s.config.arrival) return;

      // 判断本 task 当前是否需要 mutex
      let needsMutex = false;
      if (role === "high") {
        needsMutex = true; // high 整个执行期都需要 mutex
      } else if (role === "low" && s.config.holdsMutex) {
        // low 在 [acquireOffset, acquireOffset + holdDuration) 内需要持锁
        const within =
          s.executed >= s.config.mutexAcquireOffset &&
          s.executed < s.config.mutexAcquireOffset + s.config.mutexHoldDuration;
        needsMutex = within;
      }
      // mid 永不需要 mutex

      if (needsMutex) {
        wantsMutex[role] = true;
        if (s.holdingMutex) {
          ready.push(role); // 已经持有，可继续
        } else if (mutexHolder === null || mutexHolder === role) {
          ready.push(role); // 锁空闲，可立即获取
        } else {
          // 锁被别人持有 → 阻塞
          blockedOnMutex[role] = true;
        }
      } else {
        ready.push(role);
      }
    });

    // 2. 应用 PIP：若 high 被阻塞且 low 持有 mutex，提升 low 的优先级
    const lowState = states.low;
    const highState = states.high;
    if (
      config.enablePriorityInheritance &&
      lowState &&
      highState &&
      lowState.holdingMutex &&
      blockedOnMutex.high &&
      lowState.effectivePriority < highState.config.priority
    ) {
      lowState.effectivePriority = highState.config.priority;
      if (!inheritLogged) {
        pushEvent({
          time: t,
          type: "inherit",
          role: "low",
          message: `t=${t}ms low 继承 high 优先级 → ${highState.config.priority}`,
        });
        inheritLogged = true;
      }
    }

    // 3. 记录 high 阻塞事件（仅首次）
    if (blockedOnMutex.high && !highBlockedLogged) {
      pushEvent({
        time: t,
        type: "block",
        role: "high",
        message: `t=${t}ms high 等待 mutex（被 ${mutexHolder} 持有）`,
      });
      highBlockedLogged = true;
    }
    if (!blockedOnMutex.high) {
      highBlockedLogged = false;
    }

    // 4. 选出本 tick 运行的任务（最高生效优先级）
    let chosen: TaskRole | null = null;
    let chosenPrio = -Infinity;
    for (const role of ready) {
      const s = states[role];
      if (!s) continue;
      if (s.effectivePriority > chosenPrio) {
        chosenPrio = s.effectivePriority;
        chosen = role;
      }
    }

    // 5. 段管理：若 chosen 与当前段不同，关闭旧段
    if (
      currentSegment &&
      (chosen !== currentSegment.role ||
        (chosen !== null &&
          states[chosen]!.holdingMutex !== currentSegment.holdingMutex))
    ) {
      closeSegmentAt(t);
    }

    if (chosen === null) {
      // 空闲 tick
      if (currentSegment) closeSegmentAt(t);
      continue;
    }

    const cs: TaskState = states[chosen]!;

    // 6. 若 chosen 想要 mutex 且未持有 → 此 tick 获取
    if (wantsMutex[chosen] && !cs.holdingMutex) {
      cs.holdingMutex = true;
      mutexHolder = chosen;
      pushEvent({
        time: t,
        type: "acquire",
        role: chosen,
        message: `t=${t}ms ${chosen} 获取 mutex`,
      });
    }

    // 7. 开新段或延续段
    if (!currentSegment) {
      currentSegment = {
        role: chosen,
        start: t,
        end: t + 1,
        holdingMutex: cs.holdingMutex,
      };
    } else {
      currentSegment.end = t + 1;
    }

    // 8. 推进执行
    cs.executed += 1;

    // 9. 判断是否需要释放 mutex
    if (cs.holdingMutex) {
      let shouldRelease = false;
      if (chosen === "low") {
        const releaseAt =
          cs.config.mutexAcquireOffset + cs.config.mutexHoldDuration;
        if (cs.executed >= releaseAt) shouldRelease = true;
      }
      if (cs.executed >= cs.config.duration) {
        shouldRelease = true; // 任务完成必释放
      }
      if (shouldRelease) {
        cs.holdingMutex = false;
        mutexHolder = null;
        pushEvent({
          time: t + 1,
          type: "release",
          role: chosen,
          message: `t=${t + 1}ms ${chosen} 释放 mutex`,
        });
        // PIP 解除
        if (
          config.enablePriorityInheritance &&
          chosen === "low" &&
          cs.effectivePriority !== cs.config.priority
        ) {
          cs.effectivePriority = cs.config.priority;
          inheritLogged = false;
          pushEvent({
            time: t + 1,
            type: "inherit",
            role: "low",
            message: `t=${t + 1}ms low 优先级回落 → ${cs.config.priority}`,
          });
        }
      }
    }

    // 10. 任务是否完成
    if (cs.executed >= cs.config.duration && !cs.finished) {
      cs.finished = true;
      cs.finishedAt = t + 1;
      pushEvent({
        time: t + 1,
        type: "finish",
        role: chosen,
        message: `t=${t + 1}ms ${chosen} 执行完成`,
      });
    }
  }

  if (currentSegment) {
    segments.push(currentSegment);
    currentSegment = null;
  }

  // 计算等待时间和完成时刻
  const waitTimes: Record<TaskRole, number> = { high: 0, mid: 0, low: 0 };
  const finishTimes: Record<TaskRole, number | null> = {
    high: null,
    mid: null,
    low: null,
  };
  (Object.keys(states) as TaskRole[]).forEach((role) => {
    const s = states[role];
    if (!s) return;
    finishTimes[role] = s.finishedAt;
    if (s.finishedAt !== null) {
      // 等待 = 总响应时间 - 执行时长
      waitTimes[role] = s.finishedAt - s.config.arrival - s.config.duration;
    } else {
      waitTimes[role] = config.simulationTime - s.config.arrival - s.executed;
    }
  });

  return { segments, events, waitTimes, finishTimes };
}

/** 默认任务集（经典反转场景） */
export const DEFAULT_TASKS: TaskConfig[] = [
  {
    role: "high",
    name: "HighTask",
    priority: 3,
    arrival: 3,
    duration: 4,
    holdsMutex: false,
    mutexAcquireOffset: 0,
    mutexHoldDuration: 0,
  },
  {
    role: "mid",
    name: "MidTask",
    priority: 2,
    arrival: 4,
    duration: 6,
    holdsMutex: false,
    mutexAcquireOffset: 0,
    mutexHoldDuration: 0,
  },
  {
    role: "low",
    name: "LowTask",
    priority: 1,
    arrival: 0,
    duration: 8,
    holdsMutex: true,
    mutexAcquireOffset: 0,
    mutexHoldDuration: 6,
  },
];
