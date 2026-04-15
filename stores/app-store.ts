import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isRecord, isStringArray, makeSafeMerge } from "./_schema-guards";

function isValidRecentTool(v: unknown): v is RecentTool {
  if (!isRecord(v)) return false;
  return (
    typeof v.path === "string" &&
    typeof v.name === "string" &&
    typeof v.category === "string" &&
    typeof v.lastUsed === "number"
  );
}

interface RecentTool {
  path: string;
  name: string;
  category: string;
  lastUsed: number;
}

interface AppState {
  sidebarOpen: boolean;
  sidebarCollapsedCategories: string[];
  recentTools: RecentTool[];

  toggleSidebar: () => void;
  toggleCategory: (category: string) => void;
  addRecentTool: (tool: Omit<RecentTool, "lastUsed">) => void;
}

const MAX_RECENT_TOOLS = 20;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarCollapsedCategories: [],
      recentTools: [],

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      toggleCategory: (category: string) =>
        set((state) => {
          const collapsed = state.sidebarCollapsedCategories;
          return {
            sidebarCollapsedCategories: collapsed.includes(category)
              ? collapsed.filter((c) => c !== category)
              : [...collapsed, category],
          };
        }),

      addRecentTool: (tool) =>
        set((state) => {
          const filtered = state.recentTools.filter(
            (t) => t.path !== tool.path
          );
          return {
            recentTools: [
              { ...tool, lastUsed: Date.now() },
              ...filtered,
            ].slice(0, MAX_RECENT_TOOLS),
          };
        }),
    }),
    {
      name: "embed-toolkit-app",
      partialize: (state) => ({
        sidebarCollapsedCategories: state.sidebarCollapsedCategories,
        recentTools: state.recentTools,
      }),
      merge: makeSafeMerge<AppState>((p) => {
        if (!isRecord(p)) return null;
        return {
          sidebarCollapsedCategories: isStringArray(p.sidebarCollapsedCategories)
            ? p.sidebarCollapsedCategories
            : [],
          recentTools: Array.isArray(p.recentTools)
            ? p.recentTools.filter(isValidRecentTool)
            : [],
        };
      }),
    }
  )
);
