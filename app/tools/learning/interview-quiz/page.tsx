import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "嵌入式面试题库",
  description: "C 语言陷阱、RTOS 概念、通信协议、硬件基础题，随机刷题",
};

export default function InterviewQuizPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>嵌入式面试题库</CardTitle>
          <CardDescription>
            该工具正在开发中，敬请期待...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
