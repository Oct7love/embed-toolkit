import type { Metadata } from "next";
import { GpioPlanner } from "@/components/tools/gpio-planner/gpio-planner";

export const metadata: Metadata = {
  title: "GPIO 引脚分配表",
  description: "选择芯片型号，拖拽分配 GPIO 复用功能，检测冲突并导出 C 代码",
};

export default function GpioPlannerPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">GPIO Pin Planner</h1>
        <p className="text-muted-foreground mt-1">
          Select an MCU, assign alternate functions to each pin, detect conflicts, and export C initialization code
        </p>
      </div>
      <GpioPlanner />
    </div>
  );
}
