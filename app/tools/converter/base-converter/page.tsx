import type { Metadata } from "next";
import { BaseConverter } from "@/components/tools/base-converter/base-converter";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "进制转换器",
  description: "Hex/Bin/Dec/Oct 四进制实时联动互转，支持 8/16/32/64 位有符号或无符号整数",
};

export default function BaseConverterPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="进制转换器"
        description="Hex/Bin/Dec/Oct 四进制实时联动互转，支持 8/16/32/64 位有符号或无符号整数"
        example={`调试 I2C 寄存器时，把 Hex 值 0x2A 快速转成二进制查看位域；批量模式适合处理抓包日志。`}
      />
      <BaseConverter />
    </div>
  );
}
