import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — 协议调试 | Embed Toolkit",
    default: "协议调试工具 | Embed Toolkit",
  },
  description: "串口协议解析、MQTT 报文解析、JSON 协议构造、Modbus 帧生成 — 嵌入式通信协议调试工具集合",
};

export default function ProtocolLayout({ children }: { children: React.ReactNode }) {
  return children;
}
