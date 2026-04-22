"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  filterByDifficulty,
  getProgressPercent,
} from "@/lib/leetcode-hot100";
import type { Difficulty, Problem } from "@/types/leetcode-hot100";
import { useLeetcodeHot100Store } from "@/stores/leetcode-hot100-store";
import { CheckCircle2, Circle, ExternalLink } from "lucide-react";

const DIFFICULTIES: (Difficulty | "all")[] = ["all", "easy", "medium", "hard"];
const DIFFICULTY_LABEL: Record<Difficulty | "all", string> = {
  all: "全部",
  easy: "简单",
  medium: "中等",
  hard: "困难",
};
const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: "bg-green-500/10 text-green-600 border-green-500/30",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  hard: "bg-red-500/10 text-red-600 border-red-500/30",
};

export function ProblemList() {
  const { completedIds, toggleCompleted, reset } = useLeetcodeHot100Store();
  const [filter, setFilter] = useState<Difficulty | "all">("all");

  const problems = useMemo(() => filterByDifficulty(filter), [filter]);
  const progress = useMemo(
    () => getProgressPercent(completedIds),
    [completedIds]
  );

  return (
    <div className="space-y-4">
      {/* 进度 + 筛选 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">
              本轮进度：{progress.done} / {progress.total}
              <span className="ml-2 text-muted-foreground font-normal">
                ({progress.percent}%)
              </span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("清空所有已完成记录？此操作不可撤销。")) reset();
              }}
              disabled={completedIds.length === 0}
            >
              清空进度
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 rounded-lg border p-1 w-fit">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === d
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {DIFFICULTY_LABEL[d]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 表格 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-3 py-2 font-medium w-16">完成</th>
                  <th className="px-3 py-2 font-medium w-16">#</th>
                  <th className="px-3 py-2 font-medium">题目</th>
                  <th className="px-3 py-2 font-medium w-20">难度</th>
                  <th className="px-3 py-2 font-medium">标签</th>
                  <th className="px-3 py-2 font-medium w-16 text-center">
                    原题
                  </th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p) => (
                  <ProblemRow
                    key={p.id}
                    problem={p}
                    completed={completedIds.includes(p.id)}
                    onToggle={() => toggleCompleted(p.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProblemRow({
  problem: p,
  completed,
  onToggle,
}: {
  problem: Problem;
  completed: boolean;
  onToggle: () => void;
}) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/30">
      <td className="px-3 py-2">
        <button
          onClick={onToggle}
          aria-label={completed ? "标记为未完成" : "标记为已完成"}
          aria-pressed={completed}
          className="flex items-center justify-center"
        >
          {completed ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </td>
      <td className="px-3 py-2 font-mono text-muted-foreground">{p.id}</td>
      <td className="px-3 py-2">
        <Link
          href={`/tools/learning/leetcode-hot100?id=${p.id}`}
          className="font-medium hover:text-primary hover:underline"
        >
          {p.titleZh}
        </Link>
        <span className="block text-xs text-muted-foreground">
          {p.titleEn}
        </span>
      </td>
      <td className="px-3 py-2">
        <Badge variant="outline" className={DIFFICULTY_COLOR[p.difficulty]}>
          {DIFFICULTY_LABEL[p.difficulty]}
        </Badge>
      </td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap gap-1">
          {p.tags.map((t) => (
            <Badge key={t} variant="secondary" className="text-xs">
              {t}
            </Badge>
          ))}
        </div>
      </td>
      <td className="px-3 py-2 text-center">
        <a
          href={p.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-muted-foreground hover:text-primary"
          aria-label="去 LeetCode 原题"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </td>
    </tr>
  );
}
