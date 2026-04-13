import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "位操作代码生成器",
  description: "可视化勾选 Bit 位，自动生成 C 语言位操作宏和函数",
};

export default function BitOperationPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>位操作代码生成器</CardTitle>
          <CardDescription>
            该工具正在开发中，敬请期待...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
