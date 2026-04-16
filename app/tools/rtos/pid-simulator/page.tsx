import type { Metadata } from "next";
import { ToolIntro } from "@/components/shared/tool-intro";
import { PIDSimulator } from "@/components/tools/pid-simulator/pid-simulator";

export const metadata: Metadata = {
  title: "PID 调参模拟器",
  description: "可视化调参仿真，支持一阶惯性、二阶振荡、纯积分系统模型",
};

export default function Page() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <ToolIntro
        title="PID 调参模拟器"
        description="可视化调参仿真，支持一阶惯性、二阶振荡、纯积分系统模型"
        example="选择预设场景或手动调节 Kp/Ki/Kd，实时观察阶跃响应、误差曲线和控制输出，学习 PID 调参技巧。"
      />
      <PIDSimulator />
    </div>
  );
}
