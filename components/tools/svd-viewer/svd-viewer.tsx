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
import {
  PeripheralTree,
  type SelectedRef,
} from "./peripheral-tree";
import { RegisterDetail } from "./register-detail";
import {
  parseSvd,
  filterFields,
  toBitGridFields,
  readFileAsText,
  SvdParseError,
} from "@/lib/svd-viewer";
import { EXAMPLE_SVD } from "@/lib/svd-viewer/example";
import type { SvdParsed, SvdRegister } from "@/types/svd-viewer";
import { Search, FileSearch, Eye, Brackets } from "lucide-react";

export function SvdViewer() {
  const [parsed, setParsed] = useState<SvdParsed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pasted, setPasted] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SelectedRef | null>(null);

  const handleParse = useCallback((xml: string) => {
    try {
      const result = parseSvd(xml);
      setParsed(result);
      setError(null);
      // 自动选第一个 peripheral 的第一个 register（标准 10）
      const firstP = result.peripherals[0];
      const firstR = firstP?.registers[0];
      if (firstP && firstR) {
        setSelected({
          peripheralName: firstP.name,
          registerName: firstR.name,
        });
      } else {
        setSelected(null);
      }
    } catch (e) {
      setParsed(null);
      setSelected(null);
      setError(
        e instanceof SvdParseError
          ? e.message
          : `解析失败: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }, []);

  const handleFile = useCallback(
    async (file: File | undefined | null) => {
      if (!file) return;
      try {
        const text = await readFileAsText(file);
        setPasted(text);
        handleParse(text);
      } catch (e) {
        setError(
          e instanceof SvdParseError
            ? e.message
            : `读取失败: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    },
    [handleParse]
  );

  const loadExample = useCallback(() => {
    setPasted(EXAMPLE_SVD);
    handleParse(EXAMPLE_SVD);
  }, [handleParse]);

  // 搜索匹配集合
  const highlighted = useMemo(() => {
    if (!parsed || query.trim() === "") return new Set<string>();
    const matches = filterFields(query, parsed);
    const set = new Set<string>();
    for (const m of matches) {
      set.add(`${m.peripheralName}/${m.registerName}`);
    }
    return set;
  }, [parsed, query]);

  // 当前选中 register
  const selectedRegister: SvdRegister | null = useMemo(() => {
    if (!parsed || !selected) return null;
    const p = parsed.peripherals.find((p) => p.name === selected.peripheralName);
    return p?.registers.find((r) => r.name === selected.registerName) ?? null;
  }, [parsed, selected]);

  const bitGridFields = useMemo(
    () => (selectedRegister ? toBitGridFields(selectedRegister.fields) : undefined),
    [selectedRegister]
  );

  return (
    <div className="space-y-6">
      {/* 输入区 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            导入 SVD
          </CardTitle>
          <CardDescription>
            上传 .svd / .xml 文件，或直接粘贴内容。文件大小上限 10MB。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex">
              <input
                type="file"
                accept=".svd,.xml,text/xml,application/xml"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer file:hover:opacity-90"
              />
            </label>
            <Button variant="outline" size="sm" onClick={loadExample}>
              <Brackets className="h-4 w-4 mr-1" />
              加载内置示例 (STM32F103 mini)
            </Button>
            {parsed && (
              <span className="text-xs text-muted-foreground ml-auto">
                已解析: <span className="font-mono">{parsed.device.name}</span> ·{" "}
                {parsed.peripherals.length} 个 peripheral
              </span>
            )}
          </div>
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            onBlur={() => {
              if (pasted.trim()) handleParse(pasted);
            }}
            placeholder="或在此粘贴 SVD XML 内容（失焦或上传后自动解析）..."
            className="w-full h-24 px-3 py-2 text-xs font-mono border rounded-md bg-background resize-y focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            spellCheck={false}
          />
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 搜索 + 双栏 */}
      {parsed && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-base">寄存器浏览</CardTitle>
              <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜索 register / field 名称..."
                  className="h-8 text-sm"
                  spellCheck={false}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
              {/* 左侧树 */}
              <div className="border rounded-md p-2 max-h-[600px] overflow-auto">
                <PeripheralTree
                  parsed={parsed}
                  selected={selected}
                  onSelect={setSelected}
                  query={query}
                  highlighted={highlighted}
                />
              </div>
              {/* 右侧详情 */}
              <div className="space-y-3">
                {selectedRegister ? (
                  <RegisterDetail
                    peripheralName={selected!.peripheralName}
                    register={selectedRegister}
                    bitGridFields={bitGridFields}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm gap-2">
                    <Eye className="h-6 w-6 opacity-40" />
                    <p>选择左侧的 register 查看位域</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

