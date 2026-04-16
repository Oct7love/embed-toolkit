import type { Metadata } from "next";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "PID 调参模拟器",
  description: "PID 控制器调参仿真",
};

export default function Page() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <ToolIntro title="PID 调参模拟器" description="该工具正在开发中..." />
    </div>
  );
}
