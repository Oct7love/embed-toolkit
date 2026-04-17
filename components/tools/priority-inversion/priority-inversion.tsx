"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, AlertTriangle, ShieldCheck, RotateCcw } from "lucide-react";
import {
  simulateSchedule,
  DEFAULT_TASKS,
} from "@/lib/priority-inversion";
import type {
  SimulationConfig,
  TaskConfig,
  TaskRole,
  SimulationResult,
} from "@/types/priority-inversion";

const PriorityInversionChart = dynamic(
  () =>
    import("./priority-inversion-chart").then(
      (m) => m.PriorityInversionChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
        加载图表中...
      </div>
    ),
  }
);

const ROLE_LABEL: Record<TaskRole, string> = {
  high: "HighTask",
  mid: "MidTask",
  low: "LowTask",
};

const ROLE_DESC: Record<TaskRole, string> = {
  high: "最高优先级，需要 mutex 完成关键工作",
  mid: "中等优先级，不需要 mutex（反转的关键来源）",
  low: "最低优先级，先持有 mutex",
};

const DEFAULT_SIMULATION_TIME = 30;

const PRESETS: { name: string; description: string; pip: boolean }[] = [
  {
    name: "经典反转",
    description: "PIP 关闭，mid 抢占 low 导致 high 长时间等待",
    pip: false,
  },
  {
    name: "PIP 修复后",
    description: "PIP 开启，low 临时继承 high 优先级阻止 mid 抢占",
    pip: true,
  },
];

export function PriorityInversion() {
  const [tasks, setTasks] = useState<TaskConfig[]>(() =>
    DEFAULT_TASKS.map((t) => ({ ...t }))
  );
  const [enablePIP, setEnablePIP] = useState(false);
  const [simulationTime, setSimulationTime] = useState(DEFAULT_SIMULATION_TIME);

  const config: SimulationConfig = useMemo(
    () => ({ tasks, enablePriorityInheritance: enablePIP, simulationTime }),
    [tasks, enablePIP, simulationTime]
  );

  const result: SimulationResult = useMemo(
    () => simulateSchedule(config),
    [config]
  );

  // 用同样参数跑另一个开关下的版本以做对比
  const counterpart: SimulationResult = useMemo(
    () =>
      simulateSchedule({ ...config, enablePriorityInheritance: !enablePIP }),
    [config, enablePIP]
  );

  const updateTask = useCallback(
    (role: TaskRole, patch: Partial<TaskConfig>) => {
      setTasks((prev) =>
        prev.map((t) => (t.role === role ? { ...t, ...patch } : t))
      );
    },
    []
  );

  const handleReset = useCallback(() => {
    setTasks(DEFAULT_TASKS.map((t) => ({ ...t })));
    setSimulationTime(DEFAULT_SIMULATION_TIME);
    setEnablePIP(false);
  }, []);

  const handlePreset = useCallback((index: number) => {
    setTasks(DEFAULT_TASKS.map((t) => ({ ...t })));
    setSimulationTime(DEFAULT_SIMULATION_TIME);
    setEnablePIP(PRESETS[index].pip);
  }, []);

  const highWaitOn =
    enablePIP ? result.waitTimes.high : counterpart.waitTimes.high;
  const highWaitOff =
    enablePIP ? counterpart.waitTimes.high : result.waitTimes.high;

  return (
    <div className="space-y-6">
      {/* 顶部：开关 + 预设 */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>仿真控制</CardTitle>
          <CardDescription>
            切换优先级继承（PIP）开关，对比有无修复时 high 任务的等待时间
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setEnablePIP((v) => !v)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ring-1 ${
                enablePIP
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-muted text-muted-foreground ring-border hover:text-foreground"
              }`}
            >
              {enablePIP ? (
                <ShieldCheck className="size-4" />
              ) : (
                <AlertTriangle className="size-4" />
              )}
              {enablePIP ? "PIP 已启用" : "PIP 已关闭"}
            </button>

            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, i) => (
                <Button
                  key={p.name}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreset(i)}
                  title={p.description}
                >
                  {p.name}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="size-3.5" data-icon="inline-start" />
                重置
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <label className="text-muted-foreground">仿真时长 (ms)</label>
            <Input
              type="number"
              min={10}
              max={100}
              value={simulationTime}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= 10 && v <= 100) setSimulationTime(v);
              }}
              className="w-24 font-mono"
            />
          </div>
        </CardContent>
      </Card>

      {/* 中部：3 张任务卡 */}
      <div className="grid gap-4 md:grid-cols-3">
        {(["high", "mid", "low"] as TaskRole[]).map((role) => {
          const t = tasks.find((tk) => tk.role === role)!;
          return (
            <TaskConfigCard
              key={role}
              task={t}
              onChange={(patch) => updateTask(role, patch)}
            />
          );
        })}
      </div>

      {/* 性能对比 */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="High 等待时间（PIP off）"
          value={`${highWaitOff} ms`}
          tone={highWaitOff > highWaitOn ? "danger" : "neutral"}
        />
        <StatCard
          label="High 等待时间（PIP on）"
          value={`${highWaitOn} ms`}
          tone={highWaitOn < highWaitOff ? "success" : "neutral"}
        />
        <StatCard
          label="改善幅度"
          value={`${Math.max(0, highWaitOff - highWaitOn)} ms`}
          tone="success"
        />
      </div>

      {/* 甘特图 */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>调度甘特图</CardTitle>
          <CardDescription>
            横向显示每个任务的执行段，斜纹叠加表示该段持有 mutex
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PriorityInversionChart
            segments={result.segments}
            simulationTime={simulationTime}
          />
        </CardContent>
      </Card>

      {/* 事件日志 */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>关键事件日志</CardTitle>
          <CardDescription>记录 mutex 获取/释放、阻塞、优先级继承</CardDescription>
        </CardHeader>
        <CardContent>
          {result.events.length === 0 ? (
            <p className="text-sm text-muted-foreground">无事件</p>
          ) : (
            <ul className="space-y-1 font-mono text-xs">
              {result.events.map((e, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-foreground/80"
                >
                  <EventBadge type={e.type} />
                  <span>{e.message}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ----------- 子组件 ----------- */

function TaskConfigCard({
  task,
  onChange,
}: {
  task: TaskConfig;
  onChange: (patch: Partial<TaskConfig>) => void;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: roleColor(task.role) }}
          />
          {ROLE_LABEL[task.role]}
          <span className="text-xs font-normal text-muted-foreground">
            P{task.priority}
          </span>
        </CardTitle>
        <CardDescription className="text-xs">
          {ROLE_DESC[task.role]}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ParamRow label="到达时间 (ms)">
          <Input
            type="number"
            min={0}
            value={task.arrival}
            onChange={(e) =>
              onChange({ arrival: Math.max(0, Number(e.target.value) || 0) })
            }
            className="w-20 font-mono"
          />
        </ParamRow>
        <ParamRow label="执行时长 (ms)">
          <Input
            type="number"
            min={1}
            value={task.duration}
            onChange={(e) =>
              onChange({ duration: Math.max(1, Number(e.target.value) || 1) })
            }
            className="w-20 font-mono"
          />
        </ParamRow>

        {task.role === "low" && (
          <>
            <ParamRow label="持锁">
              <button
                type="button"
                onClick={() => onChange({ holdsMutex: !task.holdsMutex })}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ring-1 ${
                  task.holdsMutex
                    ? "bg-primary/10 text-primary ring-primary/30"
                    : "bg-muted text-muted-foreground ring-border"
                }`}
              >
                <Lock className="size-3" />
                {task.holdsMutex ? "持锁" : "不持锁"}
              </button>
            </ParamRow>
            {task.holdsMutex && (
              <>
                <ParamRow label="获取锁偏移 (ms)">
                  <Input
                    type="number"
                    min={0}
                    value={task.mutexAcquireOffset}
                    onChange={(e) =>
                      onChange({
                        mutexAcquireOffset: Math.max(
                          0,
                          Number(e.target.value) || 0
                        ),
                      })
                    }
                    className="w-20 font-mono"
                  />
                </ParamRow>
                <ParamRow label="持锁时长 (ms)">
                  <Input
                    type="number"
                    min={1}
                    value={task.mutexHoldDuration}
                    onChange={(e) =>
                      onChange({
                        mutexHoldDuration: Math.max(
                          1,
                          Number(e.target.value) || 1
                        ),
                      })
                    }
                    className="w-20 font-mono"
                  />
                </ParamRow>
              </>
            )}
          </>
        )}

        {task.role === "high" && (
          <p className="text-[11px] text-muted-foreground">
            High 任务整段执行都需要 mutex
          </p>
        )}
        {task.role === "mid" && (
          <p className="text-[11px] text-muted-foreground">
            Mid 任务不使用 mutex，但优先级高于 low
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ParamRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-xs text-muted-foreground shrink-0">{label}</label>
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "neutral" | "success" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "text-[var(--chart-2)]"
      : tone === "danger"
        ? "text-destructive"
        : "text-foreground";
  return (
    <div className="rounded-lg border bg-card p-3 text-center">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-base font-semibold font-mono ${toneClass}`}>
        {value}
      </div>
    </div>
  );
}

function EventBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    run: { label: "RUN", cls: "bg-muted text-muted-foreground" },
    block: { label: "BLOCK", cls: "bg-destructive/10 text-destructive" },
    inherit: {
      label: "INHERIT",
      cls: "bg-primary/15 text-primary",
    },
    release: { label: "RELEASE", cls: "bg-muted text-muted-foreground" },
    acquire: { label: "ACQUIRE", cls: "bg-muted text-muted-foreground" },
    finish: {
      label: "FINISH",
      cls: "bg-[var(--chart-2)]/15 text-[var(--chart-2)]",
    },
  };
  const item = map[type] ?? map.run;
  return (
    <span
      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${item.cls}`}
    >
      {item.label}
    </span>
  );
}

export function roleColor(role: TaskRole): string {
  // 用 chart token 区分三个任务
  if (role === "high") return "var(--chart-1)";
  if (role === "mid") return "var(--chart-3)";
  return "var(--chart-2)";
}
