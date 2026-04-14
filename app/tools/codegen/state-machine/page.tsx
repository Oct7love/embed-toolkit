import type { Metadata } from "next";
import { StateMachineEditor } from "@/components/tools/state-machine/state-machine-editor";

export const metadata: Metadata = {
  title: "状态机编辑器",
  description: "拖拽绘制状态转移图，自动导出 C 语言 switch-case 框架代码",
};

export default function StateMachinePage() {
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <StateMachineEditor />
    </div>
  );
}
