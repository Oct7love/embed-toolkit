import { ModbusGenerator } from "@/components/tools/modbus-generator/modbus-generator";

export default function ModbusGeneratorPage() {
  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Modbus 帧生成器</h1>
        <p className="text-sm text-muted-foreground">
          生成 Modbus RTU/TCP 请求帧，支持常用功能码，自动计算 CRC-16
        </p>
      </div>
      <ModbusGenerator />
    </div>
  );
}
