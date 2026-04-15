import type { Metadata } from "next";
import { JsonBuilder } from "@/components/tools/json-builder/json-builder";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "JSON 协议构造器",
  description: "可视化拖拽构建 JSON 指令帧，适用于 MCU 间 UART/MQTT 通信场景",
};

export default function JsonBuilderPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="JSON 协议构造器"
        description="可视化拖拽构建 JSON 指令帧，适用于 MCU 间 UART/MQTT 通信场景"
        example={`比如构造 {"cmd":"set_led","pin":13,"state":1} 给传感器节点，一键复制发送。`}
      />
      <JsonBuilder />
    </div>
  );
}
