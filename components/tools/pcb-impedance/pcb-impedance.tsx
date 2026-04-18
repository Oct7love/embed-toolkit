"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateImpedance, solveWidth } from "@/lib/pcb-impedance";
import { MIL_TO_MM, milToMm, mmToMil, type Geometry, type LengthUnit } from "@/types/pcb-impedance";
import { CrossSection } from "./cross-section";

type GeoState = {
  width: string;
  thickness: string;
  height: string;
  spacing: string;
  er: string;
  targetZ: string;
};

const DEFAULT_STATE: Record<Geometry, GeoState> = {
  microstrip: { width: "7", thickness: "1.4", height: "5", spacing: "5", er: "4.5", targetZ: "50" },
  stripline:  { width: "6", thickness: "1.4", height: "20", spacing: "5", er: "4.5", targetZ: "50" },
  diff:       { width: "5", thickness: "1.4", height: "5", spacing: "5", er: "4.5", targetZ: "100" },
};

export function PcbImpedance() {
  const [unit, setUnit] = useState<LengthUnit>("mil");
  const [geo, setGeo] = useState<Geometry>("microstrip");
  const [state, setState] = useState(DEFAULT_STATE);

  const toMm = (v: string): number => {
    const n = parseFloat(v);
    if (!isFinite(n) || n <= 0) return 0;
    return unit === "mil" ? milToMm(n) : n;
  };
  const toMil = (v: string): number => {
    const n = parseFloat(v);
    if (!isFinite(n) || n <= 0) return 0;
    return unit === "mil" ? n : mmToMil(n);
  };

  const cur = state[geo];

  const result = useMemo(() => {
    const widthMm = toMm(cur.width);
    const thicknessMm = toMm(cur.thickness);
    const heightMm = toMm(cur.height);
    const spacingMm = toMm(cur.spacing);
    const er = parseFloat(cur.er);
    if (widthMm <= 0 || thicknessMm <= 0 || heightMm <= 0 || !isFinite(er) || er <= 0) {
      return null;
    }
    if (geo === "diff") {
      return calculateImpedance("diff", { widthMm, thicknessMm, heightMm, er, spacingMm });
    }
    return calculateImpedance(geo, { widthMm, thicknessMm, heightMm, er });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo, cur.width, cur.thickness, cur.height, cur.spacing, cur.er, unit]);

  const setField = (k: keyof GeoState, v: string) => {
    setState((s) => ({ ...s, [geo]: { ...s[geo], [k]: v } }));
  };

  // mil <-> mm switch: in-place convert all geometric fields.
  const switchUnit = (next: LengthUnit) => {
    if (next === unit) return;
    const conv = (v: string) => {
      const n = parseFloat(v);
      if (!isFinite(n) || n <= 0) return v;
      return next === "mm" ? (n * MIL_TO_MM).toFixed(3) : (n / MIL_TO_MM).toFixed(2);
    };
    setState((s) => {
      const out = { ...s };
      (Object.keys(s) as Geometry[]).forEach((g) => {
        const cv = s[g];
        out[g] = { ...cv, width: conv(cv.width), thickness: conv(cv.thickness), height: conv(cv.height), spacing: conv(cv.spacing) };
      });
      return out;
    });
    setUnit(next);
  };

  const onSolve = () => {
    const targetZ = parseFloat(cur.targetZ);
    const thicknessMm = toMm(cur.thickness);
    const heightMm = toMm(cur.height);
    const er = parseFloat(cur.er);
    if (!isFinite(targetZ) || targetZ <= 0 || thicknessMm <= 0 || heightMm <= 0 || !isFinite(er)) return;
    const r = geo === "diff"
      ? solveWidth("diff", targetZ, { thicknessMm, heightMm, er, spacingMm: toMm(cur.spacing) })
      : solveWidth(geo, targetZ, { thicknessMm, heightMm, er });
    const w = unit === "mil" ? mmToMil(r.widthMm) : r.widthMm;
    setField("width", unit === "mil" ? w.toFixed(2) : w.toFixed(3));
  };

  const fmtN = (n: number, d = 2) => n.toFixed(d);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-muted-foreground">单位:</span>
        <div className="inline-flex rounded-md border bg-muted p-0.5">
          {(["mil", "mm"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => switchUnit(u)}
              className={`px-3 py-1 text-xs font-medium rounded ${
                unit === u
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <Tabs value={geo} onValueChange={(v) => v && setGeo(v as Geometry)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="microstrip">微带线 Microstrip</TabsTrigger>
          <TabsTrigger value="stripline">带状线 Stripline</TabsTrigger>
          <TabsTrigger value="diff">差分对 Diff Pair</TabsTrigger>
        </TabsList>

        {(["microstrip", "stripline", "diff"] as Geometry[]).map((g) => (
          <TabsContent key={g} value={g}>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">参数输入 ({unit})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Field label={`线宽 W (${unit})`} value={cur.width} onChange={(v) => setField("width", v)} />
                  <Field label={`铜厚 T (${unit})`} value={cur.thickness} onChange={(v) => setField("thickness", v)} />
                  <Field label={`介质厚度 H (${unit})`} value={cur.height} onChange={(v) => setField("height", v)} />
                  {g === "diff" && (
                    <Field label={`间距 S (${unit})`} value={cur.spacing} onChange={(v) => setField("spacing", v)} />
                  )}
                  <Field label="介电常数 εr" value={cur.er} onChange={(v) => setField("er", v)} />

                  <div className="border-t pt-3 mt-3 space-y-2">
                    <div className="text-xs text-muted-foreground">反查：给定 Z₀ 求 W</div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        value={cur.targetZ}
                        onChange={(e) => setField("targetZ", e.target.value)}
                        placeholder={g === "diff" ? "目标 Z_diff (Ω)" : "目标 Z₀ (Ω)"}
                        className="font-mono"
                      />
                      <Button onClick={onSolve} variant="secondary" size="sm">求解 W</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">截面图 & 结果</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CrossSection
                    geometry={g}
                    widthMil={toMil(cur.width)}
                    thicknessMil={toMil(cur.thickness)}
                    heightMil={toMil(cur.height)}
                    spacingMil={toMil(cur.spacing)}
                  />
                  {result && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <ResultRow label={g === "diff" ? "单端 Z₀" : "特征阻抗 Z₀"} value={`${fmtN(result.z0)} Ω`} highlight={g !== "diff"} />
                      {result.zDiff !== undefined && (
                        <ResultRow label="差分阻抗 Z_diff" value={`${fmtN(result.zDiff)} Ω`} highlight />
                      )}
                      <ResultRow label="有效介电常数 εeff" value={fmtN(result.epsEff, 2)} />
                      <ResultRow label="传播延迟" value={`${fmtN(result.propDelayPsPerInch, 1)} ps/in`} />
                    </div>
                  )}
                  {result?.warnings && result.warnings.length > 0 && (
                    <div className="space-y-1 pt-2 border-t">
                      {result.warnings.map((w) => (
                        <Badge key={w} variant="outline" className="text-xs whitespace-normal text-left">
                          {w}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <Input type="number" step="0.01" value={value} onChange={(e) => onChange(e.target.value)} className="font-mono" />
    </div>
  );
}

function ResultRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border px-2 py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`font-mono ${highlight ? "text-primary font-semibold" : ""}`}>{value}</span>
    </div>
  );
}
