"use client";

import { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { RadarPayload } from "@/types/mcu-compare";

const SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

interface SpecRadarProps {
  payloads: RadarPayload[];
}

interface RechartRow {
  axis: string;
  [chipKey: string]: string | number | null;
}

/**
 * 4 轴雷达图：Performance / Flash / RAM / Peripherals。
 * 每颗 chip 一条 Radar series，缺值字段以 null 传入 → Recharts 自动断线（不连接）。
 */
export function SpecRadar({ payloads }: SpecRadarProps) {
  const data = useMemo<RechartRow[]>(() => {
    if (payloads.length === 0) return [];
    const axes = payloads[0].axes.map((a) => a.axis);
    return axes.map((axis) => {
      const row: RechartRow = { axis };
      payloads.forEach((p) => {
        const found = p.axes.find((a) => a.axis === axis);
        row[p.chipName] = found?.value ?? null;
      });
      return row;
    });
  }, [payloads]);

  if (payloads.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
        请选择至少一款芯片
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={360}>
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          tickCount={5}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--popover)",
            borderColor: "var(--border)",
            borderRadius: "8px",
            color: "var(--popover-foreground)",
            fontSize: "12px",
          }}
          formatter={(value: unknown) =>
            value == null ? "—" : `${value as number}/100`
          }
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {payloads.map((p, idx) => (
          <Radar
            key={p.chipId}
            name={p.chipName}
            dataKey={p.chipName}
            stroke={SERIES_COLORS[idx % SERIES_COLORS.length]}
            fill={SERIES_COLORS[idx % SERIES_COLORS.length]}
            fillOpacity={0.15}
            connectNulls={false}
            isAnimationActive={false}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}
