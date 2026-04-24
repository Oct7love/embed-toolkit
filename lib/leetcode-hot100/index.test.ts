import { describe, it, expect } from "vitest";
import {
  PROBLEMS,
  filterByDifficulty,
  filterByTag,
  getProblemById,
  getProblemBySlug,
  getAllTags,
  getProgressPercent,
  DESCRIPTION_MAX_LEN,
  BLACKLIST_PATTERNS,
} from "./index";
import { LANGUAGES, type Language } from "@/types/leetcode-hot100";

/**
 * Per-language entry-point shape regex.
 * 每个语言的实现必须含有该 regex 描述的"标志性结构"，
 * 防止某语言的代码被遗漏 / 写错入口签名。
 */
const LANG_SHAPE: Record<Language, RegExp> = {
  c: /\b\w+\s*\([^)]*\)\s*\{/, // C 函数定义形式 `type name(...) {`
  // 设计题（如 #146 LRUCache、未来 #155 MinStack 等）的类名不是 Solution，
  // 放宽到任意类名以避免在用户复制的代码里塞占位 `class Solution {}`
  cpp: /class\s+\w+/,
  python: /class\s+\w+\s*[(:]/,
  java: /class\s+\w+/,
  // LeetCode JS 经典：`var twoSum = function(...)` 或现代 `function/class name`
  javascript: /(var\s+\w+\s*=\s*function|function\s+\w+\s*\(|class\s+\w+)/,
  typescript: /(function\s+\w+\s*\(|class\s+\w+)/,
  go: /^func\s+\w+/m,
  // Rust：impl <类型名>，类名不限于 Solution（如 LRUCache）
  rust: /impl\s+\w+\b/,
  kotlin: /class\s+\w+\b/,
  swift: /class\s+\w+\b/,
};

/* ---------- 1. 数据完整性 ---------- */

describe("PROBLEMS data integrity (v1.5.2 第 3 批扩展 = 40 道题)", () => {
  it("exactly 40 problems after batch 3 expansion", () => {
    expect(PROBLEMS.length).toBe(40);
  });

  it("every id is unique", () => {
    const ids = PROBLEMS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every slug is unique and kebab-case", () => {
    const slugs = PROBLEMS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) {
      expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("every problem has solutions for ALL 10 languages, non-empty", () => {
    for (const p of PROBLEMS) {
      for (const lang of LANGUAGES) {
        expect(
          p.solutions[lang],
          `problem #${p.id} missing lang=${lang}`
        ).toBeDefined();
        expect(
          p.solutions[lang].code.trim().length,
          `problem #${p.id} lang=${lang} too short`
        ).toBeGreaterThan(20);
      }
    }
  });

  it("every solution matches its language entry-point shape (signature 守卫)", () => {
    for (const p of PROBLEMS) {
      for (const lang of LANGUAGES) {
        expect(
          p.solutions[lang].code,
          `problem #${p.id} lang=${lang} 缺少入口结构 ${LANG_SHAPE[lang]}`
        ).toMatch(LANG_SHAPE[lang]);
      }
    }
  });

  it("every description ≤ 120 characters (强制简洁，避免抄原题)", () => {
    for (const p of PROBLEMS) {
      expect(p.description.length).toBeLessThanOrEqual(DESCRIPTION_MAX_LEN);
    }
  });

  it("description does not contain LeetCode 原题面标志性短语（黑名单）", () => {
    for (const p of PROBLEMS) {
      for (const pattern of BLACKLIST_PATTERNS) {
        expect(p.description).not.toMatch(pattern);
      }
    }
  });

  it("officialUrl all point to leetcode.cn/problems", () => {
    for (const p of PROBLEMS) {
      expect(p.officialUrl).toMatch(/^https:\/\/leetcode\.cn\/problems\//);
    }
  });

  it("approach has ≥ 3 paragraphs (本质 / 要点 / 陷阱)", () => {
    for (const p of PROBLEMS) {
      // 用空行分隔段落
      const paragraphs = p.approach
        .split(/\n\s*\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      expect(paragraphs.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("C++ code uses proper <include>，不用 LeetCode 的 bits/stdc++.h", () => {
    for (const p of PROBLEMS) {
      expect(p.solutions.cpp.code).not.toContain("bits/stdc++.h");
    }
  });
});

/* ---------- 2. 筛选逻辑 ---------- */

describe("filterByDifficulty", () => {
  it("返回 easy 题，顺序按 id 升序", () => {
    const easy = filterByDifficulty("easy");
    expect(easy.length).toBeGreaterThan(0);
    for (const p of easy) expect(p.difficulty).toBe("easy");
    const ids = easy.map((p) => p.id);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });

  it('undefined / "all" 返回全部题目', () => {
    expect(filterByDifficulty(undefined).length).toBe(PROBLEMS.length);
    expect(filterByDifficulty("all").length).toBe(PROBLEMS.length);
  });
});

describe("filterByTag", () => {
  it('返回含 "数组" tag 的题目', () => {
    const arr = filterByTag("数组");
    expect(arr.length).toBeGreaterThan(0);
    for (const p of arr) expect(p.tags).toContain("数组");
  });
});

describe("getAllTags", () => {
  it("returns sorted unique tag list", () => {
    const tags = getAllTags();
    expect(tags).toEqual([...new Set(tags)]);
    expect(tags).toEqual([...tags].sort((a, b) => a.localeCompare(b)));
  });
});

/* ---------- 3. 查题 + 进度 ---------- */

describe("getProblemById / getProblemBySlug", () => {
  it("existing id returns problem", () => {
    expect(getProblemById(1)?.slug).toBe("two-sum");
  });

  it("unknown id returns null", () => {
    expect(getProblemById(99999)).toBeNull();
  });

  it("existing slug returns problem", () => {
    expect(getProblemBySlug("two-sum")?.id).toBe(1);
  });

  it("unknown slug returns null", () => {
    expect(getProblemBySlug("not-a-problem")).toBeNull();
  });
});

describe("getProgressPercent", () => {
  it("0 / total → 0%", () => {
    expect(getProgressPercent([])).toEqual({
      done: 0,
      total: PROBLEMS.length,
      percent: 0,
    });
  });

  it("部分完成的 done/total/percent 一致", () => {
    const ids = [1, 3, 5, 20, 70];
    const snap = getProgressPercent(ids);
    expect(snap.done).toBe(5);
    expect(snap.total).toBe(PROBLEMS.length);
    expect(snap.percent).toBe(Math.round((5 / PROBLEMS.length) * 100));
  });

  it("全部完成 → 100%", () => {
    const allIds = PROBLEMS.map((p) => p.id);
    expect(getProgressPercent(allIds)).toEqual({
      done: PROBLEMS.length,
      total: PROBLEMS.length,
      percent: 100,
    });
  });

  it("不存在的 id 不计入（防止 localStorage 被篡改后虚假进度）", () => {
    expect(getProgressPercent([1, 99999])).toEqual({
      done: 1,
      total: PROBLEMS.length,
      percent: Math.round((1 / PROBLEMS.length) * 100),
    });
  });
});
