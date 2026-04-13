# 前端开发规范

## 1. 组件设计模式

### 1.1 组件分层

```
页面组件（app/tools/[category]/[tool]/page.tsx）
  └─ 工具组件（components/tools/[tool]/）
       ├─ 主组件（index.tsx）          — 组装子组件，管理工具级状态
       ├─ 输入组件（*-input.tsx）      — 数据输入区域
       ├─ 输出组件（*-output.tsx）     — 结果展示区域
       └─ 工具 hooks（use-*.ts）       — 工具专属逻辑
  └─ 共享组件（components/shared/）
  └─ UI 组件（components/ui/）         — shadcn/ui 生成
```

### 1.2 页面组件

页面组件是 App Router 的入口，保持精简：

```tsx
// app/tools/converter/base-converter/page.tsx
import { BaseConverter } from "@/components/tools/base-converter";

export default function BaseConverterPage() {
  return <BaseConverter />;
}
```

### 1.3 工具组件

工具主组件负责组装子组件和管理状态：

```tsx
// components/tools/base-converter/index.tsx
"use client";

import { useState } from "react";
import { BaseConverterInput } from "./base-converter-input";
import { BaseConverterOutput } from "./base-converter-output";
import { convertBase } from "@/lib/base-converter";

export function BaseConverter() {
  const [input, setInput] = useState("");
  const result = convertBase(input);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BaseConverterInput value={input} onChange={setInput} />
      <BaseConverterOutput result={result} />
    </div>
  );
}
```

### 1.4 计算逻辑分离

所有计算逻辑放在 `lib/` 下，必须是纯函数：

```tsx
// lib/base-converter/index.ts
export function convertBase(value: string, from: Base, to: Base): string {
  // 纯计算，无副作用，无 DOM 操作
}
```

### 1.5 共享组件清单

以下组件预计被多个工具复用，放在 `components/shared/`：

| 组件 | 用途 | 使用工具 |
|------|------|----------|
| `HexInput` | hex 字符串输入框，自动格式化和校验 | 进制转换、字节序转换、CRC、协议解析器 |
| `BitGrid` | 32/16/8 位 bit 网格可视化 | IEEE 754、寄存器位域、位操作生成器 |
| `CopyButton` | 一键复制按钮，带 toast 反馈 | 所有工具 |
| `CodeBlock` | 代码展示块，带语法高亮和复制 | 位操作生成器、状态机、GPIO |
| `FieldHighlighter` | 协议帧字段颜色高亮 | 串口解析器、MQTT 解析器、Modbus |

## 2. 样式规范

### 2.1 Tailwind CSS 使用规则

- 使用 Tailwind 工具类而非自定义 CSS
- 颜色统一使用 shadcn/ui 的 CSS 变量 token，不硬编码色值：

```tsx
// ✅ 正确
<div className="bg-background text-foreground border-border" />
<div className="bg-primary text-primary-foreground" />

// ❌ 错误
<div className="bg-[#1a1a2e] text-[#ffffff]" />
<div style={{ color: '#2563EB' }} />
```

- 间距使用 Tailwind 的 spacing scale（`p-4`、`gap-6`、`mt-8`）
- 尺寸优先使用相对单位和 Tailwind 的 size scale

### 2.2 等宽字体

所有数值、hex 数据、代码展示使用等宽字体：

```tsx
// 通过 next/font 加载 JetBrains Mono
<span className="font-mono">0x1A2B3C4D</span>
```

加载方式（在根 layout.tsx 中）：

```tsx
import { JetBrains_Mono } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
```

### 2.3 布局规范

工具页面统一使用「输入在上/左，输出在下/右」的布局模式：

```tsx
// 桌面端左右分栏，移动端上下堆叠
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <Card>输入区</Card>
  <Card>输出区</Card>
</div>
```

## 3. 主题系统

### 3.1 暗色/亮色切换

使用 `next-themes` 库实现主题切换：

- 默认主题：暗色（`dark`）
- 存储位置：`localStorage` key `theme`
- 切换方式：Header 中的主题切换按钮

### 3.2 主题 Token

基于 shadcn/ui 的 CSS 变量系统：

```css
:root {
  --background: 0 0% 100%;        /* 亮色背景 */
  --foreground: 0 0% 3.9%;        /* 亮色文字 */
  --primary: 221.2 83.2% 53.3%;   /* 科技蓝 #2563EB */
  --card: 0 0% 100%;
  --border: 0 0% 89.8%;
  /* ... */
}

.dark {
  --background: 0 0% 3.9%;        /* 暗色背景 */
  --foreground: 0 0% 98%;         /* 暗色文字 */
  --primary: 217.2 91.2% 59.8%;   /* 暗色主色调 */
  --card: 0 0% 5.9%;
  --border: 0 0% 14.9%;
  /* ... */
}
```

### 3.3 主色调

- 科技蓝：`#2563EB`（Tailwind `blue-600`）
- 用于：主按钮、链接、活跃状态、重点高亮
- 暗色模式下适当提亮以保证可读性

### 3.4 数据可视化颜色

协议帧字段、bit 位域等需要多颜色区分时，使用以下调色板：

```
蓝色系:   #3B82F6  — 帧头 / 主要字段
绿色系:   #22C55E  — 数据区 / 有效值
橙色系:   #F97316  — 长度 / 偏移字段
紫色系:   #A855F7  — 校验和
红色系:   #EF4444  — 错误 / 警告
灰色系:   #6B7280  — 填充 / 未使用
```

暗色模式下颜色自动适配（降低饱和度、提高明度）。

## 4. 响应式断点

使用 Tailwind CSS 默认断点：

| 断点 | 宽度 | 布局策略 |
|------|------|----------|
| 默认（移动端） | < 640px | 单列布局，底部 Tab 导航 |
| `sm` | ≥ 640px | 单列布局，底部 Tab 导航 |
| `md` | ≥ 768px | 侧边栏可折叠，工具页双列开始生效 |
| `lg` | ≥ 1024px | 侧边栏常驻，工具页左右分栏 |
| `xl` | ≥ 1280px | 同 lg，增加最大宽度约束 |

### 4.1 导航适配

- **桌面端（≥1024px）：** 左侧固定侧边栏（260px），分类折叠菜单
- **平板端（768px-1023px）：** 侧边栏可折叠（汉堡菜单触发）
- **移动端（<768px）：** 隐藏侧边栏，底部固定 Tab 栏（6 个分类 icon）

### 4.2 工具页面适配

```tsx
// 桌面端两列，移动端单列
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
  ...
</div>

// BitGrid 在小屏幕上缩小 bit 格子
<div className="grid grid-cols-8 sm:grid-cols-16 lg:grid-cols-32">
  ...
</div>
```

## 5. 无障碍要求

### 5.1 键盘导航

- 所有交互元素可通过 Tab 键聚焦
- 工具搜索支持 `Ctrl+K` / `Cmd+K` 快捷键
- BitGrid 支持方向键导航
- 模态框支持 `Esc` 关闭

### 5.2 ARIA 标签

- 使用 shadcn/ui 组件自带的 ARIA 支持（基于 Radix UI）
- 图标按钮必须有 `aria-label`
- BitGrid 中每个 bit 有 `aria-label` 标注位置和状态

```tsx
<button aria-label="复制结果到剪贴板">
  <CopyIcon />
</button>

<div role="grid" aria-label="32位寄存器位域">
  <div role="gridcell" aria-label="Bit 31, 值: 0">0</div>
</div>
```

### 5.3 色彩对比度

- 文本与背景对比度 ≥ 4.5:1（WCAG AA 标准）
- 大文本对比度 ≥ 3:1
- 不仅靠颜色传达信息（如错误同时用红色 + 图标 + 文字）
- 暗色模式下特别注意低对比度问题

### 5.4 屏幕阅读器

- 计算结果变化时使用 `aria-live="polite"` 通知
- 表格数据使用语义化 `<table>` 标签
- 图表提供文字替代描述
