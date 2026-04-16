# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-04-16

5 个新工具 + 8 款新芯片定义，工具总数从 18 增加到 23，芯片支持从 2 增加到 10。

### 新增工具

- **定时器/PWM 计算器** (`/tools/hardware/timer-calculator`) — 输入系统时钟和目标频率，自动计算 PSC/ARR/CCR 所有可行组合，支持芯片时钟预设（STM32F1/F4/H7/ESP32）
- **波特率误差计算器** (`/tools/hardware/baudrate-calculator`) — UART 分频系数、实际波特率、误差百分比（颜色编码），支持 8x/16x 过采样和批量对比
- **ADC 采样计算器** (`/tools/hardware/adc-calculator`) — 计算 ADC 转换时间、最大采样率、LSB 精度和 DMA 缓冲区建议，支持 STM32F1/F4 预设
- **时钟树配置器** (`/tools/hardware/clock-tree`) — 可视化 STM32 时钟树（F1/F4/H7），配置 HSI/HSE/PLL/AHB/APB 分频，红色警告超限频率，导出 HAL 风格 SystemClock_Config() C 代码
- **PID 调参模拟器** (`/tools/rtos/pid-simulator`) — Kp/Ki/Kd 滑块实时仿真，3 种系统模型（一阶/二阶/积分），Recharts 阶跃响应图，性能指标（上升时间/超调量/调节时间/稳态误差），3 套预设（电机/温控/平衡车）

### 新增芯片定义（GPIO 引脚分配器）

- **STM32F103RCT6** — LQFP64，3 UART / 2 SPI / 2 I2C
- **STM32F103ZET6** — LQFP144，5 UART / 3 SPI / 2 I2C，全引出
- **STM32F407VET6** — LQFP100，F4 系列，DSP + FPU
- **STM32F411CEU6** — QFN48，黑色药丸板（BlackPill）
- **STM32G431RBT6** — LQFP64，G4 系列，电机控制
- **ESP32-S3** — 双核 LX7 + USB OTG + AI 加速
- **ESP32-C3** — RISC-V 单核 + Wi-Fi/BLE
- **GD32F103C8T6** — 国产 STM32 替代，AF 标注 GD32 命名差异

---

## [1.0.0] - 2026-04-15

首个正式版本 — 18 个嵌入式开发工具 + 446 道面试题库全部完成。

🌐 **Live Demo**：<https://embed-toolkit.vercel.app/>

### Phase 1: 基础框架搭建

- Initialize Next.js 16 + TypeScript + Tailwind CSS 4 + App Router
- Integrate shadcn/ui (基于 @base-ui/react) with base components: Button/Card/Input/Select/Dialog/Tooltip/Toast/Tabs/Badge/Separator/ScrollArea
- Configure JetBrains Mono monospace font via next/font
- Implement dark/light theme switching (next-themes, 默认暗色，科技蓝主色调 `#2563EB`)
- Build sidebar navigation with 6 collapsible tool categories (lib/tools-config.ts)
- Build responsive layout: desktop 260px fixed sidebar + mobile bottom tabs with safe-area-inset
- Create Dashboard homepage with search, recent tools, category grid
- Generate 18 tool placeholder pages with SEO metadata per category
- Create shared components: `HexInput`, `BitGrid`, `CopyButton`, `CodeBlock`
- Set up global Zustand store `app-store` with localStorage persistence (sidebar state, recent tools)
- Configure ESLint + Prettier

### Phase 2: P0 核心数据转换工具（6 个）

- **进制转换器** (`/tools/converter/base-converter`) — hex/bin/dec/oct 四进制实时互转，支持 8/16/32/64 位有/无符号和批量转换
- **IEEE 754 浮点解析器** (`/tools/converter/ieee754-parser`) — 可视化符号/指数/尾数位，支持 Float32/Float64 双向转换
- **字节序转换器** (`/tools/converter/endian-converter`) — 大端/小端互转
- **校验和计算器** (`/tools/converter/checksum-calculator`) — CRC-8/16/32、XOR、累加和，内置 9 种 CRC 预设
- **Modbus 帧生成器** (`/tools/protocol/modbus-generator`) — RTU/TCP 帧生成，复用 CRC 计算逻辑
- **寄存器位域计算器** (`/tools/hardware/register-viewer`) — 32 位 Bit 网格可视化 + 自定义位域模板 + STM32 预设

### Phase 3: P1 协议与硬件工具（7 个）

- **ASCII/编码对照表** (`/tools/converter/ascii-table`) — 完整 ASCII 码表 + 控制字符中文说明 + 搜索
- **电阻色环计算器** (`/tools/hardware/resistor-calculator`) — 4/5/6 环双向查询 + SVG 电阻图 + E 系列推荐值
- **串口协议解析器** (`/tools/protocol/serial-parser`) — 自定义协议模板 + FieldHighlighter 彩色拆解 + 校验验证
- **MQTT 报文解析器** (`/tools/protocol/mqtt-parser`) — 固定头/可变头/Payload 树形解析
- **JSON 协议构造器** (`/tools/protocol/json-builder`) — 可视化拖拽 + 模板保存
- **位操作代码生成器** (`/tools/codegen/bit-operation`) — C 语言宏/内联函数两种风格
- **分压/RC 滤波计算器** (`/tools/hardware/rc-calculator`) — Recharts 波特图 + 分压 + 低/高通滤波器
- 新增共享组件：`FieldHighlighter`（协议帧字段高亮）
- 新增依赖：`recharts@3.x`

### Phase 4: P2 可视化高级工具（5 个）+ 面试题库

- **任务调度甘特图** (`/tools/rtos/task-scheduler`) — FreeRTOS 抢占式调度模拟 + SVG 甘特图 + 可调度性分析
- **内存布局可视化** (`/tools/rtos/memory-layout`) — GCC .map 文件解析 + Flash/RAM 堆叠图 + 重叠警告
- **GPIO 引脚分配表** (`/tools/hardware/gpio-planner`) — STM32F103C8T6 + ESP32 芯片定义 + 功能冲突检测 + C 代码导出
- **状态机编辑器** (`/tools/codegen/state-machine`) — SVG 画布拖拽 + 属性面板 + switch-case 代码生成
- **嵌入式面试题库** (`/tools/learning/interview-quiz`) — 446 道题 + 收藏 + 错题本 + 分类统计
  - C 语言陷阱：127 题（指针、内存对齐、位运算、const/volatile/static、函数指针、宏与 typedef）
  - RTOS 概念：107 题（任务调度、同步机制、优先级反转、中断处理、内存管理、RT-Thread）
  - 通信协议：107 题（UART、SPI、I2C、CAN、Modbus RTU/TCP、MQTT QoS/Topic/Retain）
  - 硬件基础：105 题（GPIO、ADC/DAC、PWM/定时器/DMA、时钟树、电源、数电模电基础）

### Documentation

- `README.md` — 项目介绍 + 功能清单 + 开发指南
- `CLAUDE.md` — 供 Claude Code agent 阅读的开发规范
- `docs/prd.md` — 产品需求文档（18 工具详细需求 + P0/P1/P2 优先级 + 验收标准）
- `docs/tech_stack.md` — 技术栈选型理由 + 部署方案（Vercel 免费 + 自建服务器）
- `docs/app_flow.md` — 路由结构 + 页面跳转关系 + Mermaid 流程图
- `docs/frontend_guideline.md` — 组件模式、样式、主题、响应式、无障碍规范
- `docs/backend_structure.md` — Zustand store + 各工具数据模型 + localStorage schema
- `docs/implementation_plan.md` — 4 阶段分批计划 + agent-team 协作策略 + 实际开发记录

---

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (based on @base-ui/react)
- **Charts**: Recharts 3
- **State**: Zustand 5 + localStorage persistence
- **Theme**: next-themes (dark-first)
- **Fonts**: JetBrains Mono (via next/font)
- **Package Manager**: pnpm 10
- **Deployment**: Vercel (recommended) / self-hosted Node.js / Nginx static export

## Credits

- **项目作者**：陈旭东（广东工业大学电子信息工程本科）
- **开发方式**：Claude Code + agent-team + git worktree 协作开发
- **开发时长**：2026-04-13 ~ 2026-04-15（13 天）
- **开源协议**：MIT
