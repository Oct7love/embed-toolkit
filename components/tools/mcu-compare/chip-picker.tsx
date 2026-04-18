"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ChipEntry } from "@/types/mcu-compare";
import { MAX_COMPARE } from "@/lib/mcu-compare";

interface ChipPickerProps {
  chipIndex: ChipEntry[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

/** 候选芯片选择列表 + 搜索过滤。最多 MAX_COMPARE 款。 */
export function ChipPicker({ chipIndex, selectedIds, onToggle }: ChipPickerProps) {
  const [search, setSearch] = useState("");
  const atMax = selectedIds.length >= MAX_COMPARE;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return chipIndex;
    return chipIndex.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.series.toLowerCase().includes(q) ||
        c.manufacturer.toLowerCase().includes(q)
    );
  }, [chipIndex, search]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">选择芯片</CardTitle>
        <Input
          placeholder="搜索 ID / 名称 / 系列 / 厂商..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-72 overflow-y-auto">
          {filtered.map((c) => {
            const selected = selectedIds.includes(c.id);
            const disabled = !selected && atMax;
            return (
              <button
                key={c.id}
                type="button"
                disabled={disabled}
                title={disabled ? `最多对比 ${MAX_COMPARE} 款` : undefined}
                onClick={() => onToggle(c.id)}
                className={cn(
                  "rounded-md border px-3 py-2 text-left text-xs transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  selected && "border-primary bg-primary/10 text-primary",
                  disabled &&
                    "opacity-40 cursor-not-allowed hover:bg-transparent"
                )}
              >
                <div className="font-medium font-mono">{c.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {c.manufacturer} · {c.cpu ?? "—"} · {c.maxFreq ?? "—"} MHz
                </div>
              </button>
            );
          })}
        </div>
        {atMax && (
          <div className="mt-2 text-xs text-muted-foreground">
            已达上限 — 取消已选项才能添加新的（最多 {MAX_COMPARE} 款）。
          </div>
        )}
      </CardContent>
    </Card>
  );
}
