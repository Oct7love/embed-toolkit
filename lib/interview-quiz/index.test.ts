import { describe, it, expect } from "vitest";
import {
  filterQuestions,
  pickRandomQuestion,
  selectDisplayQuestion,
} from "./index";
import type { Question, QuestionCategory } from "@/types/interview-quiz";

function makeQ(
  id: string,
  difficulty: Question["difficulty"] = "easy",
  category: QuestionCategory = "c-language"
): Question {
  return {
    id,
    category,
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

describe("selectDisplayQuestion (回归守护：提交后不跳题)", () => {
  const q1 = makeQ("q1");
  const q2 = makeQ("q2");
  const q3 = makeQ("q3");
  const loadedPool = [q1, q2, q3];

  it("提交当前题后 currentQuestion 仍属 loadedPool，但已被 answeredIds 从 pool 过滤 → 仍返回当前题（不跳到 pool 里另一道）", () => {
    // 这是 commit 8f0e6d7 引入回归的核心场景：
    // 提交 q1 → answeredIds=[q1] → pool = [q2, q3]
    // 旧实现校验 pool.some(q.id===q1) → false → 跳到 pool 中另一题，叠加 showAnswer=true 暴露答案
    const poolAfterAnswer = [q2, q3];
    expect(selectDisplayQuestion(q1, loadedPool, poolAfterAnswer)).toBe(q1);
  });

  it("currentQuestion === null + pool 非空 → 兜底选 pool 内一题（首屏首题）", () => {
    const picked = selectDisplayQuestion(null, loadedPool, loadedPool);
    expect(picked).not.toBeNull();
    expect(loadedPool).toContain(picked);
  });

  it("currentQuestion 不属 loadedPool（分类切换）→ 从新 pool 兜底", () => {
    const newLoadedPool = [makeQ("r1", "easy", "rtos"), makeQ("r2", "easy", "rtos")];
    const picked = selectDisplayQuestion(q1, newLoadedPool, newLoadedPool);
    expect(picked).not.toBeNull();
    expect(newLoadedPool).toContain(picked);
    expect(picked).not.toBe(q1);
  });

  it("pool 为空 + currentQuestion 不属 loadedPool → 返回 null", () => {
    expect(selectDisplayQuestion(q1, [], [])).toBeNull();
  });

  it("pool 为空但 currentQuestion 仍属 loadedPool（本轮做完最后一题）→ 仍展示当前题", () => {
    expect(selectDisplayQuestion(q1, loadedPool, [])).toBe(q1);
  });
});
