"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useMemo } from "react";
import type { RunSegment, TaskRole } from "@/types/priority-inversion";
import { roleColor } from "./priority-inversion";

interface ChartProps {
  segments: RunSegment[];
  simulationTime: number;
}

const ROLE_ORDER: TaskRole[] = ["high", "mid", "low"];
const ROLE_LABEL: Record<TaskRole, string> = {
  high: "HighTask",
  mid: "MidTask",
  low: "LowTask",
};

const TOOLTIP_STYLE = {
  backgroundColor: "var(--popover)",
  borderColor: "var(--border)",
  borderRadius: "8px",
  color: "var(--popover-foreground)",
  fontSize: "12px",
};

/**
 * 横向甘特图：用 BarChart layout=vertical + 堆叠 Bar 实现。
 * 每个任务一行，按时间堆叠 [空隙][段1][空隙][段2]...
 */
export function PriorityInversionChart({
  segments,
  simulationTime,
}: ChartProps) {
  const data = useMemo(() => buildData(segments, simulationTime), [
    segments,
    simulationTime,
  ]);

  if (segments.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border text-sm text-muted-foreground">
        暂无仿真数据
      </div>
    );
  }

  // 找出最大段数以决定要渲染多少个 Bar 系列
  const maxBars = Math.max(...data.map((d) => d.barFields.length / 2), 0);
  // 每行真实数据：spacer0, run0, spacer1, run1, ...
  // Recharts 需要每个 Bar 对应一个 dataKey

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
          barCategoryGap="30%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, simulationTime]}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            stroke="var(--border)"
            label={{
              value: "时间 (ms)",
              position: "insideBottom",
              offset: -10,
              fill: "var(--muted-foreground)",
              fontSize: 11,
            }}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: "var(--foreground)", fontSize: 12 }}
            stroke="var(--border)"
            width={70}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: "var(--muted)", opacity: 0.4 }}
            formatter={(value: unknown, name: unknown) => {
              const n = String(name);
              if (n.startsWith("spacer")) return ["", ""];
              const v = Number(value);
              return [`${v} ms`, "执行段"];
            }}
            labelFormatter={(label: unknown) => String(label)}
          />
          {/* 渲染 maxBars 对 (spacer, run) */}
          {Array.from({ length: maxBars }).map((_, i) => (
            <Bar
              key={`pair-${i}`}
              dataKey={`spacer${i}`}
              stackId="gantt"
              fill="transparent"
              isAnimationActive={false}
            />
          ))}
          {Array.from({ length: maxBars }).map((_, i) => (
            <Bar
              key={`run-${i}`}
              dataKey={`run${i}`}
              stackId="gantt"
              isAnimationActive={false}
              radius={2}
            >
              {data.map((row, ri) => {
                const seg = row.runs[i];
                return (
                  <Cell
                    key={`cell-${ri}-${i}`}
                    fill={seg ? roleColor(row.role) : "transparent"}
                    stroke={
                      seg?.holdingMutex ? "var(--foreground)" : undefined
                    }
                    strokeWidth={seg?.holdingMutex ? 1.5 : 0}
                    strokeDasharray={seg?.holdingMutex ? "3 2" : undefined}
                  />
                );
              })}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* 图例 */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        {ROLE_ORDER.map((r) => (
          <div key={r} className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-4 rounded-sm"
              style={{ backgroundColor: roleColor(r) }}
            />
            {ROLE_LABEL[r]}
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-auto">
          <span
            className="inline-block h-3 w-4 rounded-sm"
            style={{
              border: "1.5px dashed var(--foreground)",
              background: "transparent",
            }}
          />
          持有 mutex
        </div>
      </div>
    </div>
  );
}

interface ChartDatum {
  label: string;
  role: TaskRole;
  runs: ({ holdingMutex: boolean } | null)[];
  /** 用于循环生成 Bar 系列的 dataKey 列表 */
  barFields: string[];
  // 动态字段
  [key: string]: unknown;
}

function buildData(segments: RunSegment[], simulationTime: number): ChartDatum[] {
  return ROLE_ORDER.map((role) => {
    const own = segments
      .filter((s) => s.role === role)
      .sort((a, b) => a.start - b.start);

    const datum: ChartDatum = {
      label: ROLE_LABEL[role],
      role,
      runs: [],
      barFields: [],
    };

    let cursor = 0;
    own.forEach((seg, i) => {
      const spacer = Math.max(0, seg.start - cursor);
      const length = Math.max(0, seg.end - seg.start);
      datum[`spacer${i}`] = spacer;
      datum[`run${i}`] = length;
      datum.runs.push({ holdingMutex: seg.holdingMutex });
      datum.barFields.push(`spacer${i}`, `run${i}`);
      cursor = seg.end;
    });

    // 末尾补一个 spacer 占据剩余时间，使 X 轴稳定到 simulationTime
    const tailIdx = own.length;
    datum[`spacer${tailIdx}`] = Math.max(0, simulationTime - cursor);
    datum[`run${tailIdx}`] = 0;
    datum.barFields.push(`spacer${tailIdx}`, `run${tailIdx}`);
    datum.runs.push(null);

    return datum;
  });
}
