"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shared/copy-button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  generateModbusFrame,
  getDefaultQuantity,
  getQuantityLabel,
  needsWriteValues,
} from "@/lib/modbus-generator";
import type { ModbusFunctionCode, ModbusFrameField } from "@/types/modbus-generator";
import { FUNCTION_CODE_NAMES } from "@/types/modbus-generator";
import { RotateCcw } from "lucide-react";

const FUNCTION_CODES: ModbusFunctionCode[] = [1, 2, 3, 4, 5, 6, 15, 16];

export function ModbusGenerator() {
  const [slaveAddress, setSlaveAddress] = useState(1);
  const [functionCode, setFunctionCode] = useState<ModbusFunctionCode>(3);
  const [startAddress, setStartAddress] = useState(0);
  const [quantity, setQuantity] = useState(10);
  const [writeValuesStr, setWriteValuesStr] = useState("0");
  const [frameView, setFrameView] = useState<"rtu" | "tcp">("rtu");

  const writeValues = useMemo(() => {
    return writeValuesStr
      .split(",")
      .map((s) => {
        const trimmed = s.trim();
        if (trimmed.startsWith("0x") || trimmed.startsWith("0X")) {
          return parseInt(trimmed, 16);
        }
        return parseInt(trimmed, 10);
      })
      .filter((n) => !isNaN(n));
  }, [writeValuesStr]);

  const frame = useMemo(() => {
    if (slaveAddress < 1 || slaveAddress > 247) return null;
    if (startAddress < 0 || startAddress > 0xffff) return null;
    if (quantity < 0) return null;
    return generateModbusFrame({
      slaveAddress,
      functionCode,
      startAddress,
      quantity,
      writeValues: needsWriteValues(functionCode) ? writeValues : undefined,
    });
  }, [slaveAddress, functionCode, startAddress, quantity, writeValues]);

  const handleFunctionCodeChange = useCallback((value: string) => {
    const fc = parseInt(value, 10) as ModbusFunctionCode;
    setFunctionCode(fc);
    setQuantity(getDefaultQuantity(fc));
    setWriteValuesStr("0");
  }, []);

  const handleReset = useCallback(() => {
    setSlaveAddress(1);
    setFunctionCode(3);
    setStartAddress(0);
    setQuantity(10);
    setWriteValuesStr("0");
  }, []);

  const clampedInput = useCallback(
    (
      setter: (v: number) => void,
      min: number,
      max: number
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.trim();
      let num: number;
      if (val.startsWith("0x") || val.startsWith("0X")) {
        num = parseInt(val, 16);
      } else {
        num = parseInt(val, 10);
      }
      if (isNaN(num)) return;
      setter(Math.max(min, Math.min(max, num)));
    },
    []
  );

  return (
    <div className="space-y-4">
      {/* Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>参数设置</CardTitle>
          <CardDescription>
            配置 Modbus 请求帧参数
          </CardDescription>
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              重置
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Slave Address */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">从站地址</label>
              <Input
                type="number"
                min={1}
                max={247}
                value={slaveAddress}
                onChange={clampedInput(setSlaveAddress, 1, 247)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">范围: 1-247</p>
            </div>

            {/* Function Code */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">功能码</label>
              <Select
                value={String(functionCode)}
                onValueChange={(v) => v && handleFunctionCodeChange(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUNCTION_CODES.map((fc) => (
                    <SelectItem key={fc} value={String(fc)}>
                      {FUNCTION_CODE_NAMES[fc]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Address */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">起始地址</label>
              <Input
                value={`0x${startAddress.toString(16).toUpperCase().padStart(4, "0")}`}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  let num: number;
                  if (val.startsWith("0x") || val.startsWith("0X")) {
                    num = parseInt(val, 16);
                  } else {
                    num = parseInt(val, 10);
                  }
                  if (!isNaN(num)) {
                    setStartAddress(Math.max(0, Math.min(0xffff, num)));
                  }
                }}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                范围: 0x0000-0xFFFF
              </p>
            </div>

            {/* Quantity / Write Value */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                {getQuantityLabel(functionCode)}
              </label>
              <Input
                type="number"
                min={0}
                max={0xffff}
                value={quantity}
                onChange={clampedInput(setQuantity, 0, 0xffff)}
                className="font-mono"
              />
            </div>
          </div>

          {/* Write Values for FC 15/16 */}
          {needsWriteValues(functionCode) && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                {functionCode === 15
                  ? "线圈值 (逗号分隔, 0/1)"
                  : "寄存器值 (逗号分隔, 支持 0x 格式)"}
              </label>
              <Input
                value={writeValuesStr}
                onChange={(e) => setWriteValuesStr(e.target.value)}
                placeholder={
                  functionCode === 15
                    ? "1, 0, 1, 1, 0"
                    : "0x0001, 0x0002, 100"
                }
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                已解析 {writeValues.length} 个值，需要 {quantity} 个
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Frame Output */}
      <Card>
        <CardHeader>
          <CardTitle>生成帧</CardTitle>
          <CardDescription>Modbus RTU / TCP 帧数据</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            value={frameView}
            onValueChange={(v) => setFrameView(v as "rtu" | "tcp")}
          >
            <TabsList>
              <TabsTrigger value="rtu">RTU</TabsTrigger>
              <TabsTrigger value="tcp">TCP</TabsTrigger>
            </TabsList>
            <TabsContent value="rtu">
              {frame ? (
                <FrameDisplay
                  frameHex={frame.rtu}
                  fields={frame.rtuFields}
                />
              ) : (
                <p className="py-4 text-sm text-muted-foreground">
                  请输入有效参数
                </p>
              )}
            </TabsContent>
            <TabsContent value="tcp">
              {frame ? (
                <FrameDisplay
                  frameHex={frame.tcp}
                  fields={frame.tcpFields}
                />
              ) : (
                <p className="py-4 text-sm text-muted-foreground">
                  请输入有效参数
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function FrameDisplay({
  frameHex,
  fields,
}: {
  frameHex: string;
  fields: ModbusFrameField[];
}) {
  return (
    <div className="space-y-4 pt-2">
      {/* Raw hex with copy */}
      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
        <span className="flex-1 font-mono text-sm break-all">{frameHex}</span>
        <CopyButton value={frameHex} />
      </div>

      {/* Colored field breakdown */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">帧结构拆解</p>
        <div className="flex flex-wrap gap-1">
          {fields.map((field, i) => (
            <Tooltip key={i}>
              <TooltipTrigger
                render={
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-xs ${field.color}`}
                  >
                    {field.hex}
                  </span>
                }
              />
              <TooltipContent>
                <p className="font-medium">{field.name}</p>
                <p className="text-xs opacity-80">{field.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-3 grid grid-cols-2 gap-1 text-xs sm:grid-cols-3">
          {fields.map((field, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span
                className={`inline-block h-3 w-3 rounded-sm ${field.color.split(" ")[0]}`}
              />
              <span className="text-muted-foreground">{field.name}</span>
              <span className="font-mono text-foreground">{field.hex}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
