import type { Metadata } from "next";
import { StateMachineEditor } from "@/components/tools/state-machine/state-machine-editor";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "状态机编辑器",
  description: "拖拽绘制状态转移图，标注事件和动作，自动导出 C 语言 switch-case 框架代码",
};

export default function StateMachineEditorPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="状态机编辑器"
        description="拖拽绘制状态转移图，标注事件和动作，自动导出 C 语言 switch-case 框架代码"
        example={`画一个按键状态机（IDLE→PRESSED→LONG_PRESSED），导出的 switch-case 代码可直接集成到固件。`}
      />
      <StateMachineEditor />
    </div>
  );
}
