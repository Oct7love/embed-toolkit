"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { ResistanceUnit, DividerMode } from "@/types/rc-calculator";
import {
  toOhms,
  calculateVoltageDividerForward,
  calculateVoltageDividerReverse,
  formatResistance,
  findNearestE24,
} from "@/lib/rc-calculator";

const RESISTANCE_UNITS: ResistanceUnit[] = ["Ω", "kΩ", "MΩ"];

export function VoltageDividerTab() {
  const [mode, setMode] = useState<DividerMode>("forward");
  const [vin, setVin] = useState("5");
  const [r1, setR1] = useState("10");
  const [r1Unit, setR1Unit] = useState<ResistanceUnit>("kΩ");
  const [r2, setR2] = useState("10");
  const [r2Unit, setR2Unit] = useState<ResistanceUnit>("kΩ");
  const [targetVout, setTargetVout] = useState("3.3");

  const result = useMemo(() => {
    const vinNum = parseFloat(vin);
    const r1Num = parseFloat(r1);

    if (isNaN(vinNum) || isNaN(r1Num) || vinNum <= 0 || r1Num <= 0) {
      return null;
    }

    const r1Ohms = toOhms(r1Num, r1Unit);

    if (mode === "forward") {
      const r2Num = parseFloat(r2);
      if (isNaN(r2Num) || r2Num <= 0) return null;
      const r2Ohms = toOhms(r2Num, r2Unit);
      return calculateVoltageDividerForward(vinNum, r1Ohms, r2Ohms);
    } else {
      const voutNum = parseFloat(targetVout);
      if (isNaN(voutNum) || voutNum <= 0 || voutNum >= vinNum) return null;
      return calculateVoltageDividerReverse(vinNum, voutNum, r1Ohms);
    }
  }, [mode, vin, r1, r1Unit, r2, r2Unit, targetVout]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Input section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">参数输入</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("forward")}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === "forward"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              正向计算
            </button>
            <button
              type="button"
              onClick={() => setMode("reverse")}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === "reverse"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              反向推算 R2
            </button>
          </div>

          {/* Vin */}
          <div>
            <label className="text-sm font-medium text-foreground">
              输入电压 Vin (V)
            </label>
            <Input
              type="number"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              placeholder="例如 5"
              className="mt-1 font-mono"
            />
          </div>

          {/* R1 */}
          <div>
            <label className="text-sm font-medium text-foreground">
              电阻 R1
            </label>
            <div className="mt-1 flex gap-2">
              <Input
                type="number"
                value={r1}
                onChange={(e) => setR1(e.target.value)}
                placeholder="例如 10"
                className="flex-1 font-mono"
              />
              <Select
                value={r1Unit}
                onValueChange={(v) => setR1Unit(v as ResistanceUnit)}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESISTANCE_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* R2 or Target Vout */}
          {mode === "forward" ? (
            <div>
              <label className="text-sm font-medium text-foreground">
                电阻 R2
              </label>
              <div className="mt-1 flex gap-2">
                <Input
                  type="number"
                  value={r2}
                  onChange={(e) => setR2(e.target.value)}
                  placeholder="例如 10"
                  className="flex-1 font-mono"
                />
                <Select
                  value={r2Unit}
                  onValueChange={(v) => setR2Unit(v as ResistanceUnit)}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESISTANCE_UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-foreground">
                目标 Vout (V)
              </label>
              <Input
                type="number"
                value={targetVout}
                onChange={(e) => setTargetVout(e.target.value)}
                placeholder="例如 3.3"
                className="mt-1 font-mono"
              />
            </div>
          )}

          {/* Formula hint */}
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              {mode === "forward" ? (
                <>
                  公式：V<sub>out</sub> = V<sub>in</sub> &times; R2 / (R1 + R2)
                </>
              ) : (
                <>
                  公式：R2 = R1 &times; V<sub>out</sub> / (V<sub>in</sub> - V
                  <sub>out</sub>)
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Result section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">计算结果</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              {/* Vout */}
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">输出电压 Vout</div>
                <div className="mt-1 text-2xl font-bold font-mono text-foreground">
                  {result.vout.toFixed(4)} V
                </div>
              </div>

              {/* Ratio */}
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">分压比</div>
                <div className="mt-1 text-lg font-semibold font-mono text-foreground">
                  {(result.ratio * 100).toFixed(2)}%
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground font-mono">
                  R2 / (R1 + R2) = {result.ratio.toFixed(6)}
                </div>
              </div>

              {/* R2 result (reverse mode) */}
              {mode === "reverse" && (
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">
                    计算得 R2
                  </div>
                  <div className="mt-1 text-lg font-semibold font-mono text-foreground">
                    {formatResistance(result.r2)}
                  </div>
                  {result.r2Nearest && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline">E24 最近值</Badge>
                      <span className="font-mono text-sm">
                        {formatResistance(result.r2Nearest)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* E24 nearest for forward mode */}
              {mode === "forward" && result.r2Nearest && (
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">
                    R2 最近 E24 标准值
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline">E24</Badge>
                    <span className="font-mono text-sm">
                      {formatResistance(result.r2Nearest)}
                    </span>
                  </div>
                  {result.r2Nearest !== result.r2 && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      使用 E24 值时 Vout ={" "}
                      <span className="font-mono">
                        {(
                          parseFloat(vin) *
                          (result.r2Nearest /
                            (toOhms(parseFloat(r1), r1Unit) + result.r2Nearest))
                        ).toFixed(4)}{" "}
                        V
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Circuit diagram */}
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="text-xs text-muted-foreground mb-2">
                  电路示意
                </div>
                <pre className="text-xs font-mono text-foreground leading-5">
                  {`  Vin (${vin}V)
   │
  [R1] ${formatResistance(toOhms(parseFloat(r1) || 0, r1Unit))}
   │
   ├──── Vout (${result.vout.toFixed(3)}V)
   │
  [R2] ${mode === "forward" ? formatResistance(toOhms(parseFloat(r2) || 0, r2Unit)) : formatResistance(result.r2)}
   │
  GND`}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
              请输入有效参数以查看结果
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
