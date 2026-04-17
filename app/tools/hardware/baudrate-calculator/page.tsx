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
        description="计算 STM32 USART BRR 寄存器值（含 mantissa/fraction 编码）、实际波特率和误差百分比，支持 8×/16× 过采样和批量对比。"
        example="72MHz / 115200 / OVER16 → BRR = 0x0271（mantissa=39, fraction=1），实际 115200 bps，误差 0.00%。"
      />
      <BaudrateCalculator />
    </div>
  );
}
