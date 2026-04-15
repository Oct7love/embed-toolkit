import type { Metadata } from "next";
import { AsciiTable } from "@/components/tools/ascii-table/ascii-table";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "ASCII/编码对照表",
  description: "完整 ASCII 码表（0-127）+ 常用 Unicode 速查，支持搜索和点击复制",
};

export default function AsciiTablePage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="ASCII/编码对照表"
        description="完整 ASCII 码表（0-127）+ 常用 Unicode 速查，支持搜索和点击复制"
        example={`调试串口时收到 0x41 不知道是啥？它是字符 'A'。控制字符（如 0x0A 换行 LF）带中文说明。`}
      />
      <AsciiTable />
    </div>
  );
}
