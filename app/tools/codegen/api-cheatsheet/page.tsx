import type { Metadata } from "next";
import { ApiCheatsheet } from "@/components/tools/api-cheatsheet/api-cheatsheet";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "FreeRTOS / STM32 HAL API 速查卡",
  description:
    "汇总 FreeRTOS 与 STM32 HAL 常用 API 的签名、参数、典型用法和常见坑点，支持分类筛选与全文搜索",
};

export default function ApiCheatsheetPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="FreeRTOS / STM32 HAL API 速查卡"
        description="汇总 FreeRTOS 与 STM32 HAL 常用 API 的签名、参数、典型用法和常见坑点，支持分类筛选与全文搜索"
        example={`忘记 xQueueSendFromISR 的第三个参数是什么？切到 FreeRTOS → Queue，点开条目即可查到签名与最小可运行示例。`}
      />
      <ApiCheatsheet />
    </div>
  );
}
