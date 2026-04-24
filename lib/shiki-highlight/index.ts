/**
 * Shiki 语法高亮 — 支持 10 种语言，单一 github-dark 主题。
 *
 * 设计：
 * - highlighter 启动时不预加载任何 grammar（只准备 oniguruma + theme）
 * - 每个 lang 首次使用时按需 loadLanguage，结果用 Map<lang, true> 缓存
 *   避免重复加载（同一 session 内）
 * - 加载失败让 highlightCode 抛出，HighlightedCode 组件捕获后显示
 *   "高亮加载失败"黄色 banner + 纯文本 fallback
 * - 仅 leetcode-hot100 详情页 dynamic import，其他工具页零依赖
 */

import { createHighlighter, type Highlighter } from "shiki";

export type HighlightLang =
  | "c"
  | "cpp"
  | "python"
  | "java"
  | "javascript"
  | "typescript"
  | "go"
  | "rust"
  | "kotlin"
  | "swift";

const THEME = "github-dark";

let highlighterPromise: Promise<Highlighter> | null = null;
const loadedLangs = new Map<HighlightLang, true>();

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [THEME],
      langs: [], // lazy-load per-language on first use
    });
  }
  return highlighterPromise;
}

/**
 * 把代码高亮为 HTML 字符串（含 <pre> 包裹）。
 * - 首次访问某 lang 会异步 loadLanguage（~50KB grammar）
 * - 抛出时由 HighlightedCode 捕获并显示降级 banner
 */
export async function highlightCode(
  code: string,
  lang: HighlightLang
): Promise<string> {
  const highlighter = await getHighlighter();
  if (!loadedLangs.has(lang)) {
    await highlighter.loadLanguage(lang);
    loadedLangs.set(lang, true);
  }
  return highlighter.codeToHtml(code, { lang, theme: THEME });
}

/** 纯文本 fallback：在 shiki 加载完成前/失败时显示已转义的代码 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
