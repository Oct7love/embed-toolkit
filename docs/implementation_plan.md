# 分阶段开发计划

## 总览

项目分 4 个阶段开发，每个阶段包含明确的里程碑和交付物。

```
阶段一：基础框架搭建
    ↓
阶段二：数据转换类工具（P0）
    ↓
阶段三：协议/硬件类工具（P0 + P1）
    ↓
阶段四：可视化/高级类工具（P2）+ 部署优化
```

---

## 阶段一：基础框架搭建

### 目标

搭建项目骨架，完成布局系统和共享基础设施，为后续工具开发提供统一的开发环境。

### 任务清单

| # | 任务 | 依赖 | 说明 |
|---|------|------|------|
| 1.1 | 初始化 Next.js 15 项目 | 无 | `pnpm create next-app`，配置 TypeScript + Tailwind CSS 4 + App Router |
| 1.2 | 集成 shadcn/ui | 1.1 | `npx shadcn@latest init`，添加常用基础组件（Button、Card、Input、Select、Dialog、Tooltip、Toast） |
| 1.3 | 配置等宽字体 | 1.1 | 通过 next/font 加载 JetBrains Mono，配置 Tailwind `font-mono` |
| 1.4 | 实现暗色/亮色主题 | 1.2 | 集成 next-themes，默认暗色主题，Header 中添加切换按钮 |
| 1.5 | 实现侧边栏布局 | 1.2 | 左侧 260px 固定侧边栏，分 6 个分类折叠菜单，列出所有 18 个工具入口 |
| 1.6 | 实现响应式导航 | 1.5 | 桌面端侧边栏，平板端可折叠侧边栏，移动端底部 Tab |
| 1.7 | 实现首页 Dashboard | 1.5 | 工具卡片网格 + 搜索栏 + 最近使用模块 |
| 1.8 | 开发共享组件 | 1.2 | HexInput、BitGrid、CopyButton、CodeBlock |
| 1.9 | 配置全局 Zustand Store | 1.1 | app-store（侧边栏状态、最近使用），配置 persist 中间件 |
| 1.10 | 配置 ESLint + Prettier | 1.1 | 代码规范统一 |

### 里程碑

- [x] 项目能 `pnpm dev` 正常启动
- [x] 首页 Dashboard 展示 18 个工具卡片
- [x] 侧边栏导航可折叠，点击可跳转到工具页（显示占位内容）
- [x] 暗色/亮色主题切换正常
- [x] 移动端底部 Tab 导航正常
- [x] 共享组件 HexInput、BitGrid、CopyButton 可用

### 开发顺序

```mermaid
graph LR
    A[1.1 初始化项目] --> B[1.2 shadcn/ui]
    A --> C[1.3 字体]
    A --> J[1.10 ESLint]
    B --> D[1.4 主题]
    B --> E[1.5 侧边栏]
    B --> H[1.8 共享组件]
    E --> F[1.6 响应式]
    E --> G[1.7 Dashboard]
    A --> I[1.9 全局 Store]
```

---

## 阶段二：数据转换类工具（P0 核心）

### 目标

完成 6 个 P0 工具，构成 MVP 版本。这些是嵌入式开发者最高频使用的基础工具。

### 任务清单

| # | 工具 | 依赖 | 路由 |
|---|------|------|------|
| 2.1 | 进制转换器 | 阶段一 | `/tools/converter/base-converter` |
| 2.2 | IEEE 754 浮点解析器 | 阶段一 + BitGrid | `/tools/converter/ieee754-parser` |
| 2.3 | 字节序转换器 | 阶段一 + HexInput | `/tools/converter/endian-converter` |
| 2.4 | 校验和计算器 | 阶段一 + HexInput | `/tools/converter/checksum-calculator` |
| 2.5 | 寄存器位域计算器 | 阶段一 + BitGrid | `/tools/hardware/register-viewer` |
| 2.6 | Modbus 帧生成器 | 2.4（复用 CRC 计算逻辑） | `/tools/protocol/modbus-generator` |

### 开发顺序与依赖

```mermaid
graph TD
    A[阶段一完成] --> B[2.1 进制转换器]
    A --> C[2.2 IEEE 754]
    A --> D[2.3 字节序转换器]
    A --> E[2.4 校验和计算器]
    A --> F[2.5 寄存器位域计算器]
    E --> G[2.6 Modbus 帧生成器]
```

**推荐并行策略：**
- Agent A：2.1 进制转换器 + 2.3 字节序转换器（同属数据转换，逻辑相似）
- Agent B：2.2 IEEE 754 + 2.5 寄存器位域计算器（都依赖 BitGrid）
- Agent C：2.4 校验和计算器 → 2.6 Modbus 帧生成器（有依赖关系，串行）

### 里程碑

- [x] 6 个 P0 工具全部可用
- [x] 每个工具通过验收标准（见 PRD）
- [x] 暗色/亮色主题下所有工具显示正常
- [x] 移动端布局适配完成

---

## 阶段三：协议/硬件类工具（P1）

### 目标

完成 7 个 P1 工具，覆盖协议调试和硬件辅助场景，形成完整的工具矩阵。

### 任务清单

| # | 工具 | 依赖 | 路由 |
|---|------|------|------|
| 3.1 | ASCII/编码对照表 | 阶段一 | `/tools/converter/ascii-table` |
| 3.2 | 串口协议解析器 | 阶段一 + HexInput + FieldHighlighter | `/tools/protocol/serial-parser` |
| 3.3 | MQTT 报文解析器 | 阶段一 + FieldHighlighter | `/tools/protocol/mqtt-parser` |
| 3.4 | JSON 协议构造器 | 阶段一 | `/tools/protocol/json-builder` |
| 3.5 | 电阻色环计算器 | 阶段一 | `/tools/hardware/resistor-calculator` |
| 3.6 | 分压/RC 滤波计算器 | 阶段一 + Recharts | `/tools/hardware/rc-calculator` |
| 3.7 | 位操作代码生成器 | 阶段一 + BitGrid + CodeBlock | `/tools/codegen/bit-operation` |

### 新增共享组件

| 组件 | 说明 | 使用工具 |
|------|------|----------|
| `FieldHighlighter` | 协议帧字段颜色高亮 | 串口解析器、MQTT 解析器 |

### 开发顺序与依赖

```mermaid
graph TD
    A[阶段二完成] --> B[3.1 ASCII 表]
    A --> C[3.2 串口协议解析器]
    A --> D[3.3 MQTT 报文解析器]
    A --> E[3.4 JSON 构造器]
    A --> F[3.5 电阻色环]
    A --> G[3.6 分压/RC 滤波]
    A --> H[3.7 位操作生成器]
```

**推荐并行策略：**
- Agent A：3.1 ASCII 表 + 3.5 电阻色环（独立工具，无依赖）
- Agent B：3.2 串口协议解析器 + 3.3 MQTT 解析器（共享 FieldHighlighter）
- Agent C：3.4 JSON 构造器 + 3.7 位操作代码生成器
- Agent D：3.6 分压/RC 滤波计算器（需要 Recharts 集成）

### 里程碑

- [x] 7 个 P1 工具全部可用
- [x] FieldHighlighter 共享组件在串口和 MQTT 解析器中正确工作
- [x] 波特图 Recharts 渲染正常
- [x] 所有模板保存/加载功能正常

---

## 阶段四：可视化/高级类工具（P2）+ 部署优化

### 目标

完成 5 个 P2 工具（交互复杂度最高），进行性能优化，完善部署方案。

### 任务清单

| # | 工具 | 依赖 | 路由 |
|---|------|------|------|
| 4.1 | 任务调度甘特图 | 阶段一 + Recharts | `/tools/rtos/task-scheduler` |
| 4.2 | 内存布局可视化 | 阶段一 + Recharts | `/tools/rtos/memory-layout` |
| 4.3 | GPIO 引脚分配表 | 阶段一 | `/tools/hardware/gpio-planner` |
| 4.4 | 状态机编辑器 | 阶段一 | `/tools/codegen/state-machine` |
| 4.5 | 嵌入式面试题库 | 阶段一 | `/tools/learning/interview-quiz` |

### 开发顺序与依赖

```mermaid
graph TD
    A[阶段三完成] --> B[4.1 任务调度甘特图]
    A --> C[4.2 内存布局可视化]
    A --> D[4.3 GPIO 引脚分配表]
    A --> E[4.4 状态机编辑器]
    A --> F[4.5 面试题库]
```

**推荐并行策略：**
- Agent A：4.1 任务调度甘特图 + 4.2 内存布局可视化（都用 Recharts）
- Agent B：4.3 GPIO 引脚分配表（需要芯片数据库）
- Agent C：4.4 状态机编辑器（画布拖拽交互复杂）
- Agent D：4.5 面试题库 + 题目数据录入

### 部署优化任务

| # | 任务 | 说明 |
|---|------|------|
| 4.6 | 性能优化 | 代码分割检查、图片优化、Lighthouse 跑分 |
| 4.7 | SEO 优化 | 每个工具页面的 metadata、Open Graph 标签 |
| 4.8 | 静态导出验证 | 验证 `output: 'export'` 模式下所有工具正常工作 |
| 4.9 | 自建服务器部署文档 | 编写 Nginx 配置模板和 PM2 启动脚本 |

### 自建服务器部署准备

面向未来迁移到 2 核 2GB 自建服务器的准备：

**方式一：Node.js 运行**
```bash
# PM2 进程管理
pm2 start pnpm --name embed-toolkit -- start
pm2 save
pm2 startup
```

**方式二：静态导出 + Nginx（推荐）**
```bash
# next.config.ts 中设置 output: 'export'
pnpm build
# 将 out/ 目录部署到 Nginx root
```

验证清单：
- [x] `output: 'export'` 模式下所有 18 个工具页面正常渲染
- [x] 静态资源缓存策略配置正确
- [x] Nginx try_files 规则确保客户端路由正常
- [x] 2 核 2GB 服务器压力测试通过

### 里程碑

- [x] 全部 18 个工具开发完成
- [x] Lighthouse Performance 评分 ≥ 90
- [x] 静态导出模式验证通过
- [x] 自建服务器部署文档完成
- [x] 面试题库至少 100 道题目

---

## 开发阶段总览

| 阶段 | 内容 | 工具数 | 里程碑标志 |
|------|------|--------|------------|
| 一 | 基础框架搭建 | 0 | 项目骨架 + 布局 + 共享组件 |
| 二 | 数据转换类（P0） | 6 | MVP 可用 |
| 三 | 协议/硬件类（P1） | 7 | 完整工具矩阵 |
| 四 | 可视化/高级类（P2）+ 部署 | 5 | 全量发布 |

## Agent-Team 协作分工建议

```
主 Agent（协调者）
├── 阶段一：主 Agent 独立完成框架搭建
├── 阶段二：3 个 Agent 并行开发 6 个 P0 工具
│   ├── Agent A：进制转换器 + 字节序转换器
│   ├── Agent B：IEEE 754 + 寄存器位域
│   └── Agent C：校验和计算器 → Modbus 帧生成器
├── 阶段三：4 个 Agent 并行开发 7 个 P1 工具
│   ├── Agent A：ASCII 表 + 电阻色环
│   ├── Agent B：串口协议解析器 + MQTT 解析器
│   ├── Agent C：JSON 构造器 + 位操作生成器
│   └── Agent D：分压/RC 滤波计算器
└── 阶段四：4 个 Agent 并行开发 5 个 P2 工具
    ├── Agent A：任务调度甘特图 + 内存布局
    ├── Agent B：GPIO 引脚分配表
    ├── Agent C：状态机编辑器
    └── Agent D：面试题库
```

每个 Agent 在独立 git worktree 中工作，完成后提 PR 到 `dev` 分支，由主 Agent 审查合并。

---

## 实际开发记录

本节记录项目实际执行过程中遇到的真实问题和经验教训，供后续类似项目参考。

### 阶段一：顺利

- 按计划独立完成，`pnpm build` 一次通过（仅修了 shadcn/ui 新版本 `TooltipTrigger` 不再支持 `asChild` 的 2 处类型错误）
- Next.js 实际装到了 16（`create-next-app@latest` 的默认），而非原计划的 15；无兼容性问题

### 阶段二：3 PR 全部冲突，手动合并

- 3 个 Agent 并行提交了 PR，但都基于阶段一之前的 dev 分支（未 rebase 最新 dev）
- 每个 PR 都修改了工具占位页面 `page.tsx`（Agent 写真实组件），同时主 Agent 在 dev 上已加了 metadata export，导致 6 个 page.tsx 全部冲突
- 解决：本地 `git merge origin/feat/xxx` 逐个处理，合并时保留两边——PR 的组件引用 + 主 Agent 的 metadata
- 经验：多 Agent 并行前，PR 分支应基于最新 dev；或约定 Agent 只修改 `components/`、`lib/` 等非公共文件，`page.tsx` 由主 Agent 收尾

### 阶段三：Agent 中途用量耗尽，代码残留在 worktree 中

- 4 个 Agent 并行启动不久就都因"用量限制"中断，但都写出了大部分代码（`types/`、`lib/`、`components/` 基本完整），只是没来得及 commit + 创建 PR
- Agent B（串口 + MQTT 解析器）：TemplateEditor 和 MqttParser UI 组件未完成，由主 Agent 补齐
- 解决：主 Agent 从各 worktree 的未提交变更中把代码手工复制到主项目，统一构建、修复 3 处类型错误（shadcn/ui Select 的 `onValueChange` 签名变化、Recharts Tooltip formatter 类型）、一次性 commit
- 经验：agent 中断风险大时，prompt 里应强调"先提交再继续开发"，或拆分更小的任务粒度

### 阶段四：分批生成 + JSON 引号陷阱

- Agent D（面试题库）中途被终止，只写了 2 个分类的 JSON（54 题）+ types，缺 lib/UI/store，主 Agent 全部补齐
- 首次 `pnpm build` 失败：`rtos.json` 的中文解析文字里有**未转义的英文双引号**（如 `没有所谓的"编译态"`），用正则逐行扫描 + 转义修复
- 题库扩充到 446 题分成 16 批次（每批 20 题），每批独立 commit + push + build，避免单次 token 超限
- 经验：JSON 里的中文引号、代码样例引号易漏转义，用 `JSON.parse` 做自动校验

### 阶段四遗留项（待做）

- [ ] 性能优化和 Lighthouse 跑分（任务 4.6）
- [ ] 静态导出模式 `output: 'export'` 验证（任务 4.8）
- [ ] 自建服务器部署实战文档（任务 4.9，目前仅 tech_stack.md 中有方案说明）
- [x] 在线 Demo 部署到 <https://embed-toolkit.vercel.app/>（v1.0.0 已上线）

### 产出总结

- 代码：约 16000+ 行 TS/TSX + 约 4500 行 JSON 题库
- 18 个工具 + 446 道题 + 6 个规划文档
- 30+ commits 贯穿 4 个阶段
- 零构建警告通过

### 协作模式有效性评估

| 环节 | 效果 | 备注 |
|------|------|------|
| 主 Agent 做框架 + 规划 | 高效 | 框架一次到位，后续 Agent 产出质量整齐 |
| Worktree 隔离 + 并行 Agent | 中等 | 代码冲突和 Agent 中断风险是两大痛点 |
| PR 审查 + 合并到 dev | 有效 | 多数工具通过 PR 审查即可合并，偶有格式问题手动修 |
| 分批迭代（如题库 16 批） | 高效 | 规避 token 限制，每批独立验证，质量可控 |
