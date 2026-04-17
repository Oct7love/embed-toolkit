import { describe, it, expect } from "vitest";
import { filterQuestions, pickRandomQuestion } from "./index";
import type { Question } from "@/types/interview-quiz";

function makeQ(id: string, difficulty: Question["difficulty"] = "easy"): Question {
  return {
    id,
    category: "c-language",
    difficulty,
    question: "test",
    options: ["a", "b", "c", "d"],
    correctAnswer: 0,
    explanation: "x",
  };
}

describe("pickRandomQuestion", () => {
  it("returns null on empty pool", () => {
    expect(pickRandomQuestion([])).toBeNull();
  });

  it("never returns null on non-empty pool (covers first-question bug)", () => {
    // 回归防护：interview-quiz 首屏 displayQuestion 依赖 pool 非空时返回非 null
    // 否则 handleSubmit 拿不到题目，用户感知"提交答案无反应"
    const pool = [makeQ("q1"), makeQ("q2"), makeQ("q3")];
    for (let i = 0; i < 50; i++) {
      const picked = pickRandomQuestion(pool);
      expect(picked).not.toBeNull();
      expect(pool).toContainEqual(picked);
    }
  });
});

describe("filterQuestions", () => {
  const pool = [
    makeQ("q1", "easy"),
    makeQ("q2", "medium"),
    makeQ("q3", "hard"),
  ];

  it("excludes answered IDs", () => {
    const result = filterQuestions(pool, "all", ["q1", "q3"]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("q2");
  });

  it("filters by difficulty", () => {
    const result = filterQuestions(pool, "medium", []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("q2");
  });

  it("difficulty=all keeps all unanswered", () => {
    expect(filterQuestions(pool, "all", [])).toHaveLength(3);
  });

  it("default state (no answered, all difficulty) yields non-empty pool → pickRandomQuestion returns a question", () => {
    // 等价于首屏初始化路径：保证 displayQuestion 兜底能拿到题
    const filtered = filterQuestions(pool, "all", []);
    expect(filtered.length).toBeGreaterThan(0);
    expect(pickRandomQuestion(filtered)).not.toBeNull();
  });
});
