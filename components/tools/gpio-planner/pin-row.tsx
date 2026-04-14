"use client";

import { memo, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { PinDefinition } from "@/types/gpio-planner";
import { cn } from "@/lib/utils";

interface PinRowProps {
  pin: PinDefinition;
  assignedFunction: string | undefined;
  isConflict: boolean;
  onAssign: (pinNumber: number, func: string) => void;
  onClear: (pinNumber: number) => void;
}

export const PinRow = memo(function PinRow({
  pin,
  assignedFunction,
  isConflict,
  onAssign,
  onClear,
}: PinRowProps) {
  const hasAlternates = pin.alternateFunctions.length > 0;

  const handleValueChange = useCallback(
    (value: string | null) => {
      if (!value || value === "__none__") {
        onClear(pin.number);
      } else {
        onAssign(pin.number, value);
      }
    },
    [pin.number, onAssign, onClear]
  );

  return (
    <tr
      className={cn(
        "border-b border-border transition-colors",
        isConflict && "bg-destructive/10",
        !hasAlternates && "opacity-60"
      )}
    >
      {/* Pin number */}
      <td className="px-3 py-2 text-center font-mono text-sm">
        {pin.number}
      </td>

      {/* Pin name */}
      <td className="px-3 py-2">
        <span className="font-mono text-sm font-medium">{pin.name}</span>
      </td>

      {/* Default function */}
      <td className="px-3 py-2">
        <Badge variant="outline" className="font-mono text-xs">
          {pin.defaultFunction}
        </Badge>
      </td>

      {/* Assigned function (select) */}
      <td className="px-3 py-2">
        {hasAlternates ? (
          <Select
            value={assignedFunction ?? "__none__"}
            onValueChange={handleValueChange}
          >
            <SelectTrigger
              size="sm"
              className={cn(
                "w-[180px]",
                isConflict && "border-destructive text-destructive"
              )}
            >
              <SelectValue placeholder="Select function" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">-- None --</SelectItem>
              {pin.alternateFunctions.map((func) => (
                <SelectItem key={func} value={func}>
                  {func}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-xs text-muted-foreground">N/A</span>
        )}
      </td>

      {/* Conflict indicator */}
      <td className="px-3 py-2 text-center">
        {isConflict && (
          <Badge variant="destructive" className="text-xs">
            Conflict
          </Badge>
        )}
      </td>
    </tr>
  );
});
