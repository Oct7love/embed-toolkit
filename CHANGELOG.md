# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-04-18

3 款新工具按 karpathy guidelines（Think Before Coding / Simplicity First / Surgical Changes / Goal-Driven Execution）开发，3 worktree 并行 agent 实现。工具数 30 → 33，测试数 181 → 248。

### Added

- **MCU 选型对比器** (`/tools/hardware/mcu-compare`) — 2-4 款芯片对比 CPU/主频/Flash/RAM/外设/卖点。Recharts 雷达图（Performance 用 `MHz × DMIPS/MHz` 系数加权）+ 差异表（相同字段折叠、不同字段高亮）+ URL state 分享（`?ids=stm32f103c8t6,stm32f407vgt6`）。**最多 4 款上限**，超过禁用 + 提示。**缺数据一律渲染 `"—"`，绝不编造**。22 vitest 用例。图标 `Radar`
- **PCB 阻抗计算器** (`/tools/hardware/pcb-impedance`) — 微带线（IPC-2141A §4.2.1）/ 带状线（IPC-2141A §4.2.2）/ 差分对（Wadell 1991）三种几何，每个 lib 子文件顶部注明 source。反查线宽用牛顿迭代（≤30 步，0.01Ω 收敛阈值）+ 二分扫描兜底。SVG 截面图按参数缩放。mil ↔ mm 双制（内部 mm，常量 `MIL_TO_MM`）。**ToolIntro 明示典型误差 ±5%，精确设计请用 Polar SI9000**。15 vitest 用例。图标 `Layers3`
- **CMSIS-SVD 查看器** (`/tools/codegen/svd-viewer`) — 粘贴或上传 .svd 文件可视化 STM32/Espressif 寄存器位域。**零依赖 XML 解析**：浏览器走原生 `DOMParser`，node test 走 80 行专用最小 XML 扫描器。左树右详 + register name/field name 模糊搜索 + 文件 10MB 上限。**纯前端解析，文件不上传**。内置 STM32F103 GPIOA + RCC 迷你 SVD 示例（约 4KB 内联常量）。30 vitest 用例（含 BitGrid 回归契约测试）。图标 `Microscope`
- **数据扩字段**：`public/chips/index.json` 在每条 chip 末尾追加 `cpu / maxFreq / flashKB / ramKB / voltage / peripherals / features / priceRange`。9 款主流芯片完整规格 + 27 款基础规格 + 9 款仅基础。**现有 6 字段（id/name/series/manufacturer/package/pinCount）顺序、内容、缩进零修改**。`scripts/enrich-chip-specs.ts` 幂等生成器
- **BitGrid 共享组件 surgical 扩展**：在 `BitGridProps` 末尾追加 **可选** `fields?: Array<{ startBit, endBit, name, color? }>` prop，BitGrid 内部仅在 `fields && fields.length > 0` 时多渲染一段 FieldBars 子组件。**3 处现有调用（register-viewer / ieee754-parser / bit-operation-generator）零修改**，新增 BitGrid 回归契约测试守护"不传 fields 时与 v1.3 行为一致"

### Fixed

- **(svd-viewer) ARIA treeitem aria-selected 警告**：`<li role="treeitem">` 缺 `aria-selected`，触发 `jsx-a11y/role-has-required-aria-props`。Peripheral 节点 `aria-selected={false}`（不可选只可展开），Register 节点 `aria-selected={isSelected}`

### Changed

- **package.json version 1.3.0 → 1.4.0**
- **计数同步（README / CHANGELOG / CLAUDE.md）**：33 工具 / 45 芯片 / 446 题 / 248 测试
- **工具分类小计**：硬件 8 → 10、代码辅助 6 → 7
- 测试 181 → 248（+67：mcu-compare 22 + pcb-impedance 15 + svd-viewer 30）
- tools-config.ts 注册 3 个新工具图标：`Radar / Layers3 / Microscope`
- **eslint.config.mjs** 加 `.claude/worktrees/**` 到 globalIgnores，避免 agent worktree 的源代码被双重 lint 出幽灵 warning

### Process notes

本版本严格按 karpathy 4 准则开发：

1. **Think Before Coding** — 3 份 planning doc（`docs/planning/v1.4-*.md`）先列假设、开放问题、可选方案，等用户拍板再开工
2. **Simplicity First** — 不引第三方 XML / 阻抗求解 / 数据可视化库；svd-viewer 自写 80 行 XML 扫描器替代 jsdom；mcu-compare 单文件 168 行；pcb-impedance 单组件 < 200 行
3. **Surgical Changes** — chips/index.json 只追加新字段不动旧字段；BitGrid 只加可选 prop 不破坏调用方；3 worktree 并行路径不重叠零冲突
4. **Goal-Driven Execution** — 每个工具 planning §5 列可验证标准 → TDD 先红后绿；67 个新测试覆盖核心算法

---

## [1.3.0] - 2026-04-17

工具集从 23 → 30，重点扩充 RTOS 与代码辅助两大类，加上线上反馈的滚动 bug 修复。

### Added — RTOS 工具（3 → 6）

- **任务栈深度估算器** (`/tools/rtos/stack-estimator`) — 调用链字节累加 + ISR 32B 压栈 + printf 512B 修正 + 30% 安全余量，向上取整到 configMINIMAL_STACK_SIZE 整数倍，支持 FreeRTOS / RT-Thread / 通用 3 套预设
- **IPC 选型决策树** (`/tools/rtos/ipc-selector`) — 交互式问答推荐 9 种 FreeRTOS API（Mutex with PI / Binary / Counting Semaphore / Queue / Stream Buffer / Task Notification / Event Group / Software Timer / vTaskDelayUntil），每个叶节点带 API 签名 + 典型代码 + 使用陷阱 + 替代方案
- **优先级反转可视化** (`/tools/rtos/priority-inversion`) — 3 任务 + 1 mutex 的 1ms tick 仿真，对比 PIP on/off 的 Recharts 甘特图和 high 任务等待时间差，PIP 模型为高被锁阻塞时低临时抬升优先级

### Added — 代码辅助工具（2 → 6）

- **外设驱动模板生成器** (`/tools/codegen/driver-template`) — 6 外设（UART/SPI/I2C/ADC/TIM/PWM）× 6 MCU（STM32F1/F4/H7/G0/L4 + ESP32）× 3 风格（HAL/LL/Arduino），生成可编译 .h/.c 双文件，含 6 套预设场景，关键陷阱嵌入 ⚠️ 注释
- **中断服务程序模板** (`/tools/codegen/isr-template`) — 8 种 ISR（EXTI/TIM Update/TIM CCR/UART RX/UART RX IDLE+DMA/ADC EOC/DMA TC/SysTick）× 5 STM32 系列，可选 3 种任务通知机制（Task Notification/Queue/Binary Semaphore）+ 临界区，含中断向量注册说明
- **嵌入式数据结构生成器** (`/tools/codegen/data-structure`) — 4 种结构：环形缓冲区（power-of-two 校验、可选 critical section）/ 状态机宏（双层 switch 框架）/ 软件定时器数组（O(N) 扫描，period/counter/active/callback）/ 事件 Pub/Sub（静态数组分发）
- **API 速查卡** (`/tools/codegen/api-cheatsheet`) — 60+ 条常用 API：FreeRTOS 30（Task 8 / Semaphore 6 / Queue 6 / Timer 4 / Stream Buffer 3 / Event Group 3）+ STM32 HAL 30（GPIO 6 / UART 6 / I2C 4 / SPI 4 / TIM 5 / ADC 3 / DMA 2），含签名 / 参数 / 用法代码 / 常见陷阱，分类筛选 + 模糊搜索

### Fixed

- **侧边栏滚动**：`ScrollArea` 补 `min-h-0`，flex-1 才能实际把 Viewport 收缩到视口内触发 overflow（base-ui ScrollArea.Root 不加 min-h-0 时 Viewport 被内容撑开）
- **GPIO 芯片列表滚动**：去掉 `filteredChips.slice(0, 30)` 硬截断，把 ScrollArea 换成 `max-h-[60vh] overflow-y-auto` 原生 div，45 款芯片现在全部可见
- **interview-quiz 提交跳题**（commit `a08f6f4`）：`displayQuestion` memo 用 `pool.some()` 校验，pool 又被 answeredIds 过滤——提交后当前题立刻无效，回落 pickRandom 选了一道全新的题，叠加 showAnswer=true 暴露下一题答案。抽出纯函数 `selectDisplayQuestion` 用 `loadedPool` 校验
- **interview-quiz 重置粘连**（commit `710ce51`）：`handleReset` 与"清除所有数据"按钮补清 `selectedOption` + `showAnswer`，否则上一题的"已提交+答案视图"会粘到新一轮的第一题
- **interview-quiz 首题无响应**（commit `8f0e6d7`）：`handleSubmit` 改用 `displayQuestion` 作为权威题目并同步 `currentQuestion`，覆盖首屏首题与重置后第一题两种场景
- **stack-estimator 未转义双引号**（commit `cff3285`）：JSX 内中文引号触发 `react/no-unescaped-entities`，换成 `&ldquo;/&rdquo;`

### Changed — engineering-honest 口径修正（Codex v1.3.0 审查驱动）

- **driver-template** 定位从"一键生成可编译代码"改为"驱动脚手架"。ToolIntro 与生成结果页顶部增加黄色 banner，列出 5 条已知限制（LL I2C 主机收发 TODO、ESP32 引脚映射依赖板型、SPI CS 宏占位、NVIC 优先级保守默认、RCC/GPIO 需 board init 预置）
- **data-structure** 环形缓冲区从"线程安全"改为**单写单读 ISR 安全**（SPSC），多写多读场景明确指向 FreeRTOS StreamBuffer / Mutex。软件定时器补协作式 + tick ISR 上下文限制（禁止阻塞 / 非 FromISR API / printf / malloc / 浮点）
- **stack-estimator** 加免责说明：结果仅作起点参考，必须用 `uxTaskGetStackHighWaterMark()` 动态测量验证。结果页底部新增"用动态测量校准"卡片含示例代码与最深分支提示
- **ipc-selector** 决策树重排：`Q1.mutex` 直接推荐 Mutex with PI（不再走"是否担心 PI"问答），Binary Semaphore 改挂在 `Q3.signal-only → Q3a.multi` 分支（ISR → 多任务共享通知），文案/示例/pitfalls/alternatives 全部改写口径

### Changed — 其他

- **package.json version 1.2.0 → 1.3.0**
- **计数同步（README / CHANGELOG / CLAUDE.md）**：30 工具 / 45 芯片 / 446 题 / 181 测试
- 测试 82 → 181（+99），代码量约 25000 → 30000+ 行
- tools-config.ts 注册 7 个新工具图标：`Layers / GitBranch / ShieldCheck / Wrench / BellRing / Boxes / BookOpen`

### Security

- **hono 中危告警**：shadcn（CLI 工具，运行时不依赖）从 `dependencies` 移到 `devDependencies`，hono 不再进入生产依赖树。同时加 `pnpm.overrides` 锁 hono ≥ 4.12.14 作为防御性修复。CLI 仍可通过 `pnpm dlx shadcn add ...` 或本地 devDep 正常使用

---

## [1.2.0] - 2026-04-17

GPIO 芯片库扩容（10 → 45 款）+ Codex v1.2.0 安全/正确性审查闭环。

### Added

- **GPIO 引脚分配器扩容到 45 款芯片**（覆盖 STM32F1/F4/G0/G4/H7/L4 全系 + ESP32 全系 + GD32/CH32/AT32 国产线）
- **波特率计算器引入完整 BRR 编码**（OVER16: BRR[15:4]+BRR[3:0]；OVER8: 3-bit fraction，BRR[3]=0）
- **clock-tree 增加 VCO 频率独立校验**（F4 [192, 432] MHz、H7 [192, 836] MHz 双向边界检查）
- 82 单元测试（vitest）覆盖 BRR 编码、PID 二阶仿真、GPIO 代码生成、时钟树违规闭环
- `lib/clock-tree/constraints.ts` 增加 `flashLatencyTable` 与 `getFlashLatency()` 工具函数
- `stores/_schema-guards.ts` 共享类型守卫（6 个持久化 store 复用）
- `scripts/generate-chips.ts` 批量芯片定义生成脚本（独立于构建）

### Fixed

- **(P1) clock-tree VCO 校验改为校验真实 VCO 频率**（PLLP 分频前），同时检查上下边界，避免低频 VCO 因 PLLP=2/4/8 后落入合法 SYSCLK 区间而漏检
- **clock-tree generateCode 闭环**：存在违规时直接返回 error，不再产出可能导致硬件无法启动的 SystemClock_Config()
- **register-viewer 32-bit 掩码**：`(1 << 32) - 1 === 0` JavaScript 陷阱，改用 `width >= 32 ? 0xFFFFFFFF : ((1 << width) - 1)`
- **HexInput 0x 前缀解析**：原 `/[\s0x]/gi` 会吞掉所有 `0`，改为 `/^0x/i + /\s+/g` 顺序处理
- **PID 图表空白**：Tabs 隐藏 panel 时 Recharts ResponsiveContainer 测不到尺寸，改为 button 切换保留 DOM
- **chips JSON 中文引号转义**：`rtos.json` 等文件 CJK 邻近的全角引号导致 JSON.parse 失败
- **(P3) 波特率计算器残留 USARTDIV 文案**：CardDescription 与复制按钮统一使用 BRR 编码语义

### Changed

- **package.json version 0.1.0 → 1.2.0**（首个语义化版本号）
- **README/CHANGELOG/CLAUDE.md 计数同步**：23 工具 / 45 芯片 / 446 题 / 82 测试
- chips 数据从硬编码 TS 数组迁移到 `public/chips/*.json`，按需 fetch，减小首屏 bundle
- 所有持久化 store 接入 safe-merge schema 守卫，防止 localStorage 被篡改导致运行时崩溃

---

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
