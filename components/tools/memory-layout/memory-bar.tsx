"use client";

import { useState, useCallback } from "react";
import { formatAddress, formatSize } from "@/lib/memory-layout";
import type { MemorySection, MemoryStats } from "@/types/memory-layout";

interface MemoryBarProps {
  sections: MemorySection[];
  regionStart: number;
  totalSize: number;
  stats: MemoryStats;
}

const BAR_HEIGHT = 280;
const BAR_WIDTH = 80;
const LABEL_OFFSET = 100;

export function MemoryBar({
  sections,
  regionStart,
  totalSize,
  stats,
}: MemoryBarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getYPosition = useCallback(
    (address: number): number => {
      const offset = address - regionStart;
      return (offset / totalSize) * BAR_HEIGHT;
    },
    [regionStart, totalSize]
  );

  const getHeight = useCallback(
    (size: number): number => {
      return Math.max((size / totalSize) * BAR_HEIGHT, 2); // min 2px visibility
    },
    [totalSize]
  );

  if (sections.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
        此区域暂无内存段
      </div>
    );
  }

  const svgWidth = BAR_WIDTH + LABEL_OFFSET + 180;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${svgWidth} ${BAR_HEIGHT + 40}`}
        className="w-full max-w-md"
        style={{ maxHeight: BAR_HEIGHT + 40 }}
      >
        {/* Memory region outline */}
        <rect
          x={LABEL_OFFSET}
          y={10}
          width={BAR_WIDTH}
          height={BAR_HEIGHT}
          rx={4}
          className="fill-muted/30 stroke-border"
          strokeWidth={1}
        />

        {/* Start address label */}
        <text
          x={LABEL_OFFSET - 4}
          y={18}
          textAnchor="end"
          className="fill-muted-foreground text-[9px] font-mono"
        >
          {formatAddress(regionStart)}
        </text>

        {/* End address label */}
        <text
          x={LABEL_OFFSET - 4}
          y={BAR_HEIGHT + 12}
          textAnchor="end"
          className="fill-muted-foreground text-[9px] font-mono"
        >
          {formatAddress(regionStart + totalSize)}
        </text>

        {/* Section blocks */}
        {sections.map((section) => {
          const y = getYPosition(section.startAddress) + 10;
          const h = getHeight(section.size);
          const isHovered = hoveredId === section.id;

          return (
            <g
              key={section.id}
              onMouseEnter={() => setHoveredId(section.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer"
            >
              {/* Section bar */}
              <rect
                x={LABEL_OFFSET}
                y={y}
                width={BAR_WIDTH}
                height={h}
                rx={2}
                fill={section.color}
                opacity={isHovered ? 0.9 : 0.7}
                className="transition-opacity"
              />

              {/* Section name (inside bar if tall enough) */}
              {h > 14 && (
                <text
                  x={LABEL_OFFSET + BAR_WIDTH / 2}
                  y={y + h / 2 + 4}
                  textAnchor="middle"
                  className="fill-white text-[9px] font-medium pointer-events-none"
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                >
                  {section.name}
                </text>
              )}

              {/* Right-side labels */}
              <text
                x={LABEL_OFFSET + BAR_WIDTH + 6}
                y={y + Math.min(h / 2, 10) + 3}
                className="fill-foreground text-[9px] font-mono pointer-events-none"
              >
                {section.name}
              </text>
              <text
                x={LABEL_OFFSET + BAR_WIDTH + 6}
                y={y + Math.min(h / 2, 10) + 14}
                className="fill-muted-foreground text-[8px] font-mono pointer-events-none"
              >
                {formatSize(section.size)}
              </text>

              {/* Address marker on left */}
              <line
                x1={LABEL_OFFSET - 2}
                y1={y}
                x2={LABEL_OFFSET}
                y2={y}
                className="stroke-foreground/40"
                strokeWidth={0.5}
              />
            </g>
          );
        })}

        {/* Free space indicator */}
        {stats.freeSize > 0 && (
          <text
            x={LABEL_OFFSET + BAR_WIDTH / 2}
            y={BAR_HEIGHT + 28}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px] font-mono"
          >
            剩余: {formatSize(stats.freeSize)}
          </text>
        )}
      </svg>

      {/* Usage bar at bottom */}
      <div className="w-full max-w-md mt-2">
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted/50">
          {sections.map((section) => {
            const pct = totalSize > 0 ? (section.size / totalSize) * 100 : 0;
            return (
              <div
                key={section.id}
                className="h-full transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: section.color,
                  opacity: hoveredId === section.id ? 1 : 0.7,
                }}
                title={`${section.name}: ${formatSize(section.size)} (${pct.toFixed(1)}%)`}
                onMouseEnter={() => setHoveredId(section.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
