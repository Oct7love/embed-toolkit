import { describe, it, expect } from "vitest";
import {
  ALL_APIS,
  FREERTOS_APIS,
  STM32_HAL_APIS,
  getApisByLibrary,
  getCategoriesByLibrary,
  filterByCategory,
  searchByQuery,
} from "./index";

describe("FreeRTOS data", () => {
  it("has at least 30 entries and every entry includes a usage example", () => {
    expect(FREERTOS_APIS.length).toBeGreaterThanOrEqual(30);
    for (const entry of FREERTOS_APIS) {
      expect(entry.library).toBe("FreeRTOS");
      expect(entry.usage.trim().length).toBeGreaterThan(0);
      expect(entry.signature.trim().length).toBeGreaterThan(0);
      expect(entry.pitfalls.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("STM32 HAL data", () => {
  it("has at least 30 entries and every entry includes a usage example", () => {
    expect(STM32_HAL_APIS.length).toBeGreaterThanOrEqual(30);
    for (const entry of STM32_HAL_APIS) {
      expect(entry.library).toBe("STM32 HAL");
      expect(entry.usage.trim().length).toBeGreaterThan(0);
      expect(entry.signature.trim().length).toBeGreaterThan(0);
      expect(entry.pitfalls.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("filterByCategory", () => {
  it("empty categories returns the original list", () => {
    const list = getApisByLibrary("FreeRTOS");
    expect(filterByCategory(list, [])).toEqual(list);
  });

  it("filters entries to only the chosen categories", () => {
    const list = getApisByLibrary("FreeRTOS");
    const result = filterByCategory(list, ["Task"]);
    expect(result.length).toBeGreaterThan(0);
    for (const entry of result) {
      expect(entry.category).toBe("Task");
    }
  });

  it("supports multi-category selection", () => {
    const list = getApisByLibrary("STM32 HAL");
    const result = filterByCategory(list, ["GPIO", "UART"]);
    const categories = new Set(result.map((e) => e.category));
    expect(categories.has("GPIO")).toBe(true);
    expect(categories.has("UART")).toBe(true);
    expect(categories.has("SPI")).toBe(false);
  });
});

describe("searchByQuery", () => {
  it("matches by API name", () => {
    const result = searchByQuery(ALL_APIS, "xQueueSend");
    expect(result.length).toBeGreaterThan(0);
    expect(result.some((e) => e.name === "xQueueSend")).toBe(true);
  });

  it("matches case-insensitively against parameter description text", () => {
    const result = searchByQuery(ALL_APIS, "优先级");
    expect(result.length).toBeGreaterThan(0);
    // xTaskCreate 的 uxPriority 描述里有“优先级”
    expect(result.some((e) => e.name === "xTaskCreate")).toBe(true);
  });

  it("returns the full list for empty query", () => {
    expect(searchByQuery(ALL_APIS, "").length).toBe(ALL_APIS.length);
    expect(searchByQuery(ALL_APIS, "   ").length).toBe(ALL_APIS.length);
  });

  it("returns empty array when nothing matches", () => {
    expect(searchByQuery(ALL_APIS, "absolutely_no_such_api_name_xyz").length).toBe(0);
  });
});

describe("uniqueness", () => {
  it("no duplicate (library + name) combinations exist", () => {
    const seen = new Set<string>();
    for (const entry of ALL_APIS) {
      const key = `${entry.library}::${entry.name}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });
});

describe("getCategoriesByLibrary", () => {
  it("returns a deduplicated, ordered category list", () => {
    const categories = getCategoriesByLibrary("FreeRTOS");
    expect(categories.length).toBeGreaterThan(0);
    expect(new Set(categories).size).toBe(categories.length);
  });
});
