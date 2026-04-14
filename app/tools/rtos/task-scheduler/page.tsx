import type { Metadata } from "next";
import { TaskScheduler } from "@/components/tools/task-scheduler/task-scheduler";

export const metadata: Metadata = {
  title: "任务调度甘特图",
  description: "模拟 FreeRTOS 抢占式调度算法，生成任务时序甘特图",
};

export default function TaskSchedulerPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <TaskScheduler />
    </div>
  );
}
