"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/shared/copy-button";
import { CLOCK_PRESETS } from "@/types/timer-calculator";
import type { TimerResult } from "@/types/timer-calculator";
import {
  calculateTimerParams,
  periodToFreq,
  formatFrequency,
  formatPeriod,
  formatError,
} from "@/lib/timer-calculator";
import { Timer, Zap, ToggleLeft, ToggleRight, Info } from "lucide-react";

type InputMode = "frequency" | "period";

export function TimerCalculator() {
  // --- state ---
  const [presetIndex, setPresetIndex] = useState<string>("0");
  const [customFreqStr, setCustomFreqStr] = useState("");
  const [mode, setMode] = useState<InputMode>("frequency");
  const [targetStr, setTargetStr] = useState("1000");
  const [pwmEnabled, setPwmEnabled] = useState(false);
  const [dutyStr, setDutyStr] = useState("50");

  // --- derived ---
  const selectedPreset = CLOCK_PRESETS[Number(presetIndex)] ?? CLOCK_PRESETS[0];
  const isCustom = selectedPreset.label === "Custom";
  const clockFreq = isCustom ? Number(customFreqStr) || 0 : selectedPreset.freq;

  const targetValue = Number(targetStr) || 0;
  const dutyCycle = Math.max(0, Math.min(100, Number(dutyStr) || 0));

  const targetFreq = useMemo(() => {
    if (mode === "frequency") {
      return targetValue;
    }
    // period mode: input is in ms, convert to Hz
    return targetValue > 0 ? periodToFreq(targetValue / 1000) : 0;
  }, [mode, targetValue]);

  const results: TimerResult[] = useMemo(() => {
    if (clockFreq <= 0 || targetFreq <= 0) return [];
    return calculateTimerParams(clockFreq, targetFreq, pwmEnabled ? dutyCycle : 50, 20);
  }, [clockFreq, targetFreq, dutyCycle, pwmEnabled]);

  // --- handlers ---
  const handlePresetChange = useCallback((value: string | null) => {
    if (value !== null) {
      setPresetIndex(value);
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "frequency" ? "period" : "frequency"));
    setTargetStr("");
  }, []);

  const togglePwm = useCallback(() => {
    setPwmEnabled((prev) => !prev);
  }, []);

  // --- build copy text for a result row ---
  const buildCopyText = useCallback(
    (r: TimerResult) => {
      const lines = [
        `PSC = ${r.psc}`,
        `ARR = ${r.arr}`,
      ];
      if (pwmEnabled) {
        lines.push(`CCR = ${r.ccr}`);
      }
      lines.push(
        `// f_out = ${formatFrequency(r.actualFreq)} (error: ${formatError(r.error)})`
      );
      return lines.join("\n");
    },
    [pwmEnabled]
  );

  return (
    <div className="space-y-6">
      {/* Input section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Timer Configuration
          </CardTitle>
          <CardDescription>
            Select system clock, set target frequency or period, and enable PWM if needed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Clock source */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                System Clock
              </label>
              <Select value={presetIndex} onValueChange={handlePresetChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select clock source" />
                </SelectTrigger>
                <SelectContent>
                  {CLOCK_PRESETS.map((p, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isCustom && (
                <Input
                  type="number"
                  placeholder="Clock frequency (Hz)"
                  value={customFreqStr}
                  onChange={(e) => setCustomFreqStr(e.target.value)}
                  min={1}
                  className="font-mono"
                />
              )}
              {clockFreq > 0 && (
                <p className="text-xs text-muted-foreground font-mono">
                  f_clk = {formatFrequency(clockFreq)}
                </p>
              )}
            </div>

            {/* Target frequency / period */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  {mode === "frequency" ? "Target Frequency (Hz)" : "Target Period (ms)"}
                </label>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={toggleMode}
                  className="text-xs gap-1"
                >
                  {mode === "frequency" ? (
                    <ToggleLeft className="h-3.5 w-3.5" />
                  ) : (
                    <ToggleRight className="h-3.5 w-3.5" />
                  )}
                  {mode === "frequency" ? "Switch to Period" : "Switch to Frequency"}
                </Button>
              </div>
              <Input
                type="number"
                placeholder={mode === "frequency" ? "e.g. 1000" : "e.g. 1"}
                value={targetStr}
                onChange={(e) => setTargetStr(e.target.value)}
                min={0}
                step="any"
                className="font-mono"
              />
              {targetFreq > 0 && (
                <p className="text-xs text-muted-foreground font-mono">
                  {mode === "frequency"
                    ? `T = ${formatPeriod(1 / targetFreq)}`
                    : `f = ${formatFrequency(targetFreq)}`}
                </p>
              )}
            </div>

            {/* PWM toggle */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button
                  variant={pwmEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={togglePwm}
                  className="gap-1.5"
                >
                  <Zap className="h-3.5 w-3.5" />
                  PWM {pwmEnabled ? "ON" : "OFF"}
                </Button>
                {pwmEnabled && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground whitespace-nowrap">
                      Duty Cycle:
                    </label>
                    <Input
                      type="number"
                      value={dutyStr}
                      onChange={(e) => setDutyStr(e.target.value)}
                      min={0}
                      max={100}
                      step={1}
                      className="w-20 font-mono"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results table */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-base">
                  Calculation Results
                </CardTitle>
                <CardDescription>
                  Top {results.length} PSC/ARR combinations sorted by error
                </CardDescription>
              </div>
              <Badge variant="secondary" className="font-mono">
                {results.length} results
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-3 py-2 text-center font-medium text-muted-foreground w-10">
                      #
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                      PSC
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                      ARR
                    </th>
                    {pwmEnabled && (
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                        CCR
                      </th>
                    )}
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                      Actual Frequency
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                      Error
                    </th>
                    <th className="px-3 py-2 text-center font-medium text-muted-foreground w-16">
                      Copy
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr
                      key={`${r.psc}-${r.arr}`}
                      className={`border-b border-border/50 transition-colors hover:bg-muted/30 ${
                        r.error === 0
                          ? "bg-green-500/5"
                          : ""
                      }`}
                    >
                      <td className="px-3 py-2 text-center text-muted-foreground">
                        {i + 1}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-medium">
                        {r.psc}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-medium">
                        {r.arr}
                      </td>
                      {pwmEnabled && (
                        <td className="px-3 py-2 text-right font-mono font-medium text-blue-600 dark:text-blue-400">
                          {r.ccr}
                        </td>
                      )}
                      <td className="px-3 py-2 text-right font-mono">
                        {formatFrequency(r.actualFreq)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {r.error === 0 ? (
                          <Badge
                            variant="secondary"
                            className="bg-green-500/10 text-green-700 dark:text-green-400 font-mono text-xs"
                          >
                            Exact
                          </Badge>
                        ) : (
                          <span
                            className={
                              r.error < 0.1
                                ? "text-green-600 dark:text-green-400"
                                : r.error < 1
                                  ? "text-yellow-600 dark:text-yellow-400"
                                  : "text-red-600 dark:text-red-400"
                            }
                          >
                            {formatError(r.error)}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <CopyButton value={buildCopyText(r)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No results hint */}
      {clockFreq > 0 && targetFreq > 0 && results.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No valid PSC/ARR combinations found. The target frequency may be too high or too low for the given clock.
          </CardContent>
        </Card>
      )}

      {/* Formula reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Formula Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="space-y-2">
              <h3 className="font-medium">Timer Output Frequency</h3>
              <div className="rounded-md bg-muted/50 p-3 font-mono text-center">
                f_out = f_clk / ((PSC + 1) &times; (ARR + 1))
              </div>
              <p className="text-muted-foreground">
                PSC (Prescaler) divides the clock, ARR (Auto-Reload Register) defines the counter period.
                Both are 16-bit registers (0 ~ 65535).
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">PWM Duty Cycle</h3>
              <div className="rounded-md bg-muted/50 p-3 font-mono text-center">
                duty = CCR / (ARR + 1) &times; 100%
              </div>
              <p className="text-muted-foreground">
                CCR (Capture/Compare Register) controls the duty cycle.
                CCR = duty% &times; (ARR + 1) / 100.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Period</h3>
              <div className="rounded-md bg-muted/50 p-3 font-mono text-center">
                T = 1 / f_out = (PSC + 1) &times; (ARR + 1) / f_clk
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
