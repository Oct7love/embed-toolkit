import type { Metadata } from "next";
import { ResistorCalculator } from "@/components/tools/resistor-calculator/resistor-calculator";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "电阻色环计算器",
  description: "选择色环颜色计算阻值，或输入阻值反查色环，支持 4/5/6 环和 E 系列推荐值",
};

export default function ResistorCalculatorPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="电阻色环计算器"
        description="选择色环颜色计算阻值，或输入阻值反查色环，支持 4/5/6 环和 E 系列推荐值"
        example={`不知道电阻值？棕-黑-红-金 = 1kΩ ±5%；想买 4.7kΩ 电阻？反查对应色环为黄-紫-红-金。`}
      />
      <ResistorCalculator />
    </div>
  );
}
