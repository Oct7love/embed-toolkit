"use client";

import { useState, useMemo, useCallback } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/shared/code-block";
import {
  generateDriver,
  DRIVER_PRESETS,
  defaultPeripheralConfig,
  defaultStyle,
  availableStyles,
  createDefaultDriverConfig,
} from "@/lib/driver-template";
import type {
  DriverConfig,
  McuFamily,
  PeripheralType,
  CodeStyle,
  UartConfig,
  SpiConfig,
  I2cConfig,
  AdcConfig,
  TimConfig,
  PwmConfig,
} from "@/types/driver-template";
import { Wrench, Cpu, FileCode } from "lucide-react";

const MCU_OPTIONS: { value: McuFamily; label: string }[] = [
  { value: "stm32f1", label: "STM32F1" },
  { value: "stm32f4", label: "STM32F4" },
  { value: "stm32h7", label: "STM32H7" },
  { value: "stm32g0", label: "STM32G0" },
  { value: "stm32l4", label: "STM32L4" },
  { value: "esp32", label: "ESP32" },
];

const PERIPHERAL_OPTIONS: PeripheralType[] = [
  "UART",
  "SPI",
  "I2C",
  "ADC",
  "TIM",
  "PWM",
];

const SPI_PRESCALERS = [2, 4, 8, 16, 32, 64, 128, 256] as const;

export function DriverTemplate() {
  const [config, setConfig] = useState<DriverConfig>(() =>
    createDefaultDriverConfig()
  );
  const [activeTab, setActiveTab] = useState<"header" | "source">("header");

  const files = useMemo(() => generateDriver(config), [config]);

  const styles = useMemo(() => availableStyles(config.mcu), [config.mcu]);

  /* ---------- updaters ---------- */

  const handleMcuChange = useCallback((value: string | null) => {
    if (value === null) return;
    const mcu = value as McuFamily;
    setConfig((prev) => {
      const nextStyles = availableStyles(mcu);
      const style: CodeStyle = nextStyles.includes(prev.style)
        ? prev.style
        : defaultStyle(mcu);
      return { ...prev, mcu, style };
    });
  }, []);

  const handleStyleChange = useCallback((value: string | null) => {
    if (value === null) return;
    setConfig((prev) => ({ ...prev, style: value as CodeStyle }));
  }, []);

  const handlePeripheralChange = useCallback((value: string | null) => {
    if (value === null) return;
    const type = value as PeripheralType;
    setConfig((prev) => ({
      ...prev,
      peripheral: defaultPeripheralConfig(type),
    }));
  }, []);

  const loadPreset = useCallback((id: string) => {
    const preset = DRIVER_PRESETS.find((p) => p.id === id);
    if (preset) {
      setConfig(preset.config);
      setActiveTab("header");
    }
  }, []);

  /* ---------- field renderers ---------- */

  function updatePeripheral<K extends keyof UartConfig>(
    patch: Partial<Record<K, UartConfig[K]>>
  ): void;
  function updatePeripheral<K extends keyof SpiConfig>(
    patch: Partial<Record<K, SpiConfig[K]>>
  ): void;
  function updatePeripheral<K extends keyof I2cConfig>(
    patch: Partial<Record<K, I2cConfig[K]>>
  ): void;
  function updatePeripheral(patch: Record<string, unknown>): void {
    setConfig((prev) => ({
      ...prev,
      peripheral: { ...prev.peripheral, ...patch } as DriverConfig["peripheral"],
    }));
  }

  function renderPeripheralFields() {
    const p = config.peripheral;
    switch (p.peripheral) {
      case "UART":
        return <UartFields cfg={p} update={updatePeripheral} />;
      case "SPI":
        return <SpiFields cfg={p} update={updatePeripheral} />;
      case "I2C":
        return <I2cFields cfg={p} update={updatePeripheral} />;
      case "ADC":
        return <AdcFields cfg={p} update={updatePeripheral} />;
      case "TIM":
        return <TimFields cfg={p} update={updatePeripheral} />;
      case "PWM":
        return <PwmFields cfg={p} update={updatePeripheral} />;
    }
  }

  const fileNameBase = useMemo(() => {
    const p = config.peripheral;
    switch (p.peripheral) {
      case "UART":
        return `uart${p.instance}_driver`;
      case "SPI":
        return `spi${p.instance}_driver`;
      case "I2C":
        return `i2c${p.instance}_driver`;
      case "ADC":
        return `adc${p.instance}_driver`;
      case "TIM":
        return `tim${p.instance}_driver`;
      case "PWM":
        return `pwm${p.instance}_ch${p.channel}_driver`;
    }
  }, [config.peripheral]);

  return (
    <div className="space-y-6">
      {/* Presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="size-4" />
            预设场景
          </CardTitle>
          <CardDescription>一键加载典型驱动模板</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {DRIVER_PRESETS.map((p) => (
              <Button
                key={p.id}
                variant="outline"
                size="sm"
                onClick={() => loadPreset(p.id)}
                className="justify-start font-normal"
              >
                {p.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Config + Output */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* Config panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="size-4" />
              驱动配置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">MCU 系列</label>
              <Select value={config.mcu} onValueChange={handleMcuChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MCU_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">外设类型</label>
              <Select
                value={config.peripheral.peripheral}
                onValueChange={handlePeripheralChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIPHERAL_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">代码风格</label>
              <div className="flex flex-wrap gap-2">
                {styles.map((s) => (
                  <Button
                    key={s}
                    variant={config.style === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStyleChange(s)}
                  >
                    {s === "HAL" && config.mcu === "esp32" ? "ESP-IDF" : s}
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border space-y-3">
              <div className="text-xs text-muted-foreground font-medium">
                {config.peripheral.peripheral} 参数
              </div>
              {renderPeripheralFields()}
            </div>
          </CardContent>
        </Card>

        {/* Code output */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileCode className="size-4" />
                生成代码
                <Badge variant="outline" className="font-mono text-xs">
                  {fileNameBase}
                </Badge>
              </CardTitle>
              <Tabs
                value={activeTab}
                onValueChange={(v) => {
                  if (v === "header" || v === "source") setActiveTab(v);
                }}
              >
                <TabsList>
                  <TabsTrigger value="header">{fileNameBase}.h</TabsTrigger>
                  <TabsTrigger value="source">{fileNameBase}.c</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab}>
              <TabsContent value="header">
                <CodeBlock code={files.header} language="c" />
              </TabsContent>
              <TabsContent value="source">
                <CodeBlock code={files.source} language="c" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Peripheral-specific form fields                                     */
/* ================================================================== */

type UpdateFn = (patch: Record<string, unknown>) => void;

function UartFields({ cfg, update }: { cfg: UartConfig; update: UpdateFn }) {
  return (
    <div className="space-y-3">
      <FieldNumber
        label="实例编号 (USARTn)"
        value={cfg.instance}
        min={1}
        max={8}
        onChange={(v) => update({ instance: v })}
      />
      <FieldNumber
        label="Baudrate"
        value={cfg.baudrate}
        min={1200}
        max={3000000}
        step={100}
        onChange={(v) => update({ baudrate: v })}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={cfg.rxInterrupt}
          onChange={(e) => update({ rxInterrupt: e.target.checked })}
          className="size-4"
        />
        启用 RX 中断
      </label>
    </div>
  );
}

function SpiFields({ cfg, update }: { cfg: SpiConfig; update: UpdateFn }) {
  return (
    <div className="space-y-3">
      <FieldNumber
        label="实例编号 (SPIn)"
        value={cfg.instance}
        min={1}
        max={6}
        onChange={(v) => update({ instance: v })}
      />
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">SPI Mode</label>
        <Select
          value={String(cfg.mode)}
          onValueChange={(v) => {
            if (v !== null) update({ mode: Number(v) as 0 | 1 | 2 | 3 });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[0, 1, 2, 3].map((m) => (
              <SelectItem key={m} value={String(m)}>
                Mode {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">Prescaler</label>
        <Select
          value={String(cfg.prescaler)}
          onValueChange={(v) => {
            if (v !== null) update({ prescaler: Number(v) });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SPI_PRESCALERS.map((p) => (
              <SelectItem key={p} value={String(p)}>
                /{p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">CS 引脚</label>
        <Input
          value={cfg.csPin}
          onChange={(e) => update({ csPin: e.target.value || "PA4" })}
          className="font-mono"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

function I2cFields({ cfg, update }: { cfg: I2cConfig; update: UpdateFn }) {
  return (
    <div className="space-y-3">
      <FieldNumber
        label="实例编号 (I2Cn)"
        value={cfg.instance}
        min={1}
        max={4}
        onChange={(v) => update({ instance: v })}
      />
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">速率</label>
        <Select
          value={String(cfg.speed)}
          onValueChange={(v) => {
            if (v !== null) update({ speed: Number(v) as 100000 | 400000 });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="100000">100 kHz (Standard)</SelectItem>
            <SelectItem value="400000">400 kHz (Fast)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">Slave 地址 (7bit)</label>
        <Input
          type="text"
          value={`0x${cfg.slaveAddr7bit.toString(16).toUpperCase()}`}
          onChange={(e) => {
            const raw = e.target.value.replace(/^0x/i, "");
            const v = parseInt(raw, 16);
            if (!isNaN(v) && v >= 0 && v <= 0x7f) update({ slaveAddr7bit: v });
          }}
          className="font-mono"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

function AdcFields({ cfg, update }: { cfg: AdcConfig; update: UpdateFn }) {
  return (
    <div className="space-y-3">
      <FieldNumber
        label="实例编号 (ADCn)"
        value={cfg.instance}
        min={1}
        max={3}
        onChange={(v) => update({ instance: v })}
      />
      <FieldNumber
        label="Channel"
        value={cfg.channel}
        min={0}
        max={18}
        onChange={(v) => update({ channel: v })}
      />
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">分辨率</label>
        <Select
          value={String(cfg.resolution)}
          onValueChange={(v) => {
            if (v !== null) update({ resolution: Number(v) as 8 | 10 | 12 });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="8">8-bit</SelectItem>
            <SelectItem value="10">10-bit</SelectItem>
            <SelectItem value="12">12-bit</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={cfg.useDma}
          onChange={(e) => update({ useDma: e.target.checked })}
          className="size-4"
        />
        启用 DMA
      </label>
    </div>
  );
}

function TimFields({ cfg, update }: { cfg: TimConfig; update: UpdateFn }) {
  return (
    <div className="space-y-3">
      <FieldNumber
        label="实例编号 (TIMn)"
        value={cfg.instance}
        min={1}
        max={17}
        onChange={(v) => update({ instance: v })}
      />
      <FieldNumber
        label="Prescaler (PSC)"
        value={cfg.prescaler}
        min={0}
        max={65535}
        onChange={(v) => update({ prescaler: v })}
      />
      <FieldNumber
        label="Period (ARR)"
        value={cfg.period}
        min={1}
        max={65535}
        onChange={(v) => update({ period: v })}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={cfg.interrupt}
          onChange={(e) => update({ interrupt: e.target.checked })}
          className="size-4"
        />
        启用更新中断
      </label>
    </div>
  );
}

function PwmFields({ cfg, update }: { cfg: PwmConfig; update: UpdateFn }) {
  return (
    <div className="space-y-3">
      <FieldNumber
        label="TIM 实例"
        value={cfg.instance}
        min={1}
        max={17}
        onChange={(v) => update({ instance: v })}
      />
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">Channel</label>
        <Select
          value={String(cfg.channel)}
          onValueChange={(v) => {
            if (v !== null) update({ channel: Number(v) as 1 | 2 | 3 | 4 });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4].map((c) => (
              <SelectItem key={c} value={String(c)}>
                CH{c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <FieldNumber
        label="Prescaler"
        value={cfg.prescaler}
        min={0}
        max={65535}
        onChange={(v) => update({ prescaler: v })}
      />
      <FieldNumber
        label="Period (ARR)"
        value={cfg.period}
        min={1}
        max={65535}
        onChange={(v) => update({ period: v })}
      />
      <FieldNumber
        label="Duty (%)"
        value={cfg.dutyPercent}
        min={0}
        max={100}
        onChange={(v) => update({ dutyPercent: v })}
      />
    </div>
  );
}

function FieldNumber({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground">{label}</label>
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (!isNaN(v)) onChange(v);
        }}
        className="font-mono"
      />
    </div>
  );
}
