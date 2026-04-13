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
} from "recharts";
import type { BodeDataPoint } from "@/types/rc-calculator";

interface BodePlotProps {
  data: BodeDataPoint[];
  cutoffFrequency: number;
  cutoffFrequencyLabel: string;
  color?: string;
  title: string;
}

export function BodePlot({
  data,
  cutoffFrequency,
  cutoffFrequencyLabel,
  color = "hsl(var(--chart-1, 220 70% 50%))",
  title,
}: BodePlotProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border text-muted-foreground text-sm">
        请输入有效的 R 和 C 值
      </div>
    );
  }

  // Build tick values: use whole decades that span the data
  const minFreq = data[0].frequency;
  const maxFreq = data[data.length - 1].frequency;
  const minDecade = Math.floor(Math.log10(minFreq));
  const maxDecade = Math.ceil(Math.log10(maxFreq));

  const xTicks: number[] = [];
  for (let d = minDecade; d <= maxDecade; d++) {
    xTicks.push(Math.pow(10, d));
  }

  const formatXTick = (value: number) => {
    if (value >= 1e9) return `${value / 1e9}G`;
    if (value >= 1e6) return `${value / 1e6}M`;
    if (value >= 1e3) return `${value / 1e3}k`;
    return `${value}`;
  };

  return (
    <div>
      <div className="mb-2 text-sm font-medium text-foreground">{title}</div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border"
            />
            <XAxis
              dataKey="frequency"
              scale="log"
              domain={["dataMin", "dataMax"]}
              type="number"
              ticks={xTicks}
              tickFormatter={formatXTick}
              label={{
                value: "频率 (Hz)",
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
              domain={[-60, 5]}
              label={{
                value: "增益 (dB)",
                angle: -90,
                position: "insideLeft",
                offset: 5,
                className: "fill-muted-foreground text-xs",
              }}
              className="text-xs fill-muted-foreground"
              tick={{ className: "fill-muted-foreground text-xs" }}
              axisLine={{ className: "stroke-border" }}
              tickLine={{ className: "stroke-border" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                borderColor: "hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--popover-foreground))",
                fontSize: "12px",
              }}
              formatter={(value: unknown) => [
                `${Number(value).toFixed(2)} dB`,
                "增益",
              ]}
              labelFormatter={(label: unknown) => {
                const l = Number(label);
                if (l >= 1e6) return `${(l / 1e6).toPrecision(3)} MHz`;
                if (l >= 1e3) return `${(l / 1e3).toPrecision(3)} kHz`;
                return `${l.toPrecision(3)} Hz`;
              }}
            />
            {/* -3dB reference line */}
            <ReferenceLine
              y={-3}
              stroke="hsl(var(--destructive, 0 84% 60%))"
              strokeDasharray="5 5"
              label={{
                value: "-3dB",
                position: "right",
                className: "fill-destructive text-xs",
              }}
            />
            {/* Cutoff frequency reference line */}
            <ReferenceLine
              x={cutoffFrequency}
              stroke="hsl(var(--destructive, 0 84% 60%))"
              strokeDasharray="5 5"
              label={{
                value: `fc=${cutoffFrequencyLabel}`,
                position: "top",
                className: "fill-destructive text-xs",
              }}
            />
            <Line
              type="monotone"
              dataKey="gainDb"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
