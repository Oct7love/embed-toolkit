import type { Metadata } from "next";
import { ToolIntro } from "@/components/shared/tool-intro";
import { ClockTree } from "@/components/tools/clock-tree/clock-tree";

export const metadata: Metadata = {
  title: "时钟树配置器",
  description:
    "可视化配置 STM32 时钟树（HSI/HSE/PLL/SYSCLK/AHB/APB），实时计算频率并导出 HAL 初始化代码",
};

export default function Page() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <ToolIntro
        title="时钟树配置器"
        description="可视化配置 STM32 时钟树（HSI/HSE/PLL/SYSCLK/AHB/APB），实时计算频率、检测超频并导出 HAL 初始化代码。"
        example="选择 STM32F1，HSE 8 MHz，PLL x9 得到 72 MHz SYSCLK，APB1 分频 /2 得到 36 MHz，一键导出 SystemClock_Config()。"
      />
      <ClockTree />
    </div>
  );
}
