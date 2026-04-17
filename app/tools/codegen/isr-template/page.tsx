import type { Metadata } from "next";
import { IsrTemplateGenerator } from "@/components/tools/isr-template/isr-template";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "中断服务程序模板生成器",
  description:
    "为 STM32 各系列生成可编译的 ISR 框架代码，覆盖 EXTI / TIM / UART / ADC / DMA / SysTick，自动适配 HAL 宏差异，支持 FreeRTOS 任务通知与临界区模板。",
};

export default function IsrTemplatePage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="中断服务程序模板生成器"
        description="为 STM32 各系列生成可编译的 ISR 框架代码，覆盖 EXTI / TIM / UART / ADC / DMA / SysTick，自动适配 HAL 宏差异，支持 FreeRTOS 任务通知与临界区模板。"
        example="选 STM32F4 + EXTI0 上升沿 + Task Notification，立刻得到带 __HAL_GPIO_EXTI_CLEAR_IT 与 vTaskNotifyGiveFromISR + portYIELD_FROM_ISR 的可编译骨架。"
      />
      <IsrTemplateGenerator />
    </div>
  );
}
