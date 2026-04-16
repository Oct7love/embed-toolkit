"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { SimPoint } from "@/types/pid-simulator";

interface PIDChartProps {
  data: SimPoint[];
  type: "response" | "error" | "output";
}

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--popover))",
  borderColor: "hsl(var(--border))",
  borderRadius: "8px",
  color: "hsl(var(--popover-foreground))",
  fontSize: "12px",
};

export function PIDChart({ data, type }: PIDChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border text-muted-foreground text-sm">
        暂无仿真数据
      </div>
    );
  }

  // 降采样：图表超过 500 点时每 N 点取一个，保证渲染流畅
  const maxPoints = 500;
  const step = data.length > maxPoints ? Math.ceil(data.length / maxPoints) : 1;
  const chartData =
    step > 1 ? data.filter((_, i) => i % step === 0 || i === data.length - 1) : data;

  switch (type) {
    case "response":
      return <ResponseChart data={chartData} />;
    case "error":
      return <ErrorChart data={chartData} />;
    case "output":
      return <OutputChart data={chartData} />;
  }
}

function ResponseChart({ data }: { data: SimPoint[] }) {
  const setpoint = data[0]?.setpoint ?? 0;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="time"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v: number) => `${v.toFixed(2)}`}
            label={{
              value: "时间 (s)",
              position: "insideBottom",
              offset: -10,
              className: "fill-muted-foreground text-xs",
            }}
            className="text-xs fill-muted-foreground"
            tick={{ className: "fill-muted-foreground text-xs" }}
            axisLine={{ className: "stroke-border" }}
            tickLine={{ className: "stroke-border" }}
          />
          <YAxis
            className="text-xs fill-muted-foreground"
            tick={{ className: "fill-muted-foreground text-xs" }}
            axisLine={{ className: "stroke-border" }}
            tickLine={{ className: "stroke-border" }}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value: unknown, name: unknown) => {
              const label = name === "processVariable" ? "实际值" : "目标值";
              return [`${Number(value).toFixed(3)}`, label];
            }}
            labelFormatter={(label: unknown) => `t = ${Number(label).toFixed(3)} s`}
          />
          <Legend
            formatter={(value: string) =>
              value === "processVariable" ? "实际值" : "目标值"
            }
          />
          <ReferenceLine
            y={setpoint}
            stroke="#ef4444"
            strokeDasharray="5 5"
            label={{
              value: `目标: ${setpoint}`,
              position: "right",
              className: "fill-muted-foreground text-xs",
            }}
          />
          <Line
            type="monotone"
            dataKey="processVariable"
            stroke="hsl(var(--chart-1, 220 70% 50%))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ErrorChart({ data }: { data: SimPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="time"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v: number) => `${v.toFixed(2)}`}
            label={{
              value: "时间 (s)",
              position: "insideBottom",
              offset: -10,
              className: "fill-muted-foreground text-xs",
            }}
            className="text-xs fill-muted-foreground"
            tick={{ className: "fill-muted-foreground text-xs" }}
            axisLine={{ className: "stroke-border" }}
            tickLine={{ className: "stroke-border" }}
          />
          <YAxis
            className="text-xs fill-muted-foreground"
            tick={{ className: "fill-muted-foreground text-xs" }}
            axisLine={{ className: "stroke-border" }}
            tickLine={{ className: "stroke-border" }}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value: unknown) => [
              `${Number(value).toFixed(3)}`,
              "误差",
            ]}
            labelFormatter={(label: unknown) => `t = ${Number(label).toFixed(3)} s`}
          />
          <ReferenceLine
            y={0}
            stroke="hsl(var(--border))"
            strokeDasharray="3 3"
          />
          <Line
            type="monotone"
            dataKey="error"
            stroke="hsl(var(--chart-4, 280 65% 60%))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function OutputChart({ data }: { data: SimPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="time"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v: number) => `${v.toFixed(2)}`}
            label={{
              value: "时间 (s)",
              position: "insideBottom",
              offset: -10,
              className: "fill-muted-foreground text-xs",
            }}
            className="text-xs fill-muted-foreground"
            tick={{ className: "fill-muted-foreground text-xs" }}
            axisLine={{ className: "stroke-border" }}
            tickLine={{ className: "stroke-border" }}
          />
          <YAxis
            className="text-xs fill-muted-foreground"
            tick={{ className: "fill-muted-foreground text-xs" }}
            axisLine={{ className: "stroke-border" }}
            tickLine={{ className: "stroke-border" }}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value: unknown) => [
              `${Number(value).toFixed(3)}`,
              "控制输出",
            ]}
            labelFormatter={(label: unknown) => `t = ${Number(label).toFixed(3)} s`}
          />
          <ReferenceLine
            y={0}
            stroke="hsl(var(--border))"
            strokeDasharray="3 3"
          />
          <Line
            type="monotone"
            dataKey="controlOutput"
            stroke="hsl(var(--chart-3, 30 80% 55%))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
