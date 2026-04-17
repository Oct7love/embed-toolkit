"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/shared/code-block";
import {
  ALL_APIS,
  filterByCategory,
  getApisByLibrary,
  getCategoriesByLibrary,
  searchByQuery,
} from "@/lib/api-cheatsheet";
import type { ApiEntry, Library } from "@/types/api-cheatsheet";
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CornerDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LIBRARIES: Library[] = ["FreeRTOS", "STM32 HAL"];

export function ApiCheatsheet() {
  const [library, setLibrary] = useState<Library>("FreeRTOS");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const categories = useMemo(
    () => getCategoriesByLibrary(library),
    [library]
  );

  const libraryEntries = useMemo(
    () => getApisByLibrary(library),
    [library]
  );

  const visibleEntries = useMemo(() => {
    const afterCategory = filterByCategory(libraryEntries, selectedCategories);
    return searchByQuery(afterCategory, query);
  }, [libraryEntries, selectedCategories, query]);

  const handleLibraryChange = (next: Library) => {
    setLibrary(next);
    setSelectedCategories([]);
    setExpanded(new Set());
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const clearCategories = () => setSelectedCategories([]);

  const entryKey = (e: ApiEntry) => `${e.library}::${e.name}`;

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                FreeRTOS / STM32 HAL API 速查卡
              </CardTitle>
              <CardDescription>
                按类别筛选、按名字或描述搜索，展开任意 API 查看签名、参数、示例与常见坑
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {visibleEntries.length} / {libraryEntries.length}
              </Badge>
              <Badge variant="secondary">共 {ALL_APIS.length} 条</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Library tabs */}
      <Tabs
        value={library}
        onValueChange={(v) => {
          if (v) handleLibraryChange(v as Library);
        }}
      >
        <TabsList>
          {LIBRARIES.map((lib) => (
            <TabsTrigger key={lib} value={lib}>
              {lib}
            </TabsTrigger>
          ))}
        </TabsList>

        {LIBRARIES.map((lib) => (
          <TabsContent key={lib} value={lib} className="space-y-4 pt-2">
            {/* Search */}
            <Card size="sm">
              <CardContent className="pt-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="搜索：函数名、参数名、说明、坑点..."
                    className="pl-8 font-mono"
                    spellCheck={false}
                    autoComplete="off"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Category chips */}
            <Card size="sm">
              <CardContent className="pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground mr-1">
                    类别：
                  </span>
                  <Button
                    type="button"
                    variant={
                      selectedCategories.length === 0 ? "default" : "outline"
                    }
                    size="sm"
                    onClick={clearCategories}
                    className="h-7 px-2.5 text-xs"
                  >
                    全部
                  </Button>
                  {categories.map((cat) => {
                    const active = selectedCategories.includes(cat);
                    return (
                      <Button
                        key={cat}
                        type="button"
                        variant={active ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCategory(cat)}
                        className="h-7 px-2.5 text-xs"
                      >
                        {cat}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Entry list */}
            <Card>
              <CardContent className="p-0">
                {visibleEntries.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    未找到匹配的 API
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {visibleEntries.map((entry) => {
                      const key = entryKey(entry);
                      const isOpen = expanded.has(key);
                      return (
                        <li key={key}>
                          <button
                            type="button"
                            onClick={() => toggleExpand(key)}
                            className={cn(
                              "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                              isOpen && "bg-muted/30"
                            )}
                            aria-expanded={isOpen}
                          >
                            {isOpen ? (
                              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <Badge variant="outline" className="shrink-0">
                              {entry.category}
                            </Badge>
                            <code className="font-mono text-sm font-medium truncate">
                              {entry.name}
                            </code>
                          </button>

                          {isOpen && <EntryDetail entry={entry} />}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function EntryDetail({ entry }: { entry: ApiEntry }) {
  return (
    <div className="space-y-4 px-4 pb-4 pt-1">
      {/* Signature */}
      <div>
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          签名
        </div>
        <pre className="rounded-md border border-border bg-muted/50 p-3 text-xs overflow-x-auto">
          <code className="font-mono whitespace-pre-wrap break-words">
            {entry.signature}
          </code>
        </pre>
      </div>

      {/* Params */}
      {entry.params.length > 0 && (
        <div>
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            参数
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">
                    名称
                  </th>
                  <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">
                    类型
                  </th>
                  <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">
                    说明
                  </th>
                </tr>
              </thead>
              <tbody>
                {entry.params.map((p) => (
                  <tr key={p.name} className="border-b last:border-0">
                    <td className="px-2 py-1.5 align-top">
                      <code className="font-mono text-xs">{p.name}</code>
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <code className="font-mono text-xs text-muted-foreground">
                        {p.type}
                      </code>
                    </td>
                    <td className="px-2 py-1.5 align-top text-xs">{p.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Returns */}
      <div>
        <div className="mb-1 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <CornerDownRight className="h-3.5 w-3.5" />
          返回值
        </div>
        <p className="text-sm">{entry.returns}</p>
      </div>

      {/* Usage */}
      <div>
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          典型用法
        </div>
        <CodeBlock code={entry.usage} language="c" />
      </div>

      {/* Pitfalls */}
      {entry.pitfalls.length > 0 && (
        <div>
          <div className="mb-1 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" />
            常见坑
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {entry.pitfalls.map((pf, i) => (
              <li key={i}>{pf}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
