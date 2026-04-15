"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/shared/copy-button";
import { HexInput } from "@/components/shared/hex-input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { useChecksumStore } from "@/stores/checksum-store";
import {
  calculateCRC,
  calculateXOR,
  calculateSum,
  CRC_PRESETS,
  getPresetByName,
  parseHexInput,
  parseAsciiInput,
  toHex,
  toBin,
} from "@/lib/checksum-calculator";
import type { CRCPreset } from "@/types/checksum-calculator";
import { RotateCcw } from "lucide-react";

export function ChecksumCalculator() {
  const {
    algorithm,
    crcPreset,
    inputMode,
    setAlgorithm,
    setCrcPreset,
    setInputMode,
  } = useChecksumStore();

  const [hexInput, setHexInput] = useState("");
  const [asciiInput, setAsciiInput] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [customParams, setCustomParams] = useState<CRCPreset>({
    name: "自定义",
    width: 16,
    polynomial: 0x8005,
    init: 0xffff,
    refIn: true,
    refOut: true,
    xorOut: 0x0000,
  });

  const inputData = useMemo(() => {
    try {
      if (inputMode === "hex") {
        return parseHexInput(hexInput);
      }
      return parseAsciiInput(asciiInput);
    } catch {
      return null;
    }
  }, [inputMode, hexInput, asciiInput]);

  const activePreset = useMemo(() => {
    if (useCustom) return customParams;
    return getPresetByName(crcPreset) ?? CRC_PRESETS[0];
  }, [useCustom, customParams, crcPreset]);

  const result = useMemo(() => {
    if (!inputData || inputData.length === 0) return null;

    if (algorithm === "xor") {
      const value = calculateXOR(inputData);
      return {
        hex: toHex(value, 8),
        dec: value.toString(),
        bin: toBin(value, 8),
        width: 8 as const,
      };
    }

    if (algorithm === "sum") {
      const value = calculateSum(inputData);
      return {
        hex: toHex(value, 8),
        dec: value.toString(),
        bin: toBin(value, 8),
        width: 8 as const,
      };
    }

    const value = calculateCRC(inputData, activePreset);
    return {
      hex: toHex(value, activePreset.width),
      dec: value.toString(),
      bin: toBin(value, activePreset.width),
      width: activePreset.width,
    };
  }, [inputData, algorithm, activePreset]);

  const handleReset = useCallback(() => {
    setHexInput("");
    setAsciiInput("");
  }, []);

  const presetsByWidth = useMemo(() => {
    const groups: Record<string, CRCPreset[]> = {
      "CRC-8": [],
      "CRC-16": [],
      "CRC-32": [],
    };
    for (const p of CRC_PRESETS) {
      const key = `CRC-${p.width}`;
      groups[key].push(p);
    }
    return groups;
  }, []);

  const handleCustomParamChange = useCallback(
    (field: keyof CRCPreset, value: string | boolean | number) => {
      setCustomParams((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const parseNumberInput = useCallback((val: string): number => {
    const trimmed = val.trim();
    if (trimmed.startsWith("0x") || trimmed.startsWith("0X")) {
      return parseInt(trimmed, 16) || 0;
    }
    return parseInt(trimmed, 10) || 0;
  }, []);

  return (
    <div className="space-y-4">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>输入数据</CardTitle>
          <CardDescription>
            输入 hex 字节或 ASCII 文本来计算校验和
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Tabs
              value={inputMode}
              onValueChange={(v) => setInputMode(v as "hex" | "ascii")}
            >
              <TabsList>
                <TabsTrigger value="hex">Hex</TabsTrigger>
                <TabsTrigger value="ascii">ASCII</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInputMode("hex");
                setHexInput("01 03 00 00 00 0A");
                setAsciiInput("");
                setUseCustom(false);
                setAlgorithm("crc");
                setCrcPreset("CRC-16/MODBUS");
              }}
            >
              加载示例
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              清空
            </Button>
          </div>
          {inputMode === "hex" ? (
            <HexInput
              value={hexInput}
              onChange={setHexInput}
              placeholder="输入 hex 数据，如 01 03 00 00 00 0A"
            />
          ) : (
            <Input
              value={asciiInput}
              onChange={(e) => setAsciiInput(e.target.value)}
              placeholder="输入 ASCII 文本，如 123456789"
              className="font-mono"
            />
          )}
          {inputData && (
            <p className="text-xs text-muted-foreground">
              数据长度: {inputData.length} 字节
            </p>
          )}
          {!inputData && (inputMode === "hex" ? hexInput : asciiInput) && (
            <p className="text-xs text-destructive">输入格式有误</p>
          )}
        </CardContent>
      </Card>

      {/* Algorithm Section */}
      <Card>
        <CardHeader>
          <CardTitle>算法选择</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            value={algorithm}
            onValueChange={(v) =>
              setAlgorithm(v as "crc" | "xor" | "sum")
            }
          >
            <TabsList>
              <TabsTrigger value="crc">CRC</TabsTrigger>
              <TabsTrigger value="xor">XOR 校验</TabsTrigger>
              <TabsTrigger value="sum">累加和</TabsTrigger>
            </TabsList>
          </Tabs>

          {algorithm === "crc" && (
            <div className="space-y-3">
              {/* Preset / Custom toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={!useCustom ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseCustom(false)}
                >
                  预设
                </Button>
                <Button
                  variant={useCustom ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseCustom(true)}
                >
                  自定义
                </Button>
              </div>

              {!useCustom ? (
                <Select
                  value={crcPreset}
                  onValueChange={(v) => v && setCrcPreset(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择 CRC 预设" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(presetsByWidth).map(([group, presets]) => (
                      <SelectGroup key={group}>
                        <SelectLabel>{group}</SelectLabel>
                        {presets.map((p) => (
                          <SelectItem key={p.name} value={p.name}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <CustomCRCParams
                  params={customParams}
                  onChange={handleCustomParamChange}
                  parseNumber={parseNumberInput}
                />
              )}

              {/* Show active preset params */}
              <PresetDetails preset={activePreset} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result Section */}
      <Card>
        <CardHeader>
          <CardTitle>计算结果</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-3">
              <ResultRow label="Hex" value={`0x${result.hex}`} />
              <ResultRow label="Dec" value={result.dec} />
              <ResultRow label="Bin" value={result.bin} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              请输入数据以计算校验和
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{label}</Badge>
        <span className="font-mono text-sm">{value}</span>
      </div>
      <CopyButton value={value} />
    </div>
  );
}

function PresetDetails({ preset }: { preset: CRCPreset }) {
  const hexWidth = preset.width / 4;
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg border p-3 text-xs text-muted-foreground sm:grid-cols-3">
      <span>
        Width: <span className="font-mono text-foreground">{preset.width}</span>
      </span>
      <span>
        Poly:{" "}
        <span className="font-mono text-foreground">
          0x{preset.polynomial.toString(16).toUpperCase().padStart(hexWidth, "0")}
        </span>
      </span>
      <span>
        Init:{" "}
        <span className="font-mono text-foreground">
          0x{preset.init.toString(16).toUpperCase().padStart(hexWidth, "0")}
        </span>
      </span>
      <span>
        RefIn:{" "}
        <span className="font-mono text-foreground">
          {preset.refIn ? "true" : "false"}
        </span>
      </span>
      <span>
        RefOut:{" "}
        <span className="font-mono text-foreground">
          {preset.refOut ? "true" : "false"}
        </span>
      </span>
      <span>
        XorOut:{" "}
        <span className="font-mono text-foreground">
          0x{preset.xorOut.toString(16).toUpperCase().padStart(hexWidth, "0")}
        </span>
      </span>
    </div>
  );
}

function CustomCRCParams({
  params,
  onChange,
  parseNumber,
}: {
  params: CRCPreset;
  onChange: (field: keyof CRCPreset, value: string | boolean | number) => void;
  parseNumber: (val: string) => number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="w-16 text-sm text-muted-foreground">Width</label>
        <div className="flex gap-1">
          {([8, 16, 32] as const).map((w) => (
            <Button
              key={w}
              variant={params.width === w ? "default" : "outline"}
              size="xs"
              onClick={() => onChange("width", w)}
            >
              {w}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Polynomial</label>
          <Input
            className="font-mono"
            defaultValue={`0x${params.polynomial.toString(16).toUpperCase()}`}
            onBlur={(e) => onChange("polynomial", parseNumber(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Init Value</label>
          <Input
            className="font-mono"
            defaultValue={`0x${params.init.toString(16).toUpperCase()}`}
            onBlur={(e) => onChange("init", parseNumber(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">XorOut</label>
          <Input
            className="font-mono"
            defaultValue={`0x${params.xorOut.toString(16).toUpperCase()}`}
            onBlur={(e) => onChange("xorOut", parseNumber(e.target.value))}
          />
        </div>
      </div>
      <div className="flex gap-4">
        <Button
          variant={params.refIn ? "default" : "outline"}
          size="sm"
          onClick={() => onChange("refIn", !params.refIn)}
        >
          RefIn: {params.refIn ? "ON" : "OFF"}
        </Button>
        <Button
          variant={params.refOut ? "default" : "outline"}
          size="sm"
          onClick={() => onChange("refOut", !params.refOut)}
        >
          RefOut: {params.refOut ? "ON" : "OFF"}
        </Button>
      </div>
    </div>
  );
}
