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
import { BodePlot } from "./bode-plot";
import type {
  ResistanceUnit,
  CapacitanceUnit,
} from "@/types/rc-calculator";
import {
  toOhms,
  toFarads,
  calculateCutoffFrequency,
  generateLowPassBodeData,
  generateHighPassBodeData,
  formatResistance,
} from "@/lib/rc-calculator";

const R_UNITS: ResistanceUnit[] = ["Ω", "kΩ", "MΩ"];
const C_UNITS: CapacitanceUnit[] = ["pF", "nF", "μF"];

interface RCFilterTabProps {
  filterType: "low-pass" | "high-pass";
}

export function RCFilterTab({ filterType }: RCFilterTabProps) {
  const isLowPass = filterType === "low-pass";
  const [r, setR] = useState("10");
  const [rUnit, setRUnit] = useState<ResistanceUnit>("kΩ");
  const [c, setC] = useState("10");
  const [cUnit, setCUnit] = useState<CapacitanceUnit>("nF");

  const result = useMemo(() => {
    const rOhms = toOhms(parseFloat(r) || 0, rUnit);
    const cFarads = toFarads(parseFloat(c) || 0, cUnit);
    const fc = calculateCutoffFrequency(rOhms, cFarads);
    const bodeData = isLowPass
      ? generateLowPassBodeData(fc.cutoffFrequency)
      : generateHighPassBodeData(fc.cutoffFrequency);
    return { rOhms, cFarads, fc, bodeData };
  }, [r, rUnit, c, cUnit, isLowPass]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>参数输入</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">电阻 R</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={r}
                onChange={(e) => setR(e.target.value)}
                className="font-mono flex-1"
                min="0"
                step="any"
              />
              <Select
                value={rUnit}
                onValueChange={(v) => v && setRUnit(v as ResistanceUnit)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {R_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">电容 C</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={c}
                onChange={(e) => setC(e.target.value)}
                className="font-mono flex-1"
                min="0"
                step="any"
              />
              <Select
                value={cUnit}
                onValueChange={(v) => v && setCUnit(v as CapacitanceUnit)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {C_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">R =</span>
              <span className="font-mono text-sm">
                {formatResistance(result.rOhms)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">时间常数 τ =</span>
              <span className="font-mono text-sm">
                {result.fc.timeConstant > 0
                  ? `${(result.fc.timeConstant * 1e6).toPrecision(4)} μs`
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">截止频率 fc =</span>
              <Badge variant="secondary" className="font-mono">
                {result.fc.cutoffFrequencyFormatted}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>波特图（幅频特性）</CardTitle>
        </CardHeader>
        <CardContent>
          <BodePlot
            data={result.bodeData}
            cutoffFrequency={result.fc.cutoffFrequency}
            cutoffFrequencyLabel={result.fc.cutoffFrequencyFormatted}
            title={isLowPass ? "RC 低通滤波器" : "RC 高通滤波器"}
          />
        </CardContent>
      </Card>
    </div>
  );
}
