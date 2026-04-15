import type { Metadata } from "next";
import { TaskScheduler } from "@/components/tools/task-scheduler/task-scheduler";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "任务调度甘特图",
  description: "输入任务优先级、周期、执行时间，模拟 FreeRTOS 抢占式调度并生成时序甘特图",
};

export default function TaskSchedulerPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="任务调度甘特图"
        description="输入任务优先级、周期、执行时间，模拟 FreeRTOS 抢占式调度并生成时序甘特图"
        example={`学习 RTOS 时可视化验证优先级反转、任务错过 deadline、CPU 利用率等关键概念。`}
      />
      <TaskScheduler />
    </div>
  );
}
