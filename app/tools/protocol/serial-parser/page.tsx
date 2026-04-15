import type { Metadata } from "next";
import { SerialParser } from "@/components/tools/serial-parser/serial-parser";

export const metadata: Metadata = {
  title: "串口协议解析器",
  description: "粘贴 Hex 数据帧，用自定义模板定义字段，彩色高亮拆解",
};

export default function SerialParserPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">串口协议解析器</h1>
        <p className="text-muted-foreground mt-1">
          粘贴 Hex 数据帧，用自定义模板定义帧头/长度/数据/校验字段，彩色高亮拆解
        </p>
      </div>
      <SerialParser />
    </div>
  );
}
