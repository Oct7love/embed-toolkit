"use client";

import { useSearchParams } from "next/navigation";
import { getProblemById } from "@/lib/leetcode-hot100";
import { ProblemList } from "./problem-list";
import { ProblemDetail } from "./problem-detail";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

/**
 * 容器组件：根据 URL 参数 `?id=N` 决定展示列表还是详情。
 * 10 题 MVP 单页切换，不走 nested dynamic route。
 */
export function LeetcodeHot100() {
  const params = useSearchParams();
  const idParam = params.get("id");
  const id = idParam ? Number(idParam) : null;

  if (id !== null && Number.isFinite(id)) {
    const problem = getProblemById(id);
    if (problem) return <ProblemDetail problem={problem} />;
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-3">
          <p className="text-muted-foreground">题目不存在（id={id}）。</p>
          <Link
            href="/tools/learning/leetcode-hot100"
            className={buttonVariants({ variant: "default" })}
          >
            返回题目列表
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <ProblemList />;
}
