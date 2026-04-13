import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — RTOS 可视化 | Embed Toolkit",
    default: "RTOS 可视化工具 | Embed Toolkit",
  },
  description: "FreeRTOS 任务调度甘特图、RAM/Flash 内存布局可视化 — 嵌入式 RTOS 学习和调试工具",
};

export default function RtosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
