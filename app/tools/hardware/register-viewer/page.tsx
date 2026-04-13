import type { Metadata } from "next";
import { RegisterViewer } from "@/components/tools/register-viewer/register-viewer";

export const metadata: Metadata = {
  title: "寄存器位域计算器",
  description: "32 位寄存器 Bit 网格可视化，支持自定义位域模板",
};

export default function RegisterViewerPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">寄存器位域计算器</h1>
        <p className="text-muted-foreground mt-1">
          可视化 32 位寄存器每个 bit，支持自定义位域模板，点击翻转 bit 实时联动
        </p>
      </div>
      <RegisterViewer />
    </div>
  );
}
