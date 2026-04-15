"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BitGridProps {
  value: number;
  width?: 8 | 16 | 32;
  onBitToggle?: (bit: number) => void;
  labels?: Record<number, string>;
  /** Per-bit background/border colors: maps bit index → CSS color string */
  colors?: Record<number, string>;
  className?: string;
  readOnly?: boolean;
}

export function BitGrid({
  value,
  width = 32,
  onBitToggle,
  labels = {},
  colors,
  className,
  readOnly = false,
}: BitGridProps) {
  const bits = Array.from({ length: width }, (_, i) => width - 1 - i);
  const columns = Math.min(width, 16);
  const rows = Math.ceil(width / 16);

  // 焦点位（0..width-1 bit 编号），用于 roving tabindex 和方向键导航
  const [focusedBit, setFocusedBit] = useState<number>(width - 1);
  const containerRef = useRef<HTMLDivElement>(null);

  const focusBit = useCallback((bit: number) => {
    setFocusedBit(bit);
    // 下一个渲染周期让目标元素获得焦点
    requestAnimationFrame(() => {
      const el = containerRef.current?.querySelector<HTMLButtonElement>(
        `[data-bit="${bit}"]`
      );
      el?.focus();
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, bit: number) => {
      // bit 排列：同一行内高位在左（列索引 0），相邻列间 bit 差 1；跨行 bit 差 16
      const row = Math.floor((width - 1 - bit) / 16);
      const col = (width - 1 - bit) % 16;

      let nextRow = row;
      let nextCol = col;
      switch (e.key) {
        case "ArrowLeft":
          nextCol = Math.max(0, col - 1);
          break;
        case "ArrowRight":
          nextCol = Math.min(columns - 1, col + 1);
          break;
        case "ArrowUp":
          nextRow = Math.max(0, row - 1);
          break;
        case "ArrowDown":
          nextRow = Math.min(rows - 1, row + 1);
          break;
        case "Home":
          nextCol = 0;
          break;
        case "End":
          nextCol = columns - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      const nextBit = width - 1 - (nextRow * 16 + nextCol);
      if (nextBit >= 0 && nextBit < width) {
        focusBit(nextBit);
      }
    },
    [width, columns, rows, focusBit]
  );

  function renderCell(bit: number) {
    const isSet = (value >>> bit) & 1;
    const label = labels[bit];
    const color = colors?.[bit];

    const cell = (
      <button
        key={bit}
        type="button"
        disabled={readOnly}
        data-bit={bit}
        role="gridcell"
        tabIndex={!readOnly && bit === focusedBit ? 0 : -1}
        onClick={() => {
          setFocusedBit(bit);
          onBitToggle?.(bit);
        }}
        onFocus={() => setFocusedBit(bit)}
        onKeyDown={(e) => handleKeyDown(e, bit)}
        className={cn(
          "h-8 flex items-center justify-center font-mono text-sm border rounded-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !color &&
            (isSet
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-foreground border-border"),
          !readOnly && "hover:opacity-80 cursor-pointer",
          readOnly && "cursor-default"
        )}
        style={
          color
            ? {
                backgroundColor: isSet ? color : `color-mix(in oklch, ${color} 18%, transparent)`,
                borderColor: color,
                color: isSet ? "#fff" : "inherit",
              }
            : undefined
        }
        aria-label={`Bit ${bit}, 值: ${isSet}${label ? `, ${label}` : ""}`}
      >
        {isSet}
      </button>
    );

    if (label) {
      return (
        <Tooltip key={bit}>
          <TooltipTrigger render={cell} />
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      );
    }

    return cell;
  }

  return (
    <div
      ref={containerRef}
      className={cn("space-y-1", className)}
      role="grid"
      aria-label={`${width} 位 bit 网格（用方向键导航，Enter/Space 翻转）`}
    >
      {/* Bit 编号行 */}
      <div
        className="grid gap-px text-[10px] text-muted-foreground text-center"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        aria-hidden="true"
      >
        {bits.slice(0, columns).map((bit) => (
          <span key={`label-${bit}`}>{bit}</span>
        ))}
      </div>

      {/* Bit 值行 */}
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          role="row"
          className="grid gap-px"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {bits.slice(row * 16, (row + 1) * 16).map((bit) => renderCell(bit))}
        </div>
      ))}

      {/* 第二行编号（>16 位时） */}
      {width > 16 && (
        <div
          className="grid gap-px text-[10px] text-muted-foreground text-center"
          style={{ gridTemplateColumns: `repeat(16, 1fr)` }}
          aria-hidden="true"
        >
          {bits.slice(16).map((bit) => (
            <span key={`label2-${bit}`}>{bit}</span>
          ))}
        </div>
      )}
    </div>
  );
}
