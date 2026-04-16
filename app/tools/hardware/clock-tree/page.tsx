import type { Metadata } from "next";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "时钟树配置器",
  description: "可视化 STM32 时钟树配置",
};

export default function Page() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <ToolIntro title="时钟树配置器" description="该工具正在开发中..." />
    </div>
  );
}
