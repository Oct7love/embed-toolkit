import type { Metadata } from "next";
import { ModbusGenerator } from "@/components/tools/modbus-generator/modbus-generator";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "Modbus 帧生成器",
  description: "选择功能码和参数，自动生成 Modbus RTU/TCP 帧并计算 CRC",
};

export default function ModbusGeneratorPage() {
  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      <ToolIntro
        title="Modbus 帧生成器"
        description="选择功能码和参数，自动生成 Modbus RTU/TCP 帧并计算 CRC"
        example={`读保持寄存器：从机 1、地址 0x0000、数量 10 → RTU 帧 01 03 00 00 00 0A C5 CD。`}
      />
      <ModbusGenerator />
    </div>
  );
}
