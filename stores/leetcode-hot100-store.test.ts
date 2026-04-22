import { describe, it, expect, beforeEach } from "vitest";

// localStorage shim（复用 quiz-store.test.ts 的模式）
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

const { useLeetcodeHot100Store } = await import("./leetcode-hot100-store");

describe("leetcode-hot100-store: toggleCompleted", () => {
  beforeEach(() => {
    localStorage.clear();
    useLeetcodeHot100Store.setState({
      completedIds: [],
      preferredLang: "cpp",
    });
  });

  it("toggle 未完成的题 → 加入 completedIds", () => {
    useLeetcodeHot100Store.getState().toggleCompleted(1);
    expect(useLeetcodeHot100Store.getState().completedIds).toContain(1);
  });

  it("toggle 已完成的题 → 从 completedIds 移除（幂等）", () => {
    useLeetcodeHot100Store.getState().toggleCompleted(1);
    useLeetcodeHot100Store.getState().toggleCompleted(1);
    expect(useLeetcodeHot100Store.getState().completedIds).not.toContain(1);
  });

  it("toggle 多题互不影响", () => {
    useLeetcodeHot100Store.getState().toggleCompleted(1);
    useLeetcodeHot100Store.getState().toggleCompleted(3);
    useLeetcodeHot100Store.getState().toggleCompleted(5);
    const s = useLeetcodeHot100Store.getState();
    expect(s.completedIds).toEqual([1, 3, 5]);
  });
});

describe("leetcode-hot100-store: preferredLang", () => {
  beforeEach(() => {
    localStorage.clear();
    useLeetcodeHot100Store.setState({
      completedIds: [],
      preferredLang: "cpp",
    });
  });

  it("默认 preferredLang 为 cpp", () => {
    expect(useLeetcodeHot100Store.getState().preferredLang).toBe("cpp");
  });

  it("setLang 可切到 python", () => {
    useLeetcodeHot100Store.getState().setLang("python");
    expect(useLeetcodeHot100Store.getState().preferredLang).toBe("python");
  });
});

describe("leetcode-hot100-store: reset", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("reset 清空 completedIds，preferredLang 保留", () => {
    useLeetcodeHot100Store.setState({
      completedIds: [1, 3, 5],
      preferredLang: "python",
    });
    useLeetcodeHot100Store.getState().reset();
    const s = useLeetcodeHot100Store.getState();
    expect(s.completedIds).toEqual([]);
    expect(s.preferredLang).toBe("python");
  });
});
