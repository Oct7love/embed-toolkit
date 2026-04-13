# Embed Toolkit

> 嵌入式开发者的在线工具箱 — 浏览器端一站式嵌入式开发工具集合

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 项目简介

Embed Toolkit 将嵌入式工程师日常开发中频繁用到的计算、转换、调试、可视化工具整合到一个现代化的 Web 应用中，替代散落在各处的零碎在线工具和本地脚本。

- **纯前端计算** — 所有计算均在浏览器本地完成，无需后端服务器
- **开箱即用** — 部署到 Vercel，打开即用
- **深色主题** — 专为工程师设计的科技蓝主题，支持亮/暗切换
- **响应式布局** — 桌面侧边栏，移动端底部 Tab

## 功能截图

> 📸 截图占位 — 项目开发完成后补充

| Dashboard | 工具页面 |
|:---:|:---:|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Tool Page](docs/screenshots/tool-page.png) |

| 暗色主题 | 移动端适配 |
|:---:|:---:|
| ![Dark Mode](docs/screenshots/dark-mode.png) | ![Mobile](docs/screenshots/mobile.png) |

## 功能模块（18 个工具，6 大分类）

### 一、数据转换工具

| 工具 | 说明 |
|------|------|
| 进制转换器 | hex/bin/dec/oct 互转，支持批量转换 |
| IEEE 754 浮点解析器 | 输入 4/8 字节 hex，可视化拆解符号位、指数、尾数 |
| 字节序转换器 | 大端/小端互转，支持 16/32/64 位宽度 |
| 校验和计算器 | CRC-8/16/32、XOR 校验、累加和，可自定义多项式和初始值 |
| ASCII/编码对照表 | ASCII、Unicode、GB2312 速查，点击复制 |

### 二、协议调试工具

| 工具 | 说明 |
|------|------|
| 串口协议解析器 | 粘贴 hex 数据帧，用自定义模板定义字段，自动拆解 |
| MQTT 报文解析器 | 粘贴原始字节流，解析 MQTT 包类型、QoS、Topic、Payload |
| JSON 协议构造器 | 可视化拖拽构建 JSON 指令帧（MCU 间 UART/MQTT 通信场景） |
| Modbus 帧生成器 | 选择功能码、起始地址、寄存器数量，自动生成 RTU/TCP 帧并计算 CRC |

### 三、芯片与硬件工具

| 工具 | 说明 |
|------|------|
| 寄存器位域计算器 | 输入 32 位寄存器值，可视化显示每个 bit 的含义 |
| GPIO 引脚分配表 | 选择芯片型号，拖拽分配 GPIO 复用功能，导出 C 代码 |
| 电阻色环计算器 | 选择色环颜色计算阻值，或输入阻值反查色环 |
| 分压/RC 滤波计算器 | 输入电阻电容参数，计算分压比和截止频率，绘制波特图 |

### 四、RTOS 可视化工具

| 工具 | 说明 |
|------|------|
| 任务调度甘特图 | 输入任务参数，模拟 FreeRTOS 抢占式调度，生成时序甘特图 |
| 内存布局可视化 | 手动配置或粘贴 .map 文件，可视化 RAM/Flash 分区占用情况 |

### 五、代码辅助工具

| 工具 | 说明 |
|------|------|
| 位操作代码生成器 | 勾选 bit 位，选择操作类型，自动生成 C 语言宏和函数 |
| 状态机编辑器 | 可视化拖拽绘制状态转移图，导出 C 语言 switch-case 框架代码 |

### 六、学习与求职

| 工具 | 说明 |
|------|------|
| 嵌入式面试题库 | C 语言陷阱题、RTOS 概念题、通信协议题，随机刷题 + 收藏 + 统计 |

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [Next.js](https://nextjs.org/) | 15 | App Router 全栈框架 |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | 类型安全 |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | 原子化样式 |
| [shadcn/ui](https://ui.shadcn.com/) | latest | UI 组件库 |
| [Recharts](https://recharts.org/) | 2.x | 图表可视化 |
| [Zustand](https://zustand-demo.pmnd.rs/) | 5.x | 轻量状态管理 |
| [pnpm](https://pnpm.io/) | 9.x | 包管理 |

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
pnpm type-check       # TypeScript 类型检查
```

## 项目结构

```
embed-toolkit/
├── app/                        # Next.js App Router 页面
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 首页 Dashboard
│   └── tools/[category]/[tool-name]/
├── components/
│   ├── layout/                 # 布局组件（侧边栏、Header）
│   ├── shared/                 # 共享组件（HexInput、BitGrid）
│   ├── ui/                     # shadcn/ui 组件
│   └── tools/[tool-name]/      # 工具专属组件
├── lib/[tool-name]/            # 工具计算逻辑（纯函数）
├── stores/                     # Zustand 状态管理
├── types/                      # TypeScript 类型定义
├── docs/                       # 项目文档
└── public/                     # 静态资源
```

## 部署

### Vercel 一键部署

1. Fork 本仓库
2. 在 [Vercel](https://vercel.com) 导入项目
3. 无需配置环境变量，直接部署

### 手动部署

```bash
pnpm build
pnpm start
```

构建产物在 `.next/` 目录下，也可导出为静态站点：

```bash
# 如使用静态导出
pnpm build
# 产物在 out/ 目录，可部署到任意静态托管服务
```

## 开发指南

- 详细开发规范见 [CLAUDE.md](./CLAUDE.md)
- 每个工具模块作为独立 PR 提交
- 计算逻辑与 UI 严格分离，方便测试
- 使用 git worktree 进行模块隔离开发

## 作者

**陈旭东** — 广东工业大学 电子信息工程本科，专注嵌入式开发

## License

MIT
