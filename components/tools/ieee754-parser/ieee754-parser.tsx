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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BitGrid } from "@/components/shared/bit-grid";
import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import type { FloatType } from "@/types/ieee754-parser";
import {
  parseHexToIEEE754,
  floatToHex,
  formatFloatValue,
  buildBitColorMap,
  buildBitLabelMap,
  getConfig,
} from "@/lib/ieee754-parser";

export function IEEE754Parser() {
  const [floatType, setFloatType] = useState<FloatType>("float32");
  const [hexInput, setHexInput] = useState("41200000");
  const [decimalInput, setDecimalInput] = useState("");
  const [activeInput, setActiveInput] = useState<"hex" | "decimal">("hex");

  const config = getConfig(floatType);
  const hexLen = config.totalBits / 4;

  // Compute the effective hex based on which input is active
  const effectiveHex = useMemo(() => {
    if (activeInput === "decimal" && decimalInput !== "") {
      const num = parseFloat(decimalInput);
      if (!isNaN(num) || decimalInput === "Infinity" || decimalInput === "-Infinity") {
        const val = decimalInput === "Infinity" ? Infinity : decimalInput === "-Infinity" ? -Infinity : num;
        return floatToHex(val, floatType);
      }
      if (decimalInput.toLowerCase() === "nan") {
        return floatType === "float32" ? "7FC00000" : "7FF8000000000000";
      }
      return "";
    }
    return hexInput.replace(/[\s]/g, "");
  }, [activeInput, hexInput, decimalInput, floatType]);

  const result = useMemo(
    () => parseHexToIEEE754(effectiveHex, floatType),
    [effectiveHex, floatType]
  );

  const colorMap = useMemo(() => buildBitColorMap(floatType), [floatType]);
  const labelMap = useMemo(() => buildBitLabelMap(floatType), [floatType]);

  // Convert hex to a 32-bit grid value (for float32 only; float64 uses two rows)
  const gridValue = useMemo(() => {
    if (!result) return 0;
    const hex = result.hexString;
    if (floatType === "float32") {
      return parseInt(hex, 16) >>> 0;
    }
    // For float64, show upper 32 bits
    return parseInt(hex.slice(0, 8), 16) >>> 0;
  }, [result, floatType]);

  const handleHexChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9a-fA-F]/gi, "").toUpperCase();
      if (raw.length <= hexLen) {
        setHexInput(raw);
        setActiveInput("hex");
      }
    },
    [hexLen]
  );

  const handleDecimalChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDecimalInput(e.target.value);
      setActiveInput("decimal");
    },
    []
  );

  const handleFloatTypeChange = useCallback(
    (value: string) => {
      const newType = value as FloatType;
      setFloatType(newType);
      // Reset inputs when switching type
      if (newType === "float32") {
        setHexInput("41200000");
      } else {
        setHexInput("4024000000000000");
      }
      setDecimalInput("");
      setActiveInput("hex");
    },
    []
  );

  const handleBitToggle = useCallback(
    (bit: number) => {
      if (!result) return;

      if (floatType === "float32") {
        const current = parseInt(result.hexString, 16) >>> 0;
        const toggled = (current ^ (1 << bit)) >>> 0;
        setHexInput(toggled.toString(16).toUpperCase().padStart(8, "0"));
        setActiveInput("hex");
      }
      // For float64, toggling individual bits is complex with JS numbers,
      // so we only support it for float32
    },
    [result, floatType]
  );

  // Sync decimal display from hex result
  const displayDecimal = useMemo(() => {
    if (!result) return "";
    return formatFloatValue(result.floatValue, result.special);
  }, [result]);

  const handleLoadExample = useCallback(() => {
    setActiveInput("hex");
    if (floatType === "float32") {
      setHexInput("41200000");
    } else {
      setHexInput("4024000000000000");
    }
    setDecimalInput("");
  }, [floatType]);

  return (
    <div className="space-y-6">
      {/* Type selector */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Tabs
          value={floatType}
          onValueChange={handleFloatTypeChange}
        >
          <TabsList>
            <TabsTrigger value="float32">Float32 (单精度)</TabsTrigger>
            <TabsTrigger value="float64">Float64 (双精度)</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm" onClick={handleLoadExample}>
          加载示例
        </Button>
      </div>

      {/* Input section */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Hex 输入</CardTitle>
            <CardDescription>
              输入 {floatType === "float32" ? "4" : "8"} 字节十六进制值
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-muted-foreground">0x</span>
              <Input
                value={activeInput === "hex" ? hexInput : effectiveHex}
                onChange={handleHexChange}
                onFocus={() => setActiveInput("hex")}
                placeholder={floatType === "float32" ? "41200000" : "4024000000000000"}
                className="font-mono"
                spellCheck={false}
              />
              <CopyButton value={`0x${effectiveHex}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">十进制输入</CardTitle>
            <CardDescription>输入浮点数值（支持 Infinity、NaN）</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                value={activeInput === "decimal" ? decimalInput : displayDecimal}
                onChange={handleDecimalChange}
                onFocus={() => setActiveInput("decimal")}
                placeholder="10.0"
                className="font-mono"
                spellCheck={false}
              />
              <CopyButton value={displayDecimal} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bit visualization */}
      {result && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">位域可视化</CardTitle>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-3 h-3 rounded-sm"
                    style={{ backgroundColor: "#ef4444" }}
                  />
                  符号位
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-3 h-3 rounded-sm"
                    style={{ backgroundColor: "#3b82f6" }}
                  />
                  指数位
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-3 h-3 rounded-sm"
                    style={{ backgroundColor: "#22c55e" }}
                  />
                  尾数位
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {floatType === "float32" ? (
              <BitGrid
                value={gridValue}
                width={32}
                colors={colorMap}
                labels={labelMap}
                onBitToggle={handleBitToggle}
              />
            ) : (
              <Float64BitGrid
                hexString={result.hexString}
                colorMap={colorMap}
                labelMap={labelMap}
              />
            )}

            {/* Binary string display */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-muted-foreground shrink-0">BIN:</span>
              <code className="font-mono text-xs break-all select-all">
                <span style={{ color: "#ef4444" }}>
                  {result.binaryString[0]}
                </span>
                <span className="mx-px" />
                <span style={{ color: "#3b82f6" }}>
                  {result.exponent}
                </span>
                <span className="mx-px" />
                <span style={{ color: "#22c55e" }}>
                  {result.mantissa}
                </span>
              </code>
              <CopyButton value={result.binaryString} size="sm" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parsed result */}
      {result && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">解析结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ResultItem
                label="类型"
                value={
                  <Badge variant={result.special === "normal" ? "secondary" : "destructive"}>
                    {specialLabel(result.special)}
                  </Badge>
                }
              />
              <ResultItem
                label="十进制值"
                value={
                  <span className="font-mono">
                    {formatFloatValue(result.floatValue, result.special)}
                  </span>
                }
              />
              <ResultItem
                label="符号位 (S)"
                value={
                  <span className="font-mono">
                    {result.sign} ({result.sign === 0 ? "正" : "负"})
                  </span>
                }
              />
              <ResultItem
                label="指数 (E)"
                value={
                  <span className="font-mono">
                    {result.exponentValue} (偏移后: {result.exponentActual})
                  </span>
                }
              />
              <ResultItem
                label="偏移量 (Bias)"
                value={<span className="font-mono">{result.exponentBias}</span>}
              />
              <ResultItem
                label="尾数 (M)"
                value={
                  <span className="font-mono">
                    {result.special === "subnormal" ? "0." : "1."}
                    {result.mantissa.slice(0, 10)}
                    {result.mantissa.length > 10 ? "…" : ""}
                  </span>
                }
              />
              {result.special === "normal" && (
                <ResultItem
                  label="计算公式"
                  value={
                    <span className="font-mono text-xs">
                      (-1)^{result.sign} × {result.mantissaValue.toFixed(6)} × 2^
                      {result.exponentActual}
                    </span>
                  }
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ResultItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm">{value}</div>
    </div>
  );
}

function specialLabel(special: string): string {
  switch (special) {
    case "normal":
      return "规格化数";
    case "subnormal":
      return "非规格化数";
    case "zero":
      return "零";
    case "infinity":
      return "无穷大";
    case "nan":
      return "NaN";
    default:
      return special;
  }
}

/**
 * Float64 requires two 32-bit rows since BitGrid only supports up to 32 bits.
 */
function Float64BitGrid({
  hexString,
  colorMap,
  labelMap,
}: {
  hexString: string;
  colorMap: Record<number, string>;
  labelMap: Record<number, string>;
}) {
  const upper = parseInt(hexString.slice(0, 8), 16) >>> 0;
  const lower = parseInt(hexString.slice(8, 16), 16) >>> 0;

  // Build separate color/label maps for upper and lower halves
  const upperColors: Record<number, string> = {};
  const upperLabels: Record<number, string> = {};
  const lowerColors: Record<number, string> = {};
  const lowerLabels: Record<number, string> = {};

  for (let bit = 0; bit < 64; bit++) {
    if (bit >= 32) {
      // Upper 32 bits: bit 63→bit31 in upper grid, bit 32→bit0 in upper grid
      const gridBit = bit - 32;
      if (colorMap[bit]) upperColors[gridBit] = colorMap[bit];
      if (labelMap[bit]) upperLabels[gridBit] = labelMap[bit];
    } else {
      // Lower 32 bits
      if (colorMap[bit]) lowerColors[bit] = colorMap[bit];
      if (labelMap[bit]) lowerLabels[bit] = labelMap[bit];
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Bit [63:32]</p>
      <BitGrid
        value={upper}
        width={32}
        colors={upperColors}
        labels={upperLabels}
        readOnly
      />
      <p className="text-xs text-muted-foreground">Bit [31:0]</p>
      <BitGrid
        value={lower}
        width={32}
        colors={lowerColors}
        labels={lowerLabels}
        readOnly
      />
    </div>
  );
}
