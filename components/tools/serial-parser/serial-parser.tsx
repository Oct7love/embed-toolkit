"use client";

import { useState, useMemo, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/shared/copy-button";
import {
  FieldHighlighter,
  type HighlightSegment,
} from "@/components/shared/field-highlighter";
import { parseFrame } from "@/lib/serial-parser";
import { useSerialParserStore } from "@/stores/serial-parser-store";
import { FIELD_COLORS } from "@/types/serial-parser";
import type { ParseResult } from "@/types/serial-parser";
import { TemplateEditor } from "./template-editor";
import { Plus, Trash2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export function SerialParser() {
  const [hexInput, setHexInput] = useState("AA 55 03 01 02 03 AB");
  const {
    templates,
    activeTemplateId,
    setActiveTemplateId,
    saveTemplate,
    deleteTemplate,
  } = useSerialParserStore();

  const [showEditor, setShowEditor] = useState(false);

  const activeTemplate = useMemo(
    () => templates.find((t) => t.id === activeTemplateId) ?? templates[0],
    [templates, activeTemplateId]
  );

  const result: ParseResult | null = useMemo(() => {
    if (!hexInput.trim() || !activeTemplate) return null;
    return parseFrame(hexInput, activeTemplate);
  }, [hexInput, activeTemplate]);

  const segments: HighlightSegment[] = useMemo(() => {
    if (!result) return [];
    const segs: HighlightSegment[] = result.fields
      .filter((f) => f.hex.length > 0)
      .map((f) => {
        const colors = FIELD_COLORS[f.field.type];
        return {
          hex: f.hex,
          label: f.field.name,
          bgColor: colors.bg,
          textColor: colors.text,
          description: f.error ?? `类型: ${f.field.type} | 偏移: ${f.field.offset} | 长度: ${f.field.length}`,
          hasError: !f.valid,
        };
      });

    // Add unmatched bytes
    if (result.unmatchedBytes.length > 0) {
      segs.push({
        hex: result.unmatchedBytes
          .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
          .join(" "),
        label: "未匹配字节",
        bgColor: "bg-gray-500/20",
        textColor: "text-gray-600 dark:text-gray-400",
        description: "未被模板定义覆盖的字节",
      });
    }

    return segs;
  }, [result]);

  const handleHexChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Allow only hex chars and spaces
      const cleaned = raw.replace(/[^0-9a-fA-F\s]/g, "").toUpperCase();
      // Auto-format with spaces
      const compact = cleaned.replace(/\s+/g, "");
      const formatted = compact.replace(/(.{2})(?=.)/g, "$1 ");
      setHexInput(formatted);
    },
    []
  );

  const handleNewTemplate = useCallback(() => {
    const id = `template-${Date.now()}`;
    saveTemplate({
      id,
      name: "新模板",
      fields: [],
      createdAt: Date.now(),
    });
    setActiveTemplateId(id);
    setShowEditor(true);
  }, [saveTemplate, setActiveTemplateId]);

  const handleDeleteTemplate = useCallback(() => {
    if (templates.length <= 1) return;
    deleteTemplate(activeTemplateId);
  }, [templates.length, deleteTemplate, activeTemplateId]);

  const rawHex = hexInput.replace(/\s+/g, "");

  return (
    <div className="space-y-4">
      {/* Input */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle>数据输入</CardTitle>
              <CardDescription>粘贴 Hex 数据帧进行解析</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHexInput("AA 55 03 01 02 03 AB")}
            >
              加载示例
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Hex 数据帧</label>
            <div className="flex items-center gap-2">
              <Input
                value={hexInput}
                onChange={handleHexChange}
                placeholder="输入 hex 数据，如 AA 55 03 01 02 03 AB"
                className="font-mono flex-1"
                spellCheck={false}
                autoComplete="off"
              />
              <CopyButton value={hexInput} />
            </div>
            <p className="text-xs text-muted-foreground">
              {rawHex.length / 2} 字节
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>协议模板</CardTitle>
          <CardDescription>选择或编辑协议模板来定义帧结构</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={activeTemplateId}
              onValueChange={(v) => v && setActiveTemplateId(v)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditor(!showEditor)}
            >
              {showEditor ? "收起编辑" : "编辑模板"}
            </Button>

            <Button variant="outline" size="sm" onClick={handleNewTemplate}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              新建
            </Button>

            {templates.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteTemplate}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                删除
              </Button>
            )}
          </div>

          {/* Template Editor */}
          {showEditor && activeTemplate && (
            <TemplateEditor
              template={activeTemplate}
              onSave={(updated) => saveTemplate(updated)}
            />
          )}

          {/* Template Fields Summary */}
          {!showEditor && activeTemplate && (
            <div className="flex flex-wrap gap-1.5">
              {activeTemplate.fields.map((f) => {
                const colors = FIELD_COLORS[f.type];
                return (
                  <Badge
                    key={f.id}
                    variant="secondary"
                    className={`${colors.bg} ${colors.text} font-mono text-xs`}
                  >
                    {f.name} [{f.offset}:{f.offset + f.length}]
                  </Badge>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parse Result */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>解析结果</CardTitle>
              {result.valid ? (
                <Badge variant="secondary" className="bg-green-500/20 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  校验通过
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-red-500/20 text-red-600 dark:text-red-400">
                  <XCircle className="mr-1 h-3 w-3" />
                  存在错误
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Highlighted frame */}
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                帧结构拆解
              </p>
              <FieldHighlighter segments={segments} showLegend />
            </div>

            {/* Field details table */}
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                字段详情
              </p>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left font-medium">字段名</th>
                      <th className="px-3 py-2 text-left font-medium">类型</th>
                      <th className="px-3 py-2 text-left font-medium">偏移</th>
                      <th className="px-3 py-2 text-left font-medium">长度</th>
                      <th className="px-3 py-2 text-left font-medium font-mono">Hex</th>
                      <th className="px-3 py-2 text-left font-medium">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.fields.map((f, i) => {
                      const colors = FIELD_COLORS[f.field.type];
                      return (
                        <tr key={i} className="border-b last:border-0">
                          <td className={`px-3 py-2 ${colors.text} font-medium`}>
                            {f.field.name}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {f.field.type}
                          </td>
                          <td className="px-3 py-2 font-mono">{f.field.offset}</td>
                          <td className="px-3 py-2 font-mono">{f.field.length}</td>
                          <td className="px-3 py-2 font-mono">{f.hex || "-"}</td>
                          <td className="px-3 py-2">
                            {f.valid ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <span className="flex items-center gap-1 text-red-500 text-xs">
                                <XCircle className="h-4 w-4" />
                                {f.error}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Errors */}
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
