"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, X } from "lucide-react";
import {
  buildRadarPayloads,
  diffChips,
  MAX_COMPARE,
  parseUrlIds,
  pickChipsByIds,
  serializeIds,
} from "@/lib/mcu-compare";
import type { ChipEntry } from "@/types/mcu-compare";
import { ChipPicker } from "./chip-picker";
import { DiffTable } from "./diff-table";

const SpecRadar = dynamic(
  () => import("./spec-radar").then((m) => m.SpecRadar),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
        加载图表中...
      </div>
    ),
  }
);

export function McuCompare() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [chipIndex, setChipIndex] = useState<ChipEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/chips/index.json")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data?.chips)) {
          setError("加载芯片列表失败：数据格式错误");
        } else {
          setChipIndex(data.chips as ChipEntry[]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("加载芯片列表失败：网络错误");
        setLoading(false);
      });
  }, []);

  // URL `?ids=` → ids（截断到 MAX_COMPARE，去重）
  const selectedIds = useMemo(
    () => parseUrlIds(searchParams.get("ids")),
    [searchParams]
  );

  const selectedChips = useMemo(
    () => pickChipsByIds(chipIndex, selectedIds),
    [chipIndex, selectedIds]
  );

  const setSelectedIds = useCallback(
    (ids: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (ids.length === 0) params.delete("ids");
      else params.set("ids", serializeIds(ids));
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const toggleChip = useCallback(
    (id: string) => {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter((x) => x !== id));
        return;
      }
      if (selectedIds.length >= MAX_COMPARE) return;
      setSelectedIds([...selectedIds, id]);
    },
    [selectedIds, setSelectedIds]
  );

  const clearAll = useCallback(() => setSelectedIds([]), [setSelectedIds]);

  const radarPayloads = useMemo(
    () => buildRadarPayloads(selectedChips),
    [selectedChips]
  );
  const diffs = useMemo(() => diffChips(selectedChips), [selectedChips]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">加载芯片列表中...</div>;
  }
  if (error) {
    return <div className="text-sm text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            已选 {selectedIds.length} / {MAX_COMPARE} 款
          </CardTitle>
          {selectedIds.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              清空
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 pt-0">
          {selectedChips.length === 0 && (
            <span className="text-xs text-muted-foreground">
              从下方列表点选芯片，最多 {MAX_COMPARE} 款。URL 会自动同步分享链接。
            </span>
          )}
          {selectedChips.map((c) => (
            <Badge
              key={c.id}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/70"
              onClick={() => toggleChip(c.id)}
            >
              {c.name}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </CardContent>
      </Card>

      <ChipPicker
        chipIndex={chipIndex}
        selectedIds={selectedIds}
        onToggle={toggleChip}
      />

      {selectedChips.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">规格雷达图（4 轴归一化）</CardTitle>
              <p className="text-xs text-muted-foreground">
                每轴 0-100 归一化（参考最大 = 当前选中芯片中的实际最大）。
                Performance ≈ MHz × DMIPS/MHz 系数（M0+ 0.93 / M3 1.25 / M4 1.25 / M7 2.14 / LX6 2.5 / LX7 2.6 / RISC-V 1.6）。
                缺值字段不参与该轴渲染。
              </p>
            </CardHeader>
            <CardContent>
              <SpecRadar payloads={radarPayloads} />
            </CardContent>
          </Card>

          <DiffTable chips={selectedChips} diffs={diffs} />
        </>
      )}
    </div>
  );
}
