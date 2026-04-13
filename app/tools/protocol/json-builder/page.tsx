import type { Metadata } from "next";
import { JsonBuilder } from "@/components/tools/json-builder/json-builder";

export const metadata: Metadata = {
  title: "JSON 协议构造器",
  description: "可视化拖拽构建 JSON 指令帧，适用于 MCU 通信场景",
};

export default function JsonBuilderPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">JSON 协议构造器</h1>
        <p className="text-muted-foreground mt-1">
          可视化构建 JSON 对象，支持嵌套结构和模板保存，适用于 MCU 通信协议调试
        </p>
      </div>
      <JsonBuilder />
    </div>
  );
}
