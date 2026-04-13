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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BitGrid } from "@/components/shared/bit-grid";
import { CodeBlock } from "@/components/shared/code-block";
import { CopyButton } from "@/components/shared/copy-button";
import type { BitOperationType, CodeStyle } from "@/types/bit-operation";
import {
  generateCode,
  getDirectExpression,
  buildMask,
  toHexLiteral,
} from "@/lib/bit-operation";
import { RotateCcw } from "lucide-react";

const OPERATIONS: { label: string; value: BitOperationType; description: string }[] = [
  { label: "SET (置位)", value: "SET", description: "将选中的位设为 1" },
  { label: "CLR (清零)", value: "CLR", description: "将选中的位清为 0" },
  { label: "TOGGLE (翻转)", value: "TOGGLE", description: "翻转选中的位" },
  { label: "READ (读取)", value: "READ", description: "读取选中的位值" },
];

export function BitOperationGenerator() {
  const [bitValue, setBitValue] = useState(0);
  const [registerName, setRegisterName] = useState("REG");
  const [operation, setOperation] = useState<BitOperationType>("SET");
  const [codeStyle, setCodeStyle] = useState<CodeStyle>("macro");

  const selectedBits = useMemo(() => {
    const bits: number[] = [];
    for (let i = 0; i < 32; i++) {
      if ((bitValue >>> i) & 1) {
        bits.push(i);
      }
    }
    return bits;
  }, [bitValue]);

  const mask = useMemo(() => buildMask(selectedBits), [selectedBits]);

  const generatedCode = useMemo(
    () => generateCode(registerName, selectedBits, operation, codeStyle),
    [registerName, selectedBits, operation, codeStyle]
  );

  const directExpression = useMemo(
    () => getDirectExpression(registerName, selectedBits, operation),
    [registerName, selectedBits, operation]
  );

  const handleBitToggle = useCallback((bit: number) => {
    setBitValue((prev) => (prev ^ (1 << bit)) >>> 0);
  }, []);

  const handleReset = useCallback(() => {
    setBitValue(0);
  }, []);

  const handleSelectAll = useCallback(() => {
    setBitValue(0xffffffff >>> 0);
  }, []);

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">配置</CardTitle>
          <CardDescription>设置寄存器名称和操作类型</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">寄存器名称</label>
              <Input
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value || "REG")}
                placeholder="如 GPIOA->ODR"
                className="font-mono"
                spellCheck={false}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">操作类型</label>
              <Select
                value={operation}
                onValueChange={(v) => v && setOperation(v as BitOperationType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPERATIONS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {OPERATIONS.find((o) => o.value === operation)?.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bit Grid */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base">位选择</CardTitle>
              <CardDescription>
                点击 bit 位选择要操作的位，已选{" "}
                <span className="font-mono">{selectedBits.length}</span> 位
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                全选
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                清空
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <BitGrid
            value={bitValue}
            width={32}
            onBitToggle={handleBitToggle}
          />

          {/* Summary */}
          {selectedBits.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">MASK:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {toHexLiteral(mask)}
                </Badge>
                <CopyButton value={toHexLiteral(mask)} />
              </div>
              {directExpression && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">表达式:</span>
                  <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                    {directExpression}
                  </code>
                  <CopyButton value={directExpression} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Code */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base">生成代码</CardTitle>
            <Tabs
              value={codeStyle}
              onValueChange={(v) => setCodeStyle(v as CodeStyle)}
            >
              <TabsList>
                <TabsTrigger value="macro">宏定义</TabsTrigger>
                <TabsTrigger value="inline">内联函数</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <CodeBlock code={generatedCode.code} language="c" />
        </CardContent>
      </Card>
    </div>
  );
}
