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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton } from "@/components/shared/copy-button";
import { useJsonBuilderStore } from "@/stores/json-builder-store";
import type { JsonField, JsonValueType } from "@/types/json-builder";
import {
  createDefaultField,
  generateJson,
  updateFieldInList,
  removeFieldFromList,
  addChildToField,
  moveFieldUp,
  moveFieldDown,
  moveChildUp,
  moveChildDown,
} from "@/lib/json-builder";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  FileDown,
  Braces,
} from "lucide-react";

const VALUE_TYPES: { label: string; value: JsonValueType }[] = [
  { label: "String", value: "string" },
  { label: "Number", value: "number" },
  { label: "Boolean", value: "boolean" },
  { label: "Null", value: "null" },
  { label: "Object", value: "object" },
  { label: "Array", value: "array" },
];

export function JsonBuilder() {
  const [fields, setFields] = useState<JsonField[]>([]);
  const [formatted, setFormatted] = useState(true);
  const { templates, addTemplate, deleteTemplate } = useJsonBuilderStore();

  const jsonOutput = useMemo(
    () => generateJson(fields, formatted),
    [fields, formatted]
  );

  const handleAddField = useCallback(() => {
    setFields((prev) => [...prev, createDefaultField("string")]);
  }, []);

  const handleUpdateField = useCallback(
    (fieldId: string, updater: (field: JsonField) => JsonField) => {
      setFields((prev) => updateFieldInList(prev, fieldId, updater));
    },
    []
  );

  const handleRemoveField = useCallback((fieldId: string) => {
    setFields((prev) => removeFieldFromList(prev, fieldId));
  }, []);

  const handleAddChild = useCallback(
    (parentId: string, type: JsonValueType = "string") => {
      const child = createDefaultField(type);
      setFields((prev) => addChildToField(prev, parentId, child));
    },
    []
  );

  const handleMoveUp = useCallback(
    (index: number, parentId?: string) => {
      if (parentId) {
        setFields((prev) => moveChildUp(prev, parentId, index));
      } else {
        setFields((prev) => moveFieldUp(prev, index));
      }
    },
    []
  );

  const handleMoveDown = useCallback(
    (index: number, parentId?: string) => {
      if (parentId) {
        setFields((prev) => moveChildDown(prev, parentId, index));
      } else {
        setFields((prev) => moveFieldDown(prev, index));
      }
    },
    []
  );

  const handleLoadTemplate = useCallback(
    (templateId: string | null) => {
      if (!templateId) return;
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        // Deep clone the fields to avoid sharing references
        setFields(JSON.parse(JSON.stringify(template.fields)) as JsonField[]);
      }
    },
    [templates]
  );

  const handleClearAll = useCallback(() => {
    setFields([]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base">字段编辑器</CardTitle>
              <CardDescription>添加键值对构建 JSON 对象</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Template selector */}
              <Select onValueChange={handleLoadTemplate}>
                <SelectTrigger className="w-[180px]" size="sm">
                  <SelectValue placeholder="加载模板" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <SaveTemplateDialog
                fields={fields}
                onSave={addTemplate}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFields([
                    { id: `f-${Date.now()}-1`, key: "cmd", type: "string", value: "set_led", children: [] },
                    { id: `f-${Date.now()}-2`, key: "pin", type: "number", value: 13, children: [] },
                    { id: `f-${Date.now()}-3`, key: "state", type: "number", value: 1, children: [] },
                  ])
                }
              >
                加载示例
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearAll}>
                <Trash2 className="h-4 w-4 mr-1" />
                清空
              </Button>
              <Button size="sm" onClick={handleAddField}>
                <Plus className="h-4 w-4 mr-1" />
                添加字段
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Braces className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p>点击「添加字段」开始构建 JSON 对象</p>
              <p className="mt-1 text-xs">或从模板加载常用结构</p>
            </div>
          ) : (
            <div className="space-y-2">
              {fields.map((field, index) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  index={index}
                  total={fields.length}
                  depth={0}
                  onUpdate={handleUpdateField}
                  onRemove={handleRemoveField}
                  onAddChild={handleAddChild}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template management */}
      {templates.some((t) => t.createdAt > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">已保存的模板</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {templates
                .filter((t) => t.createdAt > 0)
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-1.5 border rounded-md px-2.5 py-1.5"
                  >
                    <button
                      type="button"
                      onClick={() => handleLoadTemplate(t.id)}
                      className="text-sm hover:text-primary transition-colors"
                    >
                      {t.name}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => deleteTemplate(t.id)}
                      aria-label={`删除模板 ${t.name}`}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* JSON output */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base">JSON 输出</CardTitle>
            <div className="flex items-center gap-2">
              <Tabs
                value={formatted ? "formatted" : "minified"}
                onValueChange={(v) => setFormatted(v === "formatted")}
              >
                <TabsList>
                  <TabsTrigger value="formatted">格式化</TabsTrigger>
                  <TabsTrigger value="minified">压缩</TabsTrigger>
                </TabsList>
              </Tabs>
              <CopyButton value={jsonOutput} size="sm" label="复制 JSON" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="p-4 rounded-lg border border-border bg-muted/50 overflow-x-auto text-sm">
            <code className="font-mono">{jsonOutput}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Field Editor ─── */

function FieldEditor({
  field,
  index,
  total,
  depth,
  parentId,
  onUpdate,
  onRemove,
  onAddChild,
  onMoveUp,
  onMoveDown,
}: {
  field: JsonField;
  index: number;
  total: number;
  depth: number;
  parentId?: string;
  onUpdate: (fieldId: string, updater: (f: JsonField) => JsonField) => void;
  onRemove: (fieldId: string) => void;
  onAddChild: (parentId: string, type?: JsonValueType) => void;
  onMoveUp: (index: number, parentId?: string) => void;
  onMoveDown: (index: number, parentId?: string) => void;
}) {
  const isContainer = field.type === "object" || field.type === "array";

  return (
    <div
      className="rounded-lg border border-border p-3"
      style={{ marginLeft: depth > 0 ? `${depth * 16}px` : undefined }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        {/* Key input */}
        <Input
          value={field.key}
          onChange={(e) =>
            onUpdate(field.id, (f) => ({ ...f, key: e.target.value }))
          }
          placeholder="key"
          className="font-mono h-8 text-sm w-32 sm:w-40"
          spellCheck={false}
        />

        <span className="text-muted-foreground text-sm">:</span>

        {/* Type selector */}
        <Select
          value={field.type}
          onValueChange={(val) => {
            const newType = val as JsonValueType;
            onUpdate(field.id, (f) => ({
              ...f,
              type: newType,
              value:
                newType === "object" || newType === "array"
                  ? null
                  : newType === "string"
                    ? ""
                    : newType === "number"
                      ? 0
                      : newType === "boolean"
                        ? false
                        : null,
              children:
                newType === "object" || newType === "array"
                  ? f.children
                  : [],
            }));
          }}
        >
          <SelectTrigger className="w-24" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VALUE_TYPES.map((vt) => (
              <SelectItem key={vt.value} value={vt.value}>
                {vt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Value input */}
        {!isContainer && <ValueInput field={field} onUpdate={onUpdate} />}

        {/* Type badge */}
        {isContainer && (
          <Badge variant="outline" className="font-mono text-xs">
            {field.type === "object" ? "{}" : "[]"} {field.children.length}
          </Badge>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-0.5 ml-auto">
          {isContainer && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onAddChild(field.id)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onMoveUp(index, parentId)}
            disabled={index === 0}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onMoveDown(index, parentId)}
            disabled={index === total - 1}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onRemove(field.id)}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {isContainer && field.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {field.children.map((child, i) => (
            <FieldEditor
              key={child.id}
              field={child}
              index={i}
              total={field.children.length}
              depth={depth + 1}
              parentId={field.id}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onAddChild={onAddChild}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Value Input ─── */

function ValueInput({
  field,
  onUpdate,
}: {
  field: JsonField;
  onUpdate: (fieldId: string, updater: (f: JsonField) => JsonField) => void;
}) {
  switch (field.type) {
    case "string":
      return (
        <Input
          value={String(field.value ?? "")}
          onChange={(e) =>
            onUpdate(field.id, (f) => ({ ...f, value: e.target.value }))
          }
          placeholder="value"
          className="font-mono h-8 text-sm flex-1 min-w-[100px]"
          spellCheck={false}
        />
      );
    case "number":
      return (
        <Input
          type="number"
          value={String(field.value ?? 0)}
          onChange={(e) => {
            const val = e.target.value === "" ? 0 : Number(e.target.value);
            onUpdate(field.id, (f) => ({ ...f, value: isNaN(val) ? 0 : val }));
          }}
          className="font-mono h-8 text-sm w-32"
          spellCheck={false}
        />
      );
    case "boolean":
      return (
        <Select
          value={String(field.value ?? false)}
          onValueChange={(val) =>
            onUpdate(field.id, (f) => ({ ...f, value: val === "true" }))
          }
        >
          <SelectTrigger className="w-24" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">true</SelectItem>
            <SelectItem value="false">false</SelectItem>
          </SelectContent>
        </Select>
      );
    case "null":
      return (
        <span className="font-mono text-sm text-muted-foreground px-2">
          null
        </span>
      );
    default:
      return null;
  }
}

/* ─── Save Template Dialog ─── */

function SaveTemplateDialog({
  fields,
  onSave,
}: {
  fields: JsonField[];
  onSave: (template: {
    id: string;
    name: string;
    description: string;
    fields: JsonField[];
    createdAt: number;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = useCallback(() => {
    if (!name.trim() || fields.length === 0) return;
    onSave({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      fields: JSON.parse(JSON.stringify(fields)) as JsonField[],
      createdAt: Date.now(),
    });
    setOpen(false);
    setName("");
    setDescription("");
  }, [name, description, fields, onSave]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" disabled={fields.length === 0}>
            <Save className="h-4 w-4 mr-1" />
            保存模板
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>保存为模板</DialogTitle>
          <DialogDescription>
            将当前 JSON 结构保存为模板，方便后续复用
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">模板名称</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：OTA 升级指令"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">描述</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="可选描述"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || fields.length === 0}>
            <FileDown className="h-4 w-4 mr-1" />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
