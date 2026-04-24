/* ------------------------------------------------------------------ */
/*  LeetCode Hot 100 刷题辅助工具 — 数据模型                          */
/* ------------------------------------------------------------------ */

export type Difficulty = "easy" | "medium" | "hard";

/** 10 种语言，与 LeetCode 官方提供的语言子集对齐 */
export type Language =
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

/** UI tab 顺序固定（与上面类型 union 顺序一致便于查表） */
export const LANGUAGES: readonly Language[] = [
  "c",
  "cpp",
  "python",
  "java",
  "javascript",
  "typescript",
  "go",
  "rust",
  "kotlin",
  "swift",
] as const;

/** UI 显示用的短标签 */
export const LANG_LABEL: Record<Language, string> = {
  c: "C",
  cpp: "C++",
  python: "Python",
  java: "Java",
  javascript: "JS",
  typescript: "TS",
  go: "Go",
  rust: "Rust",
  kotlin: "Kotlin",
  swift: "Swift",
};

export interface Solution {
  /** 完整可编译的源码 */
  code: string;
  /** 可选的补充说明（例如冷门语言为绕过 ownership 等做的妥协） */
  comment?: string;
}

export interface Problem {
  /** LeetCode 官方题号 */
  id: number;
  /** URL slug，与 leetcode.cn 一致 */
  slug: string;
  titleZh: string;
  titleEn: string;
  difficulty: Difficulty;
  /** 题目标签，如 "数组" / "哈希表" / "DP" */
  tags: string[];
  /**
   * 自改写的题目类型描述（≤ 120 字符），不复制官方题面。
   * 目的是点出"这类题要解决什么"，而不是完整题目。
   */
  description: string;
  /** LeetCode 中文站原题链接，供用户去官方读原题 + 测评 */
  officialUrl: string;
  /** 核心思路（3 段：思路本质 / 实现要点 / 陷阱或优化） */
  approach: string;
  /** 10 语言解法：每种都必须存在且非空，由 vitest shape 测试守护 */
  solutions: Record<Language, Solution>;
  complexity: {
    /** 时间复杂度，如 "O(n)" */
    time: string;
    /** 空间复杂度，如 "O(1)" */
    space: string;
  };
  /** 关键考点，1-2 句话 */
  keyPoints: string;
}

/* ---------- Store state（持久化到 localStorage） ---------- */

export interface LeetcodeHot100State {
  /** 已完成题号集合 */
  completedIds: number[];
  /** 用户偏好的代码语言，切换题目时保留 */
  preferredLang: Language;

  toggleCompleted: (id: number) => void;
  setLang: (lang: Language) => void;
  reset: () => void;
}
