"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { CopyButton } from "./copy-button";
import {
  escapeHtml,
  highlightCode,
  type HighlightLang,
} from "@/lib/shiki-highlight";
import { LANG_LABEL } from "@/types/leetcode-hot100";
import { cn } from "@/lib/utils";

interface HighlightedCodeProps {
  code: string;
  lang: HighlightLang;
  className?: string;
}

/**
 * Shiki 高亮代码块。
 * - 首屏渲染纯文本 fallback（已 HTML 转义）
 * - shiki 加载完成后替换为高亮 HTML
 * - 加载失败保留 fallback 并在顶部显示黄色 warning banner（"高亮加载失败，代码仍可查看/复制"）
 *
 * 仅在 leetcode-hot100 详情页通过 next/dynamic 引入。
 */
export function HighlightedCode({ code, lang, className }: HighlightedCodeProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // microtask wrap satisfies react-hooks/set-state-in-effect 同时让 fallback
    // 在 shiki 异步完成前能更新到屏幕
    Promise.resolve().then(() => {
      if (cancelled) return;
      setFailed(false);
      setHtml(null);
    });
    highlightCode(code, lang)
      .then((result) => {
        if (!cancelled) setHtml(result);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  return (
    <div
      className={cn(
        "relative rounded-lg border border-border overflow-hidden",
        // shiki 的 <pre> 用 github-dark 背景，外层兜底防加载阶段闪白
        "bg-[#24292e]",
        className
      )}
    >
      {/* 加载失败的黄色 warning banner */}
      {failed && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border-b border-yellow-500/30 text-xs text-yellow-200">
          <AlertTriangle className="size-3.5 shrink-0" />
          <span>语法高亮加载失败，代码仍可查看 / 复制</span>
        </div>
      )}
      {/* 顶部：语言标签 + 复制按钮 */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-black/20">
        <span className="text-xs font-mono text-white/70">
          {LANG_LABEL[lang]}
        </span>
        <CopyButton value={code} size="sm" label="" />
      </div>
      {/* 代码区 */}
      {html && !failed ? (
        <div
          className="shiki-host overflow-x-auto text-[13px] leading-relaxed [&_pre]:!m-0 [&_pre]:p-3 [&_pre]:!bg-transparent"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre
          className="overflow-x-auto m-0 p-3 text-[13px] text-white/90 font-mono leading-relaxed"
          dangerouslySetInnerHTML={{ __html: escapeHtml(code) }}
        />
      )}
    </div>
  );
}
