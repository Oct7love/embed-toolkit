"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/shared/copy-button";
import {
  swapEndian,
  validateHexInput,
  needsPadding,
  getPaddedCount,
  batchSwapEndian,
  formatBytesDisplay,
} from "@/lib/endian-converter";
import type { ByteWidth } from "@/types/endian-converter";
import { AlertCircle, ArrowLeftRight, List, Info } from "lucide-react";

const BYTE_WIDTH_OPTIONS: ByteWidth[] = [16, 32, 64];
const BYTE_WIDTH_LABELS: Record<ByteWidth, string> = {
  16: "16 位 (2 字节)",
  32: "32 位 (4 字节)",
  64: "64 位 (8 字节)",
};

export function EndianConverter() {
  const [byteWidth, setByteWidth] = useState<ByteWidth>(32);
  const [hexInput, setHexInput] = useState("");
  const [mode, setMode] = useState<"single" | "batch">("single");

  // Batch state
  const [batchInput, setBatchInput] = useState("");
  const [batchResults, setBatchResults] = useState<
    { input: string; result: ReturnType<typeof swapEndian>; error?: string }[]
  >([]);

  // Derive error and result without setState in useMemo
  const error = useMemo(() => {
    if (!hexInput.trim()) return "";
    return validateHexInput(hexInput) ?? "";
  }, [hexInput]);

  const result = useMemo(() => {
    if (!hexInput.trim() || error) return null;
    return swapEndian(hexInput, byteWidth);
  }, [hexInput, byteWidth, error]);

  const isPadded = useMemo(
    () => needsPadding(hexInput, byteWidth),
    [hexInput, byteWidth]
  );

  const paddedCount = useMemo(
    () => getPaddedCount(hexInput, byteWidth),
    [hexInput, byteWidth]
  );

  const handleInputChange = useCallback((value: string) => {
    // Allow hex chars, spaces, 0x prefix
    const cleaned = value.replace(/[^0-9a-fA-Fx\s_]/gi, "");
    setHexInput(cleaned);
  }, []);

  const handleBatchConvert = useCallback(() => {
    const results = batchSwapEndian(batchInput, byteWidth);
    setBatchResults(results);
  }, [batchInput, byteWidth]);

  const handleClear = useCallback(() => {
    setHexInput("");
    setBatchInput("");
    setBatchResults([]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5" />
                字节序转换器
              </CardTitle>
              <CardDescription>
                大端 (Big-Endian) 与小端 (Little-Endian) 互转，支持 16/32/64
                位宽度
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={String(byteWidth)}
                onValueChange={(v) => setByteWidth(Number(v) as ByteWidth)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BYTE_WIDTH_OPTIONS.map((w) => (
                    <SelectItem key={w} value={String(w)}>
                      {BYTE_WIDTH_LABELS[w]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleClear}>
                清空
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Mode tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as "single" | "batch")}>
        <TabsList>
          <TabsTrigger value="single">
            <ArrowLeftRight className="h-3.5 w-3.5" />
            单值转换
          </TabsTrigger>
          <TabsTrigger value="batch">
            <List className="h-3.5 w-3.5" />
            批量转换
          </TabsTrigger>
        </TabsList>

        {/* Single mode */}
        <TabsContent value="single">
          <div className="space-y-4">
            {/* Input */}
            <Card size="sm">
              <CardContent className="pt-3 space-y-2">
                <label className="text-sm font-medium">输入 HEX 值</label>
                <Input
                  value={hexInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="如 12345678 或 0x12345678"
                  className="font-mono"
                  spellCheck={false}
                  autoComplete="off"
                />
                {isPadded && hexInput.trim() && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    输入不足 {byteWidth / 8} 字节，已自动前补 {paddedCount} 个零
                  </div>
                )}
              </CardContent>
            </Card>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Big Endian */}
                <Card size="sm">
                  <CardContent className="pt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        Big-Endian (大端)
                      </label>
                      <CopyButton value={result.bigEndian} />
                    </div>
                    <div className="rounded-md bg-muted/50 p-3">
                      <div className="font-mono text-lg">
                        0x{formatBytesDisplay(result.bigEndian)}
                      </div>
                    </div>
                    {/* Byte breakdown */}
                    <div className="flex gap-1">
                      {result.bytes.map((byte) => (
                        <div
                          key={`be-${byte.index}`}
                          className="flex flex-1 flex-col items-center gap-1"
                        >
                          <span className="text-[10px] text-muted-foreground">
                            字节{byte.index}
                          </span>
                          <span className="w-full rounded border bg-background px-1 py-1 text-center font-mono text-sm">
                            {byte.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Little Endian */}
                <Card size="sm">
                  <CardContent className="pt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        Little-Endian (小端)
                      </label>
                      <CopyButton value={result.littleEndian} />
                    </div>
                    <div className="rounded-md bg-muted/50 p-3">
                      <div className="font-mono text-lg">
                        0x{formatBytesDisplay(result.littleEndian)}
                      </div>
                    </div>
                    {/* Byte breakdown (reversed) */}
                    <div className="flex gap-1">
                      {[...result.bytes].reverse().map((byte) => (
                        <div
                          key={`le-${byte.index}`}
                          className="flex flex-1 flex-col items-center gap-1"
                        >
                          <span className="text-[10px] text-muted-foreground">
                            字节{byte.index}
                          </span>
                          <span className="w-full rounded border bg-primary/10 px-1 py-1 text-center font-mono text-sm">
                            {byte.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Batch mode */}
        <TabsContent value="batch">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium whitespace-nowrap">
                  输入 HEX（每行一个）
                </label>
                <Button onClick={handleBatchConvert}>转换</Button>
              </div>

              <textarea
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder="每行一个 hex 值，如：&#10;12345678&#10;AABBCCDD&#10;0x1234"
                className="w-full min-h-[120px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none resize-y dark:bg-input/30"
                spellCheck={false}
              />

              {batchResults.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="px-2 py-2 font-medium text-muted-foreground">
                          输入
                        </th>
                        <th className="px-2 py-2 font-medium text-muted-foreground">
                          Big-Endian
                        </th>
                        <th className="px-2 py-2 font-medium text-muted-foreground">
                          Little-Endian
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchResults.map((row, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-2 py-1.5 font-mono">
                            {row.input}
                          </td>
                          {row.error ? (
                            <td
                              colSpan={2}
                              className="px-2 py-1.5 text-destructive"
                            >
                              <div className="flex items-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5" />
                                {row.error}
                              </div>
                            </td>
                          ) : row.result ? (
                            <>
                              <td className="px-2 py-1.5 font-mono">
                                <div className="flex items-center gap-1">
                                  0x{formatBytesDisplay(row.result.bigEndian)}
                                  <CopyButton value={row.result.bigEndian} />
                                </div>
                              </td>
                              <td className="px-2 py-1.5 font-mono">
                                <div className="flex items-center gap-1">
                                  0x
                                  {formatBytesDisplay(row.result.littleEndian)}
                                  <CopyButton
                                    value={row.result.littleEndian}
                                  />
                                </div>
                              </td>
                            </>
                          ) : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">提示</Badge>
            当前宽度：{BYTE_WIDTH_LABELS[byteWidth]}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
