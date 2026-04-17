"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CodeBlock } from "@/components/shared/code-block";
import { CopyButton } from "@/components/shared/copy-button";
import {
  generateIsr,
  ISR_TYPES,
  MCU_FAMILIES,
} from "@/lib/isr-template";
import type {
  ExtiEdge,
  IsrConfig,
  IsrType,
  McuFamily,
  NotifyMechanism,
} from "@/types/isr-template";
import { Info, ShieldAlert } from "lucide-react";

interface Preset {
  name: string;
  config: IsrConfig;
}

const PRESETS: Preset[] = [
  {
    name: "STM32F4 EXTI0 上升沿 + Task Notification",
    config: {
      mcu: "stm32f4",
      isrType: "exti",
      exti: { line: 0, edge: "rising" },
      notify: { enabled: true, mechanisms: ["task-notify"] },
      enableCriticalSection: false,
    },
  },
  {
    name: "STM32F1 USART1 RX + Queue",
    config: {
      mcu: "stm32f1",
      isrType: "uart-rx",
      uart: { instance: "USART1" },
      notify: { enabled: true, mechanisms: ["queue"] },
      enableCriticalSection: false,
    },
  },
  {
    name: "STM32H7 TIM2 Update + Binary Semaphore",
    config: {
      mcu: "stm32h7",
      isrType: "tim-update",
      timer: { instance: "TIM2" },
      notify: { enabled: true, mechanisms: ["binary-semaphore"] },
      enableCriticalSection: false,
    },
  },
  {
    name: "STM32G0 ADC1 EOC + DMA",
    config: {
      mcu: "stm32g0",
      isrType: "adc-eoc",
      adc: { instance: "ADC1" },
      notify: { enabled: true, mechanisms: ["task-notify"] },
      enableCriticalSection: false,
    },
  },
  {
    name: "STM32F4 UART RX IDLE + DMA 不定长接收",
    config: {
      mcu: "stm32f4",
      isrType: "uart-rx-idle-dma",
      uart: { instance: "USART2" },
      notify: { enabled: true, mechanisms: ["queue"] },
      enableCriticalSection: false,
    },
  },
  {
    name: "SysTick + 临界区",
    config: {
      mcu: "stm32l4",
      isrType: "systick",
      notify: { enabled: false, mechanisms: [] },
      enableCriticalSection: true,
    },
  },
];

const NOTIFY_OPTIONS: { value: NotifyMechanism; label: string }[] = [
  { value: "task-notify", label: "Task Notification" },
  { value: "queue", label: "Queue" },
  { value: "binary-semaphore", label: "Binary Semaphore" },
];

const EDGE_OPTIONS: { value: ExtiEdge; label: string }[] = [
  { value: "rising", label: "上升沿" },
  { value: "falling", label: "下降沿" },
  { value: "both", label: "双边沿" },
];

function defaultConfig(): IsrConfig {
  return {
    mcu: "stm32f4",
    isrType: "exti",
    exti: { line: 0, edge: "rising" },
    timer: { instance: "TIM2" },
    uart: { instance: "USART1" },
    dma: { controller: "DMA1", streamOrChannel: 0 },
    adc: { instance: "ADC1" },
    notify: { enabled: false, mechanisms: [] },
    enableCriticalSection: false,
  };
}

export function IsrTemplateGenerator() {
  const [config, setConfig] = useState<IsrConfig>(defaultConfig);

  const result = useMemo(() => generateIsr(config), [config]);

  const applyPreset = (preset: Preset) => {
    // 合并默认值，避免可选字段缺失
    setConfig({
      ...defaultConfig(),
      ...preset.config,
      notify: { ...preset.config.notify },
    });
  };

  const updateConfig = <K extends keyof IsrConfig>(
    key: K,
    value: IsrConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const toggleNotify = (enabled: boolean) => {
    setConfig((prev) => ({
      ...prev,
      notify: {
        enabled,
        mechanisms: enabled && prev.notify.mechanisms.length === 0
          ? ["task-notify"]
          : prev.notify.mechanisms,
      },
    }));
  };

  const toggleMechanism = (m: NotifyMechanism) => {
    setConfig((prev) => {
      const has = prev.notify.mechanisms.includes(m);
      const next = has
        ? prev.notify.mechanisms.filter((x) => x !== m)
        : [...prev.notify.mechanisms, m];
      return { ...prev, notify: { ...prev.notify, mechanisms: next } };
    });
  };

  const showExti = config.isrType === "exti";
  const showTimer = config.isrType === "tim-update" || config.isrType === "tim-ccr";
  const showUart =
    config.isrType === "uart-rx" || config.isrType === "uart-rx-idle-dma";
  const showDma = config.isrType === "dma-tc";
  const showAdc = config.isrType === "adc-eoc";

  return (
    <div className="space-y-6">
      {/* Presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">预设模板</CardTitle>
          <CardDescription>一键加载常用 ISR 配置</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.name}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(p)}
              >
                {p.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main config */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">基础配置</CardTitle>
          <CardDescription>选择 MCU 系列与中断类型</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">MCU 系列</label>
              <Select
                value={config.mcu}
                onValueChange={(v) =>
                  v && updateConfig("mcu", v as McuFamily)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MCU_FAMILIES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">中断类型</label>
              <Select
                value={config.isrType}
                onValueChange={(v) =>
                  v && updateConfig("isrType", v as IsrType)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ISR_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* EXTI 配置 */}
          {showExti && (
            <div className="grid gap-4 sm:grid-cols-2 rounded-md border border-border/60 bg-muted/30 p-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">EXTI 线号 (0-15)</label>
                <Input
                  type="number"
                  min={0}
                  max={15}
                  value={config.exti?.line ?? 0}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    const clamped = Math.max(0, Math.min(15, isNaN(n) ? 0 : n));
                    setConfig((prev) => ({
                      ...prev,
                      exti: {
                        line: clamped,
                        edge: prev.exti?.edge ?? "rising",
                      },
                    }));
                  }}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">触发沿</label>
                <Select
                  value={config.exti?.edge ?? "rising"}
                  onValueChange={(v) => {
                    if (!v) return;
                    setConfig((prev) => ({
                      ...prev,
                      exti: {
                        line: prev.exti?.line ?? 0,
                        edge: v as ExtiEdge,
                      },
                    }));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EDGE_OPTIONS.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* TIM 配置 */}
          {showTimer && (
            <div className="rounded-md border border-border/60 bg-muted/30 p-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">定时器实例</label>
                <Input
                  value={config.timer?.instance ?? "TIM2"}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      timer: { instance: e.target.value || "TIM2" },
                    }))
                  }
                  placeholder="TIM2 / TIM3 / TIM6 ..."
                  className="font-mono"
                />
              </div>
            </div>
          )}

          {/* UART 配置 */}
          {showUart && (
            <div className="rounded-md border border-border/60 bg-muted/30 p-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">USART 实例</label>
                <Input
                  value={config.uart?.instance ?? "USART1"}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      uart: { instance: e.target.value || "USART1" },
                    }))
                  }
                  placeholder="USART1 / USART2 / USART3 ..."
                  className="font-mono"
                />
              </div>
            </div>
          )}

          {/* DMA 配置 */}
          {showDma && (
            <div className="grid gap-4 sm:grid-cols-2 rounded-md border border-border/60 bg-muted/30 p-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">DMA 控制器</label>
                <Input
                  value={config.dma?.controller ?? "DMA1"}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      dma: {
                        controller: e.target.value || "DMA1",
                        streamOrChannel: prev.dma?.streamOrChannel ?? 0,
                      },
                    }))
                  }
                  placeholder="DMA1 / DMA2"
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Stream / Channel 编号
                </label>
                <Input
                  type="number"
                  min={0}
                  max={7}
                  value={config.dma?.streamOrChannel ?? 0}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    setConfig((prev) => ({
                      ...prev,
                      dma: {
                        controller: prev.dma?.controller ?? "DMA1",
                        streamOrChannel: isNaN(n) ? 0 : n,
                      },
                    }));
                  }}
                  className="font-mono"
                />
              </div>
            </div>
          )}

          {/* ADC 配置 */}
          {showAdc && (
            <div className="rounded-md border border-border/60 bg-muted/30 p-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">ADC 实例</label>
                <Input
                  value={config.adc?.instance ?? "ADC1"}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      adc: { instance: e.target.value || "ADC1" },
                    }))
                  }
                  placeholder="ADC1 / ADC2 / ADC3"
                  className="font-mono"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notify */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <CardTitle className="text-base">任务通知（可选）</CardTitle>
              <CardDescription>
                启用后在 ISR 中通过 FromISR 接口唤醒任务
              </CardDescription>
            </div>
            <Button
              variant={config.notify.enabled ? "default" : "outline"}
              size="sm"
              onClick={() => toggleNotify(!config.notify.enabled)}
            >
              {config.notify.enabled ? "已启用" : "未启用"}
            </Button>
          </div>
        </CardHeader>
        {config.notify.enabled && (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {NOTIFY_OPTIONS.map((opt) => {
                const active = config.notify.mechanisms.includes(opt.value);
                return (
                  <Button
                    key={opt.value}
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleMechanism(opt.value)}
                  >
                    {opt.label}
                  </Button>
                );
              })}
            </div>
            {config.notify.mechanisms.length === 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                至少选择一种通知机制；否则不会生成通知代码。
              </p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Critical section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <CardTitle className="text-base">临界区</CardTitle>
              <CardDescription>
                生成 portENTER_CRITICAL_FROM_ISR / portEXIT_CRITICAL_FROM_ISR
              </CardDescription>
            </div>
            <Button
              variant={config.enableCriticalSection ? "default" : "outline"}
              size="sm"
              onClick={() =>
                updateConfig("enableCriticalSection", !config.enableCriticalSection)
              }
            >
              {config.enableCriticalSection ? "已启用" : "未启用"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Generated code */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base">生成代码</CardTitle>
            <Badge variant="outline" className="font-mono text-xs">
              <ShieldAlert className="mr-1" />
              C / ISR
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <CodeBlock code={result.code} language="c" />
          <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 space-y-1">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                向量表注册说明
              </p>
              <p className="text-foreground/80 text-sm">{result.vectorNote}</p>
            </div>
            <CopyButton value={result.vectorNote} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
