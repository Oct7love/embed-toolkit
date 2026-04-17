"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/shared/code-block";
import {
  RotateCcw,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  AlertTriangle,
  GitBranch,
} from "lucide-react";
import {
  DECISION_TREE,
  traverseTree,
  getBreadcrumbs,
} from "@/lib/ipc-selector";
import type {
  DecisionNode,
  QuestionNode,
  RecommendationNode,
} from "@/types/ipc-selector";

export function IpcSelector() {
  const [answers, setAnswers] = useState<string[]>([]);
  const [treeOpen, setTreeOpen] = useState(false);

  const currentNode = useMemo<DecisionNode | null>(
    () => traverseTree(answers),
    [answers]
  );

  const breadcrumbs = useMemo(() => getBreadcrumbs(answers), [answers]);

  const handleSelect = useCallback((value: string) => {
    setAnswers((prev) => [...prev, value]);
  }, []);

  const handleReset = useCallback(() => {
    setAnswers([]);
  }, []);

  const handleBackTo = useCallback((stepIndex: number) => {
    setAnswers((prev) => prev.slice(0, stepIndex));
  }, []);

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          通过几个问题，快速定位最适合的 FreeRTOS 同步 / 通信 API。
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTreeOpen((v) => !v)}
          >
            <GitBranch className="size-3.5" data-icon="inline-start" />
            {treeOpen ? "收起决策树全景" : "查看决策树全景"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={answers.length === 0}
          >
            <RotateCcw className="size-3.5" data-icon="inline-start" />
            重新选择
          </Button>
        </div>
      </div>

      {/* 面包屑 */}
      {breadcrumbs.length > 0 && (
        <Card size="sm">
          <CardContent className="pt-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={handleReset}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                起点
              </button>
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <ChevronRight className="size-3 text-muted-foreground" />
                  <button
                    onClick={() => handleBackTo(i + 1)}
                    className="rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono hover:bg-muted transition-colors"
                    title={crumb.question}
                  >
                    {crumb.choiceLabel}
                  </button>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 当前节点：问题 or 推荐 */}
      {currentNode?.kind === "question" && (
        <QuestionView node={currentNode} onSelect={handleSelect} />
      )}

      {currentNode?.kind === "recommendation" && (
        <RecommendationView node={currentNode} />
      )}

      {/* 决策树全景 */}
      {treeOpen && (
        <Card size="sm">
          <CardHeader>
            <CardTitle>决策树全景</CardTitle>
            <CardDescription>
              展开查看所有问题与推荐方案的层级关系
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TreeOverview node={DECISION_TREE} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ---------- 子组件 ---------- */

function QuestionView({
  node,
  onSelect,
}: {
  node: QuestionNode;
  onSelect: (value: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{node.question}</CardTitle>
        <CardDescription>选择最贴近你的场景，进入下一步</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {node.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className="group flex flex-col items-start gap-1 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-primary/5"
            >
              <div className="flex w-full items-center justify-between">
                <span className="font-medium text-foreground">{opt.label}</span>
                <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              {opt.hint && (
                <span className="text-xs text-muted-foreground">{opt.hint}</span>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecommendationView({ node }: { node: RecommendationNode }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="size-4 text-primary" />
                推荐方案：{node.title}
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                {node.api}
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono">
              FreeRTOS API
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">
              适用场景
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {node.scenario}
            </p>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">
              典型代码
            </div>
            <CodeBlock code={node.codeExample.code} language={node.codeExample.language} />
          </div>

          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
              <AlertTriangle className="size-3.5" />
              使用陷阱
            </div>
            <ul className="space-y-1.5">
              {node.pitfalls.map((p, i) => (
                <li
                  key={i}
                  className="flex gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm"
                >
                  <span className="text-destructive shrink-0">!</span>
                  <span className="text-foreground/90">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">
              替代方案
            </div>
            <div className="space-y-2">
              {node.alternatives.map((alt, i) => (
                <div
                  key={i}
                  className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
                >
                  <code className="text-xs font-mono text-primary">{alt.api}</code>
                  <p className="mt-0.5 text-foreground/80">{alt.difference}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/** 决策树全景递归视图 */
function TreeOverview({ node }: { node: DecisionNode }) {
  if (node.kind === "recommendation") {
    return (
      <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-3.5 text-primary shrink-0" />
          <span className="font-medium">{node.title}</span>
          <span className="text-xs font-mono text-muted-foreground">
            {node.api}
          </span>
        </div>
      </div>
    );
  }

  return (
    <TreeQuestionBranch node={node} />
  );
}

function TreeQuestionBranch({ node }: { node: QuestionNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        {open ? (
          <ChevronDown className="size-3.5" />
        ) : (
          <ChevronRight className="size-3.5" />
        )}
        <span>{node.question}</span>
      </button>

      {open && (
        <ul className="ml-3 space-y-2 border-l border-border pl-4">
          {node.options.map((opt) => (
            <li key={opt.value} className="space-y-1.5">
              <div className="text-xs">
                <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono">
                  {opt.label}
                </span>
                {opt.hint && (
                  <span className="ml-2 text-muted-foreground">{opt.hint}</span>
                )}
              </div>
              <div className="ml-2">
                <TreeOverview node={opt.next} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
