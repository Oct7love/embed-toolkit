import type { Metadata } from "next";
import { ToolIntro } from "@/components/shared/tool-intro";
import { TimerCalculator } from "@/components/tools/timer-calculator/timer-calculator";

export const metadata: Metadata = {
  title: "定时器/PWM 计算器",
  description:
    "输入系统时钟和目标频率，自动计算所有可行的 PSC/ARR 组合，支持 PWM 占空比计算",
};

export default function Page() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="定时器/PWM 计算器"
        description="输入系统时钟和目标频率，自动计算所有可行的 PSC/ARR 组合，支持 PWM 占空比计算"
        example="STM32F1 (72 MHz) 生成 1 kHz 方波：PSC=71, ARR=999，精确无误差。启用 PWM 后自动计算 CCR。"
      />
      <TimerCalculator />
    </div>
  );
}
