import type { Metadata } from "next";
import { BitOperationGenerator } from "@/components/tools/bit-operation/bit-operation-generator";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "位操作代码生成器",
  description: "可视化勾选 Bit 位，选择置位/清零/翻转/读取操作，自动生成 C 语言宏和函数",
};

export default function BitOperationGeneratorPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="位操作代码生成器"
        description="可视化勾选 Bit 位，选择置位/清零/翻转/读取操作，自动生成 C 语言宏和函数"
        example={`需要把 GPIOA->ODR 的 bit3 和 bit7 置 1？勾选后直接生成 GPIOA->ODR |= (1<<3) | (1<<7); 代码。`}
      />
      <BitOperationGenerator />
    </div>
  );
}
