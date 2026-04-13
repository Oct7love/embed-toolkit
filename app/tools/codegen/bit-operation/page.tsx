import type { Metadata } from "next";
import { BitOperationGenerator } from "@/components/tools/bit-operation/bit-operation-generator";

export const metadata: Metadata = {
  title: "位操作代码生成器",
  description: "可视化勾选 Bit 位，自动生成 C 语言位操作宏和函数",
};

export default function BitOperationPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">位操作代码生成器</h1>
        <p className="text-muted-foreground mt-1">
          可视化勾选 32 位寄存器的 Bit 位，自动生成 C 语言位操作宏定义和内联函数
        </p>
      </div>
      <BitOperationGenerator />
    </div>
  );
}
