"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChipEntry, FieldDiff } from "@/types/mcu-compare";

const FIELD_LABELS: Record<string, string> = {
  manufacturer: "厂商",
  series: "系列",
  package: "封装",
  pinCount: "引脚数",
  cpu: "CPU 架构",
  maxFreq: "主频 (MHz)",
  flashKB: "Flash (KB)",
  ramKB: "RAM (KB)",
  voltage: "工作电压",
  priceRange: "价位段",
  features: "卖点标签",
  "peripheral:uart": "UART",
  "peripheral:spi": "SPI",
  "peripheral:i2c": "I²C",
  "peripheral:can": "CAN",
  "peripheral:usb": "USB",
  "peripheral:eth": "Ethernet",
  "peripheral:adc": "ADC",
  "peripheral:dac": "DAC",
};

function fmt(v: string | number | null): string {
  if (v == null) return "—";
  return String(v);
}

interface DiffTableProps {
  chips: ChipEntry[];
  diffs: FieldDiff[];
}

/** 差异表格：默认隐藏 identical 字段，按钮可切换显示。features 单独以 Badge chip 渲染 */
export function DiffTable({ chips, diffs }: DiffTableProps) {
  const [showIdentical, setShowIdentical] = useState(false);

  const visible = useMemo(
    () => (showIdentical ? diffs : diffs.filter((d) => !d.identical)),
    [diffs, showIdentical]
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">规格对比表</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            默认仅显示有差异的字段；相同字段（淡灰）可折叠按钮查看。
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowIdentical((v) => !v)}
        >
          {showIdentical ? "隐藏相同字段" : "显示相同字段"}
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4 font-medium text-muted-foreground w-40">
                字段
              </th>
              {chips.map((c) => (
                <th key={c.id} className="text-left py-2 pr-4 font-mono text-xs">
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((d) => (
              <tr
                key={d.field}
                className={cn(
                  "border-b last:border-0",
                  d.identical && "text-muted-foreground/60"
                )}
              >
                <td className="py-2 pr-4 text-xs">
                  {FIELD_LABELS[d.field] ?? d.field}
                </td>
                {d.values.map((v, idx) => (
                  <td
                    key={idx}
                    className={cn(
                      "py-2 pr-4 font-mono text-xs",
                      !d.identical && v != null && "font-semibold"
                    )}
                    title={
                      d.field === "priceRange" && v == null
                        ? "参考定位，非实时价格"
                        : undefined
                    }
                  >
                    {fmt(v)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-b last:border-0">
              <td className="py-2 pr-4 text-xs align-top">卖点（详细）</td>
              {chips.map((c) => (
                <td key={c.id} className="py-2 pr-4">
                  {c.features && c.features.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {c.features.map((f) => (
                        <Badge
                          key={f}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {f}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <div className="mt-3 flex items-start gap-2 rounded-md border border-muted bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          <span>
            价位段（$/$$/$$$）仅标参考定位，非实时价格；&ldquo;—&rdquo;
            表示数据未收录。精确选型请回查官方 datasheet。
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
