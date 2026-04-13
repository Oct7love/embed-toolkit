# 技术栈选型文档

## 1. 整体架构

纯前端单页应用（SPA），所有计算逻辑在浏览器本地执行，无后端服务器。选型原则：

- **轻量优先** — 不引入不必要的重依赖
- **开发体验** — TypeScript + 热更新 + 组件库，提升开发效率
- **部署简单** — 一键部署到 Vercel，零配置

## 2. 核心技术选型

### 2.1 框架：Next.js 15（App Router）

| 维度 | 说明 |
|------|------|
| **选择理由** | App Router 提供文件系统路由，天然适合 18 个工具的路由组织；内置代码分割，每个工具页面按需加载；React Server Components 减少客户端 JS 体积 |
| **备选方案** | Vite + React Router — 更轻量，但缺少文件系统路由和内置 SSG 支持 |
| **备选方案** | Remix — 侧重全栈，对纯前端项目来说过重 |
| **为何不选 Vite** | 虽然本项目是纯前端，但 Next.js 的 App Router 在路由管理和 Vercel 集成上有明显优势，且静态导出能力兼顾自建服务器部署 |
| **版本锁定** | `next@15.x`，跟随 Next.js 15 大版本，patch 版本通过 pnpm 自动管理 |

### 2.2 语言：TypeScript 5.x

| 维度 | 说明 |
|------|------|
| **选择理由** | 嵌入式工具涉及大量位运算和数值转换，类型安全能有效减少计算 bug；提升 IDE 补全和重构体验 |
| **配置策略** | strict 模式，禁止 `any`，确保类型覆盖 |
| **版本锁定** | 跟随 Next.js 内置的 TypeScript 版本，不单独锁定 |

### 2.3 样式：Tailwind CSS 4

| 维度 | 说明 |
|------|------|
| **选择理由** | 原子化 CSS，配合 shadcn/ui 实现快速 UI 开发；内置暗色模式支持（`dark:` 前缀）；无运行时开销 |
| **备选方案** | CSS Modules — 需要额外维护类名映射，开发效率较低 |
| **备选方案** | styled-components — 运行时 CSS-in-JS，性能不如 Tailwind |
| **版本锁定** | `tailwindcss@4.x` |

### 2.4 UI 组件库：shadcn/ui

| 维度 | 说明 |
|------|------|
| **选择理由** | 非 npm 依赖，组件代码直接复制到项目中，完全可控可定制；基于 Radix UI 原语，无障碍支持好；与 Tailwind CSS 深度集成 |
| **备选方案** | Ant Design — 体积过大，样式风格不适合开发者工具 |
| **备选方案** | Headless UI — 组件种类较少，不够用 |
| **使用策略** | 按需添加组件（`npx shadcn@latest add button`），不全量安装 |

### 2.5 图表：Recharts 2.x

| 维度 | 说明 |
|------|------|
| **选择理由** | 基于 React 声明式 API，学习成本低；满足波特图、甘特图、内存布局图的需求 |
| **备选方案** | D3.js — 功能强大但学习曲线陡峭，对简单图表来说过重 |
| **备选方案** | Chart.js — 非 React 原生，需要额外封装 |
| **使用范围** | 分压/RC 滤波计算器的波特图、任务调度甘特图、内存布局可视化 |
| **版本锁定** | `recharts@2.x` |

### 2.6 状态管理：Zustand 5.x

| 维度 | 说明 |
|------|------|
| **选择理由** | API 极简，bundle size 小（<2KB）；内置 `persist` 中间件支持 localStorage 持久化；不需要 Provider 包裹 |
| **备选方案** | Redux Toolkit — 对本项目来说 boilerplate 过多 |
| **备选方案** | Jotai — 原子化模型适合细粒度状态，但工具级状态用 Zustand 更直观 |
| **使用策略** | 仅在需要持久化或跨组件共享时使用 Zustand；简单工具用 React 内置 state 即可 |
| **版本锁定** | `zustand@5.x` |

### 2.7 包管理：pnpm 9.x

| 维度 | 说明 |
|------|------|
| **选择理由** | 硬链接节省磁盘空间；严格的依赖隔离避免幽灵依赖；安装速度快 |
| **备选方案** | npm — 依赖安装慢，磁盘占用大 |
| **备选方案** | yarn — 与 pnpm 功能接近，但 pnpm 在 monorepo 和磁盘效率上更优 |
| **版本锁定** | `pnpm@9.x`，通过 `packageManager` 字段锁定 |

## 3. 辅助工具链

| 工具 | 用途 | 说明 |
|------|------|------|
| ESLint | 代码检查 | 使用 Next.js 内置 ESLint 配置 |
| Prettier | 代码格式化 | 统一代码风格 |
| next/font | 字体加载 | 加载 JetBrains Mono 等宽字体 |

## 4. 版本锁定策略

| 策略 | 说明 |
|------|------|
| **pnpm-lock.yaml** | 锁定所有依赖的精确版本，确保团队/CI 环境一致 |
| **package.json** | 使用 `^` 语义化版本范围，允许 patch/minor 更新 |
| **packageManager** | 在 package.json 中声明 `"packageManager": "pnpm@9.x"`，确保团队使用同一版本 pnpm |
| **Node.js** | 使用 `.nvmrc` 文件锁定 Node.js 版本（>=18） |

## 5. 不引入的技术（及原因）

| 技术 | 原因 |
|------|------|
| 后端框架（Express/Fastify） | 纯前端项目，无后端需求 |
| 数据库 | 所有数据存储在 localStorage |
| 认证系统 | 无用户账号功能 |
| Docker | 部署到 Vercel，无需容器化（自建服务器时可选） |
| 测试框架（Vitest/Jest） | 初期不做单元测试，后续按需引入 |

## 6. 部署方案

### 6.1 当前方案：Vercel 免费版

| 维度 | 说明 |
|------|------|
| **部署方式** | GitHub 仓库关联 Vercel，push 到 main 自动部署 |
| **CDN** | Vercel Edge Network 全球 CDN |
| **免费额度** | 带宽 100GB/月，构建 6000 分钟/月，足够个人项目使用 |
| **自定义域名** | 支持绑定自有域名 |
| **Preview 部署** | 每个 PR 自动生成预览链接 |

### 6.2 未来迁移方案：自建服务器（2 核 2GB）

当项目流量增长或需要自主可控时，可迁移到自建服务器。支持两种方式：

#### 方式一：Node.js 运行

```bash
# 构建
pnpm build

# 启动（默认端口 3000）
pnpm start

# 或指定端口
PORT=8080 pnpm start
```

适用场景：需要 Next.js SSR 能力（虽然当前纯前端，但预留扩展可能）。建议用 PM2 做进程管理。

#### 方式二：静态导出 + Nginx 托管

```bash
# 在 next.config.ts 中添加 output: 'export'
pnpm build
# 产物在 out/ 目录
```

Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name embed-toolkit.example.com;
    root /var/www/embed-toolkit/out;
    index index.html;

    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }

    # 静态资源缓存
    location /_next/static/ {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

适用场景：纯前端项目首选，资源占用极低，2 核 2GB 服务器绑绑有余。

#### 两种方式对比

| 维度 | Node.js 运行 | 静态导出 + Nginx |
|------|-------------|-----------------|
| 服务器资源占用 | 中（Node 进程常驻） | 低（仅 Nginx） |
| 部署复杂度 | 低（pnpm start） | 中（需配置 Nginx） |
| SSR 支持 | 支持 | 不支持 |
| 适合本项目 | 可用 | **推荐** |
