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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BitGrid } from "@/components/shared/bit-grid";
import { CopyButton } from "@/components/shared/copy-button";
import { useRegisterViewerStore } from "@/stores/register-viewer-store";
import type { BitField, RegisterTemplate } from "@/types/register-viewer";
import {
  parseHexValue,
  toHex,
  toBin,
  getFieldValue,
  setFieldValue,
  buildFieldColorMap,
  buildFieldLabelMap,
  validateFields,
  FIELD_COLORS,
} from "@/lib/register-viewer";
import { Plus, Trash2, Save } from "lucide-react";

export function RegisterViewer() {
  const [regValue, setRegValue] = useState(0);
  const [hexInput, setHexInput] = useState("00000000");
  const { templates, activeTemplateId, setActiveTemplate, addTemplate, deleteTemplate } =
    useRegisterViewerStore();

  const activeTemplate = useMemo(
    () => templates.find((t) => t.id === activeTemplateId) ?? null,
    [templates, activeTemplateId]
  );

  const fields = useMemo(() => activeTemplate?.fields ?? [], [activeTemplate]);

  const colorMap = useMemo(() => buildFieldColorMap(fields), [fields]);
  const labelMap = useMemo(() => buildFieldLabelMap(fields), [fields]);

  const handleHexChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9a-fA-F]/gi, "").toUpperCase();
      if (raw.length <= 8) {
        setHexInput(raw.padStart(8, "0"));
        const val = parseHexValue(raw);
        if (val !== null) setRegValue(val);
      }
    },
    []
  );

  const handleDecChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, "");
      if (raw === "") {
        setRegValue(0);
        setHexInput("00000000");
        return;
      }
      const val = parseInt(raw, 10);
      if (val <= 0xffffffff) {
        setRegValue(val >>> 0);
        setHexInput(toHex(val >>> 0));
      }
    },
    []
  );

  const handleBitToggle = useCallback(
    (bit: number) => {
      const toggled = (regValue ^ (1 << bit)) >>> 0;
      setRegValue(toggled);
      setHexInput(toHex(toggled));
    },
    [regValue]
  );

  const handleFieldValueChange = useCallback(
    (field: BitField, newFieldVal: number) => {
      const updated = setFieldValue(regValue, field.startBit, field.endBit, newFieldVal);
      setRegValue(updated);
      setHexInput(toHex(updated));
    },
    [regValue]
  );

  const handleTemplateChange = useCallback(
    (value: string | null) => {
      setActiveTemplate(!value || value === "none" ? null : value);
    },
    [setActiveTemplate]
  );

  return (
    <div className="space-y-6">
      {/* Value inputs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">寄存器值</CardTitle>
          <CardDescription>输入 32 位寄存器值或点击 bit 翻转</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">HEX</label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-muted-foreground">0x</span>
                <Input
                  value={hexInput}
                  onChange={handleHexChange}
                  className="font-mono"
                  spellCheck={false}
                />
                <CopyButton value={`0x${hexInput}`} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">DEC</label>
              <div className="flex items-center gap-2">
                <Input
                  value={(regValue >>> 0).toString(10)}
                  onChange={handleDecChange}
                  className="font-mono"
                  spellCheck={false}
                />
                <CopyButton value={(regValue >>> 0).toString(10)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">BIN</label>
              <div className="flex items-center gap-2">
                <div className="font-mono text-xs truncate border rounded-md px-3 py-2 bg-muted/50 flex-1">
                  {toBin(regValue)}
                </div>
                <CopyButton value={toBin(regValue)} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bit grid */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base">位域视图</CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={activeTemplateId ?? "none"}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger className="w-[200px]" size="sm">
                  <SelectValue placeholder="选择位域模板" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无模板</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <NewTemplateDialog onSave={addTemplate} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <BitGrid
            value={regValue}
            width={32}
            onBitToggle={handleBitToggle}
            colors={colorMap}
            labels={labelMap}
          />

          {/* Field legend */}
          {fields.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {fields.map((f) => (
                <span key={`${f.name}-${f.startBit}`} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="inline-block w-3 h-3 rounded-sm"
                    style={{ backgroundColor: f.color }}
                  />
                  {f.name} [{Math.max(f.startBit, f.endBit)}:{Math.min(f.startBit, f.endBit)}]
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Field values */}
      {activeTemplate && fields.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{activeTemplate.name}</CardTitle>
                {activeTemplate.description && (
                  <CardDescription>{activeTemplate.description}</CardDescription>
                )}
              </div>
              {activeTemplate.createdAt > 0 && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => deleteTemplate(activeTemplate.id)}
                  aria-label="删除模板"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-4 gap-y-2 items-center text-sm">
                <span className="font-medium text-muted-foreground text-xs">字段</span>
                <span className="font-medium text-muted-foreground text-xs">描述</span>
                <span className="font-medium text-muted-foreground text-xs">位域</span>
                <span className="font-medium text-muted-foreground text-xs">值</span>
                {fields.map((field) => {
                  const low = Math.min(field.startBit, field.endBit);
                  const high = Math.max(field.startBit, field.endBit);
                  const fieldVal = getFieldValue(regValue, field.startBit, field.endBit);
                  const width = high - low + 1;
                  const maxVal = width >= 32 ? 0xFFFFFFFF : (1 << width) - 1;

                  return (
                    <FieldRow
                      key={`${field.name}-${low}`}
                      field={field}
                      fieldVal={fieldVal}
                      maxVal={maxVal}
                      low={low}
                      high={high}
                      onValueChange={(v) => handleFieldValueChange(field, v)}
                    />
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FieldRow({
  field,
  fieldVal,
  maxVal,
  low,
  high,
  onValueChange,
}: {
  field: BitField;
  fieldVal: number;
  maxVal: number;
  low: number;
  high: number;
  onValueChange: (v: number) => void;
}) {
  return (
    <>
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
          style={{ backgroundColor: field.color }}
        />
        <span className="font-mono text-sm">{field.name}</span>
      </span>
      <span className="text-xs text-muted-foreground truncate">
        {field.description}
      </span>
      <Badge variant="outline" className="font-mono text-xs">
        [{high}:{low}]
      </Badge>
      <div className="flex items-center gap-1">
        <Input
          value={fieldVal.toString()}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v >= 0 && v <= maxVal) {
              onValueChange(v);
            } else if (e.target.value === "") {
              onValueChange(0);
            }
          }}
          className="font-mono w-20 h-7 text-xs"
          spellCheck={false}
        />
        <span className="text-xs text-muted-foreground font-mono">
          0x{fieldVal.toString(16).toUpperCase()}
        </span>
      </div>
    </>
  );
}

function NewTemplateDialog({
  onSave,
}: {
  onSave: (template: RegisterTemplate) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<BitField[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleAddField = useCallback(() => {
    setFields((prev) => [
      ...prev,
      {
        name: `FIELD${prev.length}`,
        startBit: 0,
        endBit: 0,
        description: "",
        color: FIELD_COLORS[prev.length % FIELD_COLORS.length],
      },
    ]);
  }, []);

  const handleRemoveField = useCallback((index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleFieldChange = useCallback(
    (index: number, key: keyof BitField, value: string | number) => {
      setFields((prev) =>
        prev.map((f, i) => (i === index ? { ...f, [key]: value } : f))
      );
    },
    []
  );

  const handleSave = useCallback(() => {
    if (!name.trim()) return;
    const errors = validateFields(fields, 32);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    onSave({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      width: 32,
      fields,
      createdAt: Date.now(),
    });
    setOpen(false);
    setName("");
    setDescription("");
    setFields([]);
    setValidationErrors([]);
  }, [name, description, fields, onSave]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            新建模板
          </Button>
        }
      />
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新建位域模板</DialogTitle>
          <DialogDescription>
            定义寄存器的位域结构，保存后可在列表中选用
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">模板名称</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：STM32 TIMx_CR1"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">描述</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="定时器控制寄存器 1"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">位域定义</label>
              <Button variant="ghost" size="sm" onClick={handleAddField}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                添加
              </Button>
            </div>

            {fields.map((field, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end"
              >
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">名称</label>
                  <Input
                    value={field.name}
                    onChange={(e) => handleFieldChange(i, "name", e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">起始位</label>
                  <Input
                    type="number"
                    min={0}
                    max={31}
                    value={field.startBit}
                    onChange={(e) =>
                      handleFieldChange(i, "startBit", parseInt(e.target.value) || 0)
                    }
                    className="h-8 text-xs font-mono w-16"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">结束位</label>
                  <Input
                    type="number"
                    min={0}
                    max={31}
                    value={field.endBit}
                    onChange={(e) =>
                      handleFieldChange(i, "endBit", parseInt(e.target.value) || 0)
                    }
                    className="h-8 text-xs font-mono w-16"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemoveField(i)}
                  className="mb-0.5"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}

            {fields.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                点击「添加」定义位域
              </p>
            )}
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <p className="font-medium mb-1">保存失败：位域校验未通过</p>
            <ul className="list-disc list-inside space-y-0.5">
              {validationErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            <Save className="h-4 w-4 mr-1" />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
