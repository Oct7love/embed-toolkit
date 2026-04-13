import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — 代码辅助 | Embed Toolkit",
    default: "代码辅助工具 | Embed Toolkit",
  },
  description: "位操作代码生成、状态机编辑器 — 嵌入式 C 语言代码自动生成工具",
};

export default function CodegenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
