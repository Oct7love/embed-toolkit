import type { Metadata } from "next";
import { BaudrateCalculator } from "@/components/tools/baudrate-calculator/baudrate-calculator";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "波特率误差计算器",
  description: "计算 UART 分频系数和实际波特率误差，支持 8x/16x 过采样和批量对比",
};

export default function BaudrateCalculatorPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="波特率误差计算器"
        description="计算 UART 分频系数、实际波特率和误差百分比，支持 8x/16x 过采样模式和批量对比。"
        example="STM32F1 72MHz 时钟 + 16× 过采样下，115200 bps 的 USARTDIV=39，实际波特率 115384.6 bps，误差 0.16%，可用。"
      />
      <BaudrateCalculator />
    </div>
  );
}
