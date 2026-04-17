"use client";

import { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/shared/copy-button";
import {
  calculateBaudrate,
  calculateBatchBaudrates,
  formatBaudrate,
  getErrorColorClass,
} from "@/lib/baudrate-calculator";
import {
  CLOCK_PRESETS,
  BAUDRATE_PRESETS,
} from "@/types/baudrate-calculator";
import { CheckCircle2, XCircle, List } from "lucide-react";

export function BaudrateCalculator() {
  const [clockFreq, setClockFreq] = useState(72_000_000);
  const [targetBaudrate, setTargetBaudrate] = useState(115200);
  const [oversampling, setOversampling] = useState<8 | 16>(16);
  const [showBatch, setShowBatch] = useState(false);

  const result = useMemo(
    () => calculateBaudrate({ clockFreq, targetBaudrate, oversampling }),
    [clockFreq, targetBaudrate, oversampling]
  );

  const batchResults = useMemo(
    () => (showBatch ? calculateBatchBaudrates(clockFreq, oversampling) : []),
    [clockFreq, oversampling, showBatch]
  );

  return (
    <div className="space-y-4">
      {/* 输入区 */}
      <Card>
        <CardHeader>
          <CardTitle>参数配置</CardTitle>
          <CardDescription>
            公式（OVER16）：BRR = round(f_clk / baudrate)；OVER8 时 BRR[3] 必须为 0
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* 时钟频率 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">系统时钟</label>
              <Select
                value={String(clockFreq)}
                onValueChange={(v) => v && setClockFreq(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLOCK_PRESETS.map((p) => (
                    <SelectItem key={p.freq} value={String(p.freq)}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={clockFreq}
                onChange={(e) => setClockFreq(Number(e.target.value) || 0)}
                className="font-mono"
                min={1}
              />
              <p className="text-xs text-muted-foreground">
                {(clockFreq / 1_000_000).toFixed(1)} MHz
              </p>
            </div>

            {/* 波特率 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">目标波特率</label>
              <Select
                value={String(targetBaudrate)}
                onValueChange={(v) => v && setTargetBaudrate(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BAUDRATE_PRESETS.map((b) => (
                    <SelectItem key={b} value={String(b)}>
                      {formatBaudrate(b)} bps
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={targetBaudrate}
                onChange={(e) => setTargetBaudrate(Number(e.target.value) || 0)}
                className="font-mono"
                min={1}
              />
            </div>
          </div>

          {/* 过采样 */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">过采样</label>
            <div className="flex gap-1 rounded-lg border p-1">
              {([16, 8] as const).map((os) => (
                <button
                  key={os}
                  onClick={() => setOversampling(os)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    oversampling === os
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {os}×
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 单值结果 */}
      <Card>
        <CardHeader>
          <CardTitle>计算结果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <ResultItem label="BRR 寄存器值" value={`0x${result.brrValue.toString(16).toUpperCase().padStart(4, "0")}`} mono />
            <ResultItem label={`Mantissa[15:4] / Fraction[${oversampling === 16 ? "3:0" : "2:0"}]`} value={`${result.mantissa} / ${result.fraction}`} mono />
            <ResultItem
              label="实际波特率"
              value={`${result.actualBaudrate.toFixed(2)} bps`}
              mono
            />
            <ResultItem
              label="误差"
              value={`${result.errorPercent.toFixed(4)}%`}
              className={getErrorColorClass(result.errorPercent)}
              mono
            />
            <div className="rounded-lg border p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">是否可用（&lt;2.5%）</div>
              <div className="flex items-center justify-center gap-1">
                {result.isAcceptable ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-500">可用</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-red-500">不可用</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <CopyButton
              value={`BRR=0x${result.brrValue.toString(16).toUpperCase().padStart(4, "0")}, mantissa=${result.mantissa}, fraction=${result.fraction}, 实际=${result.actualBaudrate.toFixed(2)}bps, 误差=${result.errorPercent.toFixed(4)}%`}
              size="sm"
              label="复制结果"
            />
          </div>
        </CardContent>
      </Card>

      {/* 批量模式 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>批量对比</CardTitle>
              <CardDescription>
                当前时钟下所有常见波特率的误差一览
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBatch(!showBatch)}
            >
              <List className="h-3.5 w-3.5 mr-1" />
              {showBatch ? "收起" : "展开"}
            </Button>
          </div>
        </CardHeader>
        {showBatch && (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2 text-left font-medium">波特率</th>
                    <th className="px-3 py-2 text-left font-medium font-mono">BRR</th>
                    <th className="px-3 py-2 text-left font-medium">实际波特率</th>
                    <th className="px-3 py-2 text-left font-medium">误差</th>
                    <th className="px-3 py-2 text-center font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {batchResults.map(({ baudrate, result: r }) => (
                    <tr key={baudrate} className="border-b last:border-0">
                      <td className="px-3 py-2 font-mono font-medium">
                        {formatBaudrate(baudrate)}
                      </td>
                      <td className="px-3 py-2 font-mono">0x{r.brrValue.toString(16).toUpperCase().padStart(4, "0")}</td>
                      <td className="px-3 py-2 font-mono">
                        {r.actualBaudrate.toFixed(2)}
                      </td>
                      <td className={`px-3 py-2 font-mono font-medium ${getErrorColorClass(r.errorPercent)}`}>
                        {r.errorPercent.toFixed(4)}%
                      </td>
                      <td className="px-3 py-2 text-center">
                        {r.isAcceptable ? (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-xs">
                            OK
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            NG
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 公式说明 */}
      <Card>
        <CardContent className="pt-4 text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">公式说明（STM32 BRR 编码）</p>
          <p>
            <strong>OVER16：</strong>
            <code className="font-mono bg-muted px-1 rounded ml-1">
              BRR = round(f_clk / baudrate)
            </code>
            ；mantissa = BRR[15:4]，fraction = BRR[3:0]
          </p>
          <p>
            <strong>OVER8：</strong>
            <code className="font-mono bg-muted px-1 rounded ml-1">
              USARTDIV = f_clk / (8 × baudrate)
            </code>
            ；fraction 仅 3 位（BRR[2:0]），BRR[3] 必须为 0
          </p>
          <p>
            示例：72MHz / 115200 / OVER16 → BRR = 0x0271（mantissa=39, fraction=1），实际 115200.00 bps，误差 0.00%
          </p>
          <p>
            16× 过采样（默认）精度更高；8× 过采样可支持更高波特率但容错性降低。
          </p>
          <p>
            误差标准：<span className="text-green-500 font-medium">&lt;1% 优</span> ·{" "}
            <span className="text-yellow-500 font-medium">1-3% 可用</span> ·{" "}
            <span className="text-red-500 font-medium">&gt;3% 不推荐</span> ·
            STM32 手册要求 &lt;2.5%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultItem({
  label,
  value,
  className = "",
  mono = false,
}: {
  label: string;
  value: string;
  className?: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-base font-semibold ${mono ? "font-mono" : ""} ${className}`}>
        {value}
      </div>
    </div>
  );
}
