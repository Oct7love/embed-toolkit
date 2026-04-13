import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — 数据转换 | Embed Toolkit",
    default: "数据转换工具 | Embed Toolkit",
  },
  description: "进制转换、IEEE 754 浮点解析、字节序转换、CRC 校验和计算、ASCII 编码对照 — 嵌入式开发常用数据转换工具集合",
};

export default function ConverterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
