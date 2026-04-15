# Embed Toolkit

> 嵌入式开发者的在线工具箱 — 浏览器端一站式嵌入式开发工具集合

![Status](https://img.shields.io/badge/Status-Completed-brightgreen)
![Tools](https://img.shields.io/badge/Tools-18%2F18-blue)
![Questions](https://img.shields.io/badge/Questions-446-orange)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 项目简介

Embed Toolkit 将嵌入式工程师日常开发中频繁用到的计算、转换、调试、可视化工具整合到一个现代化的 Web 应用中，替代散落在各处的零碎在线工具和本地脚本。

- **纯前端计算** — 所有计算均在浏览器本地完成，无需后端服务器
- **开箱即用** — 部署到 Vercel，打开即用
- **深色主题** — 专为工程师设计的科技蓝主题，支持亮/暗切换
- **响应式布局** — 桌面侧边栏，移动端底部 Tab

## 在线体验

🌐 **Demo**：[https://embed-toolkit.vercel.app](https://embed-toolkit.vercel.app)

> 所有工具均已上线可用，无需注册，打开即用。本地/离线使用见下方「本地开发」章节。

## 功能模块（18 个工具，6 大分类，全部完成 ✅）

### 一、数据转换工具

| 工具 | 说明 | 状态 |
|------|------|:----:|
| 进制转换器 | hex/bin/dec/oct 互转，支持批量转换 | ✅ |
| IEEE 754 浮点解析器 | 输入 4/8 字节 hex，可视化拆解符号位、指数、尾数 | ✅ |
| 字节序转换器 | 大端/小端互转，支持 16/32/64 位宽度 | ✅ |
| 校验和计算器 | CRC-8/16/32、XOR 校验、累加和，可自定义多项式和初始值 | ✅ |
| ASCII/编码对照表 | ASCII、Unicode、GB2312 速查，点击复制 | ✅ |

### 二、协议调试工具

| 工具 | 说明 | 状态 |
|------|------|:----:|
| 串口协议解析器 | 粘贴 hex 数据帧，用自定义模板定义字段，自动拆解 | ✅ |
| MQTT 报文解析器 | 粘贴原始字节流，解析 MQTT 包类型、QoS、Topic、Payload | ✅ |
| JSON 协议构造器 | 可视化拖拽构建 JSON 指令帧（MCU 间 UART/MQTT 通信场景） | ✅ |
| Modbus 帧生成器 | 选择功能码、起始地址、寄存器数量，自动生成 RTU/TCP 帧并计算 CRC | ✅ |

### 三、芯片与硬件工具

| 工具 | 说明 | 状态 |
|------|------|:----:|
| 寄存器位域计算器 | 输入 32 位寄存器值，可视化显示每个 bit 的含义 | ✅ |
| GPIO 引脚分配表 | 选择芯片型号（STM32F103C8T6/ESP32），拖拽分配复用功能，导出 C 代码 | ✅ |
| 电阻色环计算器 | 选择色环颜色计算阻值，或输入阻值反查色环 | ✅ |
| 分压/RC 滤波计算器 | 输入电阻电容参数，计算分压比和截止频率，绘制波特图 | ✅ |

### 四、RTOS 可视化工具

| 工具 | 说明 | 状态 |
|------|------|:----:|
| 任务调度甘特图 | 输入任务参数，模拟 FreeRTOS 抢占式调度，生成时序甘特图 | ✅ |
| 内存布局可视化 | 手动配置或粘贴 .map 文件，可视化 RAM/Flash 分区占用情况 | ✅ |

### 五、代码辅助工具

| 工具 | 说明 | 状态 |
|------|------|:----:|
| 位操作代码生成器 | 勾选 bit 位，选择操作类型，自动生成 C 语言宏和函数 | ✅ |
| 状态机编辑器 | 可视化拖拽绘制状态转移图，导出 C 语言 switch-case 框架代码 | ✅ |

### 六、学习与求职

| 工具 | 说明 | 状态 |
|------|------|:----:|
| 嵌入式面试题库 | **446 道题**（C 语言 127 + RTOS 107 + 协议 107 + 硬件 105）+ 收藏 + 错题本 + 统计面板 | ✅ |

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [Next.js](https://nextjs.org/) | 16 | App Router 全栈框架 |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | 类型安全 |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | 原子化样式 |
| [shadcn/ui](https://ui.shadcn.com/) | latest | UI 组件库（基于 @base-ui/react） |
| [Recharts](https://recharts.org/) | 3.x | 图表可视化（波特图、甘特图） |
| [Zustand](https://zustand-demo.pmnd.rs/) | 5.x | 轻量状态管理 + localStorage 持久化 |
| [pnpm](https://pnpm.io/) | 10.x | 包管理 |

## 本地开发

### 环境要求

- Node.js >= 18
- pnpm >= 9

### 快速开始

```bash
# 克隆仓库
git clone https://github.com/Oct7love/embed-toolkit.git
cd embed-toolkit

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 常用命令

```bash
pnpm dev              # 启动开发服务器（默认端口 3000）
pnpm build            # 生产环境构建
pnpm start            # 启动生产服务器
pnpm lint             # ESLint 代码检查
```

## 项目结构

```
embed-toolkit/
├── app/                        # Next.js App Router 页面
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 首页 Dashboard
│   └── tools/[category]/[tool-name]/
├── components/
│   ├── layout/                 # 布局组件（侧边栏、Header、MobileNav）
│   ├── shared/                 # 共享组件（HexInput、BitGrid、CopyButton、FieldHighlighter）
│   ├── ui/                     # shadcn/ui 组件
│   └── tools/[tool-name]/      # 工具专属组件
├── lib/[tool-name]/            # 工具计算逻辑（纯函数）
├── stores/                     # Zustand 状态管理
├── types/                      # TypeScript 类型定义
├── docs/                       # 项目文档
└── public/                     # 静态资源
```

## 部署

### Vercel 一键部署（推荐）

1. Fork 本仓库
2. 在 [Vercel](https://vercel.com) 导入项目
3. 无需配置环境变量，直接部署

### 自建服务器部署

详见 [docs/tech_stack.md](./docs/tech_stack.md#62-未来迁移方案自建服务器2-核-2gb) 中的自建服务器方案（2 核 2GB 服务器上用 Node.js 或 Nginx 静态托管）。

## 开发指南

- 详细开发规范见 [CLAUDE.md](./CLAUDE.md)
- 项目规划文档见 [docs/](./docs/)
- 更新日志见 [CHANGELOG.md](./CHANGELOG.md)

## 作者

**陈旭东** — 广东工业大学 电子信息工程本科，专注嵌入式开发

### 开发历程

本项目是 **Claude Code + agent-team + git worktree** 协作开发模式的完整实践：

- **开发时长**：2026-04-13 ~ 2026-04-15，共 13 天
- **开发方式**：主 Agent 负责架构、规划、审查与合并；每阶段启动 3-4 个 worktree 隔离 Agent 并行开发独立工具模块，通过 PR 合并到 `dev` 分支
- **四个阶段**
  - **阶段一**：项目骨架、布局系统、共享组件（主 Agent 独立完成）
  - **阶段二**：6 个 P0 核心工具（3 Agent 并行，3 PR）
  - **阶段三**：7 个 P1 工具（4 Agent 并行，含 Recharts 集成、FieldHighlighter 共享组件）
  - **阶段四**：5 个 P2 工具（4 Agent 并行）+ 446 道面试题库（分 16 批次迭代生成）
- **产出**：18 个工具、446 道题、6 个规划文档、约 16000+ 行代码、零构建警告
- **协作经验**：记录在 [docs/implementation_plan.md](./docs/implementation_plan.md#实际开发记录) 的「实际开发记录」章节

## License

MIT
