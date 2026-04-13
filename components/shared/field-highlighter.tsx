"use client";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** A single colored segment for display */
export interface HighlightSegment {
  /** Hex bytes to display (e.g. "AA 55") */
  hex: string;
  /** Label for the segment */
  label: string;
  /** Background color class */
  bgColor: string;
  /** Text color class */
  textColor: string;
  /** Tooltip description */
  description?: string;
  /** Whether this segment has an error */
  hasError?: boolean;
}

interface FieldHighlighterProps {
  /** Segments to highlight */
  segments: HighlightSegment[];
  /** Additional class name */
  className?: string;
  /** Whether to show the legend below */
  showLegend?: boolean;
}

/**
 * FieldHighlighter displays a hex data frame with color-coded fields.
 * Each field is a clickable/hoverable segment with tooltip info.
 * Reusable across serial-parser, mqtt-parser, and other protocol tools.
 */
export function FieldHighlighter({
  segments,
  className,
  showLegend = true,
}: FieldHighlighterProps) {
  if (segments.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Colored hex segments */}
      <div className="flex flex-wrap gap-1">
        {segments.map((seg, i) => (
          <Tooltip key={i}>
            <TooltipTrigger
              render={
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2 py-1 font-mono text-xs transition-opacity hover:opacity-80",
                    seg.bgColor,
                    seg.textColor,
                    seg.hasError && "ring-2 ring-red-500/50"
                  )}
                >
                  {seg.hex}
                </span>
              }
            />
            <TooltipContent>
              <p className="font-medium">{seg.label}</p>
              {seg.description && (
                <p className="text-xs opacity-80">{seg.description}</p>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="grid grid-cols-2 gap-1 text-xs sm:grid-cols-3">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-block h-3 w-3 rounded-sm",
                  seg.bgColor
                )}
              />
              <span className="text-muted-foreground truncate">
                {seg.label}
              </span>
              <span className="font-mono text-foreground truncate">
                {seg.hex}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
