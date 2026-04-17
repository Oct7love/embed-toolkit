"use client";

import { useState, useMemo, useCallback } from "react";
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
import { CodeBlock } from "@/components/shared/code-block";
import {
  Plus,
  Trash2,
  RotateCcw,
  Lightbulb,
  Cpu,
  Radio,
  Zap,
} from "lucide-react";
import { calculateStack, RTOS_META, STACK_PRESETS } from "@/lib/stack-estimator";
import type {
  CalcInput,
  StackEntry,
  TargetRtos,
} from "@/types/stack-estimator";

const PRESET_ICONS = [Lightbulb, Radio, Zap] as const;

const DEFAULT_INPUT: CalcInput = {
  entries: [
    { id: "init-1", functionName: "MyTask", stackBytes: 64 },
  ],
  isInIsr: false,
  usesPrintf: false,
  targetRtos: "freertos",
};

let entryIdCounter = 100;
const nextId = () => `entry-${++entryIdCounter}`;

export function StackEstimator() {
  const [input, setInput] = useState<CalcInput>(DEFAULT_INPUT);

  const updateInput = useCallback((patch: Partial<CalcInput>) => {
    setInput((prev) => ({ ...prev, ...patch }));
  }, []);

  const addEntry = useCallback(() => {
    setInput((prev) => ({
      ...prev,
      entries: [
        ...prev.entries,
        { id: nextId(), functionName: `func${prev.entries.length + 1}`, stackBytes: 32 },
      ],
    }));
  }, []);

  const removeEntry = useCallback((id: string) => {
    setInput((prev) => ({
      ...prev,
      entries: prev.entries.filter((e) => e.id !== id),
    }));
  }, []);

  const updateEntry = useCallback(
    (id: string, patch: Partial<StackEntry>) => {
      setInput((prev) => ({
        ...prev,
        entries: prev.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      }));
    },
    []
  );

  const handleReset = useCallback(() => {
    setInput(DEFAULT_INPUT);
  }, []);

  const handlePreset = useCallback((index: number) => {
    const preset = STACK_PRESETS[index];
    setInput((prev) => ({
      ...prev,
      entries: preset.entries.map((e) => ({ ...e, id: nextId() })),
      isInIsr: preset.isInIsr,
      usesPrintf: preset.usesPrintf,
    }));
  }, []);

  const handleRtosChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      updateInput({ targetRtos: value as TargetRtos });
    },
    [updateInput]
  );

  const result = useMemo(() => calculateStack(input), [input]);
  const meta = RTOS_META[input.targetRtos];

  return (
    <div className="space-y-6">
      {/* 预设按钮 */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>快速预设</CardTitle>
          <CardDescription>一键加载典型场景</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {STACK_PRESETS.map((preset, i) => {
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

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* 左侧：调用链编辑器 */}
        <div className="space-y-4">
          <Card size="sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>任务调用链</CardTitle>
                  <CardDescription>
                    添加任务执行路径上调用的所有函数及其局部变量字节数
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addEntry}>
                  <Plus className="size-3.5" data-icon="inline-start" />
                  新增函数
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {input.entries.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-6 border border-dashed rounded-md">
                  暂无函数，点击右上角“新增函数”
                </div>
              )}
              {input.entries.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="grid grid-cols-[auto_1fr_140px_auto] gap-2 items-center rounded-md border bg-card p-2"
                >
                  <span className="text-xs text-muted-foreground font-mono w-6 text-center">
                    #{idx + 1}
                  </span>
                  <Input
                    value={entry.functionName}
                    onChange={(e) =>
                      updateEntry(entry.id, { functionName: e.target.value })
                    }
                    placeholder="函数名"
                    className="font-mono"
                  />
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={entry.stackBytes}
                      min={0}
                      step={4}
                      onChange={(e) =>
                        updateEntry(entry.id, {
                          stackBytes: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                      className="font-mono"
                    />
                    <span className="text-xs text-muted-foreground shrink-0">
                      bytes
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEntry(entry.id)}
                    aria-label="删除"
                  >
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 修正项 */}
          <Card size="sm">
            <CardHeader>
              <CardTitle>额外修正</CardTitle>
              <CardDescription>
                根据使用场景增加固定栈开销
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ToggleRow
                label="在 ISR 中调用"
                hint="Cortex-M3 中断压栈固定 32 bytes (R0-R3, R12, LR, PC, xPSR)"
                active={input.isInIsr}
                onClick={() => updateInput({ isInIsr: !input.isInIsr })}
              />
              <ToggleRow
                label="使用 printf"
                hint="标准 printf 调用约占 +512 bytes 栈空间"
                active={input.usesPrintf}
                onClick={() => updateInput({ usesPrintf: !input.usesPrintf })}
              />
            </CardContent>
          </Card>

          {/* 目标 RTOS */}
          <Card size="sm">
            <CardHeader>
              <CardTitle>目标 RTOS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={input.targetRtos}
                onValueChange={handleRtosChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="freertos">
                    FreeRTOS (configMINIMAL_STACK_SIZE = 128 words)
                  </SelectItem>
                  <SelectItem value="rt-thread">
                    RT-Thread (默认 256 words)
                  </SelectItem>
                  <SelectItem value="generic">
                    通用 RTOS (默认 256 words)
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground flex items-start gap-1.5">
                <Cpu className="size-3.5 mt-0.5 shrink-0" />
                <span>
                  最终栈大小将向上取整到{" "}
                  <span className="font-mono text-foreground">
                    {meta.minimalStackWords}
                  </span>{" "}
                  words ({meta.minimalStackWords * 4} bytes) 的整数倍
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              <RotateCcw className="size-3.5" data-icon="inline-start" />
              重置默认参数
            </Button>
          </div>
        </div>

        {/* 右侧：结果 */}
        <div className="space-y-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle>计算结果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ResultRow
                label="调用链累加"
                value={`${result.callChainBytes} B`}
              />
              <ResultRow
                label="ISR 修正"
                value={
                  input.isInIsr
                    ? `+${result.isrOverheadBytes} B`
                    : "—"
                }
                muted={!input.isInIsr}
              />
              <ResultRow
                label="printf 修正"
                value={
                  input.usesPrintf
                    ? `+${result.printfOverheadBytes} B`
                    : "—"
                }
                muted={!input.usesPrintf}
              />
              <div className="border-t pt-2">
                <ResultRow
                  label="修正后总需求"
                  value={`${result.adjustedBytes} B`}
                />
                <ResultRow
                  label="加 30% 余量"
                  value={`${result.recommendedBytes} B`}
                />
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>推荐栈大小</CardTitle>
              <CardDescription>{meta.label}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  最终 StackSize
                </div>
                <div className="text-2xl font-bold font-mono text-primary">
                  {result.finalStackWords}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    words
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-mono">
                  = {result.finalStackBytes} bytes ={" "}
                  {result.multiplier} × configMINIMAL_STACK_SIZE
                </div>
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>代码片段</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock code={result.codeSnippet} language="c" />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>用动态测量校准</CardTitle>
              <CardDescription>
                上面的估算是起点，真实值请用 FreeRTOS 内置 API 测
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                任务跑稳后调用{" "}
                <code className="font-mono bg-muted px-1 rounded">
                  uxTaskGetStackHighWaterMark(NULL)
                </code>{" "}
                获取&ldquo;历史最低剩余 words&rdquo;。推荐栈大小 ≈ 历史最低 × 1.3。
              </p>
              <CodeBlock
                language="c"
                code={`/* 在任务主循环的关键路径后调用 */
void measure_stack(void)
{
    /* 传 NULL 测当前任务；或传 TaskHandle_t 测他人 */
    UBaseType_t free_words = uxTaskGetStackHighWaterMark(NULL);
    printf("stack free: %u words (min over lifetime)\\n",
           (unsigned)free_words);
    /* 剩余过小（< 32 words）→ 增加 StackSize；
       长期富余 > 50% → 可下调节省 RAM。 */
}`}
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                ⚠️ 必须让任务跑过所有 <strong>最深调用分支</strong>（含异常路径、
                printf、DMA 完成回调等）才能得到可信水位。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------- 子组件 ---------- */

function ToggleRow({
  label,
  hint,
  active,
  onClick,
}: {
  label: string;
  hint: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start justify-between gap-3 rounded-md border p-3 text-left transition-colors ${
        active
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card hover:bg-muted/40"
      }`}
    >
      <div className="space-y-0.5">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      <div
        className={`shrink-0 mt-1 h-5 w-9 rounded-full p-0.5 transition-colors ${
          active ? "bg-primary" : "bg-muted"
        }`}
      >
        <div
          className={`h-4 w-4 rounded-full bg-background shadow transition-transform ${
            active ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
}

function ResultRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`font-mono ${
          muted ? "text-muted-foreground" : "text-foreground font-semibold"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
