"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/shared/copy-button";
import {
  FieldHighlighter,
  type HighlightSegment,
} from "@/components/shared/field-highlighter";
import { parseMqttPacket, hexToBytes } from "@/lib/mqtt-parser";
import { MQTT_COLORS } from "@/types/mqtt-parser";
import type { MqttTreeNode } from "@/types/mqtt-parser";
import { CheckCircle2, XCircle, AlertTriangle, ChevronRight } from "lucide-react";

export function MqttParser() {
  const [hexInput, setHexInput] = useState("");

  const result = useMemo(() => {
    const raw = hexInput.replace(/\s+/g, "");
    if (raw.length < 4) return null;
    try {
      const bytes = hexToBytes(raw);
      return parseMqttPacket(bytes);
    } catch {
      return null;
    }
  }, [hexInput]);

  const segments: HighlightSegment[] = useMemo(() => {
    if (!result) return [];
    return result.segments.map((s) => {
      const colors = MQTT_COLORS[s.category];
      return {
        hex: s.hex,
        label: s.label,
        bgColor: colors.bg,
        textColor: colors.text,
      };
    });
  }, [result]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/[^0-9a-fA-F\s]/g, "").toUpperCase();
    const compact = cleaned.replace(/\s+/g, "");
    const formatted = compact.replace(/(.{2})(?=.)/g, "$1 ");
    setHexInput(formatted);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>数据输入</CardTitle>
          <CardDescription>粘贴 MQTT 原始字节流（Hex）</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Input
                value={hexInput}
                onChange={handleHexChange}
                placeholder="输入 MQTT 报文 hex，如 10 1A 00 04 4D 51 54 54 ..."
                className="font-mono flex-1"
                spellCheck={false}
              />
              <CopyButton value={hexInput} />
            </div>
            <p className="text-xs text-muted-foreground">
              {hexInput.replace(/\s+/g, "").length / 2} 字节
            </p>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>解析结果</CardTitle>
              {result.valid ? (
                <Badge variant="secondary" className="bg-green-500/20 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {result.fixedHeader?.packetTypeName}
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-red-500/20 text-red-600 dark:text-red-400">
                  <XCircle className="mr-1 h-3 w-3" />
                  解析失败
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {segments.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">报文结构</p>
                <FieldHighlighter segments={segments} showLegend />
              </div>
            )}

            {result.tree.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">详细解析</p>
                <div className="rounded-lg border p-3 space-y-1">
                  {result.tree.map((node, i) => (
                    <TreeNodeView key={i} node={node} depth={0} />
                  ))}
                </div>
              </div>
            )}

            {result.errors.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
                <p className="mb-1 flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  错误信息
                </p>
                <ul className="list-inside list-disc text-xs text-red-600 dark:text-red-400">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TreeNodeView({ node, depth }: { node: MqttTreeNode; depth: number }) {
  const colors = MQTT_COLORS[node.category];
  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div className="flex items-center gap-2 py-0.5 text-sm">
        {node.children && node.children.length > 0 && (
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        )}
        <span className={`font-medium ${colors.text}`}>{node.label}</span>
        {node.hex && (
          <span className="font-mono text-xs text-muted-foreground">{node.hex}</span>
        )}
        {node.value && (
          <span className="text-xs">{node.value}</span>
        )}
      </div>
      {node.children?.map((child, i) => (
        <TreeNodeView key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}
