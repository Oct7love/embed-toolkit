import {
  ArrowLeftRight,
  BellRing,
  Binary,
  BookOpen,
  Boxes,
  Cable,
  Calculator,
  ChevronRightSquare,
  CircuitBoard,
  Clock,
  Cpu,
  FileCode2,
  Gauge,
  GitBranch,
  GraduationCap,
  Hash,
  Layers,
  Layers3,
  LayoutGrid,
  MemoryStick,
  MessageSquareCode,
  Microscope,
  Network,
  Palette,
  Radar,
  Router,
  ShieldCheck,
  Sigma,
  SlidersHorizontal,
  Timer,
  Wrench,
  Zap,
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
        description: "Hex/Bin/Dec/Oct 四进制实时联动互转，支持有符号整数和批量模式",
        icon: Hash,
        priority: "P0",
      },
      {
        name: "IEEE 754 浮点解析器",
        slug: "ieee754-parser",
        description: "输入 Hex 可视化拆解符号位、指数、尾数，支持 float/double 双向转换",
        icon: Binary,
        priority: "P0",
      },
      {
        name: "字节序转换器",
        slug: "endian-converter",
        description: "Big-Endian / Little-Endian 一键互转，支持 16/32/64 位宽度",
        icon: ArrowLeftRight,
        priority: "P0",
      },
      {
        name: "校验和计算器",
        slug: "checksum-calculator",
        description: "CRC-8/16/32、XOR、累加和，内置 MODBUS/CCITT 等常用预设，支持自定义多项式",
        icon: Sigma,
        priority: "P0",
      },
      {
        name: "ASCII/编码对照表",
        slug: "ascii-table",
        description: "完整 ASCII 码表 + 常用 Unicode 速查，支持搜索和点击复制",
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
        description: "粘贴 Hex 数据帧，用自定义模板定义帧头/长度/数据/校验字段，彩色高亮拆解",
        icon: Cable,
        priority: "P1",
      },
      {
        name: "MQTT 报文解析器",
        slug: "mqtt-parser",
        description: "粘贴原始字节流，解析 MQTT 固定头、报文类型、QoS、Topic、Payload",
        icon: MessageSquareCode,
        priority: "P1",
      },
      {
        name: "JSON 协议构造器",
        slug: "json-builder",
        description: "可视化拖拽构建 JSON 指令帧，适用于 MCU 间 UART/MQTT 通信场景",
        icon: FileCode2,
        priority: "P1",
      },
      {
        name: "Modbus 帧生成器",
        slug: "modbus-generator",
        description: "选择功能码和参数，自动生成 Modbus RTU/TCP 帧，含 CRC 校验和字段拆解",
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
        description: "32 位寄存器 Bit 网格可视化，支持自定义位域模板和点击翻转",
        icon: CircuitBoard,
        priority: "P0",
      },
      {
        name: "GPIO 引脚分配表",
        slug: "gpio-planner",
        description: "选择芯片型号，拖拽分配 GPIO 复用功能，自动检测冲突并导出 C 初始化代码",
        icon: Cpu,
        priority: "P2",
      },
      {
        name: "电阻色环计算器",
        slug: "resistor-calculator",
        description: "选择色环颜色计算阻值 / 输入阻值反查色环，支持 4/5/6 环和 E 系列推荐值",
        icon: Palette,
        priority: "P1",
      },
      {
        name: "分压/RC 滤波计算器",
        slug: "rc-calculator",
        description: "电阻分压 + RC 低通/高通滤波器，计算截止频率并绘制波特图",
        icon: Calculator,
        priority: "P1",
      },
      {
        name: "定时器/PWM 计算器",
        slug: "timer-calculator",
        description: "输入系统时钟和目标频率，自动计算 PSC/ARR/CCR 所有可行组合，支持 PWM 占空比",
        icon: Clock,
        priority: "P1",
      },
      {
        name: "波特率误差计算器",
        slug: "baudrate-calculator",
        description: "计算 UART 分频系数和实际波特率误差，支持 8x/16x 过采样和批量对比",
        icon: Gauge,
        priority: "P1",
      },
      {
        name: "ADC 采样计算器",
        slug: "adc-calculator",
        description: "计算 ADC 转换时间、最大采样率、LSB 精度和 DMA 缓冲区建议",
        icon: Zap,
        priority: "P1",
      },
      {
        name: "时钟树配置器",
        slug: "clock-tree",
        description: "可视化 STM32 时钟树，配置 HSI/HSE/PLL/AHB/APB 分频，导出 SystemClock_Config 代码",
        icon: Network,
        priority: "P1",
      },
      {
        name: "MCU 选型对比器",
        slug: "mcu-compare",
        description: "选 2-4 款芯片对比 CPU/主频/Flash/RAM/外设/卖点，雷达图 + 差异表，缺数据明示 — 不编造",
        icon: Radar,
        priority: "P2",
      },
      {
        name: "PCB 阻抗计算器",
        slug: "pcb-impedance",
        description: "微带线 / 带状线 / 差分对（IPC-2141A + Wadell 近似公式，典型误差 ±5%）+ 反查线宽 + SVG 截面",
        icon: Layers3,
        priority: "P2",
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
        description: "输入任务优先级和周期，模拟 FreeRTOS 抢占式调度并生成时序甘特图",
        icon: Timer,
        priority: "P2",
      },
      {
        name: "内存布局可视化",
        slug: "memory-layout",
        description: "手动配置或粘贴 .map 文件，可视化 RAM/Flash 各段分区占用和剩余空间",
        icon: MemoryStick,
        priority: "P2",
      },
      {
        name: "PID 调参模拟器",
        slug: "pid-simulator",
        description: "调节 Kp/Ki/Kd 参数，实时仿真阶跃响应曲线，显示上升时间/超调量/稳态误差",
        icon: SlidersHorizontal,
        priority: "P1",
      },
      {
        name: "任务栈深度估算器",
        slug: "stack-estimator",
        description: "按调用链估算 FreeRTOS/RT-Thread 任务栈，含 ISR/printf 修正和 30% 安全余量",
        icon: Layers,
        priority: "P2",
      },
      {
        name: "IPC 选型决策树",
        slug: "ipc-selector",
        description: "决策树问答推荐 Mutex/Semaphore/Queue/Stream Buffer/Notification，给出代码与陷阱",
        icon: GitBranch,
        priority: "P2",
      },
      {
        name: "优先级反转可视化",
        slug: "priority-inversion",
        description: "3 任务 + Mutex 场景仿真，对比有/无优先级继承的甘特图和 high 等待时间",
        icon: ShieldCheck,
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
        description: "可视化勾选 Bit 位，选择置位/清零/翻转操作，自动生成 C 语言宏和函数",
        icon: ChevronRightSquare,
        priority: "P1",
      },
      {
        name: "状态机编辑器",
        slug: "state-machine",
        description: "拖拽绘制状态转移图，标注事件和动作，自动导出 C 语言 switch-case 框架",
        icon: FileCode2,
        priority: "P2",
      },
      {
        name: "外设驱动模板生成器",
        slug: "driver-template",
        description: "选 MCU 系列 + 外设（UART/SPI/I2C/ADC/TIM/PWM）+ 风格（HAL/LL/Arduino），生成可编译 .h/.c 双文件",
        icon: Wrench,
        priority: "P2",
      },
      {
        name: "中断服务程序模板",
        slug: "isr-template",
        description: "选中断类型（EXTI/TIM/UART/ADC/DMA/SysTick）+ 通知机制，生成 ISR 框架，含临界区与陷阱注释",
        icon: BellRing,
        priority: "P2",
      },
      {
        name: "嵌入式数据结构生成器",
        slug: "data-structure",
        description: "环形缓冲区 / 状态机宏 / 软件定时器 / 事件 Pub/Sub 四种数据结构一键生成 .h/.c",
        icon: Boxes,
        priority: "P2",
      },
      {
        name: "API 速查卡",
        slug: "api-cheatsheet",
        description: "FreeRTOS + STM32 HAL 共 60+ 常用 API，按分类筛选 + 搜索 + 典型用法 + 常见陷阱",
        icon: BookOpen,
        priority: "P2",
      },
      {
        name: "CMSIS-SVD 查看器",
        slug: "svd-viewer",
        description: "粘贴或上传 CMSIS-SVD 文件，可视化外设寄存器位域。纯前端解析，文件不上传任何服务器",
        icon: Microscope,
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
        description: "C 语言陷阱、RTOS 概念、通信协议、硬件基础题，随机刷题 + 收藏 + 错题统计",
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
