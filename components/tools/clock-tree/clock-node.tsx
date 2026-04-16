"use client";

import { cn } from "@/lib/utils";
import { formatFreq } from "@/lib/clock-tree";
import { AlertTriangle } from "lucide-react";

interface ClockNodeProps {
  /** Node label shown at the top */
  label: string;
  /** Current frequency in Hz */
  frequency: number;
  /** Whether this node is on the active (selected) path */
  active?: boolean;
  /** Whether this node exceeds its max frequency */
  violation?: boolean;
  /** Extra info line (e.g. "x9", "/2") */
  info?: string;
  /** The control to render inside the node */
  children?: React.ReactNode;
  className?: string;
}

export function ClockNode({
  label,
  frequency,
  active = true,
  violation = false,
  info,
  children,
  className,
}: ClockNodeProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-stretch rounded-lg border-2 bg-card px-3 py-2 text-sm transition-colors min-w-[130px]",
        violation
          ? "border-destructive bg-destructive/5"
          : active
            ? "border-primary/60 bg-primary/5"
            : "border-muted-foreground/30 bg-muted/30",
        className
      )}
    >
      {/* Header: label + violation icon */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <span
          className={cn(
            "font-semibold text-xs uppercase tracking-wide",
            violation
              ? "text-destructive"
              : active
                ? "text-primary"
                : "text-muted-foreground"
          )}
        >
          {label}
        </span>
        {violation && (
          <AlertTriangle className="size-3.5 text-destructive shrink-0" />
        )}
      </div>

      {/* Frequency display */}
      <div
        className={cn(
          "font-mono text-sm font-bold tabular-nums",
          violation ? "text-destructive" : active ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {formatFreq(frequency)}
      </div>

      {/* Optional info line */}
      {info && (
        <span className="text-xs text-muted-foreground font-mono mt-0.5">
          {info}
        </span>
      )}

      {/* Controls slot */}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

/* ---------- Connector line between nodes ---------- */

interface ConnectorProps {
  active?: boolean;
  className?: string;
}

export function Connector({ active = true, className }: ConnectorProps) {
  return (
    <div className={cn("flex items-center shrink-0", className)}>
      <div
        className={cn(
          "h-0.5 w-6 md:w-10",
          active ? "bg-primary/60" : "bg-muted-foreground/25"
        )}
      />
      {/* Arrow head */}
      <div
        className={cn(
          "w-0 h-0 border-y-[5px] border-y-transparent border-l-[7px]",
          active ? "border-l-primary/60" : "border-l-muted-foreground/25"
        )}
      />
    </div>
  );
}
