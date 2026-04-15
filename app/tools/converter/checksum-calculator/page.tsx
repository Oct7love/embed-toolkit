import type { Metadata } from "next";
import { ChecksumCalculator } from "@/components/tools/checksum-calculator/checksum-calculator";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "校验和计算器",
  description: "CRC-8/16/32、XOR、累加和计算，内置 MODBUS/CCITT 等常用预设，支持自定义多项式",
};

export default function ChecksumCalculatorPage() {
  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      <ToolIntro
        title="校验和计算器"
        description="CRC-8/16/32、XOR、累加和计算，内置 MODBUS/CCITT 等常用预设，支持自定义多项式"
        example={`Modbus RTU 帧 01 03 00 00 00 0A 的 CRC-16/MODBUS 校验为 0xCDC5，可用本工具验证。`}
      />
      <ChecksumCalculator />
    </div>
  );
}
