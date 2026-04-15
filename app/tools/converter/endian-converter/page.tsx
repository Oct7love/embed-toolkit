import type { Metadata } from "next";
import { EndianConverter } from "@/components/tools/endian-converter/endian-converter";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "字节序转换器",
  description: "Big-Endian / Little-Endian 一键互转，支持 16/32/64 位宽度",
};

export default function EndianConverterPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="字节序转换器"
        description="Big-Endian / Little-Endian 一键互转，支持 16/32/64 位宽度"
        example={`网络协议接收的字节流（大端）和 x86/ARM MCU 内存（小端）格式不同，本工具帮你快速换算字节顺序。`}
      />
      <EndianConverter />
    </div>
  );
}
