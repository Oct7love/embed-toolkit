import type { Metadata } from "next";
import { IEEE754Parser } from "@/components/tools/ieee754-parser/ieee754-parser";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "IEEE 754 浮点解析器",
  description: "可视化拆解 float/double 的符号位、指数位和尾数位，支持十六进制 ↔ 十进制双向转换",
};

export default function IEEE754ParserPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="IEEE 754 浮点解析器"
        description="可视化拆解 float/double 的符号位、指数位和尾数位，支持十六进制 ↔ 十进制双向转换"
        example={`例如 0x41200000 解析为 float 10.0，一眼看清每一位如何编码；特殊值 NaN/Infinity/Subnormal 也会标注。`}
      />
      <IEEE754Parser />
    </div>
  );
}
