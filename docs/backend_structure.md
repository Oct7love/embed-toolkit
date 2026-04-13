# 数据结构与状态管理

> 本项目是纯前端应用，此文档中的「数据结构」指前端状态管理和本地持久化方案，不涉及后端数据库。

## 1. 状态管理策略

### 1.1 分层原则

| 层级 | 方案 | 适用场景 |
|------|------|----------|
| **组件内状态** | React `useState` / `useReducer` | 工具的临时输入值、UI 开关状态 |
| **工具级状态** | Zustand store | 需要持久化的用户配置、模板、历史记录 |
| **全局状态** | Zustand store | 主题偏好、侧边栏状态、最近使用记录 |

### 1.2 判断标准

- 状态是否需要在页面刷新后保留？ → **是** → Zustand + persist
- 状态是否需要跨组件共享？ → **是** → Zustand
- 以上都不是？ → React 内置 state

## 2. 全局 Store

### 2.1 应用全局状态 `app-store.ts`

```typescript
// stores/app-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  // 侧边栏
  sidebarOpen: boolean;
  sidebarCollapsedCategories: string[];

  // 最近使用
  recentTools: RecentTool[];

  // Actions
  toggleSidebar: () => void;
  toggleCategory: (category: string) => void;
  addRecentTool: (tool: RecentTool) => void;
}

interface RecentTool {
  path: string;       // 路由路径，如 "/tools/converter/base-converter"
  name: string;       // 工具名称
  category: string;   // 分类
  lastUsed: number;   // 时间戳
}
```

**localStorage key:** `embed-toolkit-app`

**持久化字段：** `sidebarCollapsedCategories`、`recentTools`

**最近使用规则：**
- 最多保留 20 条记录
- 按 `lastUsed` 倒序排列
- 相同工具重复使用只更新时间戳

## 3. 工具级 Store

### 3.1 通用工具 Store 模式

每个需要持久化的工具遵循相同的 store 模式：

```typescript
// stores/[tool-name]-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ToolState {
  // 用户配置（持久化）
  config: ToolConfig;

  // 保存的模板（持久化）
  templates: Template[];

  // Actions
  updateConfig: (config: Partial<ToolConfig>) => void;
  saveTemplate: (template: Template) => void;
  deleteTemplate: (id: string) => void;
  loadTemplate: (id: string) => void;
}
```

### 3.2 各工具数据模型

---

#### 进制转换器

```typescript
// types/base-converter.ts
type Base = "hex" | "dec" | "oct" | "bin";
type BitWidth = 8 | 16 | 32 | 64;
type SignMode = "unsigned" | "signed";

interface BaseConverterConfig {
  bitWidth: BitWidth;
  signMode: SignMode;
  batchMode: boolean;
}
```

不需要 Zustand store，用组件内 `useState` 即可。

---

#### IEEE 754 浮点解析器

```typescript
// types/ieee754-parser.ts
type FloatType = "float32" | "float64";

interface IEEE754Result {
  sign: number;           // 0 或 1
  exponent: string;       // 二进制字符串
  mantissa: string;       // 二进制字符串
  exponentValue: number;  // 指数实际值
  mantissaValue: number;  // 尾数实际值
  floatValue: number;     // 最终浮点数值
  special: "normal" | "subnormal" | "zero" | "infinity" | "nan";
}
```

不需要 Zustand store。

---

#### 字节序转换器

```typescript
// types/endian-converter.ts
type ByteWidth = 16 | 32 | 64;
type Endianness = "big" | "little";

interface EndianResult {
  bigEndian: string;
  littleEndian: string;
  bytes: string[];  // 按字节拆分，标注编号
}
```

不需要 Zustand store。

---

#### 校验和计算器

```typescript
// types/checksum-calculator.ts
interface CRCPreset {
  name: string;         // 如 "CRC-16/MODBUS"
  width: 8 | 16 | 32;
  polynomial: number;
  init: number;
  refIn: boolean;
  refOut: boolean;
  xorOut: number;
}

interface ChecksumConfig {
  algorithm: "crc" | "xor" | "sum";
  crcPreset: string;       // 预设名称
  customPolynomial: number;
  inputMode: "hex" | "ascii";
}
```

**Zustand store:** 持久化 `customPolynomial` 和上次使用的算法/预设。

**localStorage key:** `embed-toolkit-checksum`

---

#### 串口协议解析器

```typescript
// types/serial-parser.ts
interface ProtocolField {
  id: string;
  name: string;           // 字段名，如 "帧头"、"数据长度"
  offset: number;         // 字节偏移
  length: number;         // 字节长度
  type: "header" | "length" | "data" | "checksum" | "custom";
  color: string;          // 高亮颜色
}

interface ProtocolTemplate {
  id: string;
  name: string;           // 模板名称
  description: string;
  fields: ProtocolField[];
  checksumAlgorithm: "crc16" | "xor" | "sum" | "none";
  createdAt: number;
}

interface SerialParserStore {
  templates: ProtocolTemplate[];
  activeTemplateId: string | null;
}
```

**Zustand store:** 持久化模板列表。

**localStorage key:** `embed-toolkit-serial-parser`

---

#### MQTT 报文解析器

```typescript
// types/mqtt-parser.ts
type MQTTPacketType =
  | "CONNECT" | "CONNACK" | "PUBLISH" | "PUBACK"
  | "PUBREC" | "PUBREL" | "PUBCOMP" | "SUBSCRIBE"
  | "SUBACK" | "UNSUBSCRIBE" | "UNSUBACK"
  | "PINGREQ" | "PINGRESP" | "DISCONNECT";

interface MQTTFixedHeader {
  packetType: MQTTPacketType;
  dup: boolean;
  qos: 0 | 1 | 2;
  retain: boolean;
  remainingLength: number;
}

interface MQTTParseResult {
  fixedHeader: MQTTFixedHeader;
  variableHeader: Record<string, unknown>;
  payload: Record<string, unknown>;
  raw: string;
}
```

不需要 Zustand store。

---

#### JSON 协议构造器

```typescript
// types/json-builder.ts
type JsonValueType = "string" | "number" | "boolean" | "array" | "object";

interface JsonField {
  id: string;
  key: string;
  valueType: JsonValueType;
  value: string | number | boolean;
  children?: JsonField[];  // object/array 类型的子字段
}

interface JsonTemplate {
  id: string;
  name: string;
  fields: JsonField[];
  createdAt: number;
}

interface JsonBuilderStore {
  templates: JsonTemplate[];
}
```

**Zustand store:** 持久化模板。

**localStorage key:** `embed-toolkit-json-builder`

---

#### Modbus 帧生成器

```typescript
// types/modbus-generator.ts
type ModbusFunctionCode = 1 | 2 | 3 | 4 | 5 | 6 | 15 | 16;

interface ModbusRequest {
  slaveAddress: number;       // 1-247
  functionCode: ModbusFunctionCode;
  startAddress: number;       // 0x0000-0xFFFF
  quantity: number;           // 寄存器数量或写入值
  writeValues?: number[];     // 多寄存器写入时的值列表
}

interface ModbusFrame {
  rtu: string;    // RTU 帧 hex 字符串（含 CRC）
  tcp: string;    // TCP 帧 hex 字符串（含 MBAP）
  fields: ModbusFrameField[];
}

interface ModbusFrameField {
  name: string;
  hex: string;
  description: string;
  color: string;
}
```

不需要 Zustand store。

---

#### 寄存器位域计算器

```typescript
// types/register-viewer.ts
interface BitField {
  name: string;
  startBit: number;     // 起始 bit（含）
  endBit: number;       // 结束 bit（含）
  description: string;
  color: string;
}

interface RegisterTemplate {
  id: string;
  name: string;           // 如 "STM32 GPIO_MODER"
  description: string;
  width: 8 | 16 | 32;
  fields: BitField[];
  createdAt: number;
}

interface RegisterViewerStore {
  templates: RegisterTemplate[];
  activeTemplateId: string | null;
}
```

**Zustand store:** 持久化位域模板。

**localStorage key:** `embed-toolkit-register-viewer`

---

#### GPIO 引脚分配表

```typescript
// types/gpio-planner.ts
interface ChipDefinition {
  id: string;
  name: string;             // 如 "STM32F103C8T6"
  pins: PinDefinition[];
}

interface PinDefinition {
  number: number;
  name: string;             // 如 "PA0"
  defaultFunction: string;  // 默认功能
  alternateFunctions: string[];  // 可复用功能列表
}

interface PinAssignment {
  pinNumber: number;
  assignedFunction: string;
}

interface GpioPlannerStore {
  selectedChip: string;
  assignments: PinAssignment[];
}
```

**Zustand store:** 持久化引脚分配方案。

**localStorage key:** `embed-toolkit-gpio-planner`

---

#### 电阻色环计算器 / 分压 RC 滤波计算器

不需要 Zustand store，用组件内状态即可。

---

#### 任务调度甘特图

```typescript
// types/task-scheduler.ts
interface RTOSTask {
  id: string;
  name: string;
  priority: number;       // 数字越大优先级越高
  period: number;         // 周期 (ms)
  executionTime: number;  // 执行时间 (ms)
  color: string;
}

interface ScheduleResult {
  timeline: TimeSlot[];
  cpuUtilization: number;
  missedDeadlines: string[];  // 错过 deadline 的任务名
}

interface TimeSlot {
  taskId: string;
  start: number;
  end: number;
  state: "running" | "ready" | "blocked";
}
```

不需要 Zustand store（任务列表不需要跨页面持久化）。

---

#### 内存布局可视化

```typescript
// types/memory-layout.ts
type MemoryType = "flash" | "ram";
type SectionType = "text" | "data" | "bss" | "heap" | "stack" | "custom";

interface MemorySection {
  id: string;
  name: string;
  type: SectionType;
  startAddress: number;
  size: number;
  memoryType: MemoryType;
  color: string;
}

interface MemoryConfig {
  flashSize: number;     // 总 Flash 大小 (bytes)
  ramSize: number;       // 总 RAM 大小 (bytes)
  flashStart: number;    // Flash 起始地址
  ramStart: number;      // RAM 起始地址
  sections: MemorySection[];
}
```

不需要 Zustand store。

---

#### 位操作代码生成器

```typescript
// types/bit-operation.ts
type BitOperation = "set" | "clear" | "toggle" | "read";
type CodeStyle = "macro" | "inline-function";

interface BitOperationConfig {
  registerName: string;    // 如 "GPIOA->ODR"
  selectedBits: number[];  // 选中的 bit 位列表
  operation: BitOperation;
  codeStyle: CodeStyle;
}
```

不需要 Zustand store。

---

#### 状态机编辑器

```typescript
// types/state-machine.ts
interface StateMachineState {
  id: string;
  name: string;
  x: number;             // 画布 x 坐标
  y: number;             // 画布 y 坐标
  isInitial: boolean;
  isFinal: boolean;
}

interface StateTransition {
  id: string;
  from: string;          // 源状态 id
  to: string;            // 目标状态 id
  event: string;         // 触发事件
  action: string;        // 执行动作
}

interface StateMachineProject {
  id: string;
  name: string;
  states: StateMachineState[];
  transitions: StateTransition[];
  createdAt: number;
}

interface StateMachineStore {
  projects: StateMachineProject[];
  activeProjectId: string | null;
}
```

**Zustand store:** 持久化状态机项目。

**localStorage key:** `embed-toolkit-state-machine`

---

#### 嵌入式面试题库

```typescript
// types/interview-quiz.ts
type QuestionCategory = "c-language" | "rtos" | "protocol" | "hardware";
type QuestionType = "single-choice" | "true-false";

interface Question {
  id: string;
  category: QuestionCategory;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: number;    // 正确选项的 index
  explanation: string;
}

interface QuizStats {
  totalAnswered: number;
  correctCount: number;
  categoryStats: Record<QuestionCategory, { total: number; correct: number }>;
}

interface QuizStore {
  favorites: string[];       // 收藏的题目 id
  wrongAnswers: string[];    // 错题 id
  stats: QuizStats;
  answeredIds: string[];     // 本轮已答题目（用于去重）
}
```

**Zustand store:** 持久化收藏、错题、统计。

**localStorage key:** `embed-toolkit-quiz`

---

## 4. localStorage 键名汇总

| Key | 存储内容 | 大小预估 |
|-----|----------|----------|
| `embed-toolkit-app` | 侧边栏状态、最近使用记录 | < 2KB |
| `embed-toolkit-checksum` | 校验和计算器配置 | < 1KB |
| `embed-toolkit-serial-parser` | 协议模板 | < 10KB |
| `embed-toolkit-json-builder` | JSON 模板 | < 5KB |
| `embed-toolkit-register-viewer` | 位域模板 | < 5KB |
| `embed-toolkit-gpio-planner` | 引脚分配方案 | < 5KB |
| `embed-toolkit-state-machine` | 状态机项目 | < 10KB |
| `embed-toolkit-quiz` | 面试题统计和收藏 | < 5KB |
| `theme` | 主题偏好（next-themes） | < 0.1KB |

**总计：** < 50KB，远低于浏览器 localStorage 的 5MB 限制。

## 5. 数据流架构图

```
用户操作
  │
  ▼
React 组件（useState / useReducer）
  │
  ├──────────────────┐
  ▼                  ▼
lib/ 纯函数计算      Zustand Store
  │                  │
  ▼                  ▼
UI 渲染结果         localStorage（persist 中间件）
                     │
                     ▼
                  页面刷新时自动恢复
```
