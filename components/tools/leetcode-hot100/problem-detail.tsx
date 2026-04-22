"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/shared/code-block";
import { useLeetcodeHot100Store } from "@/stores/leetcode-hot100-store";
import type { Language, Problem } from "@/types/leetcode-hot100";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ExternalLink,
  Clock,
  HardDrive,
} from "lucide-react";

const DIFFICULTY_LABEL: Record<Problem["difficulty"], string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};
const DIFFICULTY_COLOR: Record<Problem["difficulty"], string> = {
  easy: "bg-green-500/10 text-green-600 border-green-500/30",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  hard: "bg-red-500/10 text-red-600 border-red-500/30",
};
const LANGUAGES: { value: Language; label: string }[] = [
  { value: "cpp", label: "C++" },
  { value: "python", label: "Python" },
];

export function ProblemDetail({ problem }: { problem: Problem }) {
  const { completedIds, toggleCompleted, preferredLang, setLang } =
    useLeetcodeHot100Store();
  const completed = completedIds.includes(problem.id);

  return (
    <div className="space-y-4">
      {/* 顶部：返回 + 标题 + 完成 */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <Link
          href="/tools/learning/leetcode-hot100"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回题目列表
        </Link>
        <Button
          variant={completed ? "default" : "outline"}
          size="sm"
          onClick={() => toggleCompleted(problem.id)}
        >
          {completed ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              已完成
            </>
          ) : (
            <>
              <Circle className="h-4 w-4 mr-1" />
              标记为已完成
            </>
          )}
        </Button>
      </div>

      {/* 题目信息卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3 flex-wrap">
            <span className="font-mono text-muted-foreground text-sm">
              #{problem.id}
            </span>
            <CardTitle className="text-lg">
              {problem.titleZh}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {problem.titleEn}
              </span>
            </CardTitle>
            <Badge
              variant="outline"
              className={DIFFICULTY_COLOR[problem.difficulty]}
            >
              {DIFFICULTY_LABEL[problem.difficulty]}
            </Badge>
            <a
              href={problem.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary hover:underline ml-auto"
            >
              去 LeetCode 刷
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {problem.tags.map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">
                {t}
              </Badge>
            ))}
          </div>
          <CardDescription className="mt-3 text-sm leading-relaxed text-foreground">
            {problem.description}
            <span className="block text-xs text-muted-foreground mt-1">
              ↑ 仅为题目类型描述，完整题面请点右上角去 LeetCode 原题查看。
            </span>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 核心思路 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">核心思路</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {problem.approach}
          </div>
        </CardContent>
      </Card>

      {/* 代码 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base">参考代码</CardTitle>
            <div className="flex gap-1 rounded-lg border p-1">
              {LANGUAGES.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLang(l.value)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    preferredLang === l.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={problem.solutions[preferredLang].code}
            language={preferredLang === "cpp" ? "cpp" : "python"}
          />
          {problem.solutions[preferredLang].comment && (
            <p className="mt-2 text-xs text-muted-foreground italic">
              {problem.solutions[preferredLang].comment}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 复杂度 + 关键考点 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">复杂度</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              时间：
              <code className="font-mono bg-muted px-1.5 rounded">
                {problem.complexity.time}
              </code>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              空间：
              <code className="font-mono bg-muted px-1.5 rounded">
                {problem.complexity.space}
              </code>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">关键考点</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            {problem.keyPoints}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
