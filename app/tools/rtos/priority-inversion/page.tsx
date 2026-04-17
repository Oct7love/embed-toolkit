import type { Metadata } from "next";
import { ToolIntro } from "@/components/shared/tool-intro";
import { PriorityInversion } from "@/components/tools/priority-inversion/priority-inversion";

export const metadata: Metadata = {
  title: "优先级反转可视化",
  description:
    "演示 FreeRTOS 经典优先级反转问题与优先级继承协议（PIP）的修复效果",
};

export default function Page() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <ToolIntro
        title="优先级反转可视化"
        description="演示 FreeRTOS 经典优先级反转问题与优先级继承协议（PIP）的修复效果"
        example="切换 PIP 开关，对比 high 任务的等待时间。经典反转下 mid 抢占持锁的 low 会让 high 等待远超 mid 执行时长；启用 PIP 后 low 临时继承 high 优先级，mid 无法抢占。"
      />
      <PriorityInversion />
    </div>
  );
}
