import type { Metadata } from "next";
import { MqttParser } from "@/components/tools/mqtt-parser/mqtt-parser";

export const metadata: Metadata = {
  title: "MQTT 报文解析器",
  description: "解析 MQTT 原始字节流的报文类型、QoS、Topic、Payload",
};

export default function MqttParserPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">MQTT 报文解析器</h1>
        <p className="text-muted-foreground mt-1">
          粘贴原始字节流，解析 MQTT 固定头、报文类型、QoS、Topic、Payload
        </p>
      </div>
      <MqttParser />
    </div>
  );
}
