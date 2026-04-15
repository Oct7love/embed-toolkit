# CLAUDE.md — Embed Toolkit 开发指南

本文件供 Claude Code agent 阅读，定义项目的开发规范、代码风格、git 工作流和 PR 规范。

## 项目简介

Embed Toolkit 是面向嵌入式开发者的浏览器端工具集合平台，纯前端，部署到 Vercel。

## 技术栈

- Next.js 16 (App Router) + TypeScript 5
- Tailwind CSS 4 + shadcn/ui（基于 @base-ui/react）
- Recharts 3（图表）
- Zustand 5 + localStorage 持久化
- pnpm 10（包管理）

### 已知差异（注意点）

- shadcn/ui Select 的 `onValueChange` 签名为 `(value: string | null) => void`，需处理 null
- shadcn/ui Tooltip 的 `TooltipTrigger` 不再支持 `asChild`，改用 `render={<Button ... />}` prop
- Recharts 3 的 Tooltip `formatter` 签名变为 `(value: unknown, ...)`，需显式类型转换

## 目录结构

```
embed-toolkit/
├── app/
│   ├── layout.tsx              # 根布局（侧边栏 + 主内容区）
│   ├── page.tsx                # 首页 Dashboard
│   └── tools/
│       └── [category]/
│           └── [tool-name]/
│               └── page.tsx    # 每个工具的页面
├── components/
│   ├── layout/                 # 侧边栏、Header、Footer 等布局组件
│   ├── shared/                 # 共享 UI 组件（HexInput、BitGrid、CopyButton 等）
│   └── tools/
│       └── [tool-name]/        # 每个工具的专属组件目录
├── lib/
│   └── [tool-name]/            # 每个工具的纯计算逻辑，与 UI 分离
├── stores/                     # Zustand stores
├── types/                      # TypeScript 类型定义
├── docs/                       # 项目文档（PRD、技术方案等）
└── public/                     # 静态资源
```

## 开发规范

### 命名规则

- 文件/目录：kebab-case（如 `bit-operation-generator`、`hex-input.tsx`）
- React 组件：PascalCase（如 `HexInput`、`BitGrid`）
- 函数/变量：camelCase（如 `calculateCRC`、`parseFrame`）
- 常量：UPPER_SNAKE_CASE（如 `DEFAULT_POLYNOMIAL`）
- 类型/接口：PascalCase，接口不加 `I` 前缀

### 代码风格

- 使用 TypeScript strict 模式，不允许 `any`
- 组件使用函数式组件 + hooks
- 计算逻辑与 UI 严格分离：`lib/` 放纯函数，`components/` 放 UI
- `lib/` 下的函数必须是纯函数，无副作用，方便单元测试
- 使用 `"use client"` 标记客户端组件，默认 Server Component
- 数值展示统一使用等宽字体（通过 Tailwind `font-mono` 类）
- 颜色使用 Tailwind CSS 变量和 shadcn/ui 主题 token，不硬编码

### 组件规范

- 每个工具封装为独立组件目录：`components/tools/[tool-name]/`
- 工具组件目录下包含：主组件、子组件、工具专属 hooks
- 共享组件放 `components/shared/`，必须可复用于多个工具
- shadcn/ui 组件放 `components/ui/`，由 CLI 生成，不手动修改

### 状态管理

- 简单工具：用 React `useState` / `useReducer` 即可
- 需要持久化或跨组件共享：用 Zustand store + `localStorage`
- store 文件放 `stores/[tool-name]-store.ts`

## Git 工作流

### 分支策略

- `main`：生产分支，始终可部署
- `dev`：开发集成分支，所有功能分支合并到此
- 功能分支：`feat/[tool-name]`（如 `feat/base-converter`、`feat/crc-calculator`）
- 修复分支：`fix/[description]`
- 文档分支：`docs/[description]`

### Worktree 开发模式

使用 git worktree 进行模块隔离开发，每个工具模块在独立 worktree 中开发：

```bash
# 创建 worktree 开发新工具
git worktree add ../embed-toolkit-feat-crc-calculator -b feat/crc-calculator

# 开发完成后移除 worktree
git worktree remove ../embed-toolkit-feat-crc-calculator
```

### Agent-Team 协作

- 每个 agent 负责一个独立工具模块
- agent 在独立 worktree 中工作，避免冲突
- 开发完成后提交 PR 到 `dev` 分支
- 主 agent 负责代码审查和合并

### Commit 规范

使用 Conventional Commits 格式：

```
<type>(<scope>): <description>

type: feat | fix | docs | style | refactor | test | chore
scope: 工具名或模块名
```

示例：
- `feat(base-converter): add hex/bin/dec/oct conversion`
- `fix(crc-calculator): correct CRC-16 polynomial handling`
- `docs(readme): add local development guide`
- `refactor(shared): extract HexInput component`

## PR 规范

### PR 标题

格式与 commit 一致：`<type>(<scope>): <description>`

### PR 描述模板

```markdown
## 概述
<!-- 简要描述本 PR 做了什么 -->

## 变更内容
- [ ] 新增/修改的文件列表
- [ ] 涉及的工具模块

## 测试
- [ ] 本地运行 `pnpm dev` 验证功能正常
- [ ] 响应式布局测试（桌面/移动端）
- [ ] 暗色/亮色主题测试
- [ ] 边界值和异常输入测试

## 截图
<!-- 如有 UI 变更，附截图 -->
```

### PR 规则

- 每个工具模块作为独立 PR 提交
- PR 必须包含完整的工具功能（UI + 计算逻辑）
- 不要在一个 PR 中混合多个不相关的工具
- 共享组件的修改单独提 PR

## 网络与代理

本机环境变量中配置了 HTTP 代理，但该代理**无法连接 GitHub**。执行 git push/pull 时需要绕过代理：

```bash
# git push/pull 绕过代理
HTTP_PROXY="" HTTPS_PROXY="" ALL_PROXY="" git push origin main

# pnpm install 如遇代理问题，同理
HTTP_PROXY="" HTTPS_PROXY="" ALL_PROXY="" pnpm install
```

> 注意：不要用 `unset` 修改 shell 环境变量，用内联方式覆盖即可，避免影响其他需要代理的程序。

## 常用命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器
pnpm build            # 生产构建
pnpm lint             # 代码检查
pnpm type-check       # 类型检查
```

## 工具分类速查（共 18 个，全部完成）

| 分类 | 路由前缀 | 工具数量 | 具体工具 |
|------|----------|----------|----------|
| 数据转换工具 | `/tools/converter/` | 5 | base-converter, ieee754-parser, endian-converter, checksum-calculator, ascii-table |
| 协议调试工具 | `/tools/protocol/` | 4 | serial-parser, mqtt-parser, json-builder, modbus-generator |
| 芯片与硬件工具 | `/tools/hardware/` | 4 | register-viewer, gpio-planner, resistor-calculator, rc-calculator |
| RTOS 可视化工具 | `/tools/rtos/` | 2 | task-scheduler, memory-layout |
| 代码辅助工具 | `/tools/codegen/` | 2 | bit-operation, state-machine |
| 学习与求职 | `/tools/learning/` | 1 | interview-quiz（446 道题） |
