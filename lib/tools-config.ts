import {
  ArrowLeftRight,
  Binary,
  Cable,
  Calculator,
  ChevronRightSquare,
  CircuitBoard,
  Cpu,
  FileCode2,
  GraduationCap,
  Hash,
  LayoutGrid,
  MemoryStick,
  MessageSquareCode,
  Network,
  Palette,
  Router,
  Sigma,
  Timer,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ToolInfo {
  name: string;
  slug: string;
  description: string;
  icon: LucideIcon;
  priority: "P0" | "P1" | "P2";
}

export interface ToolCategory {
  name: string;
  slug: string;
  icon: LucideIcon;
  tools: ToolInfo[];
}

export const toolCategories: ToolCategory[] = [
  {
    name: "数据转换工具",
    slug: "converter",
    icon: ArrowLeftRight,
    tools: [
      {
        name: "进制转换器",
        slug: "base-converter",
        description: "hex/bin/dec/oct 互转，支持批量转换",
        icon: Hash,
        priority: "P0",
      },
      {
        name: "IEEE 754 浮点解析器",
        slug: "ieee754-parser",
        description: "可视化拆解符号位、指数、尾数",
        icon: Binary,
        priority: "P0",
      },
      {
        name: "字节序转换器",
        slug: "endian-converter",
        description: "大端/小端互转，支持 16/32/64 位",
        icon: ArrowLeftRight,
        priority: "P0",
      },
      {
        name: "校验和计算器",
        slug: "checksum-calculator",
        description: "CRC-8/16/32、XOR、累加和",
        icon: Sigma,
        priority: "P0",
      },
      {
        name: "ASCII/编码对照表",
        slug: "ascii-table",
        description: "ASCII、Unicode 速查，点击复制",
        icon: LayoutGrid,
        priority: "P1",
      },
    ],
  },
  {
    name: "协议调试工具",
    slug: "protocol",
    icon: Network,
    tools: [
      {
        name: "串口协议解析器",
        slug: "serial-parser",
        description: "自定义模板拆解 hex 数据帧",
        icon: Cable,
        priority: "P1",
      },
      {
        name: "MQTT 报文解析器",
        slug: "mqtt-parser",
        description: "解析 MQTT 包类型、QoS、Topic",
        icon: MessageSquareCode,
        priority: "P1",
      },
      {
        name: "JSON 协议构造器",
        slug: "json-builder",
        description: "可视化构建 JSON 指令帧",
        icon: FileCode2,
        priority: "P1",
      },
      {
        name: "Modbus 帧生成器",
        slug: "modbus-generator",
        description: "生成 RTU/TCP 帧并计算 CRC",
        icon: Router,
        priority: "P0",
      },
    ],
  },
  {
    name: "芯片与硬件工具",
    slug: "hardware",
    icon: Cpu,
    tools: [
      {
        name: "寄存器位域计算器",
        slug: "register-viewer",
        description: "可视化 32 位寄存器每个 bit",
        icon: CircuitBoard,
        priority: "P0",
      },
      {
        name: "GPIO 引脚分配表",
        slug: "gpio-planner",
        description: "拖拽分配 GPIO 复用功能",
        icon: Cpu,
        priority: "P2",
      },
      {
        name: "电阻色环计算器",
        slug: "resistor-calculator",
        description: "色环↔阻值互查，支持 4/5/6 环",
        icon: Palette,
        priority: "P1",
      },
      {
        name: "分压/RC 滤波计算器",
        slug: "rc-calculator",
        description: "计算分压比、截止频率，绘制波特图",
        icon: Calculator,
        priority: "P1",
      },
    ],
  },
  {
    name: "RTOS 可视化",
    slug: "rtos",
    icon: Timer,
    tools: [
      {
        name: "任务调度甘特图",
        slug: "task-scheduler",
        description: "模拟 FreeRTOS 抢占式调度",
        icon: Timer,
        priority: "P2",
      },
      {
        name: "内存布局可视化",
        slug: "memory-layout",
        description: "可视化 RAM/Flash 分区占用",
        icon: MemoryStick,
        priority: "P2",
      },
    ],
  },
  {
    name: "代码辅助工具",
    slug: "codegen",
    icon: FileCode2,
    tools: [
      {
        name: "位操作代码生成器",
        slug: "bit-operation",
        description: "勾选 bit 位，生成 C 语言位操作代码",
        icon: ChevronRightSquare,
        priority: "P1",
      },
      {
        name: "状态机编辑器",
        slug: "state-machine",
        description: "可视化绘制状态转移图，导出 C 代码",
        icon: FileCode2,
        priority: "P2",
      },
    ],
  },
  {
    name: "学习与求职",
    slug: "learning",
    icon: GraduationCap,
    tools: [
      {
        name: "嵌入式面试题库",
        slug: "interview-quiz",
        description: "C 语言、RTOS、协议题，随机刷题",
        icon: GraduationCap,
        priority: "P2",
      },
    ],
  },
];

export function getAllTools(): (ToolInfo & { category: string; categorySlug: string })[] {
  return toolCategories.flatMap((cat) =>
    cat.tools.map((tool) => ({
      ...tool,
      category: cat.name,
      categorySlug: cat.slug,
    }))
  );
}
