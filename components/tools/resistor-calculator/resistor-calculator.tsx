"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { BandCount, ColorName } from "@/types/resistor-calculator";
import {
  calculateResistance,
  reverseLookup,
  getDefaultBands,
  getDigitColors,
  getMultiplierColors,
  getToleranceColors,
  getTempCoeffColors,
  formatResistance,
  findNearestE24,
  getColorByName,
} from "@/lib/resistor-calculator";
import { ResistorSvg } from "./resistor-svg";
import { ColorBandSelector } from "./color-band-selector";
import { Zap, ArrowRightLeft, Search } from "lucide-react";

type Mode = "forward" | "reverse";

export function ResistorCalculator() {
  const [mode, setMode] = useState<Mode>("forward");
  const [bandCount, setBandCount] = useState<BandCount>(4);
  const [bands, setBands] = useState<ColorName[]>(getDefaultBands(4));

  // 反向查询
  const [reverseInput, setReverseInput] = useState("");
  const [reverseBandCount, setReverseBandCount] = useState<BandCount>(4);

  const handleBandCountChange = useCallback(
    (count: BandCount) => {
      setBandCount(count);
      setBands(getDefaultBands(count));
    },
    []
  );

  const handleBandChange = useCallback(
    (index: number, color: ColorName) => {
      setBands((prev) => {
        const next = [...prev];
        next[index] = color;
        return next;
      });
    },
    []
  );

  // 正向计算结果
  const forwardResult = useMemo(
    () => calculateResistance(bands, bandCount),
    [bands, bandCount]
  );

  const nearestE24Forward = useMemo(
    () =>
      forwardResult
        ? formatResistance(findNearestE24(forwardResult.resistance))
        : null,
    [forwardResult]
  );

  // 反向查询结果
  const reverseResult = useMemo(() => {
    const ohms = parseFloat(reverseInput);
    if (isNaN(ohms) || ohms <= 0) return null;
    return reverseLookup(ohms, reverseBandCount);
  }, [reverseInput, reverseBandCount]);

  // 色环标签
  const bandLabels = useMemo(() => {
    if (bandCount === 4) {
      return ["第1环 (十位)", "第2环 (个位)", "第3环 (乘数)", "第4环 (精度)"];
    }
    if (bandCount === 5) {
      return [
        "第1环 (百位)",
        "第2环 (十位)",
        "第3环 (个位)",
        "第4环 (乘数)",
        "第5环 (精度)",
      ];
    }
    return [
      "第1环 (百位)",
      "第2环 (十位)",
      "第3环 (个位)",
      "第4环 (乘数)",
      "第5环 (精度)",
      "第6环 (温度系数)",
    ];
  }, [bandCount]);

  const digitColors = useMemo(() => getDigitColors(), []);
  const multiplierColors = useMemo(() => getMultiplierColors(), []);
  const toleranceColors = useMemo(() => getToleranceColors(), []);
  const tempCoeffColors = useMemo(() => getTempCoeffColors(), []);

  const getColorsForBand = useCallback(
    (index: number) => {
      if (bandCount === 4) {
        if (index <= 1) return digitColors;
        if (index === 2) return multiplierColors;
        return toleranceColors;
      }
      if (bandCount === 5) {
        if (index <= 2) return digitColors;
        if (index === 3) return multiplierColors;
        return toleranceColors;
      }
      // 6 bands
      if (index <= 2) return digitColors;
      if (index === 3) return multiplierColors;
      if (index === 4) return toleranceColors;
      return tempCoeffColors;
    },
    [bandCount, digitColors, multiplierColors, toleranceColors, tempCoeffColors]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                电阻色环计算器
              </CardTitle>
              <CardDescription>
                色环颜色与阻值双向互查，支持 4/5/6 环电阻，E24 系列标准值
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Mode Tabs */}
      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as Mode)}
      >
        <TabsList>
          <TabsTrigger value="forward">
            <ArrowRightLeft className="h-3.5 w-3.5" />
            色环 → 阻值
          </TabsTrigger>
          <TabsTrigger value="reverse">
            <Search className="h-3.5 w-3.5" />
            阻值 → 色环
          </TabsTrigger>
        </TabsList>

        {/* ===== 正向计算 ===== */}
        <TabsContent value="forward">
          <div className="space-y-4">
            {/* 环数选择 */}
            <Card size="sm">
              <CardContent className="pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    电阻类型：
                  </span>
                  <div className="flex gap-2">
                    {([4, 5, 6] as BandCount[]).map((count) => (
                      <Button
                        key={count}
                        variant={bandCount === count ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleBandCountChange(count)}
                      >
                        {count} 环
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 电阻可视化 */}
            <Card>
              <CardContent className="py-4">
                <ResistorSvg bands={bands} bandCount={bandCount} />
              </CardContent>
            </Card>

            {/* 色环选择器 */}
            <Card>
              <CardContent className="space-y-4 pt-4">
                {bandLabels.map((label, index) => (
                  <ColorBandSelector
                    key={`${bandCount}-${index}`}
                    label={label}
                    colors={getColorsForBand(index)}
                    selected={bands[index]}
                    onChange={(color) => handleBandChange(index, color)}
                  />
                ))}
              </CardContent>
            </Card>

            {/* 计算结果 */}
            {forwardResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">计算结果</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ResultItem
                      label="阻值"
                      value={forwardResult.formattedResistance}
                    />
                    <ResultItem
                      label="精度"
                      value={forwardResult.formattedTolerance}
                    />
                    <ResultItem
                      label="最小阻值"
                      value={formatResistance(forwardResult.minResistance)}
                    />
                    <ResultItem
                      label="最大阻值"
                      value={formatResistance(forwardResult.maxResistance)}
                    />
                    {forwardResult.tempCoeff !== undefined && (
                      <ResultItem
                        label="温度系数"
                        value={`${forwardResult.tempCoeff} ppm/\u00B0C`}
                      />
                    )}
                    {nearestE24Forward && (
                      <ResultItem
                        label="E24 最接近标准值"
                        value={nearestE24Forward}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ===== 反向查询 ===== */}
        <TabsContent value="reverse">
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex-1 w-full">
                    <label className="text-sm font-medium mb-1.5 block">
                      输入阻值 (\u03A9)
                    </label>
                    <Input
                      value={reverseInput}
                      onChange={(e) => setReverseInput(e.target.value)}
                      placeholder="如 4700, 10000, 1000000"
                      className="font-mono"
                      type="number"
                      min="0"
                      step="any"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      环数
                    </label>
                    <div className="flex gap-2">
                      {([4, 5, 6] as BandCount[]).map((count) => (
                        <Button
                          key={count}
                          variant={
                            reverseBandCount === count ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setReverseBandCount(count)}
                        >
                          {count} 环
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {reverseInput && !reverseResult && parseFloat(reverseInput) > 0 && (
                  <div className="text-sm text-muted-foreground">
                    无法为该阻值找到对应色环组合
                  </div>
                )}
              </CardContent>
            </Card>

            {reverseResult && (
              <>
                {/* 电阻可视化 */}
                <Card>
                  <CardContent className="py-4">
                    <ResistorSvg
                      bands={reverseResult.bands}
                      bandCount={reverseResult.bandCount}
                    />
                  </CardContent>
                </Card>

                {/* 结果详情 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">查询结果</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!reverseResult.exactMatch && (
                      <div className="flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/5 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
                        输入值不是标准阻值，已匹配最接近的 E24 标准值
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ResultItem
                        label="E24 标准阻值"
                        value={reverseResult.formattedE24}
                      />
                      <ResultItem
                        label="色环颜色"
                        value=""
                        custom={
                          <div className="flex items-center gap-1">
                            {reverseResult.bands.map((colorName, i) => (
                              <ColorDot key={i} colorName={colorName} />
                            ))}
                          </div>
                        }
                      />
                    </div>

                    <Separator />

                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        色环详情：
                      </span>
                      <div className="mt-2 space-y-1">
                        {reverseResult.bands.map((colorName, i) => {
                          const bandLabel = getBandLabel(
                            i,
                            reverseResult.bandCount
                          );
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-sm"
                            >
                              <ColorDot colorName={colorName} />
                              <span className="text-muted-foreground">
                                {bandLabel}:
                              </span>
                              <span className="font-medium">{colorName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** 结果项 */
function ResultItem({
  label,
  value,
  custom,
}: {
  label: string;
  value: string;
  custom?: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      {custom ?? <div className="text-lg font-mono font-semibold">{value}</div>}
    </div>
  );
}

/** 颜色圆点 */
function ColorDot({ colorName }: { colorName: ColorName }) {
  const color = getColorByName(colorName);
  return (
    <span
      className="inline-block h-5 w-5 rounded-full ring-1 ring-foreground/10"
      style={{ backgroundColor: color.hex }}
      title={`${color.label} (${color.name})`}
    />
  );
}

/** 根据索引和环数获取色环标签 */
function getBandLabel(index: number, bandCount: BandCount): string {
  const labels4 = ["十位", "个位", "乘数", "精度"];
  const labels5 = ["百位", "十位", "个位", "乘数", "精度"];
  const labels6 = ["百位", "十位", "个位", "乘数", "精度", "温度系数"];

  if (bandCount === 4) return labels4[index] ?? "";
  if (bandCount === 5) return labels5[index] ?? "";
  return labels6[index] ?? "";
}
