import type { Metadata } from "next";
import { MemoryLayout } from "@/components/tools/memory-layout/memory-layout";

export const metadata: Metadata = {
  title: "内存布局可视化",
  description: "手动配置或解析 .map 文件，可视化 RAM/Flash 分区占用",
};

export default function MemoryLayoutPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <MemoryLayout />
    </div>
  );
}
