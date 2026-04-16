"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/shared/code-block";
import { ClockNode, Connector } from "./clock-node";
import { CHIP_CONSTRAINTS } from "@/lib/clock-tree/constraints";
import { getConstraintsById } from "@/lib/clock-tree/constraints";
import {
  calculateFrequencies,
  checkViolations,
  createDefaultConfig,
  generateCode,
  formatFreq,
} from "@/lib/clock-tree";
import type {
  ClockConfig,
  PllParamsF1,
  PllParamsF4,
  PllParamsH7,
  SysclkSource,
  PllSource,
} from "@/types/clock-tree";
import { AHB_DIVIDERS, APB_DIVIDERS } from "@/types/clock-tree";
import { AlertTriangle, Code, Cpu } from "lucide-react";

/* ================================================================== */
/*  Helper: number range → array                                       */
/* ================================================================== */
function rangeArray(min: number, max: number): number[] {
  const arr: number[] = [];
  for (let i = min; i <= max; i++) arr.push(i);
  return arr;
}

/* ================================================================== */
/*  Main component                                                     */
/* ================================================================== */

export function ClockTree() {
  const [config, setConfig] = useState<ClockConfig>(() =>
    createDefaultConfig("stm32f1")
  );

  const constraints = useMemo(
    () => getConstraintsById(config.chipId),
    [config.chipId]
  );

  const freqs = useMemo(() => calculateFrequencies(config), [config]);
  const violations = useMemo(
    () => checkViolations(freqs, constraints),
    [freqs, constraints]
  );
  const code = useMemo(() => generateCode(config, freqs), [config, freqs]);

  const violationSet = useMemo(
    () => new Set(violations.map((v) => v.node)),
    [violations]
  );

  /* ---------- Updaters ---------- */

  const update = useCallback(
    (patch: Partial<ClockConfig>) =>
      setConfig((prev) => ({ ...prev, ...patch })),
    []
  );

  const handleChipChange = useCallback((value: string | null) => {
    if (value === null) return;
    setConfig(createDefaultConfig(value));
  }, []);

  const handleHseFreqChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const mhz = parseFloat(e.target.value);
      if (!isNaN(mhz) && mhz > 0) {
        update({ hseFreq: mhz * 1_000_000 });
      }
    },
    [update]
  );

  const handleSysclkSrcChange = useCallback(
    (value: string | null) => {
      if (value !== null) update({ sysclkSource: value as SysclkSource });
    },
    [update]
  );

  const handlePllSrcChange = useCallback(
    (value: string | null) => {
      if (value === null) return;
      setConfig((prev) => ({
        ...prev,
        pll: { ...prev.pll, pllSrc: value as PllSource },
      }));
    },
    []
  );

  const handleAhbDivChange = useCallback(
    (value: string | null) => {
      if (value !== null) update({ ahbDiv: Number(value) });
    },
    [update]
  );

  const handleApb1DivChange = useCallback(
    (value: string | null) => {
      if (value !== null) update({ apb1Div: Number(value) });
    },
    [update]
  );

  const handleApb2DivChange = useCallback(
    (value: string | null) => {
      if (value !== null) update({ apb2Div: Number(value) });
    },
    [update]
  );

  /* ---------- PLL param updaters (per-family) ---------- */

  const updatePllF1 = useCallback(
    (patch: Partial<PllParamsF1>) =>
      setConfig((prev) => ({
        ...prev,
        pll: { ...prev.pll, ...patch } as PllParamsF1,
      })),
    []
  );

  const updatePllF4 = useCallback(
    (patch: Partial<PllParamsF4>) =>
      setConfig((prev) => ({
        ...prev,
        pll: { ...prev.pll, ...patch } as PllParamsF4,
      })),
    []
  );

  const updatePllH7 = useCallback(
    (patch: Partial<PllParamsH7>) =>
      setConfig((prev) => ({
        ...prev,
        pll: { ...prev.pll, ...patch } as PllParamsH7,
      })),
    []
  );

  /* ---------- Whether nodes are on the active path ---------- */
  const hsiActive =
    config.sysclkSource === "HSI" ||
    (config.sysclkSource === "PLL" && config.pll.pllSrc === "HSI");
  const hseActive =
    config.sysclkSource === "HSE" ||
    (config.sysclkSource === "PLL" && config.pll.pllSrc === "HSE");
  const pllActive = config.sysclkSource === "PLL";

  /* ---------- PLL controls per family ---------- */
  function renderPllControls() {
    switch (config.pll.type) {
      case "f1": {
        const pll = config.pll;
        const range = constraints.pllMulRange ?? [2, 16];
        return (
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">PLL 源</label>
            <Select value={pll.pllSrc} onValueChange={handlePllSrcChange}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HSI">HSI / 2</SelectItem>
                <SelectItem value="HSE">HSE</SelectItem>
              </SelectContent>
            </Select>
            <label className="text-xs text-muted-foreground">PLLMUL</label>
            <Select
              value={String(pll.pllMul)}
              onValueChange={(v) => {
                if (v !== null) updatePllF1({ pllMul: Number(v) });
              }}
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rangeArray(range[0], range[1]).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    x{n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }
      case "f4": {
        const pll = config.pll;
        return (
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">PLL 源</label>
            <Select value={pll.pllSrc} onValueChange={handlePllSrcChange}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HSI">HSI</SelectItem>
                <SelectItem value="HSE">HSE</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-xs text-muted-foreground">PLLM</label>
                <Input
                  type="number"
                  min={constraints.pllMRange?.[0] ?? 2}
                  max={constraints.pllMRange?.[1] ?? 63}
                  value={pll.pllM}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v)) updatePllF4({ pllM: v });
                  }}
                  className="font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">PLLN</label>
                <Input
                  type="number"
                  min={constraints.pllNRange?.[0] ?? 50}
                  max={constraints.pllNRange?.[1] ?? 432}
                  value={pll.pllN}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v)) updatePllF4({ pllN: v });
                  }}
                  className="font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">PLLP</label>
                <Select
                  value={String(pll.pllP)}
                  onValueChange={(v) => {
                    if (v !== null) updatePllF4({ pllP: Number(v) });
                  }}
                >
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(constraints.pllPOptions ?? [2, 4, 6, 8]).map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        /{n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">PLLQ</label>
                <Input
                  type="number"
                  min={constraints.pllQRange?.[0] ?? 2}
                  max={constraints.pllQRange?.[1] ?? 15}
                  value={pll.pllQ}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v)) updatePllF4({ pllQ: v });
                  }}
                  className="font-mono"
                />
              </div>
            </div>
          </div>
        );
      }
      case "h7": {
        const pll = config.pll;
        return (
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">PLL 源</label>
            <Select value={pll.pllSrc} onValueChange={handlePllSrcChange}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HSI">HSI</SelectItem>
                <SelectItem value="HSE">HSE</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-3 gap-1.5">
              <div>
                <label className="text-xs text-muted-foreground">DIVM</label>
                <Input
                  type="number"
                  min={constraints.divMRange?.[0] ?? 1}
                  max={constraints.divMRange?.[1] ?? 63}
                  value={pll.divM}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v)) updatePllH7({ divM: v });
                  }}
                  className="font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">DIVN</label>
                <Input
                  type="number"
                  min={constraints.divNRange?.[0] ?? 4}
                  max={constraints.divNRange?.[1] ?? 512}
                  value={pll.divN}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v)) updatePllH7({ divN: v });
                  }}
                  className="font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">DIVP</label>
                <Input
                  type="number"
                  min={constraints.divPRange?.[0] ?? 2}
                  max={constraints.divPRange?.[1] ?? 128}
                  value={pll.divP}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v)) updatePllH7({ divP: v });
                  }}
                  className="font-mono"
                />
              </div>
            </div>
          </div>
        );
      }
    }
  }

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div className="space-y-6">
      {/* ---- Chip selector ---- */}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="size-4" />
            芯片系列
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={config.chipId} onValueChange={handleChipChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHIP_CONSTRAINTS.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-2 text-xs text-muted-foreground">
            HSI = {formatFreq(constraints.hsiFreq)} &middot; SYSCLK max{" "}
            {formatFreq(constraints.maxSysclk)} &middot; APB1 max{" "}
            {formatFreq(constraints.maxApb1)} &middot; APB2 max{" "}
            {formatFreq(constraints.maxApb2)}
          </p>
        </CardContent>
      </Card>

      {/* ---- Violations banner ---- */}
      {violations.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 space-y-1">
          {violations.map((v, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm text-destructive"
            >
              <AlertTriangle className="size-4 shrink-0" />
              <span>{v.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* ---- Clock tree flow diagram ---- */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>时钟树</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="flex items-start gap-0 min-w-[800px] py-2">
            {/* ---- Column 1: Clock sources (HSI + HSE stacked) ---- */}
            <div className="flex flex-col gap-3 shrink-0">
              <ClockNode
                label="HSI"
                frequency={freqs.hsi}
                active={hsiActive}
                info="内部 RC"
              />
              <ClockNode
                label="HSE"
                frequency={freqs.hse}
                active={hseActive}
                info="外部晶振"
              >
                <div>
                  <label className="text-xs text-muted-foreground">
                    频率 (MHz)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    step={0.1}
                    value={config.hseFreq / 1_000_000}
                    onChange={handleHseFreqChange}
                    className="font-mono w-20"
                  />
                </div>
              </ClockNode>
            </div>

            {/* ---- Connector → PLL ---- */}
            <div className="flex flex-col justify-center self-stretch shrink-0">
              <div className="flex items-center h-1/2">
                <Connector active={hsiActive && pllActive} />
              </div>
              <div className="flex items-center h-1/2">
                <Connector active={hseActive && pllActive} />
              </div>
            </div>

            {/* ---- Column 2: PLL ---- */}
            <div className="flex items-center self-stretch shrink-0">
              <ClockNode
                label="PLL"
                frequency={freqs.pllOutput}
                active={pllActive}
                violation={pllActive && violationSet.has("SYSCLK") && config.sysclkSource === "PLL"}
                info={
                  config.pll.type === "f1"
                    ? `x${config.pll.pllMul}`
                    : config.pll.type === "f4"
                      ? `M=${config.pll.pllM} N=${config.pll.pllN} P=${config.pll.pllP}`
                      : `M=${config.pll.divM} N=${config.pll.divN} P=${config.pll.divP}`
                }
                className="min-w-[160px]"
              >
                {renderPllControls()}
              </ClockNode>
            </div>

            {/* ---- Connector → SYSCLK ---- */}
            <div className="flex items-center self-stretch shrink-0">
              <Connector active />
            </div>

            {/* ---- Column 3: SYSCLK ---- */}
            <div className="flex items-center self-stretch shrink-0">
              <ClockNode
                label="SYSCLK"
                frequency={freqs.sysclk}
                active
                violation={violationSet.has("SYSCLK")}
              >
                <div>
                  <label className="text-xs text-muted-foreground">
                    时钟源
                  </label>
                  <Select
                    value={config.sysclkSource}
                    onValueChange={handleSysclkSrcChange}
                  >
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HSI">HSI</SelectItem>
                      <SelectItem value="HSE">HSE</SelectItem>
                      <SelectItem value="PLL">PLL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </ClockNode>
            </div>

            {/* ---- Connector → AHB ---- */}
            <div className="flex items-center self-stretch shrink-0">
              <Connector active />
            </div>

            {/* ---- Column 4: AHB ---- */}
            <div className="flex items-center self-stretch shrink-0">
              <ClockNode
                label="AHB / HCLK"
                frequency={freqs.ahb}
                active
                violation={violationSet.has("AHB")}
                info={`/${config.ahbDiv}`}
              >
                <div>
                  <label className="text-xs text-muted-foreground">
                    分频
                  </label>
                  <Select
                    value={String(config.ahbDiv)}
                    onValueChange={handleAhbDivChange}
                  >
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AHB_DIVIDERS.map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          /{d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </ClockNode>
            </div>

            {/* ---- Connector → APB1/APB2 ---- */}
            <div className="flex flex-col justify-center self-stretch shrink-0">
              <div className="flex items-center h-1/2">
                <Connector active />
              </div>
              <div className="flex items-center h-1/2">
                <Connector active />
              </div>
            </div>

            {/* ---- Column 5: APB1 + APB2 ---- */}
            <div className="flex flex-col gap-3 shrink-0">
              <ClockNode
                label="APB1 / PCLK1"
                frequency={freqs.apb1}
                active
                violation={violationSet.has("APB1")}
                info={`/${config.apb1Div}`}
              >
                <div>
                  <label className="text-xs text-muted-foreground">
                    分频
                  </label>
                  <Select
                    value={String(config.apb1Div)}
                    onValueChange={handleApb1DivChange}
                  >
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {APB_DIVIDERS.map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          /{d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </ClockNode>
              <ClockNode
                label="APB2 / PCLK2"
                frequency={freqs.apb2}
                active
                violation={violationSet.has("APB2")}
                info={`/${config.apb2Div}`}
              >
                <div>
                  <label className="text-xs text-muted-foreground">
                    分频
                  </label>
                  <Select
                    value={String(config.apb2Div)}
                    onValueChange={handleApb2DivChange}
                  >
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {APB_DIVIDERS.map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          /{d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </ClockNode>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---- Frequency summary ---- */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>频率汇总</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              ["SYSCLK", freqs.sysclk, constraints.maxSysclk],
              ["AHB", freqs.ahb, constraints.maxAhb],
              ["APB1", freqs.apb1, constraints.maxApb1],
              ["APB2", freqs.apb2, constraints.maxApb2],
            ] as const).map(([label, freq, max]) => {
              const over = freq > max;
              return (
                <div
                  key={label}
                  className={cn(
                    "rounded-md border px-3 py-2",
                    over
                      ? "border-destructive/50 bg-destructive/5"
                      : "border-border"
                  )}
                >
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div
                    className={cn(
                      "font-mono font-bold text-sm",
                      over && "text-destructive"
                    )}
                  >
                    {formatFreq(freq)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    max {formatFreq(max)}
                  </div>
                  {over && (
                    <Badge variant="destructive" className="mt-1 text-[10px]">
                      超频
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ---- Generated C code ---- */}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="size-4" />
            HAL 初始化代码
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock code={code} language="c" />
        </CardContent>
      </Card>
    </div>
  );
}
