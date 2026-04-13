import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — 学习求职 | Embed Toolkit",
    default: "学习与求职 | Embed Toolkit",
  },
  description: "嵌入式面试题库 — C 语言陷阱题、RTOS 概念题、通信协议题，随机刷题、收藏和统计",
};

export default function LearningLayout({ children }: { children: React.ReactNode }) {
  return children;
}
