import { describe, it, expect, beforeEach } from "vitest";

// zustand persist 在 create 时会读取 localStorage 做 hydrate；node 环境下需 shim
// 直接覆盖（不检查既有），避免运行时已存在不完整 stub 导致 .clear 不可调
{
  const map = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => {
        map.set(k, v);
      },
      removeItem: (k: string) => {
        map.delete(k);
      },
      clear: () => {
        map.clear();
      },
      key: (i: number) => Array.from(map.keys())[i] ?? null,
      get length() {
        return map.size;
      },
    },
    writable: true,
    configurable: true,
  });
}

const { useQuizStore } = await import("./quiz-store");

const seedAnswered = () => {
  useQuizStore.setState({
    favorites: ["q1"],
    wrongAnswers: ["q2"],
    answeredIds: ["q3", "q4", "q5"],
    stats: {
      totalAnswered: 3,
      correctCount: 2,
      categoryStats: { "c-language": { total: 3, correct: 2 } },
    },
  });
};

describe("quiz-store: resetSession", () => {
  beforeEach(() => {
    localStorage.clear();
    useQuizStore.setState({
      favorites: [],
      wrongAnswers: [],
      stats: { totalAnswered: 0, correctCount: 0, categoryStats: {} },
      answeredIds: [],
      currentCategory: "all",
      currentDifficulty: "all",
      currentView: "quiz",
    });
  });

  it("clears answeredIds only", () => {
    seedAnswered();
    useQuizStore.getState().resetSession();
    expect(useQuizStore.getState().answeredIds).toEqual([]);
  });

  it("preserves favorites / wrongAnswers / stats so 跨轮数据不丢", () => {
    seedAnswered();
    useQuizStore.getState().resetSession();
    const s = useQuizStore.getState();
    expect(s.favorites).toEqual(["q1"]);
    expect(s.wrongAnswers).toEqual(["q2"]);
    expect(s.stats.totalAnswered).toBe(3);
    expect(s.stats.correctCount).toBe(2);
  });
});

describe("quiz-store: resetAllData", () => {
  beforeEach(() => {
    localStorage.clear();
    useQuizStore.setState({
      favorites: [],
      wrongAnswers: [],
      stats: { totalAnswered: 0, correctCount: 0, categoryStats: {} },
      answeredIds: [],
      currentCategory: "all",
      currentDifficulty: "all",
      currentView: "quiz",
    });
  });

  it("clears favorites / wrongAnswers / stats / answeredIds", () => {
    seedAnswered();
    useQuizStore.getState().resetAllData();
    const s = useQuizStore.getState();
    expect(s.favorites).toEqual([]);
    expect(s.wrongAnswers).toEqual([]);
    expect(s.answeredIds).toEqual([]);
    expect(s.stats.totalAnswered).toBe(0);
    expect(s.stats.correctCount).toBe(0);
    expect(s.stats.categoryStats).toEqual({});
  });
});

describe("quiz-store: recordAnswer", () => {
  beforeEach(() => {
    localStorage.clear();
    useQuizStore.setState({
      favorites: [],
      wrongAnswers: [],
      stats: { totalAnswered: 0, correctCount: 0, categoryStats: {} },
      answeredIds: [],
      currentCategory: "all",
      currentDifficulty: "all",
      currentView: "quiz",
    });
  });

  it("正确答题 → totalAnswered+1, correctCount+1, 不入错题本", () => {
    useQuizStore.getState().recordAnswer("q1", "c-language", true);
    const s = useQuizStore.getState();
    expect(s.stats.totalAnswered).toBe(1);
    expect(s.stats.correctCount).toBe(1);
    expect(s.wrongAnswers).not.toContain("q1");
    expect(s.answeredIds).toContain("q1");
  });

  it("错误答题 → 入错题本，correctCount 不变", () => {
    useQuizStore.getState().recordAnswer("q1", "c-language", false);
    const s = useQuizStore.getState();
    expect(s.stats.totalAnswered).toBe(1);
    expect(s.stats.correctCount).toBe(0);
    expect(s.wrongAnswers).toContain("q1");
  });
});
