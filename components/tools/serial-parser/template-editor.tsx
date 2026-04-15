"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { ProtocolTemplate, ProtocolField, FieldType } from "@/types/serial-parser";
import { FIELD_COLORS } from "@/types/serial-parser";

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "header", label: "帧头" },
  { value: "length", label: "长度" },
  { value: "data", label: "数据" },
  { value: "checksum", label: "校验" },
  { value: "custom", label: "自定义" },
];

interface TemplateEditorProps {
  template: ProtocolTemplate;
  onSave: (template: ProtocolTemplate) => void;
}

export function TemplateEditor({ template, onSave }: TemplateEditorProps) {
  const [name, setName] = useState(template.name);
  const [fields, setFields] = useState<ProtocolField[]>(template.fields);

  const handleAddField = useCallback(() => {
    const lastField = fields[fields.length - 1];
    const nextOffset = lastField ? lastField.offset + lastField.length : 0;
    const newField: ProtocolField = {
      id: `field-${Date.now()}`,
      name: `字段${fields.length + 1}`,
      offset: nextOffset,
      length: 1,
      type: "data",
    };
    setFields([...fields, newField]);
  }, [fields]);

  const handleUpdateField = useCallback(
    (id: string, updates: Partial<ProtocolField>) => {
      setFields((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
      );
    },
    []
  );

  const handleRemoveField = useCallback((id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleSave = useCallback(() => {
    onSave({ ...template, name, fields });
  }, [template, name, fields, onSave]);

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="模板名称"
          className="max-w-[200px] text-sm"
        />
        <Button size="sm" onClick={handleSave}>
          保存
        </Button>
      </div>

      <div className="space-y-2">
        {fields.map((field) => {
          const colors = FIELD_COLORS[field.type];
          return (
            <div
              key={field.id}
              className="flex items-center gap-2 text-sm flex-wrap"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className={`w-2 h-6 rounded-sm shrink-0`} style={{ backgroundColor: colors.hex }} />
              <Input
                value={field.name}
                onChange={(e) =>
                  handleUpdateField(field.id, { name: e.target.value })
                }
                className="w-24 text-sm"
                placeholder="字段名"
              />
              <Select
                value={field.type}
                onValueChange={(v) =>
                  v && handleUpdateField(field.id, { type: v as FieldType })
                }
              >
                <SelectTrigger className="w-24" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">偏移</span>
                <Input
                  type="number"
                  value={field.offset}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    handleUpdateField(field.id, {
                      offset: Number.isFinite(v) && v >= 0 ? v : 0,
                    });
                  }}
                  className="w-16 text-sm font-mono"
                  min={0}
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">长度</span>
                <Input
                  type="number"
                  value={field.length}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    handleUpdateField(field.id, {
                      length: Number.isFinite(v) && v >= 1 ? v : 1,
                    });
                  }}
                  className="w-16 text-sm font-mono"
                  min={1}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveField(field.id)}
                className="h-7 w-7 text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
      </div>

      <Button variant="outline" size="sm" onClick={handleAddField}>
        <Plus className="mr-1 h-3.5 w-3.5" />
        添加字段
      </Button>
    </div>
  );
}
