import type { Metadata } from "next";
import { RegisterViewer } from "@/components/tools/register-viewer/register-viewer";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "寄存器位域计算器",
  description: "32 位寄存器 Bit 网格可视化，支持自定义位域模板 + 点击翻转",
};

export default function RegisterViewerPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="寄存器位域计算器"
        description="32 位寄存器 Bit 网格可视化，支持自定义位域模板 + 点击翻转"
        example={`查看 STM32 GPIO_MODER 寄存器，一眼看清每两位对应的 IO 模式（输入/输出/复用/模拟）。`}
      />
      <RegisterViewer />
    </div>
  );
}
