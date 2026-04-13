import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RegisterTemplate, RegisterViewerStore } from "@/types/register-viewer";

const BUILTIN_TEMPLATES: RegisterTemplate[] = [
  {
    id: "stm32-gpio-moder",
    name: "STM32 GPIO_MODER",
    description: "GPIO 端口模式寄存器 — 每 2 位控制一个引脚的模式",
    width: 32,
    fields: Array.from({ length: 16 }, (_, i) => ({
      name: `MODER${i}`,
      startBit: i * 2,
      endBit: i * 2 + 1,
      description: `Pin ${i} 模式: 00=输入 01=输出 10=复用 11=模拟`,
      color: i % 2 === 0 ? "#3b82f6" : "#22c55e",
    })),
    createdAt: 0,
  },
  {
    id: "stm32-rcc-cr",
    name: "STM32 RCC_CR",
    description: "时钟控制寄存器",
    width: 32,
    fields: [
      { name: "HSION", startBit: 0, endBit: 0, description: "HSI 时钟使能", color: "#3b82f6" },
      { name: "HSIRDY", startBit: 1, endBit: 1, description: "HSI 时钟就绪", color: "#22c55e" },
      { name: "HSITRIM", startBit: 3, endBit: 7, description: "HSI 时钟校准微调", color: "#f59e0b" },
      { name: "HSICAL", startBit: 8, endBit: 15, description: "HSI 时钟校准", color: "#8b5cf6" },
      { name: "HSEON", startBit: 16, endBit: 16, description: "HSE 时钟使能", color: "#ef4444" },
      { name: "HSERDY", startBit: 17, endBit: 17, description: "HSE 时钟就绪", color: "#06b6d4" },
      { name: "HSEBYP", startBit: 18, endBit: 18, description: "HSE 时钟旁路", color: "#ec4899" },
      { name: "CSSON", startBit: 19, endBit: 19, description: "时钟安全系统使能", color: "#f97316" },
      { name: "PLLON", startBit: 24, endBit: 24, description: "PLL 使能", color: "#3b82f6" },
      { name: "PLLRDY", startBit: 25, endBit: 25, description: "PLL 就绪", color: "#22c55e" },
    ],
    createdAt: 0,
  },
];

export const useRegisterViewerStore = create<RegisterViewerStore>()(
  persist(
    (set) => ({
      templates: BUILTIN_TEMPLATES,
      activeTemplateId: null,

      addTemplate: (template) =>
        set((state) => ({
          templates: [...state.templates, template],
        })),

      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
          activeTemplateId:
            state.activeTemplateId === id ? null : state.activeTemplateId,
        })),

      setActiveTemplate: (id) =>
        set({ activeTemplateId: id }),

      updateTemplate: (id, partial) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...partial } : t
          ),
        })),
    }),
    {
      name: "embed-toolkit-register-viewer",
      partialize: (state) => ({
        templates: state.templates,
        activeTemplateId: state.activeTemplateId,
      }),
    }
  )
);
