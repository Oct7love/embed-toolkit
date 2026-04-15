"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { simulateSchedule } from "@/lib/task-scheduler";
import { checkSchedulability } from "@/lib/task-scheduler/analysis";
import type {
  RTOSTask,
  ScheduleResult,
} from "@/types/task-scheduler";
import { DEFAULT_TASKS, TASK_COLORS } from "@/types/task-scheduler";
import {
  Plus,
  Trash2,
  Play,
  AlertTriangle,
  Clock,
  Cpu,
  BarChart3,
} from "lucide-react";
import { GanttChart } from "./gantt-chart";

export function TaskScheduler() {
  const [tasks, setTasks] = useState<RTOSTask[]>(DEFAULT_TASKS);
  const [simulationTime, setSimulationTime] = useState(100);
  const [result, setResult] = useState<ScheduleResult | null>(null);

  const schedulability = useMemo(() => checkSchedulability(tasks), [tasks]);

  const handleAddTask = useCallback(() => {
    const nextId = `task-${Date.now()}`;
    const colorIdx = tasks.length % TASK_COLORS.length;
    setTasks((prev) => [
      ...prev,
      {
        id: nextId,
        name: `Task_${prev.length + 1}`,
        priority: 1,
        period: 50,
        executionTime: 10,
        color: TASK_COLORS[colorIdx],
      },
    ]);
  }, [tasks.length]);

  const handleRemoveTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setResult(null);
  }, []);

  const handleUpdateTask = useCallback(
    (id: string, field: keyof RTOSTask, value: string | number) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
      );
      setResult(null);
    },
    []
  );

  const handleSimulate = useCallback(() => {
    const validTasks = tasks.filter(
      (t) => t.period > 0 && t.executionTime > 0
    );
    const res = simulateSchedule(validTasks, simulationTime);
    setResult(res);
  }, [tasks, simulationTime]);

  const handleLoadExample = useCallback(() => {
    setTasks(DEFAULT_TASKS);
    setResult(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                任务调度甘特图
              </CardTitle>
              <CardDescription>
                模拟 FreeRTOS 抢占式优先级调度算法，生成任务时序甘特图
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  仿真时长
                </span>
                <Select
                  value={String(simulationTime)}
                  onValueChange={(v) => {
                    if (v !== null) {
                      setSimulationTime(Number(v));
                      setResult(null);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[50, 100, 200, 500, 1000].map((t) => (
                      <SelectItem key={t} value={String(t)}>
                        {t} ms
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSimulate}>
                <Play className="h-3.5 w-3.5" />
                运行仿真
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Task list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">任务列表</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleLoadExample}>
                加载示例
              </Button>
              <Button variant="outline" size="sm" onClick={handleAddTask}>
                <Plus className="h-3.5 w-3.5" />
                添加任务
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              暂无任务，点击「添加任务」开始
            </p>
          ) : (
            <div className="space-y-3">
              {/* Header row */}
              <div className="hidden sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground px-1">
                <span>任务名</span>
                <span>优先级</span>
                <span>周期 (ms)</span>
                <span>执行时间 (ms)</span>
                <span>颜色</span>
                <span />
              </div>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 items-center rounded-lg border border-border p-2"
                >
                  <Input
                    value={task.name}
                    onChange={(e) =>
                      handleUpdateTask(task.id, "name", e.target.value)
                    }
                    placeholder="任务名"
                    className="font-mono text-sm"
                  />
                  <Input
                    type="number"
                    value={task.priority}
                    onChange={(e) =>
                      handleUpdateTask(
                        task.id,
                        "priority",
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    min={1}
                    max={32}
                    className="font-mono text-sm"
                  />
                  <Input
                    type="number"
                    value={task.period}
                    onChange={(e) =>
                      handleUpdateTask(
                        task.id,
                        "period",
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    min={1}
                    className="font-mono text-sm"
                  />
                  <Input
                    type="number"
                    value={task.executionTime}
                    onChange={(e) =>
                      handleUpdateTask(
                        task.id,
                        "executionTime",
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    min={1}
                    className="font-mono text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={task.color}
                      onChange={(e) =>
                        handleUpdateTask(task.id, "color", e.target.value)
                      }
                      className="h-7 w-10 cursor-pointer rounded border border-input bg-transparent"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemoveTask(task.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedulability analysis */}
      {tasks.length > 0 && (
        <Card size="sm">
          <CardContent className="pt-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  CPU 利用率:
                </span>
                <span
                  className={`font-mono text-sm font-medium ${
                    schedulability.utilization > 1
                      ? "text-destructive"
                      : schedulability.utilization > 0.8
                        ? "text-yellow-500"
                        : "text-green-500"
                  }`}
                >
                  {(schedulability.utilization * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground">
                  RM 充分条件上界:
                </span>
                <span className="font-mono text-sm">
                  {(schedulability.rmBound * 100).toFixed(1)}%
                </span>
              </div>
              {schedulability.isRateMonotonic ? (
                schedulability.rmSufficientMet ? (
                  <Badge variant="outline" className="text-green-600">
                    满足 RM 充分条件
                  </Badge>
                ) : schedulability.utilization <= 1 ? (
                  <Badge variant="outline" className="text-yellow-600">
                    超出 RM 充分条件（可能仍可调度，请看仿真结果）
                  </Badge>
                ) : (
                  <Badge variant="destructive">CPU 过载</Badge>
                )
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  非 RM 优先级分配（RM 充分条件不适用）
                </Badge>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              说明：RM 充分条件（Liu &amp; Layland）仅在优先级按周期分配（周期短→优先级高）时有效；同优先级任务按 FIFO 非抢占执行。可调度性以仿真结果为准。
            </p>
          </CardContent>
        </Card>
      )}

      {/* Simulation result */}
      {result && (
        <>
          {/* Missed deadlines warning */}
          {result.missedDeadlines.length > 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">检测到错过 Deadline</p>
                <ul className="mt-1 space-y-0.5 text-xs">
                  {result.missedDeadlines.slice(0, 10).map((md, i) => (
                    <li key={i}>
                      {md.taskName} 在 t={md.deadline}ms 处错过截止时间
                    </li>
                  ))}
                  {result.missedDeadlines.length > 10 && (
                    <li>...还有 {result.missedDeadlines.length - 10} 处</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Gantt chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">调度甘特图</CardTitle>
            </CardHeader>
            <CardContent>
              <GanttChart
                tasks={tasks}
                timeline={result.timeline}
                simulationTime={simulationTime}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
