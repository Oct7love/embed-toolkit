/**
 * 轻量 schema 守卫：用于 Zustand persist 的 merge 函数。
 * 从 localStorage 读到的数据可能被恶意扩展/用户篡改/旧版本格式损坏，
 * 直接 .find()/.includes() 会崩溃并导致持久化白屏。
 * 这里不引入 zod 等运行时依赖，手写 type guard 保证最小体积。
 */

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

export function isArrayOf<T>(v: unknown, guard: (x: unknown) => x is T): v is T[] {
  return Array.isArray(v) && v.every(guard);
}

export function hasString(obj: Record<string, unknown>, key: string): boolean {
  return typeof obj[key] === "string";
}

export function hasNumber(obj: Record<string, unknown>, key: string): boolean {
  return typeof obj[key] === "number" && Number.isFinite(obj[key] as number);
}

/**
 * 通用 merge 工厂：接受一个验证函数，若验证失败直接返回 defaultState（抛弃持久化数据）。
 */
export function makeSafeMerge<TState extends object>(
  validate: (persisted: unknown) => Partial<TState> | null
) {
  return (persistedState: unknown, currentState: TState): TState => {
    const safe = validate(persistedState);
    if (!safe) {
      if (typeof console !== "undefined") {
        console.warn("[store] persisted state failed schema check, falling back to defaults");
      }
      return currentState;
    }
    return { ...currentState, ...safe };
  };
}
