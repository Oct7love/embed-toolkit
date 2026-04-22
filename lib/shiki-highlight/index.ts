/**
 * Shiki 语法高亮 — 仅支持 cpp + python 两种语言、单一 github-dark 主题。
 *
 * 设计目标：
 * - 体积最小化：只预加载 cpp / python 两种 grammar
 * - 可在 node 测试环境同步调用（vitest）
 * - 浏览器侧由 HighlightedCode 组件 dynamic import，不进其他 34 个工具的 chunk
 */

import { createHighlighter, type Highlighter } from "shiki";

export type HighlightLang = "cpp" | "python";

const THEME = "github-dark";

/** 单例 highlighter，避免每次调用都重建 oniguruma 引擎 */
let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [THEME],
      langs: ["cpp", "python"],
    });
  }
  return highlighterPromise;
}

/**
 * 把代码高亮为 HTML 字符串（含 <pre> 包裹）。
 * 调用方负责通过 dangerouslySetInnerHTML 渲染。
 */
export async function highlightCode(
  code: string,
  lang: HighlightLang
): Promise<string> {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, { lang, theme: THEME });
}

/** 纯文本 fallback：在 shiki 加载完成前显示已转义的代码 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
