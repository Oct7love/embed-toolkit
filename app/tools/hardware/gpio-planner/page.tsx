import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function gpioplannerPage() {
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
