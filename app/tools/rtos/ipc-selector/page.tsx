import type { Metadata } from "next";
import { ToolIntro } from "@/components/shared/tool-intro";
import { IpcSelector } from "@/components/tools/ipc-selector/ipc-selector";

export const metadata: Metadata = {
  title: "信号量 / 互斥量 / 队列 选型决策树",
  description:
    "通过交互式问答，定位 FreeRTOS 同步与通信场景下最适合的 API（Mutex / Semaphore / Queue / Stream Buffer / Task Notification / Event Group / Timer 等）",
};

export default function Page() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <ToolIntro
        title="IPC 选型决策树"
        description="FreeRTOS 同步与通信 API 选择助手"
        example="在 Mutex、Semaphore、Queue、Stream Buffer、Task Notification、Event Group、Software Timer 之间犹豫？回答几个问题，得到含代码示例和使用陷阱的推荐方案。"
      />
      <IpcSelector />
    </div>
  );
}
