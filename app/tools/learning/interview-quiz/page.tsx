import type { Metadata } from "next";
import { InterviewQuiz } from "@/components/tools/interview-quiz/interview-quiz";
import { ALL_QUESTIONS } from "@/lib/interview-quiz";

export const metadata: Metadata = {
  title: "嵌入式面试题库",
  description: "C 语言陷阱、RTOS 概念、通信协议、硬件基础题，随机刷题 + 收藏 + 错题统计",
};

export default function InterviewQuizPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">嵌入式面试题库</h1>
        <p className="text-muted-foreground mt-1">
          共 {ALL_QUESTIONS.length} 道题，覆盖 C 语言陷阱、RTOS 概念、通信协议、硬件基础四大类
        </p>
      </div>
      <InterviewQuiz />
    </div>
  );
}
