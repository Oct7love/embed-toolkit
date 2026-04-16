"use client";

import { useState, useMemo, useCallback } from "react";
import { Cpu, Zap, Info, Clock, Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  calculateADC,
  formatTime,
  formatRate,
  formatVoltage,
  formatClockFreq,
} from "@/lib/adc-calculator";
import type {
  ADCConfig,
  ADCResolution,
  ChipPreset,
} from "@/types/adc-calculator";
import {
  CHIP_PRESETS,
  RESOLUTION_OPTIONS,
} from "@/types/adc-calculator";

const DEFAULT_CONFIG: ADCConfig = {
  adcClock: CHIP_PRESETS.stm32f1.adcClock,
  sampleCycles: CHIP_PRESETS.stm32f1.defaultSampleCycles,
  conversionCycles: CHIP_PRESETS.stm32f1.conversionCycles,
  resolution: CHIP_PRESETS.stm32f1.defaultResolution,
  channels: 1,
  dmaEnabled: false,
  vref: 3.3,
  dmaBufferMultiplier: 2,
};

export function ADCCalculator() {
  const [preset, setPreset] = useState<ChipPreset>("stm32f1");
  const [config, setConfig] = useState<ADCConfig>(DEFAULT_CONFIG);

  const presetConfig = CHIP_PRESETS[preset];

  const handlePresetChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      const p = value as ChipPreset;
      setPreset(p);
      const pc = CHIP_PRESETS[p];
      setConfig((prev) => ({
        ...prev,
        adcClock: pc.adcClock,
        conversionCycles: pc.conversionCycles,
        sampleCycles: pc.defaultSampleCycles,
        resolution: pc.defaultResolution,
      }));
    },
    []
  );

  const handleSampleCyclesChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      setConfig((prev) => ({ ...prev, sampleCycles: Number(value) }));
    },
    []
  );

  const handleResolutionChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      setConfig((prev) => ({
        ...prev,
        resolution: Number(value) as ADCResolution,
      }));
    },
    []
  );

  const handleDmaMultiplierChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      setConfig((prev) => ({
        ...prev,
        dmaBufferMultiplier: Number(value),
      }));
    },
    []
  );

  const result = useMemo(() => calculateADC(config), [config]);

  return (
    <div className="space-y-6">
      {/* Input Configuration */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Chip & ADC Parameters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              芯片与 ADC 参数
            </CardTitle>
            <CardDescription>选择芯片预设或自定义 ADC 时钟参数</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chip Preset */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">芯片预设</label>
              <Select
                value={preset}
                onValueChange={handlePresetChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CHIP_PRESETS) as ChipPreset[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {CHIP_PRESETS[key].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ADC Clock */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                ADC 时钟频率
                {preset !== "custom" && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({formatClockFreq(presetConfig.adcClock)})
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  className="font-mono"
                  value={config.adcClock / 1e6}
                  onChange={(e) => {
                    const mhz = parseFloat(e.target.value);
                    if (!isNaN(mhz) && mhz > 0) {
                      setConfig((prev) => ({
                        ...prev,
                        adcClock: mhz * 1e6,
                      }));
                    }
                  }}
                  disabled={preset !== "custom"}
                  min={0.1}
                  step={0.1}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  MHz
                </span>
              </div>
            </div>

            {/* Sample Cycles */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">采样周期</label>
              <Select
                value={String(config.sampleCycles)}
                onValueChange={handleSampleCyclesChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {presetConfig.sampleCyclesOptions.map((c) => (
                    <SelectItem key={c} value={String(c)}>
                      {c} cycles
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conversion Cycles */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">转换周期</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  className="font-mono"
                  value={config.conversionCycles}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v > 0) {
                      setConfig((prev) => ({
                        ...prev,
                        conversionCycles: v,
                      }));
                    }
                  }}
                  disabled={preset !== "custom"}
                  min={1}
                  step={0.5}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  cycles
                </span>
              </div>
            </div>

            {/* Resolution */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">分辨率</label>
              <Select
                value={String(config.resolution)}
                onValueChange={handleResolutionChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOLUTION_OPTIONS.map((r) => (
                    <SelectItem key={r} value={String(r)}>
                      {r} bit
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Scanning & DMA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              扫描与 DMA 设置
            </CardTitle>
            <CardDescription>配置通道数、DMA 和参考电压</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Channel Count */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">扫描通道数</label>
              <Input
                type="number"
                className="font-mono"
                value={config.channels}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 1 && v <= 16) {
                    setConfig((prev) => ({ ...prev, channels: v }));
                  }
                }}
                min={1}
                max={16}
              />
            </div>

            {/* Vref */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">参考电压 (Vref)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  className="font-mono"
                  value={config.vref}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v > 0) {
                      setConfig((prev) => ({ ...prev, vref: v }));
                    }
                  }}
                  min={0.1}
                  max={5}
                  step={0.1}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  V
                </span>
              </div>
            </div>

            {/* DMA Enable */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">DMA 连续模式</label>
              <div className="flex items-center gap-3">
                <Button
                  variant={config.dmaEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      dmaEnabled: !prev.dmaEnabled,
                    }))
                  }
                >
                  {config.dmaEnabled ? "已启用" : "未启用"}
                </Button>
                {config.dmaEnabled && (
                  <span className="text-xs text-muted-foreground">
                    半满/全满中断双缓冲
                  </span>
                )}
              </div>
            </div>

            {/* DMA Buffer Multiplier */}
            {config.dmaEnabled && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  DMA 缓冲倍数 (N)
                </label>
                <Select
                  value={String(config.dmaBufferMultiplier)}
                  onValueChange={handleDmaMultiplierChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 4, 8, 16, 32, 64].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}x (缓冲区 = {config.channels * n} 样本)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  缓冲区大小 = 通道数 ({config.channels}) x N，半满中断在 N/2 触发
                </p>
              </div>
            )}

            <Separator />

            {/* Quick preset buttons */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                快速预设
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPreset("stm32f1");
                    const pc = CHIP_PRESETS.stm32f1;
                    setConfig({
                      adcClock: pc.adcClock,
                      sampleCycles: pc.defaultSampleCycles,
                      conversionCycles: pc.conversionCycles,
                      resolution: pc.defaultResolution,
                      channels: 1,
                      dmaEnabled: false,
                      vref: 3.3,
                      dmaBufferMultiplier: 2,
                    });
                  }}
                >
                  <Zap className="h-3.5 w-3.5" />
                  F1 单通道
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPreset("stm32f4");
                    const pc = CHIP_PRESETS.stm32f4;
                    setConfig({
                      adcClock: pc.adcClock,
                      sampleCycles: pc.defaultSampleCycles,
                      conversionCycles: pc.conversionCycles,
                      resolution: pc.defaultResolution,
                      channels: 4,
                      dmaEnabled: true,
                      vref: 3.3,
                      dmaBufferMultiplier: 4,
                    });
                  }}
                >
                  <Zap className="h-3.5 w-3.5" />
                  F4 四通道 DMA
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            计算结果
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ResultItem
              label="单通道转换时间"
              value={formatTime(result.singleConvTime)}
              detail={`(${config.sampleCycles} + ${config.conversionCycles}) / ${formatClockFreq(config.adcClock)}`}
            />
            <ResultItem
              label="多通道扫描总时间"
              value={formatTime(result.totalScanTime)}
              detail={`单通道 x ${config.channels} 通道`}
            />
            <ResultItem
              label="最大采样率"
              value={formatRate(result.maxSampleRate)}
              detail="1 / 扫描总时间"
            />
            <ResultItem
              label="LSB 电压"
              value={formatVoltage(result.lsbVoltage)}
              detail={`${config.vref} V / 2^${config.resolution}`}
            />
            {config.dmaEnabled && (
              <ResultItem
                label="DMA 缓冲区大小"
                value={`${result.dmaBufferSize} 样本`}
                detail={`${config.channels} ch x ${config.dmaBufferMultiplier} = ${result.dmaBufferSize}`}
              />
            )}
            <ResultItem
              label="总转换 cycles"
              value={`${config.sampleCycles + config.conversionCycles} cycles`}
              detail={`采样 ${config.sampleCycles} + 转换 ${config.conversionCycles}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Formula Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            公式说明
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <FormulaRow
              name="单通道转换时间"
              formula="T_conv = (T_sample + T_conversion) / f_ADC"
              description="采样保持时间 + SAR 逐次逼近时间，除以 ADC 时钟频率"
            />
            <Separator />
            <FormulaRow
              name="多通道扫描时间"
              formula="T_scan = T_conv x N_channels"
              description="扫描模式下所有通道依次转换的总时间"
            />
            <Separator />
            <FormulaRow
              name="最大采样率"
              formula="f_sample = 1 / T_scan"
              description="每秒可完成的完整扫描次数"
            />
            <Separator />
            <FormulaRow
              name="LSB 电压"
              formula="V_LSB = V_ref / 2^n"
              description="ADC 最小可分辨电压，n 为分辨率位数"
            />
            <Separator />
            <FormulaRow
              name="DMA 缓冲区"
              formula="BufSize = N_channels x N_multiplier"
              description="半满中断在 BufSize/2 处触发，实现双缓冲无缝采集"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/** Single result display item */
function ResultItem({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold font-mono">{value}</p>
      <p className="text-xs text-muted-foreground font-mono">{detail}</p>
    </div>
  );
}

/** Formula reference row */
function FormulaRow({
  name,
  formula,
  description,
}: {
  name: string;
  formula: string;
  description: string;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[160px_1fr_1fr]">
      <span className="font-medium">{name}</span>
      <code className="font-mono text-xs bg-muted px-2 py-1 rounded self-start">
        {formula}
      </code>
      <span className="text-muted-foreground">{description}</span>
    </div>
  );
}
