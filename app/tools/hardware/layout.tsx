import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — 芯片硬件 | Embed Toolkit",
    default: "芯片与硬件工具 | Embed Toolkit",
  },
  description: "寄存器位域计算、GPIO 引脚分配、电阻色环计算、分压/RC 滤波计算 — 嵌入式硬件辅助工具集合",
};

export default function HardwareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
