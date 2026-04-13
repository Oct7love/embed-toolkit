import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "电阻色环计算器",
  description: "色环颜色↔阻值双向互查，支持 4/5/6 环和 E 系列标准值",
};

export default function ResistorCalculatorPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>电阻色环计算器</CardTitle>
          <CardDescription>
            该工具正在开发中，敬请期待...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
