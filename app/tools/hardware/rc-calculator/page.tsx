import type { Metadata } from "next";
import { RCCalculator } from "@/components/tools/rc-calculator/rc-calculator";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "分压/RC 滤波计算器",
  description: "电阻分压 + RC 低通/高通滤波器，计算截止频率并绘制波特图",
};

export default function RCCalculatorPage() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <ToolIntro
        title="分压/RC 滤波计算器"
        description="电阻分压 + RC 低通/高通滤波器，计算截止频率并绘制波特图"
        example={`ADC 前端 RC 低通：R=10kΩ、C=10nF 截止频率 ≈ 1.59 kHz，波特图清晰展示 -3dB 位置。`}
      />
      <RCCalculator />
    </div>
  );
}
