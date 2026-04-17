import { describe, it, expect } from "vitest";
import {
  DECISION_TREE,
  traverseTree,
  getAllRecommendations,
  getBreadcrumbs,
} from "./index";

describe("traverseTree", () => {
  it("empty answers returns root question node", () => {
    const node = traverseTree([]);
    expect(node).not.toBeNull();
    expect(node?.kind).toBe("question");
    expect(node?.id).toBe(DECISION_TREE.id);
  });

  it("path mutex lands directly on Mutex with PI (互斥保护无条件推荐 Mutex，不再额外问 PI)", () => {
    const node = traverseTree(["mutex"]);
    expect(node).not.toBeNull();
    expect(node?.kind).toBe("recommendation");
    if (node?.kind === "recommendation") {
      expect(node.api).toBe("xSemaphoreCreateMutex");
      expect(node.id).toBe("rec-mutex-pi");
    }
  });

  it("path ipc → signal-only → multi lands on Binary Semaphore (ISR → 多任务同步，不是互斥)", () => {
    const node = traverseTree(["ipc", "signal-only", "multi"]);
    expect(node).not.toBeNull();
    expect(node?.kind).toBe("recommendation");
    if (node?.kind === "recommendation") {
      expect(node.api).toBe("xSemaphoreCreateBinary");
      expect(node.id).toBe("rec-binary-sem");
    }
  });

  it("path ipc → small-fixed lands on Queue recommendation", () => {
    const node = traverseTree(["ipc", "small-fixed"]);
    expect(node).not.toBeNull();
    expect(node?.kind).toBe("recommendation");
    if (node?.kind === "recommendation") {
      expect(node.api).toBe("xQueueCreate");
      expect(node.id).toBe("rec-queue");
    }
  });

  it("path events lands directly on Event Group (single-step recommendation)", () => {
    const node = traverseTree(["events"]);
    expect(node?.kind).toBe("recommendation");
    if (node?.kind === "recommendation") {
      expect(node.api).toBe("xEventGroupCreate");
    }
  });

  it("invalid answer returns null", () => {
    expect(traverseTree(["not-a-real-option"])).toBeNull();
    expect(traverseTree(["mutex", "definitely-wrong"])).toBeNull();
  });

  it("extra answer past a recommendation leaf returns null", () => {
    // events → REC_EVENT_GROUP；再多一个 answer 应该非法
    expect(traverseTree(["events", "anything"])).toBeNull();
  });
});

describe("getAllRecommendations", () => {
  it("collects every leaf recommendation in the tree", () => {
    const recs = getAllRecommendations();
    // 当前覆盖 9 个推荐方案
    expect(recs.length).toBe(9);
    // 全部 id 唯一
    const ids = new Set(recs.map((r) => r.id));
    expect(ids.size).toBe(recs.length);
    // 所有节点都是 recommendation 类型
    for (const r of recs) {
      expect(r.kind).toBe("recommendation");
      expect(r.api.length).toBeGreaterThan(0);
      expect(r.codeExample.code.length).toBeGreaterThan(0);
      expect(r.pitfalls.length).toBeGreaterThanOrEqual(1);
      expect(r.alternatives.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("getBreadcrumbs", () => {
  it("returns ordered crumbs along a valid path", () => {
    const crumbs = getBreadcrumbs(["ipc", "small-fixed"]);
    expect(crumbs).toHaveLength(2);
    expect(crumbs[0].choiceLabel).toContain("跨任务");
    expect(crumbs[1].choiceLabel).toContain("小尺寸");
  });

  it("returns empty array for invalid path", () => {
    expect(getBreadcrumbs(["bogus"])).toEqual([]);
  });
});
