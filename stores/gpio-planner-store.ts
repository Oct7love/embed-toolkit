import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GpioPlannerStore } from "@/types/gpio-planner";
import { isRecord, makeSafeMerge } from "./_schema-guards";

export const useGpioPlannerStore = create<GpioPlannerStore>()(
  persist(
    (set) => ({
      chipId: "",
      assignments: {},

      setChipId: (chipId) =>
        set({ chipId, assignments: {} }),

      assignPin: (pinNumber, func) =>
        set((state) => ({
          assignments: { ...state.assignments, [pinNumber]: func },
        })),

      clearPin: (pinNumber) =>
        set((state) => {
          const next = { ...state.assignments };
          delete next[pinNumber];
          return { assignments: next };
        }),

      clearAll: () =>
        set({ assignments: {} }),
    }),
    {
      name: "embed-toolkit-gpio-planner",
      partialize: (state) => ({
        chipId: state.chipId,
        assignments: state.assignments,
      }),
      merge: makeSafeMerge<GpioPlannerStore>((p) => {
        if (!isRecord(p)) return null;
        return {
          chipId: typeof p.chipId === "string" ? p.chipId : "",
          assignments: isRecord(p.assignments) ? (p.assignments as Record<number, string>) : {},
        };
      }),
    }
  )
);
