import { describe, it, expect } from "vitest";
import {
  calculateStack,
  RTOS_META,
  ISR_OVERHEAD_BYTES,
  PRINTF_OVERHEAD_BYTES,
  BYTES_PER_WORD,
} from "./index";
import type { CalcInput, StackEntry } from "@/types/stack-estimator";

function makeEntry(name: string, bytes: number): StackEntry {
  return { id: name, functionName: name, stackBytes: bytes };
}

function makeInput(overrides: Partial<CalcInput> = {}): CalcInput {
  return {
    entries: [],
    isInIsr: false,
    usesPrintf: false,
    targetRtos: "freertos",
    ...overrides,
  };
}

describe("calculateStack — 空调用链", () => {
  it("空 + 无 ISR + 无 printf：调用链累加为 0，仍至少给 1 倍 minimal", () => {
    const r = calculateStack(makeInput());
    expect(r.callChainBytes).toBe(0);
    expect(r.isrOverheadBytes).toBe(0);
    expect(r.printfOverheadBytes).toBe(0);
    expect(r.adjustedBytes).toBe(0);
    expect(r.recommendedBytes).toBe(0);
    expect(r.multiplier).toBe(1);
    expect(r.finalStackWords).toBe(RTOS_META.freertos.minimalStackWords);
  });

  it("空 + ISR：仅 32B 修正", () => {
    const r = calculateStack(makeInput({ isInIsr: true }));
    expect(r.isrOverheadBytes).toBe(ISR_OVERHEAD_BYTES);
    expect(r.adjustedBytes).toBe(32);
    expect(r.recommendedBytes).toBe(Math.ceil(32 * 1.3));
  });

  it("空 + printf：仅 512B 修正", () => {
    const r = calculateStack(makeInput({ usesPrintf: true }));
    expect(r.printfOverheadBytes).toBe(PRINTF_OVERHEAD_BYTES);
    expect(r.adjustedBytes).toBe(512);
  });
});

describe("calculateStack — 单函数 + 30% 余量", () => {
  it("单函数 100B → 推荐 130B", () => {
    const r = calculateStack(
      makeInput({ entries: [makeEntry("foo", 100)] })
    );
    expect(r.callChainBytes).toBe(100);
    expect(r.adjustedBytes).toBe(100);
    expect(r.recommendedBytes).toBe(130);
  });
});

describe("calculateStack — ISR + printf 双开", () => {
  it("两者同时启用：累加正确", () => {
    const r = calculateStack(
      makeInput({
        entries: [makeEntry("a", 64), makeEntry("b", 64)],
        isInIsr: true,
        usesPrintf: true,
      })
    );
    // 64 + 64 + 32 + 512 = 672
    expect(r.callChainBytes).toBe(128);
    expect(r.adjustedBytes).toBe(128 + 32 + 512);
    expect(r.recommendedBytes).toBe(Math.ceil(672 * 1.3));
  });
});

describe("calculateStack — 向上取整到 configMINIMAL_STACK_SIZE 整数倍", () => {
  it("FreeRTOS minimal=128 words=512B：推荐 600B → multiplier=2 → 1024B", () => {
    // 制造 recommendedBytes ≈ 600：input adjusted = ceil(600/1.3)=462；用 462B
    const r = calculateStack(
      makeInput({ entries: [makeEntry("big", 462)] })
    );
    // recommended = ceil(462 * 1.3) = ceil(600.6) = 601
    expect(r.recommendedBytes).toBe(601);
    // 601 / 512 = 1.17 → ceil = 2
    expect(r.multiplier).toBe(2);
    expect(r.finalStackBytes).toBe(2 * 128 * BYTES_PER_WORD);
    expect(r.finalStackWords).toBe(256);
    expect(r.codeSnippet).toContain("2 * configMINIMAL_STACK_SIZE");
  });

  it("刚好等于 1 倍 minimal：multiplier=1", () => {
    // FreeRTOS: 1 * 128 * 4 = 512B；adjusted = floor(512/1.3) = 393
    const r = calculateStack(
      makeInput({ entries: [makeEntry("x", 100)] })
    );
    // recommended=130，远小于 512 → multiplier=1
    expect(r.multiplier).toBe(1);
    expect(r.finalStackBytes).toBe(512);
  });
});

describe("calculateStack — 不同 RTOS 的 minimal stack size 计算", () => {
  it("RT-Thread minimal=256 words=1024B", () => {
    const r = calculateStack(
      makeInput({
        entries: [makeEntry("foo", 200)],
        targetRtos: "rt-thread",
      })
    );
    // recommended = ceil(200 * 1.3) = 260
    expect(r.recommendedBytes).toBe(260);
    // 260 < 1024 → multiplier=1
    expect(r.multiplier).toBe(1);
    expect(r.finalStackBytes).toBe(1024);
    expect(r.finalStackWords).toBe(256);
    expect(r.codeSnippet).toContain("rt_thread_create");
  });

  it("通用 RTOS minimal=256 words=1024B，大栈触发 multiplier=3", () => {
    // 需要 recommended > 2*1024=2048：adjusted > 2048/1.3 ≈ 1576
    const r = calculateStack(
      makeInput({
        entries: [makeEntry("huge", 1600)],
        usesPrintf: true, // +512
        targetRtos: "generic",
      })
    );
    // adjusted = 1600 + 512 = 2112；recommended = ceil(2112*1.3)=ceil(2745.6)=2746
    expect(r.adjustedBytes).toBe(2112);
    expect(r.recommendedBytes).toBe(2746);
    // 2746 / 1024 = 2.68 → ceil=3
    expect(r.multiplier).toBe(3);
    expect(r.finalStackBytes).toBe(3072);
    expect(r.codeSnippet).toContain("3 * MINIMAL_STACK_SIZE");
  });

  it("FreeRTOS 代码片段格式正确", () => {
    const r = calculateStack(
      makeInput({ entries: [makeEntry("t", 50)], targetRtos: "freertos" })
    );
    expect(r.codeSnippet).toContain("xTaskCreate");
    expect(r.codeSnippet).toContain("configMINIMAL_STACK_SIZE");
  });
});
