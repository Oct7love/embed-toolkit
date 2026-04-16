"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CodeBlock } from "@/components/shared/code-block";
import { useGpioPlannerStore } from "@/stores/gpio-planner-store";
import { detectConflicts, isPinInConflict } from "@/lib/gpio-planner/conflict-detector";
import { generateCode } from "@/lib/gpio-planner/code-generator";
import { PinRow } from "./pin-row";
import type { ChipDefinition, ChipIndexEntry } from "@/types/gpio-planner";
import {
  Search,
  Trash2,
  Download,
  AlertTriangle,
  Cpu,
  Upload,
} from "lucide-react";

// 系列到 JSON 文件的映射
const SERIES_FILE: Record<string, string> = {
  stm32f1: "stm32f1",
  stm32f4: "stm32f4",
  stm32h7: "stm32h7",
  stm32g0: "stm32g0-g4",
  stm32g4: "stm32g0-g4",
  stm32l4: "stm32l4",
  esp32: "esp32",
  gd32: "domestic",
  ch32: "domestic",
  at32: "domestic",
};

const MANUFACTURERS = ["全部", "ST", "Espressif", "GigaDevice", "WCH", "Artery"];
const PIN_RANGES = [
  { label: "全部", min: 0, max: 999 },
  { label: "<32", min: 0, max: 31 },
  { label: "32-48", min: 32, max: 48 },
  { label: "48-64", min: 49, max: 64 },
  { label: "64-100", min: 65, max: 100 },
  { label: "100-144", min: 101, max: 144 },
  { label: "144+", min: 145, max: 999 },
];

export function GpioPlanner() {
  const { chipId, assignments, setChipId, assignPin, clearPin, clearAll } =
    useGpioPlannerStore();

  const [showCode, setShowCode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMfr, setFilterMfr] = useState("全部");
  const [filterPins, setFilterPins] = useState("全部");

  // 芯片索引（从 public/chips/index.json 加载）
  const [chipIndex, setChipIndex] = useState<ChipIndexEntry[]>([]);
  const [indexLoading, setIndexLoading] = useState(true);

  // 当前选中芯片的完整数据（懒加载）
  const [chipData, setChipData] = useState<ChipDefinition | null>(null);
  const [chipLoading, setChipLoading] = useState(false);

  // 自定义导入
  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState("");

  // 加载芯片索引
  useEffect(() => {
    fetch("/chips/index.json")
      .then((r) => r.json())
      .then((data) => {
        setChipIndex(data.chips ?? []);
        setIndexLoading(false);
      })
      .catch(() => setIndexLoading(false));
  }, []);

  // 选中芯片后懒加载完整引脚数据
  useEffect(() => {
    if (!chipId) {
      setChipData(null);
      return;
    }
    const entry = chipIndex.find((c) => c.id === chipId);
    if (!entry) return;

    const file = SERIES_FILE[entry.series];
    if (!file) return;

    setChipLoading(true);
    fetch(`/chips/${file}.json`)
      .then((r) => r.json())
      .then((data) => {
        const found = (data.chips as ChipDefinition[])?.find(
          (c) => c.id === chipId
        );
        setChipData(found ?? null);
        setChipLoading(false);
      })
      .catch(() => {
        setChipData(null);
        setChipLoading(false);
      });
  }, [chipId, chipIndex]);

  // 搜索与筛选
  const filteredChips = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const pinRange = PIN_RANGES.find((r) => r.label === filterPins) ?? PIN_RANGES[0];
    return chipIndex.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q) && !c.id.includes(q)) return false;
      if (filterMfr !== "全部" && c.manufacturer !== filterMfr) return false;
      if (c.pinCount < pinRange.min || c.pinCount > pinRange.max) return false;
      return true;
    });
  }, [chipIndex, searchQuery, filterMfr, filterPins]);

  const chip = chipData;
  const conflicts = useMemo(() => {
    if (!chip) return [];
    return detectConflicts(chip, assignments);
  }, [chip, assignments]);

  const code = useMemo(() => {
    if (!chip) return "";
    return generateCode(chip, assignments);
  }, [chip, assignments]);

  const assignedCount = Object.keys(assignments).length;

  const handleChipSelect = useCallback(
    (id: string) => {
      setChipId(id);
      setShowCode(false);
    },
    [setChipId]
  );

  const handleImport = useCallback(() => {
    try {
      const parsed = JSON.parse(importJson);
      if (!parsed.id || !parsed.name || !Array.isArray(parsed.pins)) {
        setImportError("JSON 需要包含 id、name、pins 字段");
        return;
      }
      setChipData(parsed as ChipDefinition);
      setChipId(parsed.id);
      setImportError("");
      setShowImport(false);
      setImportJson("");
    } catch {
      setImportError("JSON 解析失败");
    }
  }, [importJson, setChipId]);

  const selectedEntry = chipIndex.find((c) => c.id === chipId);

  return (
    <div className="space-y-4">
      {/* 芯片选择器 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base">芯片选择</CardTitle>
              <CardDescription>
                {indexLoading
                  ? "加载芯片库..."
                  : `${chipIndex.length} 款芯片可选`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImport(!showImport)}
              >
                <Upload className="h-3.5 w-3.5 mr-1" />
                导入自定义芯片
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 搜索栏 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索芯片型号（如 F407、ESP32、C8T6）..."
              className="pl-9 font-mono"
            />
          </div>

          {/* 筛选器 */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={filterMfr}
              onValueChange={(v) => v && setFilterMfr(v)}
            >
              <SelectTrigger className="w-[130px]" size="sm">
                <SelectValue placeholder="厂商" />
              </SelectTrigger>
              <SelectContent>
                {MANUFACTURERS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterPins}
              onValueChange={(v) => v && setFilterPins(v)}
            >
              <SelectTrigger className="w-[120px]" size="sm">
                <SelectValue placeholder="引脚数" />
              </SelectTrigger>
              <SelectContent>
                {PIN_RANGES.map((r) => (
                  <SelectItem key={r.label} value={r.label}>
                    {r.label === "全部" ? "引脚数" : r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-xs text-muted-foreground ml-auto">
              匹配 {filteredChips.length} 款
            </span>
          </div>

          {/* 芯片卡片列表 */}
          <ScrollArea className="max-h-[240px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredChips.slice(0, 30).map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleChipSelect(c.id)}
                  className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-left transition-colors text-sm ${
                    chipId === c.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Cpu className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-mono font-medium truncate">
                      {c.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.manufacturer} · {c.package} · {c.pinCount}pin
                    </div>
                  </div>
                </button>
              ))}
              {filteredChips.length > 30 && (
                <div className="col-span-full text-xs text-muted-foreground text-center py-2">
                  还有 {filteredChips.length - 30} 款，请缩小搜索范围
                </div>
              )}
            </div>
          </ScrollArea>

          {/* 自定义导入 */}
          {showImport && (
            <div className="space-y-2 rounded-lg border p-3">
              <p className="text-sm font-medium">导入自定义芯片 JSON</p>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder={'{"id":"my-chip","name":"MY_CHIP","package":"LQFP48","pins":[{"number":1,"name":"PA0","defaultFunction":"GPIO","alternateFunctions":["GPIO","UART_TX"]}]}'}
                className="w-full min-h-[80px] rounded-md border px-3 py-2 text-xs font-mono"
              />
              {importError && (
                <p className="text-xs text-destructive">{importError}</p>
              )}
              <Button size="sm" onClick={handleImport}>
                导入
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 加载中 / 未选中 */}
      {chipLoading && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            加载引脚数据...
          </CardContent>
        </Card>
      )}

      {!chipLoading && !chip && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {chipId ? "未找到芯片数据" : "请从上方选择一款芯片"}
          </CardContent>
        </Card>
      )}

      {/* 选中后的引脚表 */}
      {chip && !chipLoading && (
        <>
          {/* 芯片信息摘要 */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex gap-4 flex-wrap text-sm items-center">
                <span className="font-mono font-medium">{chip.name}</span>
                <Badge variant="secondary">{selectedEntry?.package ?? chip.package}</Badge>
                <span className="text-muted-foreground">{chip.pins.length} 引脚</span>
                <span className="text-muted-foreground">已分配 {assignedCount}</span>
                {conflicts.length > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {conflicts.length} 冲突
                  </Badge>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                    disabled={assignedCount === 0}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    清空
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCode(!showCode)}
                    disabled={assignedCount === 0}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    {showCode ? "隐藏代码" : "导出代码"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 冲突警告 */}
          {conflicts.length > 0 && (
            <Card className="border-destructive">
              <CardContent className="pt-4 space-y-1">
                {conflicts.map((conflict) => (
                  <div
                    key={conflict.functionName}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Badge variant="destructive" className="font-mono text-xs">
                      {conflict.functionName}
                    </Badge>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-mono text-xs">
                      {conflict.pinNumbers
                        .map((pn) => chip.pins.find((p) => p.number === pn)?.name ?? `#${pn}`)
                        .join(", ")}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 引脚表 */}
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <div className="min-w-[640px]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-3 py-2 text-center font-medium text-muted-foreground w-16">Pin</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground w-28">Name</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground w-32">Default</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Function</th>
                        <th className="px-3 py-2 text-center font-medium text-muted-foreground w-24">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chip.pins.map((pin) => (
                        <PinRow
                          key={pin.number}
                          pin={pin}
                          assignedFunction={assignments[pin.number]}
                          isConflict={isPinInConflict(pin.number, conflicts)}
                          onAssign={(pn, func) => assignPin(pn, func)}
                          onClear={(pn) => clearPin(pn)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* 代码导出 */}
          {showCode && assignedCount > 0 && (
            <Card>
              <CardContent className="pt-4">
                <CodeBlock code={code} language="c" />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
