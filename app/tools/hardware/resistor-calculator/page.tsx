import type { Metadata } from "next";
import { ResistorCalculator } from "@/components/tools/resistor-calculator/resistor-calculator";

export const metadata: Metadata = {
  title: "电阻色环计算器",
  description: "色环颜色↔阻值双向互查，支持 4/5/6 环和 E 系列标准值",
};

export default function ResistorCalculatorPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">电阻色环计算器</h1>
        <p className="text-muted-foreground mt-1">
          选择色环颜色计算阻值，或输入阻值反查色环，支持 4/5/6 环和 E 系列标准值
        </p>
      </div>
      <ResistorCalculator />
    </div>
  );
}
