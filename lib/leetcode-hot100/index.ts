/**
 * LeetCode Hot 100 — 纯函数（筛选 / 查询 / 进度）
 */

import type { Difficulty, Problem } from "@/types/leetcode-hot100";
import { PROBLEMS } from "./data";

export { PROBLEMS };

/** description 强制最大长度，防止抄官方题面蔓延 */
export const DESCRIPTION_MAX_LEN = 120;

/**
 * LeetCode 原题面标志性短语黑名单。
 * 出现任一即视为疑似抄原题，测试守护。
 */
export const BLACKLIST_PATTERNS: RegExp[] = [
  /给你一个/,
  /给定一个/,
  /给定两个/,
  /给你两个/,
  /给定字符串/,
  /^Given /i,
  /Given an array/i,
  /Given a string/i,
  /Return the (length|minimum|maximum|largest|smallest)/i,
];

export function filterByDifficulty(
  difficulty: Difficulty | "all" | undefined
): Problem[] {
  if (difficulty === undefined || difficulty === "all") return PROBLEMS;
  return PROBLEMS.filter((p) => p.difficulty === difficulty).sort(
    (a, b) => a.id - b.id
  );
}

export function filterByTag(tag: string): Problem[] {
  return PROBLEMS.filter((p) => p.tags.includes(tag));
}

export function getAllTags(): string[] {
  const set = new Set<string>();
  for (const p of PROBLEMS) for (const t of p.tags) set.add(t);
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function getProblemById(id: number): Problem | null {
  return PROBLEMS.find((p) => p.id === id) ?? null;
}

export function getProblemBySlug(slug: string): Problem | null {
  return PROBLEMS.find((p) => p.slug === slug) ?? null;
}

export interface ProgressSnapshot {
  done: number;
  total: number;
  percent: number;
}

/**
 * 基于 completedIds 计算进度。
 * 只计入当前题库中存在的 id，防止 localStorage 被篡改/题目被移除后产生"虚假进度"。
 */
export function getProgressPercent(completedIds: number[]): ProgressSnapshot {
  const valid = new Set(PROBLEMS.map((p) => p.id));
  const done = completedIds.filter((id) => valid.has(id)).length;
  const total = PROBLEMS.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}
