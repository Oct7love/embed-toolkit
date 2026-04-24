import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  LANGUAGES,
  type Language,
  type LeetcodeHot100State,
} from "@/types/leetcode-hot100";
import { isRecord, isArrayOf, makeSafeMerge } from "./_schema-guards";

function isValidLang(v: unknown): v is Language {
  return typeof v === "string" && (LANGUAGES as readonly string[]).includes(v);
}

export const useLeetcodeHot100Store = create<LeetcodeHot100State>()(
  persist(
    (set) => ({
      completedIds: [],
      preferredLang: "cpp",

      toggleCompleted: (id) =>
        set((state) => ({
          completedIds: state.completedIds.includes(id)
            ? state.completedIds.filter((x) => x !== id)
            : [...state.completedIds, id],
        })),

      setLang: (lang) => set({ preferredLang: lang }),

      reset: () => set({ completedIds: [] }),
    }),
    {
      name: "embed-toolkit-leetcode-hot100",
      version: 1,
      partialize: (state) => ({
        completedIds: state.completedIds,
        preferredLang: state.preferredLang,
      }),
      merge: makeSafeMerge<LeetcodeHot100State>((p) => {
        if (!isRecord(p)) return null;
        const completedIds = isArrayOf(
          p.completedIds,
          (x): x is number => typeof x === "number" && Number.isFinite(x)
        )
          ? p.completedIds
          : [];
        const preferredLang: Language = isValidLang(p.preferredLang)
          ? p.preferredLang
          : "cpp";
        return { completedIds, preferredLang };
      }),
    }
  )
);
