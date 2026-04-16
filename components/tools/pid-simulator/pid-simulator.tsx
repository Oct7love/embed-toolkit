"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Zap,
  Thermometer,
  Bike,
} from "lucide-react";
import { simulatePID } from "@/lib/pid-simulator";
import { PID_PRESETS } from "@/lib/pid-simulator/presets";
import type {
  PIDConfig,
  PlantModel,
  PIDSimulationResult,
} from "@/types/pid-simulator";

// Recharts 动态导入
const PIDChart = dynamic(
  () => import("./pid-chart").then((m) => m.PIDChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">
        加载图表中...
      </div>
    ),
  }
);

const DEFAULT_CONFIG: PIDConfig = {
  kp: 2,
  ki: 0.5,
  kd: 0.1,
  setpoint: 100,
  initialValue: 0,
  simulationTime: 5,
  samplePeriod: 10,
  plantModel: "first-order",
  plantParams: { tau: 0.1, gain: 1 },
};

const PRESET_ICONS = [Zap, Thermometer, Bike] as const;

export function PIDSimulator() {
  const [config, setConfig] = useState<PIDConfig>(DEFAULT_CONFIG);
  const [result, setResult] = useState<PIDSimulationResult | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const updateConfig = useCallback(
    (patch: Partial<PIDConfig>) => {
      setConfig((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const updatePlantParams = useCallback(
    (patch: Partial<PIDConfig["plantParams"]>) => {
      setConfig((prev) => ({
        ...prev,
        plantParams: { ...prev.plantParams, ...patch },
      }));
    },
    []
  );

  const handleRun = useCallback(() => {
    const res = simulatePID(config);
    setResult(res);
  }, [config]);

  const handleReset = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    setResult(null);
  }, []);

  const handlePreset = useCallback(
    (index: number) => {
      const preset = PID_PRESETS[index];
      const newConfig: PIDConfig = {
        ...DEFAULT_CONFIG,
        ...preset.config,
        plantParams: {
          ...DEFAULT_CONFIG.plantParams,
          ...preset.config.plantParams,
        },
      };
      setConfig(newConfig);
      // 自动运行仿真
      const res = simulatePID(newConfig);
      setResult(res);
    },
    []
  );

  const handlePlantModelChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      const model = value as PlantModel;
      const defaultParams =
        model === "first-order"
          ? { tau: 0.1, gain: 1 }
          : model === "second-order"
            ? { wn: 10, zeta: 0.5, gain: 1 }
            : { gain: 1 };
      setConfig((prev) => ({
        ...prev,
        plantModel: model,
        plantParams: defaultParams,
      }));
    },
    []
  );

  // 自动运行仿真（每次参数变化后）
  const autoResult = useMemo(() => {
    try {
      return simulatePID(config);
    } catch {
      return null;
    }
  }, [config]);

  const displayResult = result ?? autoResult;

  return (
    <div className="space-y-6">
      {/* 预设按钮 */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>快速预设</CardTitle>
          <CardDescription>一键加载典型场景参数</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PID_PRESETS.map((preset, i) => {
              const Icon = PRESET_ICONS[i];
              return (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreset(i)}
                >
                  <Icon className="size-3.5" data-icon="inline-start" />
                  {preset.name}
                  <span className="text-muted-foreground font-normal">
                    - {preset.description}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* 左侧：参数面板 */}
        <div className="space-y-4">
          {/* PID 参数 */}
          <Card size="sm">
            <CardHeader>
              <CardTitle>PID 参数</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SliderInput
                label="Kp（比例）"
                value={config.kp}
                min={0}
                max={100}
                step={0.1}
                onChange={(v) => updateConfig({ kp: v })}
              />
              <SliderInput
                label="Ki（积分）"
                value={config.ki}
                min={0}
                max={50}
                step={0.1}
                onChange={(v) => updateConfig({ ki: v })}
              />
              <SliderInput
                label="Kd（微分）"
                value={config.kd}
                min={0}
                max={50}
                step={0.1}
                onChange={(v) => updateConfig({ kd: v })}
              />
            </CardContent>
          </Card>

          {/* 系统参数 */}
          <Card size="sm">
            <CardHeader>
              <CardTitle>系统参数</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ParamRow label="目标值">
                <Input
                  type="number"
                  value={config.setpoint}
                  onChange={(e) =>
                    updateConfig({ setpoint: Number(e.target.value) || 0 })
                  }
                  className="w-24 font-mono"
                />
              </ParamRow>
              <ParamRow label="初始值">
                <Input
                  type="number"
                  value={config.initialValue}
                  onChange={(e) =>
                    updateConfig({
                      initialValue: Number(e.target.value) || 0,
                    })
                  }
                  className="w-24 font-mono"
                />
              </ParamRow>
              <ParamRow label="仿真时间 (s)">
                <Input
                  type="number"
                  value={config.simulationTime}
                  min={0.5}
                  max={30}
                  step={0.5}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= 0.5 && v <= 30) {
                      updateConfig({ simulationTime: v });
                    }
                  }}
                  className="w-24 font-mono"
                />
              </ParamRow>
              <ParamRow label="采样周期 (ms)">
                <Input
                  type="number"
                  value={config.samplePeriod}
                  min={1}
                  max={100}
                  step={1}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= 1 && v <= 100) {
                      updateConfig({ samplePeriod: v });
                    }
                  }}
                  className="w-24 font-mono"
                />
              </ParamRow>
            </CardContent>
          </Card>

          {/* 系统模型 */}
          <Card size="sm">
            <CardHeader>
              <CardTitle>系统模型</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  模型类型
                </label>
                <Select
                  value={config.plantModel}
                  onValueChange={handlePlantModelChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first-order">
                      一阶惯性 G/(τs+1)
                    </SelectItem>
                    <SelectItem value="second-order">
                      二阶振荡 ωn²/(s²+2ζωns+ωn²)
                    </SelectItem>
                    <SelectItem value="integrator">
                      纯积分 G/s
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {config.plantModel === "first-order" && (
                <ParamRow label="时间常数 τ (s)">
                  <Input
                    type="number"
                    value={config.plantParams.tau ?? 0.1}
                    min={0.001}
                    step={0.1}
                    onChange={(e) =>
                      updatePlantParams({
                        tau: Math.max(0.001, Number(e.target.value) || 0.1),
                      })
                    }
                    className="w-24 font-mono"
                  />
                </ParamRow>
              )}

              {config.plantModel === "second-order" && (
                <>
                  <ParamRow label="自然频率 ωn">
                    <Input
                      type="number"
                      value={config.plantParams.wn ?? 10}
                      min={0.1}
                      step={0.5}
                      onChange={(e) =>
                        updatePlantParams({
                          wn: Math.max(0.1, Number(e.target.value) || 10),
                        })
                      }
                      className="w-24 font-mono"
                    />
                  </ParamRow>
                  <ParamRow label="阻尼比 ζ">
                    <Input
                      type="number"
                      value={config.plantParams.zeta ?? 0.5}
                      min={0}
                      max={2}
                      step={0.01}
                      onChange={(e) =>
                        updatePlantParams({
                          zeta: Math.max(
                            0,
                            Math.min(2, Number(e.target.value) || 0.5)
                          ),
                        })
                      }
                      className="w-24 font-mono"
                    />
                  </ParamRow>
                </>
              )}

              <ParamRow label="增益 G">
                <Input
                  type="number"
                  value={config.plantParams.gain}
                  step={0.1}
                  onChange={(e) =>
                    updatePlantParams({
                      gain: Number(e.target.value) || 1,
                    })
                  }
                  className="w-24 font-mono"
                />
              </ParamRow>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button onClick={handleRun} className="flex-1">
              <Play className="size-3.5" data-icon="inline-start" />
              运行仿真
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="size-3.5" data-icon="inline-start" />
              重置
            </Button>
          </div>
        </div>

        {/* 右侧：图表 + 指标 */}
        <div className="space-y-4">
          {/* 性能指标 */}
          {displayResult && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="上升时间"
                value={
                  displayResult.metrics.riseTime === Infinity
                    ? "N/A"
                    : `${displayResult.metrics.riseTime.toFixed(3)} s`
                }
              />
              <StatCard
                label="超调量"
                value={`${displayResult.metrics.overshoot.toFixed(1)}%`}
              />
              <StatCard
                label="调节时间"
                value={
                  displayResult.metrics.settlingTime === Infinity
                    ? "N/A"
                    : `${displayResult.metrics.settlingTime.toFixed(3)} s`
                }
              />
              <StatCard
                label="稳态误差"
                value={displayResult.metrics.steadyStateError.toFixed(3)}
              />
            </div>
          )}

          {/* 图表 */}
          <Card size="sm">
            <CardContent className="pt-4">
              <Tabs defaultValue="response">
                <TabsList>
                  <TabsTrigger value="response">阶跃响应</TabsTrigger>
                  <TabsTrigger value="error">误差曲线</TabsTrigger>
                  <TabsTrigger value="output">控制输出</TabsTrigger>
                </TabsList>
                <TabsContent value="response" className="mt-4">
                  <PIDChart
                    data={displayResult?.data ?? []}
                    type="response"
                  />
                </TabsContent>
                <TabsContent value="error" className="mt-4">
                  <PIDChart
                    data={displayResult?.data ?? []}
                    type="error"
                  />
                </TabsContent>
                <TabsContent value="output" className="mt-4">
                  <PIDChart
                    data={displayResult?.data ?? []}
                    type="output"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* 调参指南 */}
          <Card size="sm">
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => setGuideOpen((prev) => !prev)}
            >
              <div className="flex items-center justify-between">
                <CardTitle>PID 调参指南</CardTitle>
                {guideOpen ? (
                  <ChevronUp className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            {guideOpen && (
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="space-y-2">
                  <GuideItem
                    param="Kp 增大"
                    effect="响应加快，但超调增大、可能振荡"
                  />
                  <GuideItem
                    param="Ki 增大"
                    effect="消除稳态误差，但响应变慢、可能振荡"
                  />
                  <GuideItem
                    param="Kd 增大"
                    effect="抑制超调、改善动态特性，但对噪声敏感"
                  />
                </div>
                <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
                  <p className="font-medium text-foreground text-xs mb-1">
                    调参口诀
                  </p>
                  <p className="text-xs">
                    先 P 后 I 再 D，逐步调整。先用纯比例控制使系统响应，再加积分消除稳态误差，最后加微分抑制超调。
                  </p>
                </div>
                <div className="mt-2 space-y-1 text-xs">
                  <p className="font-medium text-foreground">典型步骤：</p>
                  <ol className="list-decimal list-inside space-y-0.5 pl-1">
                    <li>Ki=0, Kd=0，逐渐增大 Kp 至系统开始振荡</li>
                    <li>Kp 减小为振荡值的 60%~70%</li>
                    <li>逐渐增大 Ki，观察稳态误差是否消除</li>
                    <li>如有超调，逐渐增大 Kd 抑制</li>
                  </ol>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------- 子组件 ---------- */

/** 滑块 + 数字输入联动组件 */
function SliderInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">{label}</label>
        <Input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v)) {
              onChange(Math.max(min, Math.min(max, v)));
            }
          }}
          className="w-20 h-7 text-xs font-mono text-right"
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-muted accent-primary"
      />
    </div>
  );
}

/** 参数行（label + input） */
function ParamRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-xs text-muted-foreground shrink-0">{label}</label>
      {children}
    </div>
  );
}

/** 性能指标卡片 */
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3 text-center">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-base font-semibold font-mono">{value}</div>
    </div>
  );
}

/** 调参指南条目 */
function GuideItem({ param, effect }: { param: string; effect: string }) {
  return (
    <div className="flex gap-2">
      <span className="shrink-0 font-medium text-foreground">{param}</span>
      <span className="text-muted-foreground">&rarr; {effect}</span>
    </div>
  );
}
