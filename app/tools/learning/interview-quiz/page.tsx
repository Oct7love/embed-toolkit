import type { Metadata } from "next";
import { InterviewQuiz } from "@/components/tools/interview-quiz/interview-quiz";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "嵌入式面试题库",
  description: "C 语言陷阱、RTOS 概念、通信协议、硬件基础，共 446 道题 + 收藏 + 错题本 + 统计",
};

export default function InterviewQuizPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="嵌入式面试题库"
        description="C 语言陷阱、RTOS 概念、通信协议、硬件基础，共 446 道题 + 收藏 + 错题本 + 统计"
        example={`校招刷题利器：每题都有详细解析（80+ 字），覆盖指针陷阱、优先级反转、SPI 四种模式等高频考点。`}
      />
      <InterviewQuiz />
    </div>
  );
}
