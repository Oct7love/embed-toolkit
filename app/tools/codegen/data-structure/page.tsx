import type { Metadata } from "next";
import { DataStructureGenerator } from "@/components/tools/data-structure/data-structure";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "常用嵌入式数据结构生成器",
  description:
    "一键生成环形缓冲区、简单状态机、软件定时器、发布订阅框架的 C 代码",
};

export default function DataStructurePage() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <ToolIntro
        title="常用嵌入式数据结构生成器"
        description="一键生成环形缓冲区、简单状态机、软件定时器、发布订阅框架的 C 代码，直接复制到工程即可使用"
        example="需要一个 RX DMA 的环形缓冲区？选择 uint8_t + 容量 256 + 线程安全，立即得到 .h/.c 源码。"
      />
      <DataStructureGenerator />
    </div>
  );
}
