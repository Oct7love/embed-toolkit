"use client";

import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({
  code,
  language = "c",
  className,
}: CodeBlockProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg border border-border bg-muted/50",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground uppercase">
          {language}
        </span>
        <CopyButton value={code} />
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}
