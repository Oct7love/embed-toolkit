import type { Metadata } from "next";
import { ToolIntro } from "@/components/shared/tool-intro";
import { StackEstimator } from "@/components/tools/stack-estimator/stack-estimator";

export const metadata: Metadata = {
  title: "任务栈深度估算器",
  description:
    "估算 RTOS 任务栈大小的起点参考：基于 ISR 压栈 / printf / FreeRTOS minimal 等经验值，必须用 uxTaskGetStackHighWaterMark 动态测量验证",
};

export default function Page() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <ToolIntro
        title="任务栈深度估算器"
        description="基于常见经验值（ISR 压栈 32B、printf ≈ 512B、FreeRTOS minimal 128 words）给出栈大小的起点参考。实际值依赖编译器、优化级别、库版本，结果仅作起点参考，必须用 uxTaskGetStackHighWaterMark() 动态测量验证。"
        example="录入调用链各函数局部变量字节数，勾选 ISR / printf 修正项，自动加 30% 余量并对齐到 configMINIMAL_STACK_SIZE，生成 xTaskCreate 代码片段。"
      />
      <StackEstimator />
    </div>
  );
}
