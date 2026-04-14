import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GpioPlannerStore } from "@/types/gpio-planner";

export const useGpioPlannerStore = create<GpioPlannerStore>()(
  persist(
    (set) => ({
      chipId: "stm32f103c8t6",
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
    }
  )
);
