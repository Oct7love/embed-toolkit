# 应用流程文档

## 1. 路由结构

### 1.1 完整路由表

```
/                                          → 首页 Dashboard
/tools/converter/base-converter            → 进制转换器
/tools/converter/ieee754-parser            → IEEE 754 浮点解析器
/tools/converter/endian-converter          → 字节序转换器
/tools/converter/checksum-calculator       → 校验和计算器
/tools/converter/ascii-table               → ASCII/编码对照表
/tools/protocol/serial-parser              → 串口协议解析器
/tools/protocol/mqtt-parser                → MQTT 报文解析器
/tools/protocol/json-builder               → JSON 协议构造器
/tools/protocol/modbus-generator           → Modbus 帧生成器
/tools/hardware/register-viewer            → 寄存器位域计算器
/tools/hardware/gpio-planner               → GPIO 引脚分配表
/tools/hardware/resistor-calculator        → 电阻色环计算器
/tools/hardware/rc-calculator              → 分压/RC 滤波计算器
/tools/rtos/task-scheduler                 → 任务调度甘特图
/tools/rtos/memory-layout                  → 内存布局可视化
/tools/codegen/bit-operation               → 位操作代码生成器
/tools/codegen/state-machine               → 状态机编辑器
/tools/learning/interview-quiz             → 嵌入式面试题库
```

### 1.2 路由目录结构（App Router）

```
app/
├── layout.tsx                             → 根布局（侧边栏 + 主内容区）
├── page.tsx                               → 首页 Dashboard
└── tools/
    ├── converter/
    │   ├── base-converter/page.tsx
    │   ├── ieee754-parser/page.tsx
    │   ├── endian-converter/page.tsx
    │   ├── checksum-calculator/page.tsx
    │   └── ascii-table/page.tsx
    ├── protocol/
    │   ├── serial-parser/page.tsx
    │   ├── mqtt-parser/page.tsx
    │   ├── json-builder/page.tsx
    │   └── modbus-generator/page.tsx
    ├── hardware/
    │   ├── register-viewer/page.tsx
    │   ├── gpio-planner/page.tsx
    │   ├── resistor-calculator/page.tsx
    │   └── rc-calculator/page.tsx
    ├── rtos/
    │   ├── task-scheduler/page.tsx
    │   └── memory-layout/page.tsx
    ├── codegen/
    │   ├── bit-operation/page.tsx
    │   └── state-machine/page.tsx
    └── learning/
        └── interview-quiz/page.tsx
```

## 2. 页面布局结构

### 2.1 桌面端布局（≥1024px）

```
┌──────────────────────────────────────────────────┐
│  Header（Logo + 搜索栏 + 主题切换）               │
├────────────┬─────────────────────────────────────┤
│            │                                     │
│  侧边栏     │         主内容区                    │
│  (260px)   │                                     │
│            │   ┌─────────────────────────────┐   │
│  数据转换 ▼ │   │                             │   │
│   · 进制转换│   │      工具操作界面             │   │
│   · IEEE754│   │                             │   │
│   · ...    │   │   输入区（上/左）             │   │
│            │   │   结果区（下/右）             │   │
│  协议调试 ▶ │   │                             │   │
│  芯片硬件 ▶ │   └─────────────────────────────┘   │
│  RTOS ▶    │                                     │
│  代码辅助 ▶ │                                     │
│  学习求职 ▶ │                                     │
│            │                                     │
└────────────┴─────────────────────────────────────┘
```

### 2.2 移动端布局（<768px）

```
┌──────────────────────┐
│  Header（Logo + 搜索）│
├──────────────────────┤
│                      │
│     主内容区          │
│                      │
│   工具操作界面        │
│   （全宽，纵向排列）  │
│                      │
│                      │
├──────────────────────┤
│ 转换 │ 协议 │ 硬件 │ …│  ← 底部 Tab
└──────────────────────┘
```

## 3. 页面跳转关系

```mermaid
graph TD
    A[首页 Dashboard] --> B[搜索工具]
    A --> C[分类卡片]
    A --> D[最近使用]
    
    B --> E[搜索结果列表]
    E --> F[工具页面]
    
    C --> G[分类工具列表]
    G --> F
    
    D --> F
    
    H[侧边栏] --> G
    H --> F
    
    F --> |面包屑导航| A
    F --> |面包屑导航| G
    F --> |侧边栏切换| F2[其他工具页面]
```

## 4. 用户操作流程

### 4.1 首次访问流程

```mermaid
flowchart TD
    A[用户访问首页] --> B{已有访问记录?}
    B -->|是| C[显示最近使用的工具]
    B -->|否| D[显示全部工具卡片]
    C --> E[用户选择工具]
    D --> E
    E --> F[进入工具页面]
    F --> G[输入数据]
    G --> H[实时计算/转换]
    H --> I[查看结果]
    I --> J{需要复制?}
    J -->|是| K[一键复制结果]
    J -->|否| L{继续使用?}
    K --> L
    L -->|换个工具| E
    L -->|修改输入| G
    L -->|离开| M[关闭页面]
```

### 4.2 工具搜索流程

```mermaid
flowchart TD
    A[点击搜索栏 / 快捷键 Ctrl+K] --> B[输入关键词]
    B --> C[实时过滤工具列表]
    C --> D{找到目标工具?}
    D -->|是| E[点击/回车进入]
    D -->|否| F[展示空状态提示]
    E --> G[工具页面]
```

### 4.3 工具通用操作流程

```mermaid
flowchart TD
    A[进入工具页面] --> B[选择模式/参数]
    B --> C[输入数据]
    C --> D{输入合法?}
    D -->|是| E[实时计算结果]
    D -->|否| F[显示错误提示]
    F --> C
    E --> G[结果展示区]
    G --> H{用户操作}
    H -->|复制| I[复制到剪贴板 + toast 提示]
    H -->|保存配置| J[存储到 localStorage]
    H -->|重置| K[清空输入，恢复默认]
    H -->|修改输入| C
    I --> H
    J --> H
    K --> C
```

### 4.4 模板管理流程（适用于串口协议解析器、寄存器位域计算器等）

```mermaid
flowchart TD
    A[工具页面] --> B{使用模板?}
    B -->|选择已有模板| C[从 localStorage 加载]
    B -->|新建模板| D[填写模板字段]
    C --> E[模板应用到工具]
    D --> F[保存模板]
    F --> G[存储到 localStorage]
    G --> E
    E --> H[使用工具]
```

## 5. 数据流向

```mermaid
flowchart LR
    A[用户输入] --> B[React State]
    B --> C[lib/ 纯函数计算]
    C --> D[计算结果]
    D --> E[UI 渲染]
    
    B --> |需要持久化| F[Zustand Store]
    F --> G[localStorage]
    G --> |页面加载时| F
    F --> B
```

## 6. 首页 Dashboard 结构

```
┌─────────────────────────────────────────────┐
│  🔍 搜索工具...                    Ctrl+K   │
├─────────────────────────────────────────────┤
│                                             │
│  最近使用                          查看全部 →│
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │进制   │ │CRC   │ │寄存器│ │Modbus│      │
│  │转换器 │ │计算器│ │位域  │ │生成器│      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│                                             │
│  数据转换工具                               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │      │ │      │ │      │ │      │      │
│  │      │ │      │ │      │ │      │      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│                                             │
│  协议调试工具                               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │      │ │      │ │      │ │      │      │
│  │      │ │      │ │      │ │      │      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│                                             │
│  ... 其他分类                               │
└─────────────────────────────────────────────┘
```
