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
  /**
   * 可选位域可视化条：在 BitGrid 下方渲染 field 横条（startBit..endBit 占位）。
   * 默认 undefined —— 与 v1.3 行为完全一致，现有 3 处调用点零修改即兼容。
   */
  fields?: Array<{ startBit: number; endBit: number; name: string; color?: string }>;
}

export function BitGrid({
  value,
  width = 32,
  onBitToggle,
  labels = {},
  colors,
  className,
  readOnly = false,
  fields,
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

      {/* 可选 field 条（仅当 fields 非空时渲染，独立于上方 colors/labels 路径） */}
      {fields && fields.length > 0 && (
        <FieldBars fields={fields} width={width} />
      )}
    </div>
  );
}

/** field 横条：把每个 field 按 [startBit..endBit] 投影到与 grid 同列宽的 16 列条 */
function FieldBars({
  fields,
  width,
}: {
  fields: NonNullable<BitGridProps["fields"]>;
  width: number;
}) {
  const rowsCount = width > 16 ? 2 : 1;
  // 每行覆盖 16 个 bit，row 0 → 高 16 位（bit 31..16），row 1 → 低 16 位（bit 15..0），与上方 grid 对齐
  return (
    <div className="space-y-1 pt-2">
      {Array.from({ length: rowsCount }, (_, rowIdx) => {
        // row 0 显示高位段（width 32 时是 bit 31..16；width 16/8 时是唯一行）
        const rowHigh = width - 1 - rowIdx * 16;
        const rowLow = Math.max(0, rowHigh - 15);
        const rowFields = fields.filter(
          (f) => Math.max(f.startBit, f.endBit) >= rowLow && Math.min(f.startBit, f.endBit) <= rowHigh
        );
        return (
          <div
            key={rowIdx}
            className="grid gap-px"
            style={{ gridTemplateColumns: `repeat(${Math.min(width, 16)}, 1fr)` }}
            role="presentation"
          >
            {rowFields.map((f) => {
              const fLow = Math.min(f.startBit, f.endBit);
              const fHigh = Math.max(f.startBit, f.endBit);
              const segLow = Math.max(fLow, rowLow);
              const segHigh = Math.min(fHigh, rowHigh);
              // 列起始：高位在左 → 列号 = rowHigh - segHigh
              const colStart = rowHigh - segHigh + 1; // CSS grid 1-based
              const span = segHigh - segLow + 1;
              return (
                <div
                  key={`${f.name}-${segLow}`}
                  className={cn(
                    "h-5 rounded-sm border text-[10px] font-mono flex items-center justify-center truncate px-1",
                    !f.color && "bg-primary/20 border-primary/40 text-foreground"
                  )}
                  style={{
                    gridColumn: `${colStart} / span ${span}`,
                    ...(f.color
                      ? {
                          backgroundColor: `color-mix(in oklch, ${f.color} 25%, transparent)`,
                          borderColor: f.color,
                        }
                      : undefined),
                  }}
                  title={`${f.name} [${fHigh}:${fLow}]`}
                  aria-label={`位域 ${f.name}, bit ${fHigh} 到 ${fLow}`}
                >
                  {f.name}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
