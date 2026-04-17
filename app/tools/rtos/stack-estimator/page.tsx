import type { Metadata } from "next";
import { ToolIntro } from "@/components/shared/tool-intro";
import { StackEstimator } from "@/components/tools/stack-estimator/stack-estimator";

export const metadata: Metadata = {
  title: "任务栈深度估算器",
  description:
    "快速估算 RTOS 任务栈大小，支持 FreeRTOS / RT-Thread / 通用 RTOS，自动加 30% 安全余量",
};

export default function Page() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <ToolIntro
        title="任务栈深度估算器"
        description="快速估算 RTOS 任务栈大小，自动加 30% 安全余量并对齐到 configMINIMAL_STACK_SIZE"
        example="录入任务调用链中各函数的局部变量字节数，勾选 ISR / printf 等修正项，工具会自动算出推荐 StackSize 并生成 xTaskCreate 代码片段。"
      />
      <StackEstimator />
    </div>
  );
}
