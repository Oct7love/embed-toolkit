import type { Metadata } from "next";
import { MqttParser } from "@/components/tools/mqtt-parser/mqtt-parser";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "MQTT 报文解析器",
  description: "粘贴原始字节流，解析 MQTT 固定头、报文类型、QoS、Topic、Payload",
};

export default function MqttParserPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="MQTT 报文解析器"
        description="粘贴原始字节流，解析 MQTT 固定头、报文类型、QoS、Topic、Payload"
        example={`例如 30 0B 00 04 74 65 73 74 68 65 6C 6C 6F 是 PUBLISH 报文，Topic=test，Payload=hello。`}
      />
      <MqttParser />
    </div>
  );
}
