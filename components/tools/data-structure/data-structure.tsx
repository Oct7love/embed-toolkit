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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/shared/code-block";
import {
  generatePubSub,
  generateRingBuffer,
  generateStateMachine,
  generateSwTimer,
  isPowerOfTwo,
} from "@/lib/data-structure";
import type {
  DataStructureType,
  ElementType,
  PubSubConfig,
  RingBufferConfig,
  StateMachineConfig,
  SwTimerConfig,
} from "@/types/data-structure";

const ELEMENT_TYPES: { value: ElementType; label: string }[] = [
  { value: "uint8_t", label: "uint8_t" },
  { value: "uint16_t", label: "uint16_t" },
  { value: "uint32_t", label: "uint32_t" },
  { value: "custom", label: "自定义" },
];

const POWER_OF_TWO_PRESETS = [4, 8, 16, 32, 64, 128, 256, 512, 1024];

export function DataStructureGenerator() {
  const [tab, setTab] = useState<DataStructureType>("ring-buffer");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>常用嵌入式数据结构生成器</CardTitle>
          <CardDescription>
            选择数据结构类型，配置参数，右侧实时预览生成的 C 代码
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={tab}
            onValueChange={(v) => v && setTab(v as DataStructureType)}
          >
            <TabsList className="w-full flex-wrap h-auto">
              <TabsTrigger value="ring-buffer">环形缓冲区</TabsTrigger>
              <TabsTrigger value="state-machine">状态机宏框架</TabsTrigger>
              <TabsTrigger value="sw-timer">软件定时器</TabsTrigger>
              <TabsTrigger value="pub-sub">事件订阅/发布</TabsTrigger>
            </TabsList>

            <TabsContent value="ring-buffer" className="pt-4">
              <RingBufferPanel />
            </TabsContent>
            <TabsContent value="state-machine" className="pt-4">
              <StateMachinePanel />
            </TabsContent>
            <TabsContent value="sw-timer" className="pt-4">
              <SwTimerPanel />
            </TabsContent>
            <TabsContent value="pub-sub" className="pt-4">
              <PubSubPanel />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ring buffer panel                                                   */
/* ------------------------------------------------------------------ */

function RingBufferPanel() {
  const [config, setConfig] = useState<RingBufferConfig>({
    typeName: "my_buf",
    elementType: "uint8_t",
    customElementType: "my_packet_t",
    capacity: 32,
    threadSafe: false,
  });

  const result = useMemo(() => {
    if (!isPowerOfTwo(config.capacity)) {
      return {
        error: `容量必须是 2 的幂 (got ${config.capacity})`,
        header: "",
        source: "",
      };
    }
    try {
      const out = generateRingBuffer(config);
      return { error: null, ...out };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { error: msg, header: "", source: "" };
    }
  }, [config]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
      <div className="space-y-3">
        <Field label="类型名">
          <Input
            value={config.typeName}
            onChange={(e) =>
              setConfig({ ...config, typeName: e.target.value })
            }
            placeholder="my_buf"
            className="font-mono"
            spellCheck={false}
          />
        </Field>

        <Field label="元素类型">
          <Select
            value={config.elementType}
            onValueChange={(v) =>
              v && setConfig({ ...config, elementType: v as ElementType })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ELEMENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {config.elementType === "custom" && (
          <Field label="自定义类型名">
            <Input
              value={config.customElementType}
              onChange={(e) =>
                setConfig({ ...config, customElementType: e.target.value })
              }
              placeholder="my_packet_t"
              className="font-mono"
              spellCheck={false}
            />
          </Field>
        )}

        <Field label="容量（必须是 2 的幂）">
          <Select
            value={String(config.capacity)}
            onValueChange={(v) =>
              v && setConfig({ ...config, capacity: Number(v) })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POWER_OF_TWO_PRESETS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="flex items-center gap-2">
          <input
            id="rb-threadsafe"
            type="checkbox"
            checked={config.threadSafe}
            onChange={(e) =>
              setConfig({ ...config, threadSafe: e.target.checked })
            }
            className="h-4 w-4 rounded border-input"
          />
          <label
            htmlFor="rb-threadsafe"
            className="text-sm cursor-pointer select-none"
          >
            单写单读 ISR 安全（PRIMASK critical section 包裹）
            <span className="block text-xs text-muted-foreground mt-0.5">
              典型：UART RX ISR 生产 + 任务消费。多写多读请改用 StreamBuffer 或加 Mutex
            </span>
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {result.error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {result.error}
          </div>
        ) : (
          <>
            <CodeBlock code={result.header} language={`${config.typeName}.h`} />
            <CodeBlock code={result.source} language={`${config.typeName}.c`} />
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Simple state machine panel                                          */
/* ------------------------------------------------------------------ */

function StateMachinePanel() {
  const [config, setConfig] = useState<StateMachineConfig>({
    prefix: "door",
    states: ["IDLE", "OPENING", "OPEN", "CLOSING"],
    events: ["BUTTON", "TIMEOUT"],
  });
  const [statesText, setStatesText] = useState("IDLE, OPENING, OPEN, CLOSING");
  const [eventsText, setEventsText] = useState("BUTTON, TIMEOUT");

  const code = useMemo(() => generateStateMachine(config), [config]);

  function applyText() {
    setConfig({
      ...config,
      states: statesText.split(",").map((s) => s.trim()).filter(Boolean),
      events: eventsText.split(",").map((s) => s.trim()).filter(Boolean),
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
      <div className="space-y-3">
        <Field label="前缀">
          <Input
            value={config.prefix}
            onChange={(e) =>
              setConfig({ ...config, prefix: e.target.value })
            }
            placeholder="fsm"
            className="font-mono"
            spellCheck={false}
          />
        </Field>

        <Field label="状态名（逗号分隔）">
          <Input
            value={statesText}
            onChange={(e) => setStatesText(e.target.value)}
            onBlur={applyText}
            placeholder="IDLE, RUNNING, DONE"
            className="font-mono"
            spellCheck={false}
          />
        </Field>

        <Field label="事件名（逗号分隔）">
          <Input
            value={eventsText}
            onChange={(e) => setEventsText(e.target.value)}
            onBlur={applyText}
            placeholder="START, STOP, TICK"
            className="font-mono"
            spellCheck={false}
          />
        </Field>

        <Button variant="outline" size="sm" onClick={applyText}>
          应用
        </Button>

        <p className="text-xs text-muted-foreground leading-relaxed">
          复杂状态机请使用{" "}
          <a
            href="/tools/codegen/state-machine"
            className="text-primary underline"
          >
            可视化编辑器
          </a>
          。
        </p>
      </div>

      <div>
        <CodeBlock code={code} language={`${config.prefix}.h`} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Software timer panel                                                */
/* ------------------------------------------------------------------ */

function SwTimerPanel() {
  const [config, setConfig] = useState<SwTimerConfig>({
    prefix: "swtimer",
    maxTimers: 8,
    tickHz: 1000,
  });

  const out = useMemo(() => generateSwTimer(config), [config]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
      <div className="space-y-3">
        <Field label="前缀">
          <Input
            value={config.prefix}
            onChange={(e) =>
              setConfig({ ...config, prefix: e.target.value })
            }
            placeholder="swtimer"
            className="font-mono"
            spellCheck={false}
          />
        </Field>
        <Field label="定时器数量">
          <Input
            type="number"
            min={1}
            max={64}
            value={config.maxTimers}
            onChange={(e) =>
              setConfig({
                ...config,
                maxTimers: Math.max(1, Number(e.target.value) || 1),
              })
            }
            className="font-mono"
          />
        </Field>
        <Field label="Tick 频率 (Hz)">
          <Input
            type="number"
            min={1}
            value={config.tickHz}
            onChange={(e) =>
              setConfig({
                ...config,
                tickHz: Math.max(1, Number(e.target.value) || 1),
              })
            }
            className="font-mono"
          />
        </Field>
        <p className="text-xs text-muted-foreground leading-relaxed">
          在 SysTick 或 1ms 中断里调用{" "}
          <code className="font-mono">{config.prefix}_tick()</code>。
        </p>
      </div>

      <div className="space-y-3">
        <CodeBlock code={out.header} language={`${config.prefix}.h`} />
        <CodeBlock code={out.source} language={`${config.prefix}.c`} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pub/Sub panel                                                       */
/* ------------------------------------------------------------------ */

function PubSubPanel() {
  const [config, setConfig] = useState<PubSubConfig>({
    prefix: "evt",
    maxSubscribers: 8,
    eventTypes: ["KEY_DOWN", "KEY_UP", "TIMER_FIRED"],
  });
  const [eventsText, setEventsText] = useState("KEY_DOWN, KEY_UP, TIMER_FIRED");

  const out = useMemo(() => generatePubSub(config), [config]);

  function applyEvents() {
    setConfig({
      ...config,
      eventTypes: eventsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
      <div className="space-y-3">
        <Field label="前缀">
          <Input
            value={config.prefix}
            onChange={(e) =>
              setConfig({ ...config, prefix: e.target.value })
            }
            placeholder="evt"
            className="font-mono"
            spellCheck={false}
          />
        </Field>

        <Field label="最大订阅者数">
          <Input
            type="number"
            min={1}
            max={64}
            value={config.maxSubscribers}
            onChange={(e) =>
              setConfig({
                ...config,
                maxSubscribers: Math.max(1, Number(e.target.value) || 1),
              })
            }
            className="font-mono"
          />
        </Field>

        <Field label="事件类型（逗号分隔）">
          <Input
            value={eventsText}
            onChange={(e) => setEventsText(e.target.value)}
            onBlur={applyEvents}
            placeholder="KEY_DOWN, KEY_UP"
            className="font-mono"
            spellCheck={false}
          />
        </Field>

        <Button variant="outline" size="sm" onClick={applyEvents}>
          应用
        </Button>
      </div>

      <div className="space-y-3">
        <CodeBlock code={out.header} language={`${config.prefix}.h`} />
        <CodeBlock code={out.source} language={`${config.prefix}.c`} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small reusable label/field wrapper                                  */
/* ------------------------------------------------------------------ */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
