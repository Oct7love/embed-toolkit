"use client";

import { useState, useCallback } from "react";
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
  convert,
  validateInput,
  batchConvert,
  formatBinDisplay,
  formatHexDisplay,
} from "@/lib/base-converter";
import type {
  Base,
  BitWidth,
  SignMode,
  ConversionResult,
} from "@/types/base-converter";
import { AlertCircle, List, ArrowRightLeft } from "lucide-react";

const BIT_WIDTH_OPTIONS: BitWidth[] = [8, 16, 32, 64];
const BASE_LABELS: Record<Base, string> = {
  hex: "HEX (十六进制)",
  dec: "DEC (十进制)",
  oct: "OCT (八进制)",
  bin: "BIN (二进制)",
};
const BASE_PLACEHOLDERS: Record<Base, string> = {
  hex: "如 FF, 0xFF",
  dec: "如 255, -1",
  oct: "如 377",
  bin: "如 11111111",
};

export function BaseConverter() {
  const [bitWidth, setBitWidth] = useState<BitWidth>(32);
  const [signMode, setSignMode] = useState<SignMode>("unsigned");
  const [activeBase, setActiveBase] = useState<Base>("hex");
  const [inputValues, setInputValues] = useState<Record<Base, string>>({
    hex: "",
    dec: "",
    oct: "",
    bin: "",
  });
  const [error, setError] = useState<string>("");
  const [mode, setMode] = useState<"single" | "batch">("single");

  // Batch mode state
  const [batchInput, setBatchInput] = useState("");
  const [batchBase, setBatchBase] = useState<Base>("hex");
  const [batchResults, setBatchResults] = useState<
    { input: string; result: ConversionResult }[]
  >([]);

  const handleSingleInput = useCallback(
    (base: Base, value: string) => {
      setActiveBase(base);
      setError("");

      const newValues: Record<Base, string> = {
        hex: "",
        dec: "",
        oct: "",
        bin: "",
      };
      newValues[base] = value;

      if (value.trim() === "") {
        setInputValues(newValues);
        return;
      }

      const validationError = validateInput(value, base);
      if (validationError) {
        newValues[base] = value;
        setInputValues(newValues);
        setError(validationError);
        return;
      }

      const result = convert(value, base, bitWidth, signMode);
      if (result.error) {
        newValues[base] = value;
        setInputValues(newValues);
        setError(result.error);
        return;
      }

      newValues.hex = base === "hex" ? value : result.hex;
      newValues.dec = base === "dec" ? value : result.dec;
      newValues.oct = base === "oct" ? value : result.oct;
      newValues.bin = base === "bin" ? value : result.bin;
      setInputValues(newValues);
    },
    [bitWidth, signMode]
  );

  const handleConfigChange = useCallback(
    (newBitWidth: BitWidth, newSignMode: SignMode) => {
      setBitWidth(newBitWidth);
      setSignMode(newSignMode);

      // Re-convert current value
      const currentValue = inputValues[activeBase];
      if (currentValue.trim()) {
        const result = convert(currentValue, activeBase, newBitWidth, newSignMode);
        if (result.error) {
          setError(result.error);
        } else {
          setError("");
          setInputValues({
            hex: activeBase === "hex" ? currentValue : result.hex,
            dec: activeBase === "dec" ? currentValue : result.dec,
            oct: activeBase === "oct" ? currentValue : result.oct,
            bin: activeBase === "bin" ? currentValue : result.bin,
          });
        }
      }
    },
    [inputValues, activeBase]
  );

  const handleBatchConvert = useCallback(() => {
    const results = batchConvert(batchInput, batchBase, bitWidth, signMode);
    setBatchResults(results);
  }, [batchInput, batchBase, bitWidth, signMode]);

  const handleClear = useCallback(() => {
    setInputValues({ hex: "", dec: "", oct: "", bin: "" });
    setError("");
    setBatchInput("");
    setBatchResults([]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Config bar */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                进制转换器
              </CardTitle>
              <CardDescription>
                支持 HEX/BIN/DEC/OCT 四种进制实时互转，有符号/无符号，批量转换
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={String(bitWidth)}
                onValueChange={(v) =>
                  handleConfigChange(Number(v) as BitWidth, signMode)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BIT_WIDTH_OPTIONS.map((w) => (
                    <SelectItem key={w} value={String(w)}>
                      {w} 位
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={signMode}
                onValueChange={(v) =>
                  handleConfigChange(bitWidth, v as SignMode)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unsigned">无符号</SelectItem>
                  <SelectItem value="signed">有符号</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSingleInput("hex", "2A")}
              >
                加载示例
              </Button>
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
            <ArrowRightLeft className="h-3.5 w-3.5" />
            单值转换
          </TabsTrigger>
          <TabsTrigger value="batch">
            <List className="h-3.5 w-3.5" />
            批量转换
          </TabsTrigger>
        </TabsList>

        {/* Single mode */}
        <TabsContent value="single">
          <div className="grid gap-4 sm:grid-cols-2">
            {(["hex", "dec", "oct", "bin"] as Base[]).map((base) => (
              <Card key={base} size="sm">
                <CardContent className="pt-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        {BASE_LABELS[base]}
                      </label>
                      {inputValues[base] && (
                        <CopyButton value={inputValues[base]} />
                      )}
                    </div>
                    <Input
                      value={inputValues[base]}
                      onChange={(e) => handleSingleInput(base, e.target.value)}
                      placeholder={BASE_PLACEHOLDERS[base]}
                      className="font-mono"
                      spellCheck={false}
                      autoComplete="off"
                    />
                    {/* Show formatted display under bin/hex for readability */}
                    {base === "bin" && inputValues.bin && !error && (
                      <div className="text-xs text-muted-foreground font-mono break-all">
                        {formatBinDisplay(inputValues.bin)}
                      </div>
                    )}
                    {base === "hex" && inputValues.hex && !error && (
                      <div className="text-xs text-muted-foreground font-mono">
                        0x{formatHexDisplay(inputValues.hex)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive mt-4">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </TabsContent>

        {/* Batch mode */}
        <TabsContent value="batch">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium whitespace-nowrap">
                  输入进制
                </label>
                <Select
                  value={batchBase}
                  onValueChange={(v) => setBatchBase(v as Base)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["hex", "dec", "oct", "bin"] as Base[]).map((b) => (
                      <SelectItem key={b} value={b}>
                        {BASE_LABELS[b]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleBatchConvert}>转换</Button>
              </div>

              <textarea
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder="每行一个数值，如：&#10;FF&#10;A0&#10;1234"
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
                          HEX
                        </th>
                        <th className="px-2 py-2 font-medium text-muted-foreground">
                          DEC
                        </th>
                        <th className="px-2 py-2 font-medium text-muted-foreground">
                          OCT
                        </th>
                        <th className="px-2 py-2 font-medium text-muted-foreground">
                          BIN
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchResults.map((row, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-2 py-1.5 font-mono">
                            {row.input}
                          </td>
                          {row.result.error ? (
                            <td
                              colSpan={4}
                              className="px-2 py-1.5 text-destructive"
                            >
                              <div className="flex items-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5" />
                                {row.result.error}
                              </div>
                            </td>
                          ) : (
                            <>
                              <td className="px-2 py-1.5 font-mono">
                                <div className="flex items-center gap-1">
                                  {row.result.hex}
                                  <CopyButton value={row.result.hex} />
                                </div>
                              </td>
                              <td className="px-2 py-1.5 font-mono">
                                <div className="flex items-center gap-1">
                                  {row.result.dec}
                                  <CopyButton value={row.result.dec} />
                                </div>
                              </td>
                              <td className="px-2 py-1.5 font-mono">
                                <div className="flex items-center gap-1">
                                  {row.result.oct}
                                  <CopyButton value={row.result.oct} />
                                </div>
                              </td>
                              <td className="px-2 py-1.5 font-mono">
                                <div className="flex items-center gap-1 max-w-[200px]">
                                  <span className="truncate">
                                    {row.result.bin}
                                  </span>
                                  <CopyButton value={row.result.bin} />
                                </div>
                              </td>
                            </>
                          )}
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
            当前设置：{bitWidth} 位 {signMode === "signed" ? "有符号" : "无符号"}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
