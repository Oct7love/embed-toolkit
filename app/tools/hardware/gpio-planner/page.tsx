import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "GPIO 引脚分配表",
  description: "选择芯片型号，拖拽分配 GPIO 复用功能，检测冲突并导出 C 代码",
};

export default function GpioPlannerPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>GPIO 引脚分配表</CardTitle>
          <CardDescription>
            该工具正在开发中，敬请期待...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
