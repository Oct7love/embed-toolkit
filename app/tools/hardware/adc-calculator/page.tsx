import type { Metadata } from "next";
import { ADCCalculator } from "@/components/tools/adc-calculator/adc-calculator";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "ADC 采样计算器",
  description:
    "计算 ADC 转换时间、最大采样率、LSB 电压和 DMA 缓冲区大小，支持 STM32F1/F4 芯片预设",
};

export default function ADCCalculatorPage() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <ToolIntro
        title="ADC 采样计算器"
        description="计算 ADC 转换时间、最大采样率、LSB 电压和 DMA 缓冲区大小，支持 STM32F1/F4 芯片预设一键加载。"
        example="STM32F1 ADC 时钟 14MHz，采样 1.5 cycles + 转换 12.5 cycles = 14 cycles，单通道最快 1MSPS。"
      />
      <ADCCalculator />
    </div>
  );
}
