import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Modbus 帧生成器",
  description: "选择功能码和参数，自动生成 Modbus RTU/TCP 帧并计算 CRC",
};

export default function ModbusGeneratorPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Modbus 帧生成器</CardTitle>
          <CardDescription>
            该工具正在开发中，敬请期待...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
