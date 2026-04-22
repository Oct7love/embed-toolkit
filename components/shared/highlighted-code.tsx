"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "./copy-button";
import {
  escapeHtml,
  highlightCode,
  type HighlightLang,
} from "@/lib/shiki-highlight";
import { cn } from "@/lib/utils";

const LANG_LABEL: Record<HighlightLang, string> = {
  cpp: "C++",
  python: "Python",
};

interface HighlightedCodeProps {
  code: string;
  lang: HighlightLang;
  className?: string;
}

/**
 * Shiki 高亮代码块。首屏渲染纯文本 fallback（已 HTML 转义），
 * 高亮异步加载完成后替换。仅在 leetcode-hot100 详情页通过 next/dynamic 引入。
 */
export function HighlightedCode({ code, lang, className }: HighlightedCodeProps) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    highlightCode(code, lang)
      .then((result) => {
        if (!cancelled) setHtml(result);
      })
      .catch(() => {
        // 高亮失败保持 fallback 显示，不破坏页面
      });
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  return (
    <div
      className={cn(
        "relative rounded-lg border border-border overflow-hidden",
        // shiki 自带的 <pre> 背景色用 github-dark 主题色，包一层暗色背景兜底
        "bg-[#24292e]",
        className
      )}
    >
      {/* 顶部：语言标签 + 复制按钮 */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-black/20">
        <span className="text-xs font-mono text-white/70">
          {LANG_LABEL[lang]}
        </span>
        <CopyButton value={code} size="sm" label="" />
      </div>
      {/* 代码区 */}
      {html ? (
        <div
          className="shiki-host overflow-x-auto text-[13px] [&_pre]:!m-0 [&_pre]:p-3 [&_pre]:!bg-transparent"
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
