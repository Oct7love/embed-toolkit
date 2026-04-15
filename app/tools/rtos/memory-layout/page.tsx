import type { Metadata } from "next";
import { MemoryLayout } from "@/components/tools/memory-layout/memory-layout";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "内存布局可视化",
  description: "手动配置或粘贴 GCC .map 文件，可视化 RAM/Flash 各段分区占用和剩余空间",
};

export default function MemoryLayoutPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="内存布局可视化"
        description="手动配置或粘贴 GCC .map 文件，可视化 RAM/Flash 各段分区占用和剩余空间"
        example={`分析固件时贴入 .map 文件，立即看到 .text/.data/.bss/heap/stack 的占用比例和地址范围。`}
      />
      <MemoryLayout />
    </div>
  );
}
