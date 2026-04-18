import type { Metadata } from "next";
import { PcbImpedance } from "@/components/tools/pcb-impedance/pcb-impedance";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "PCB 阻抗计算器",
  description:
    "微带线 / 带状线 / 差分对特征阻抗计算，基于 IPC-2141A + Wadell 近似公式，典型误差 ±5%。",
};

export default function PcbImpedancePage() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <ToolIntro
        title="PCB 阻抗计算器"
        description="微带线 / 带状线 / 差分对特征阻抗计算与反查（给定 Z₀ 求 W）。"
        example="基于 IPC-2141A + Wadell 近似公式，典型误差 ±5%。精确设计请用 Polar SI9000 等 2D 场求解器。"
      />
      <PcbImpedance />
    </div>
  );
}
