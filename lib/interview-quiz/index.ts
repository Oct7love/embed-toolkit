import type { Question, QuestionCategory, Difficulty } from "@/types/interview-quiz";

// 每类题库采用 dynamic import，访问时才加载对应 JSON。
// Next.js 会把每个 JSON 拆成独立 chunk，减小 interview-quiz 路由首屏体积。
const loaders: Record<QuestionCategory, () => Promise<Question[]>> = {
  "c-language": () =>
    import("./questions/c-language.json").then((m) => m.default as Question[]),
  rtos: () => import("./questions/rtos.json").then((m) => m.default as Question[]),
  protocol: () =>
    import("./questions/protocol.json").then((m) => m.default as Question[]),
  hardware: () =>
    import("./questions/hardware.json").then((m) => m.default as Question[]),
};

/** 加载指定分类（或全部）的题库；已加载的分类直接复用缓存。 */
const cache = new Map<QuestionCategory, Question[]>();

export async function loadQuestions(
  category: QuestionCategory | "all"
): Promise<Question[]> {
  if (category !== "all") {
    if (!cache.has(category)) {
      cache.set(category, await loaders[category]());
    }
    return cache.get(category)!;
  }
  const categories: QuestionCategory[] = ["c-language", "rtos", "protocol", "hardware"];
  const uncached = categories.filter((c) => !cache.has(c));
  await Promise.all(
    uncached.map(async (c) => {
      cache.set(c, await loaders[c]());
    })
  );
  return categories.flatMap((c) => cache.get(c)!);
}

/** 同步读取已加载缓存（用于无法异步的调用点）。 */
export function getCachedQuestions(
  category: QuestionCategory | "all"
): Question[] {
  if (category !== "all") return cache.get(category) ?? [];
  const categories: QuestionCategory[] = ["c-language", "rtos", "protocol", "hardware"];
  return categories.flatMap((c) => cache.get(c) ?? []);
}

export function filterQuestions(
  pool: Question[],
  difficulty: Difficulty | "all",
  excludeIds: string[] = []
): Question[] {
  return pool.filter(
    (q) =>
      (difficulty === "all" || q.difficulty === difficulty) &&
      !excludeIds.includes(q.id)
  );
}

export function pickRandomQuestion(pool: Question[]): Question | null {
  if (pool.length === 0) return null;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

/** 题库静态元信息（各分类题数）。硬编码以避免加载 JSON 仅为计数。 */
export const CATEGORY_COUNTS: Record<QuestionCategory, number> = {
  "c-language": 127,
  rtos: 107,
  protocol: 107,
  hardware: 105,
};

export function getCategoryCount(category: QuestionCategory): number {
  return CATEGORY_COUNTS[category];
}

export function getTotalCount(): number {
  return Object.values(CATEGORY_COUNTS).reduce((a, b) => a + b, 0);
}

/** 从全部缓存中按 id 查题（需要已加载过对应分类）。 */
export function getQuestionById(id: string): Question | undefined {
  for (const arr of cache.values()) {
    const found = arr.find((q) => q.id === id);
    if (found) return found;
  }
  return undefined;
}
