"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import type { RTOSTask, TimeSlot, TaskState } from "@/types/task-scheduler";

interface GanttChartProps {
  tasks: RTOSTask[];
  timeline: TimeSlot[];
  simulationTime: number;
}

const ROW_HEIGHT = 36;
const LABEL_WIDTH = 120;
const TOP_AXIS_HEIGHT = 28;
const BOTTOM_PADDING = 4;

const STATE_OPACITY: Record<TaskState, number> = {
  running: 1,
  ready: 0.35,
  blocked: 0.15,
};

export function GanttChart({ tasks, timeline, simulationTime }: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{
    x: number;
    y: number;
    slot: TimeSlot;
    task: RTOSTask;
  } | null>(null);

  // Compute chart dimensions
  const chartHeight = tasks.length * ROW_HEIGHT + TOP_AXIS_HEIGHT + BOTTOM_PADDING;

  // Generate time ticks
  const ticks = useMemo(() => {
    const result: number[] = [];
    let step = 1;
    if (simulationTime > 500) step = 50;
    else if (simulationTime > 200) step = 20;
    else if (simulationTime > 100) step = 10;
    else if (simulationTime > 50) step = 5;
    else step = 2;

    for (let t = 0; t <= simulationTime; t += step) {
      result.push(t);
    }
    return result;
  }, [simulationTime]);

  // Task ID to index map
  const taskIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    tasks.forEach((t, i) => map.set(t.id, i));
    return map;
  }, [tasks]);

  // Task ID to task map
  const taskMap = useMemo(() => {
    const map = new Map<string, RTOSTask>();
    tasks.forEach((t) => map.set(t.id, t));
    return map;
  }, [tasks]);

  const handleSlotHover = useCallback(
    (e: React.MouseEvent, slot: TimeSlot) => {
      const task = taskMap.get(slot.taskId);
      if (!task) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setTooltipInfo({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        slot,
        task,
      });
    },
    [taskMap]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltipInfo(null);
  }, []);

  if (tasks.length === 0 || timeline.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-border text-muted-foreground text-sm">
        点击「运行仿真」查看调度结果
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-x-auto rounded-lg border border-border"
      onMouseLeave={handleMouseLeave}
    >
      <svg
        width="100%"
        viewBox={`0 0 ${LABEL_WIDTH + simulationTime * 4 + 20} ${chartHeight}`}
        className="min-w-[600px]"
        style={{ minWidth: Math.max(600, LABEL_WIDTH + simulationTime * 4 + 20) }}
      >
        {/* Time axis labels */}
        {ticks.map((t) => (
          <g key={`tick-${t}`}>
            <text
              x={LABEL_WIDTH + t * 4}
              y={TOP_AXIS_HEIGHT - 8}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px] font-mono"
            >
              {t}
            </text>
            <line
              x1={LABEL_WIDTH + t * 4}
              y1={TOP_AXIS_HEIGHT - 2}
              x2={LABEL_WIDTH + t * 4}
              y2={chartHeight - BOTTOM_PADDING}
              className="stroke-border"
              strokeWidth={0.5}
              strokeDasharray="2 2"
            />
          </g>
        ))}

        {/* Task rows */}
        {tasks.map((task, rowIdx) => {
          const y = TOP_AXIS_HEIGHT + rowIdx * ROW_HEIGHT;
          return (
            <g key={task.id}>
              {/* Row background */}
              {rowIdx % 2 === 0 && (
                <rect
                  x={0}
                  y={y}
                  width="100%"
                  height={ROW_HEIGHT}
                  className="fill-muted/30"
                />
              )}
              {/* Task label */}
              <text
                x={8}
                y={y + ROW_HEIGHT / 2 + 4}
                className="fill-foreground text-[11px] font-medium"
              >
                {task.name}
              </text>
              {/* Priority badge */}
              <text
                x={LABEL_WIDTH - 8}
                y={y + ROW_HEIGHT / 2 + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[9px] font-mono"
              >
                P{task.priority}
              </text>
              {/* Row separator */}
              <line
                x1={0}
                y1={y + ROW_HEIGHT}
                x2="100%"
                y2={y + ROW_HEIGHT}
                className="stroke-border"
                strokeWidth={0.5}
              />
            </g>
          );
        })}

        {/* Time slots */}
        {timeline.map((slot, i) => {
          const rowIdx = taskIndexMap.get(slot.taskId);
          if (rowIdx === undefined) return null;
          const task = taskMap.get(slot.taskId);
          if (!task) return null;

          const x = LABEL_WIDTH + slot.start * 4;
          const width = (slot.end - slot.start) * 4;
          const y = TOP_AXIS_HEIGHT + rowIdx * ROW_HEIGHT + 4;
          const height = ROW_HEIGHT - 8;

          return (
            <rect
              key={`${slot.taskId}-${slot.state}-${slot.start}-${i}`}
              x={x}
              y={y}
              width={Math.max(width, 1)}
              height={height}
              rx={2}
              fill={task.color}
              opacity={STATE_OPACITY[slot.state]}
              className="cursor-pointer transition-opacity hover:opacity-80"
              onMouseMove={(e) => handleSlotHover(e, slot)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltipInfo && (
        <div
          className="pointer-events-none absolute z-50 rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10"
          style={{
            left: tooltipInfo.x + 12,
            top: tooltipInfo.y - 10,
          }}
        >
          <div className="font-medium">{tooltipInfo.task.name}</div>
          <div className="text-muted-foreground">
            {tooltipInfo.slot.start}ms - {tooltipInfo.slot.end}ms
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{
                backgroundColor: tooltipInfo.task.color,
                opacity: STATE_OPACITY[tooltipInfo.slot.state],
              }}
            />
            <span>
              {tooltipInfo.slot.state === "running"
                ? "运行中"
                : tooltipInfo.slot.state === "ready"
                  ? "就绪"
                  : "阻塞"}
            </span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 px-3 py-2 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-6 rounded-sm"
            style={{ backgroundColor: "#3B82F6", opacity: 1 }}
          />
          运行 (Running)
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-6 rounded-sm"
            style={{ backgroundColor: "#3B82F6", opacity: 0.35 }}
          />
          就绪 (Ready)
        </div>
        <div className="flex items-center gap-1.5 ml-auto font-mono">
          X轴: 时间 (ms)
        </div>
      </div>
    </div>
  );
}
