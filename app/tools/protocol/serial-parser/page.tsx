import type { Metadata } from "next";
import { SerialParser } from "@/components/tools/serial-parser/serial-parser";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "串口协议解析器",
  description: "粘贴 Hex 数据帧，用自定义模板定义帧头/长度/数据/校验字段，彩色高亮拆解",
};

export default function SerialParserPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="串口协议解析器"
        description="粘贴 Hex 数据帧，用自定义模板定义帧头/长度/数据/校验字段，彩色高亮拆解"
        example={`自定义协议帧 AA 55 03 01 02 03 AB，设置好模板即可自动识别各字段，并验证校验和。`}
      />
      <SerialParser />
    </div>
  );
}
