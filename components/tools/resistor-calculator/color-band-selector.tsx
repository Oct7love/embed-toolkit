"use client";

import type { ColorName, ColorInfo } from "@/types/resistor-calculator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check } from "lucide-react";

interface ColorBandSelectorProps {
  label: string;
  colors: ColorInfo[];
  selected: ColorName;
  onChange: (color: ColorName) => void;
}

/** 色环颜色选择器 */
export function ColorBandSelector({
  label,
  colors,
  selected,
  onChange,
}: ColorBandSelectorProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {colors.map((color) => {
          const isSelected = selected === color.name;
          return (
            <Tooltip key={color.name}>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={() => onChange(color.name)}
                    className={`relative h-8 w-8 rounded-md border-2 transition-all hover:scale-110 ${
                      isSelected
                        ? "border-ring ring-2 ring-ring/50 scale-110"
                        : "border-transparent ring-1 ring-foreground/10"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    aria-label={`${color.label} (${color.name})`}
                  >
                    {isSelected && (
                      <Check
                        className={`absolute inset-0 m-auto h-4 w-4 ${
                          ["black", "blue", "violet", "green"].includes(color.name)
                            ? "text-white"
                            : "text-black"
                        }`}
                      />
                    )}
                  </button>
                }
              />
              <TooltipContent>
                {color.label} ({color.name})
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
