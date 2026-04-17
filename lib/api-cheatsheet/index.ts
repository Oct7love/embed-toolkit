import type { ApiEntry, Library } from "@/types/api-cheatsheet";
import { FREERTOS_APIS } from "./data/freertos";
import { STM32_HAL_APIS } from "./data/stm32-hal";

/** 全部 API 数据 */
export const ALL_APIS: ApiEntry[] = [...FREERTOS_APIS, ...STM32_HAL_APIS];

/** 按 library 获取 */
export function getApisByLibrary(library: Library): ApiEntry[] {
  return ALL_APIS.filter((entry) => entry.library === library);
}

/** 获取某个 library 下所有 category（按出现顺序去重） */
export function getCategoriesByLibrary(library: Library): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const entry of ALL_APIS) {
    if (entry.library !== library) continue;
    if (!seen.has(entry.category)) {
      seen.add(entry.category);
      result.push(entry.category);
    }
  }
  return result;
}

/** 按 category 多选过滤；空数组表示不过滤 */
export function filterByCategory(
  entries: ApiEntry[],
  categories: string[]
): ApiEntry[] {
  if (categories.length === 0) return entries;
  const set = new Set(categories);
  return entries.filter((entry) => set.has(entry.category));
}

/** 按 query 模糊匹配 name / signature / params.desc / pitfalls */
export function searchByQuery(entries: ApiEntry[], query: string): ApiEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter((entry) => {
    if (entry.name.toLowerCase().includes(q)) return true;
    if (entry.signature.toLowerCase().includes(q)) return true;
    if (entry.returns.toLowerCase().includes(q)) return true;
    for (const p of entry.params) {
      if (p.name.toLowerCase().includes(q)) return true;
      if (p.desc.toLowerCase().includes(q)) return true;
    }
    for (const pf of entry.pitfalls) {
      if (pf.toLowerCase().includes(q)) return true;
    }
    return false;
  });
}

export { FREERTOS_APIS, STM32_HAL_APIS };
