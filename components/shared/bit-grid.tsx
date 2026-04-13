"use client";

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

  function renderCell(bit: number) {
    const isSet = (value >>> bit) & 1;
    const label = labels[bit];
    const color = colors?.[bit];

    const cell = (
      <button
        key={bit}
        type="button"
        disabled={readOnly}
        onClick={() => onBitToggle?.(bit)}
        className={cn(
          "h-8 flex items-center justify-center font-mono text-sm border rounded-sm transition-colors",
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
        aria-label={`Bit ${bit}, 值: ${isSet}`}
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
    <div className={cn("space-y-1", className)}>
      {/* Bit 编号行 */}
      <div
        className="grid gap-px text-[10px] text-muted-foreground text-center"
        style={{ gridTemplateColumns: `repeat(${Math.min(width, 16)}, 1fr)` }}
      >
        {bits.slice(0, Math.min(width, 16)).map((bit) => (
          <span key={`label-${bit}`}>{bit}</span>
        ))}
      </div>

      {/* Bit 值行 */}
      {Array.from({ length: Math.ceil(width / 16) }, (_, row) => (
        <div
          key={row}
          className="grid gap-px"
          style={{ gridTemplateColumns: `repeat(${Math.min(width, 16)}, 1fr)` }}
        >
          {bits.slice(row * 16, (row + 1) * 16).map((bit) => renderCell(bit))}
        </div>
      ))}

      {/* 第二行编号（>16 位时） */}
      {width > 16 && (
        <div
          className="grid gap-px text-[10px] text-muted-foreground text-center"
          style={{ gridTemplateColumns: `repeat(16, 1fr)` }}
        >
          {bits.slice(16).map((bit) => (
            <span key={`label2-${bit}`}>{bit}</span>
          ))}
        </div>
      )}
    </div>
  );
}
