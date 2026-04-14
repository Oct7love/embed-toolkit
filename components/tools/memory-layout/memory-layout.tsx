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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  parseMapFile,
  computeMemoryStats,
  detectOverlaps,
  formatAddress,
  formatSize,
} from "@/lib/memory-layout";
import { parseAddress, parseSize } from "@/lib/memory-layout/format";
import type {
  MemorySection,
  MemoryType,
  SectionType,
} from "@/types/memory-layout";
import {
  SECTION_COLORS,
  SECTION_TYPE_LABELS,
  DEFAULT_FLASH_START,
  DEFAULT_FLASH_SIZE,
  DEFAULT_RAM_START,
  DEFAULT_RAM_SIZE,
} from "@/types/memory-layout";
import {
  Plus,
  Trash2,
  Upload,
  HardDrive,
  AlertTriangle,
  Cpu,
  PenLine,
} from "lucide-react";
import { MemoryBar } from "./memory-bar";

export function MemoryLayout() {
  const [sections, setSections] = useState<MemorySection[]>([]);
  const [flashStart, setFlashStart] = useState(DEFAULT_FLASH_START);
  const [flashSize, setFlashSize] = useState(DEFAULT_FLASH_SIZE);
  const [ramStart, setRamStart] = useState(DEFAULT_RAM_START);
  const [ramSize, setRamSize] = useState(DEFAULT_RAM_SIZE);
  const [mapContent, setMapContent] = useState("");
  const [mode, setMode] = useState<"manual" | "import">("manual");

  // Computed stats
  const flashStats = useMemo(
    () => computeMemoryStats(sections, "flash", flashSize),
    [sections, flashSize]
  );
  const ramStats = useMemo(
    () => computeMemoryStats(sections, "ram", ramSize),
    [sections, ramSize]
  );
  const overlaps = useMemo(() => detectOverlaps(sections), [sections]);

  const flashSections = useMemo(
    () =>
      sections
        .filter((s) => s.memoryType === "flash")
        .sort((a, b) => a.startAddress - b.startAddress),
    [sections]
  );
  const ramSections = useMemo(
    () =>
      sections
        .filter((s) => s.memoryType === "ram")
        .sort((a, b) => a.startAddress - b.startAddress),
    [sections]
  );

  const handleAddSection = useCallback(() => {
    const id = `section-${Date.now()}`;
    const newSection: MemorySection = {
      id,
      name: ".custom",
      type: "custom",
      startAddress: flashStart,
      size: 1024,
      memoryType: "flash",
      color: SECTION_COLORS.custom,
    };
    setSections((prev) => [...prev, newSection]);
  }, [flashStart]);

  const handleRemoveSection = useCallback((id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleUpdateSection = useCallback(
    (id: string, field: keyof MemorySection, value: string | number) => {
      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          const updated = { ...s, [field]: value };
          // Auto-update color when type changes
          if (field === "type") {
            updated.color = SECTION_COLORS[value as SectionType] || SECTION_COLORS.custom;
          }
          return updated;
        })
      );
    },
    []
  );

  const handleParseMap = useCallback(() => {
    const parsed = parseMapFile(mapContent);
    if (parsed.length > 0) {
      setSections(parsed);
    }
  }, [mapContent]);

  const handleLoadExample = useCallback(() => {
    setSections([
      {
        id: "ex-1",
        name: ".isr_vector",
        type: "vector",
        startAddress: 0x08000000,
        size: 0x188,
        memoryType: "flash",
        color: SECTION_COLORS.vector,
      },
      {
        id: "ex-2",
        name: ".text",
        type: "text",
        startAddress: 0x08000188,
        size: 0x1a000,
        memoryType: "flash",
        color: SECTION_COLORS.text,
      },
      {
        id: "ex-3",
        name: ".rodata",
        type: "rodata",
        startAddress: 0x0801a188,
        size: 0x2000,
        memoryType: "flash",
        color: SECTION_COLORS.rodata,
      },
      {
        id: "ex-4",
        name: ".data",
        type: "data",
        startAddress: 0x20000000,
        size: 0x800,
        memoryType: "ram",
        color: SECTION_COLORS.data,
      },
      {
        id: "ex-5",
        name: ".bss",
        type: "bss",
        startAddress: 0x20000800,
        size: 0x3000,
        memoryType: "ram",
        color: SECTION_COLORS.bss,
      },
      {
        id: "ex-6",
        name: "Heap",
        type: "heap",
        startAddress: 0x20003800,
        size: 0x4000,
        memoryType: "ram",
        color: SECTION_COLORS.heap,
      },
      {
        id: "ex-7",
        name: "Stack",
        type: "stack",
        startAddress: 0x2001f800,
        size: 0x800,
        memoryType: "ram",
        color: SECTION_COLORS.stack,
      },
    ]);
  }, []);

  const handleClearAll = useCallback(() => {
    setSections([]);
    setMapContent("");
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                内存布局可视化
              </CardTitle>
              <CardDescription>
                手动配置或解析 GCC .map 文件，可视化 Flash/RAM 分区占用
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleLoadExample}>
                加载示例
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearAll}>
                清空
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Memory region config */}
      <Card size="sm">
        <CardContent className="pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Flash 起始地址 / 总大小
              </label>
              <div className="flex gap-2">
                <Input
                  value={formatAddress(flashStart)}
                  onChange={(e) => {
                    const v = parseAddress(e.target.value);
                    if (v !== null) setFlashStart(v);
                  }}
                  className="font-mono text-sm"
                  placeholder="0x08000000"
                />
                <Input
                  value={formatSize(flashSize)}
                  onChange={(e) => {
                    const v = parseSize(e.target.value);
                    if (v !== null && v > 0) setFlashSize(v);
                  }}
                  className="font-mono text-sm"
                  placeholder="512KB"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                RAM 起始地址 / 总大小
              </label>
              <div className="flex gap-2">
                <Input
                  value={formatAddress(ramStart)}
                  onChange={(e) => {
                    const v = parseAddress(e.target.value);
                    if (v !== null) setRamStart(v);
                  }}
                  className="font-mono text-sm"
                  placeholder="0x20000000"
                />
                <Input
                  value={formatSize(ramSize)}
                  onChange={(e) => {
                    const v = parseSize(e.target.value);
                    if (v !== null && v > 0) setRamSize(v);
                  }}
                  className="font-mono text-sm"
                  placeholder="128KB"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input mode tabs */}
      <Tabs
        value={mode}
        onValueChange={(v) => {
          if (v !== null) setMode(v as "manual" | "import");
        }}
      >
        <TabsList>
          <TabsTrigger value="manual">
            <PenLine className="h-3.5 w-3.5" />
            手动输入
          </TabsTrigger>
          <TabsTrigger value="import">
            <Upload className="h-3.5 w-3.5" />
            导入 .map
          </TabsTrigger>
        </TabsList>

        {/* Manual mode */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">内存段列表</CardTitle>
                <Button variant="outline" size="sm" onClick={handleAddSection}>
                  <Plus className="h-3.5 w-3.5" />
                  添加段
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sections.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  暂无内存段，点击「添加段」或「加载示例」开始
                </p>
              ) : (
                <div className="space-y-3">
                  {/* Header row */}
                  <div className="hidden lg:grid lg:grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1.2fr_auto] gap-2 text-xs font-medium text-muted-foreground px-1">
                    <span>段名</span>
                    <span>类型 / 区域</span>
                    <span>起始地址</span>
                    <span>大小</span>
                    <span>颜色</span>
                    <span />
                  </div>
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1.2fr_auto] gap-2 items-center rounded-lg border border-border p-2"
                    >
                      <Input
                        value={section.name}
                        onChange={(e) =>
                          handleUpdateSection(section.id, "name", e.target.value)
                        }
                        placeholder="段名"
                        className="font-mono text-sm"
                      />
                      <div className="flex gap-1">
                        <Select
                          value={section.type}
                          onValueChange={(v) => {
                            if (v !== null)
                              handleUpdateSection(section.id, "type", v);
                          }}
                        >
                          <SelectTrigger size="sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(
                              Object.entries(SECTION_TYPE_LABELS) as [
                                SectionType,
                                string,
                              ][]
                            ).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={section.memoryType}
                          onValueChange={(v) => {
                            if (v !== null)
                              handleUpdateSection(section.id, "memoryType", v);
                          }}
                        >
                          <SelectTrigger size="sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flash">Flash</SelectItem>
                            <SelectItem value="ram">RAM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        value={formatAddress(section.startAddress)}
                        onChange={(e) => {
                          const v = parseAddress(e.target.value);
                          if (v !== null)
                            handleUpdateSection(section.id, "startAddress", v);
                        }}
                        placeholder="0x08000000"
                        className="font-mono text-sm"
                      />
                      <Input
                        value={section.size}
                        onChange={(e) => {
                          const v = parseInt(e.target.value);
                          if (!isNaN(v) && v >= 0)
                            handleUpdateSection(section.id, "size", v);
                        }}
                        type="number"
                        min={0}
                        placeholder="大小 (bytes)"
                        className="font-mono text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={section.color}
                          onChange={(e) =>
                            handleUpdateSection(section.id, "color", e.target.value)
                          }
                          className="h-7 w-10 cursor-pointer rounded border border-input bg-transparent"
                        />
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatSize(section.size)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemoveSection(section.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import mode */}
        <TabsContent value="import">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  粘贴 GCC .map 文件内容
                </label>
                <textarea
                  value={mapContent}
                  onChange={(e) => setMapContent(e.target.value)}
                  placeholder={"粘贴 arm-none-eabi-gcc 生成的 .map 文件内容...\n\n示例:\n.text           0x08000000    0x1a3c\n.rodata         0x0801a3c     0x500\n.data           0x20000000    0x200\n.bss            0x20000200    0x3000"}
                  className="w-full min-h-[200px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none resize-y dark:bg-input/30"
                  spellCheck={false}
                />
              </div>
              <Button onClick={handleParseMap} disabled={!mapContent.trim()}>
                <Upload className="h-3.5 w-3.5" />
                解析 .map 文件
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Overlap warnings */}
      {overlaps.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">检测到地址重叠</p>
            <ul className="mt-1 space-y-0.5 text-xs">
              {overlaps.map((o, i) => (
                <li key={i}>
                  {o.sectionA} 与 {o.sectionB} 在{" "}
                  <span className="font-mono">
                    {formatAddress(o.overlapStart)}
                  </span>{" "}
                  -{" "}
                  <span className="font-mono">
                    {formatAddress(o.overlapEnd)}
                  </span>{" "}
                  重叠
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Visualization */}
      {sections.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Flash */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  Flash
                </CardTitle>
                <div className="text-right">
                  <span
                    className={`font-mono text-sm font-medium ${
                      flashStats.usagePercent > 90
                        ? "text-destructive"
                        : flashStats.usagePercent > 70
                          ? "text-yellow-500"
                          : "text-green-500"
                    }`}
                  >
                    {flashStats.usagePercent.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({formatSize(flashStats.usedSize)} / {formatSize(flashStats.totalSize)})
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <MemoryBar
                sections={flashSections}
                regionStart={flashStart}
                totalSize={flashSize}
                stats={flashStats}
              />
            </CardContent>
          </Card>

          {/* RAM */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  RAM
                </CardTitle>
                <div className="text-right">
                  <span
                    className={`font-mono text-sm font-medium ${
                      ramStats.usagePercent > 90
                        ? "text-destructive"
                        : ramStats.usagePercent > 70
                          ? "text-yellow-500"
                          : "text-green-500"
                    }`}
                  >
                    {ramStats.usagePercent.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({formatSize(ramStats.usedSize)} / {formatSize(ramStats.totalSize)})
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <MemoryBar
                sections={ramSections}
                regionStart={ramStart}
                totalSize={ramSize}
                stats={ramStats}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Section summary table */}
      {sections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">段详情</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-2 py-2 font-medium text-muted-foreground">
                      段名
                    </th>
                    <th className="px-2 py-2 font-medium text-muted-foreground">
                      区域
                    </th>
                    <th className="px-2 py-2 font-medium text-muted-foreground">
                      起始地址
                    </th>
                    <th className="px-2 py-2 font-medium text-muted-foreground">
                      结束地址
                    </th>
                    <th className="px-2 py-2 font-medium text-muted-foreground">
                      大小
                    </th>
                    <th className="px-2 py-2 font-medium text-muted-foreground">
                      占比
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sections
                    .sort((a, b) => {
                      if (a.memoryType !== b.memoryType)
                        return a.memoryType === "flash" ? -1 : 1;
                      return a.startAddress - b.startAddress;
                    })
                    .map((section) => {
                      const total =
                        section.memoryType === "flash" ? flashSize : ramSize;
                      const pct =
                        total > 0 ? (section.size / total) * 100 : 0;
                      return (
                        <tr key={section.id} className="border-b last:border-0">
                          <td className="px-2 py-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block h-3 w-3 rounded-sm shrink-0"
                                style={{ backgroundColor: section.color }}
                              />
                              <span className="font-mono">{section.name}</span>
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            <Badge variant="outline" className="text-xs">
                              {section.memoryType.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-2 py-1.5 font-mono">
                            {formatAddress(section.startAddress)}
                          </td>
                          <td className="px-2 py-1.5 font-mono">
                            {formatAddress(
                              section.startAddress + section.size
                            )}
                          </td>
                          <td className="px-2 py-1.5 font-mono">
                            {formatSize(section.size)}
                          </td>
                          <td className="px-2 py-1.5 font-mono">
                            {pct.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
