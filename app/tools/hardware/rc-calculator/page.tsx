import type { Metadata } from "next";
import { RCCalculator } from "@/components/tools/rc-calculator/rc-calculator";

export const metadata: Metadata = {
  title: "分压/RC 滤波计算器",
  description: "电阻分压 + RC 低通/高通滤波器，计算截止频率并绘制波特图",
};

export default function RcCalculatorPage() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">分压/RC 滤波计算器</h1>
        <p className="text-muted-foreground mt-1">
          电阻分压和 RC 低通/高通滤波器截止频率计算，内含波特图（幅频特性）
        </p>
      </div>
      <RCCalculator />
    </div>
  );
}
