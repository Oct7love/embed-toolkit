import type { Metadata } from "next";
import { GpioPlanner } from "@/components/tools/gpio-planner/gpio-planner";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "GPIO 引脚分配表",
  description: "选择芯片（STM32F103C8T6/ESP32），拖拽分配 GPIO 功能，自动检测冲突并导出 C 代码",
};

export default function GpioPlannerPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="GPIO 引脚分配表"
        description="选择芯片（STM32F103C8T6/ESP32），拖拽分配 GPIO 功能，自动检测冲突并导出 C 代码"
        example={`设计原理图时先用它规划引脚：把 UART1_TX 放 PA9，I2C1 放 PB6/PB7，避免同一功能被分配到多个引脚。`}
      />
      <GpioPlanner />
    </div>
  );
}
