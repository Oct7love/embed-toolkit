"use client";

import { useMemo, useCallback, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CodeBlock } from "@/components/shared/code-block";
import { useGpioPlannerStore } from "@/stores/gpio-planner-store";
import { CHIPS, getChipById } from "@/lib/gpio-planner/chips";
import { detectConflicts, isPinInConflict } from "@/lib/gpio-planner/conflict-detector";
import { generateCode } from "@/lib/gpio-planner/code-generator";
import { PinRow } from "./pin-row";
import { Trash2, Download, AlertTriangle } from "lucide-react";

export function GpioPlanner() {
  const { chipId, assignments, setChipId, assignPin, clearPin, clearAll } =
    useGpioPlannerStore();

  const [showCode, setShowCode] = useState(false);

  const chip = useMemo(() => getChipById(chipId), [chipId]);

  const conflicts = useMemo(() => {
    if (!chip) return [];
    return detectConflicts(chip, assignments);
  }, [chip, assignments]);

  const code = useMemo(() => {
    if (!chip) return "";
    return generateCode(chip, assignments);
  }, [chip, assignments]);

  const assignedCount = useMemo(
    () => Object.keys(assignments).length,
    [assignments]
  );

  const handleChipChange = useCallback(
    (value: string | null) => {
      if (value) {
        setChipId(value);
      }
    },
    [setChipId]
  );

  const handleAssign = useCallback(
    (pinNumber: number, func: string) => {
      assignPin(pinNumber, func);
    },
    [assignPin]
  );

  const handleClear = useCallback(
    (pinNumber: number) => {
      clearPin(pinNumber);
    },
    [clearPin]
  );

  if (!chip) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No chip selected
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chip selector & summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-base">Chip Selection</CardTitle>
              <CardDescription>
                Select MCU and assign pin functions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={chipId} onValueChange={handleChipChange}>
                <SelectTrigger className="w-[220px]" size="sm">
                  <SelectValue placeholder="Select chip" />
                </SelectTrigger>
                <SelectContent>
                  {CHIPS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.package})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                disabled={assignedCount === 0}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Chip:</span>
              <span className="font-mono font-medium">{chip.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Package:</span>
              <span className="font-mono">{chip.package}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Total Pins:</span>
              <span className="font-mono">{chip.pins.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Assigned:</span>
              <Badge variant="secondary" className="font-mono">
                {assignedCount}
              </Badge>
            </div>
            {conflicts.length > 0 && (
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <Badge variant="destructive" className="font-mono">
                  {conflicts.length} conflict{conflicts.length > 1 ? "s" : ""}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conflict warnings */}
      {conflicts.length > 0 && (
        <Card className="border-destructive">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pin Conflicts Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conflicts.map((conflict) => (
                <div
                  key={conflict.functionName}
                  className="flex items-center gap-2 text-sm"
                >
                  <Badge variant="destructive" className="font-mono text-xs">
                    {conflict.functionName}
                  </Badge>
                  <span className="text-muted-foreground">assigned to pins:</span>
                  <span className="font-mono">
                    {conflict.pinNumbers
                      .map((pn) => {
                        const p = chip.pins.find((pp) => pp.number === pn);
                        return p ? p.name : `#${pn}`;
                      })
                      .join(", ")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pin table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pin Assignment Table</CardTitle>
          <CardDescription>
            Assign alternate functions to each configurable pin
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="min-w-[640px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-3 py-2 text-center font-medium text-muted-foreground w-16">
                      Pin
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground w-28">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground w-32">
                      Default
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                      Assigned Function
                    </th>
                    <th className="px-3 py-2 text-center font-medium text-muted-foreground w-24">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chip.pins.map((pin) => (
                    <PinRow
                      key={pin.number}
                      pin={pin}
                      assignedFunction={assignments[pin.number]}
                      isConflict={isPinInConflict(pin.number, conflicts)}
                      onAssign={handleAssign}
                      onClear={handleClear}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Code export */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base">Export C Code</CardTitle>
              <CardDescription>
                {chip.id === "stm32f103c8t6"
                  ? "STM32 HAL GPIO initialization code"
                  : "ESP32 Arduino GPIO initialization code"}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCode(!showCode)}
              disabled={assignedCount === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              {showCode ? "Hide Code" : "Show Code"}
            </Button>
          </div>
        </CardHeader>
        {showCode && assignedCount > 0 && (
          <CardContent>
            <CodeBlock
              code={code}
              language="c"
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
