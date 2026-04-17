/** 调用链中单个函数的栈占用条目 */
export interface StackEntry {
  id: string;
  functionName: string;
  /** 该函数局部变量估算字节数 */
  stackBytes: number;
}

/** 目标 RTOS 类型 */
export type TargetRtos = "freertos" | "rt-thread" | "generic";

/** RTOS 元数据 */
export interface RtosMeta {
  /** 显示名称 */
  label: string;
  /** configMINIMAL_STACK_SIZE 的 word 数 */
  minimalStackWords: number;
  /** xTaskCreate 类似的代码模板（含占位符 {N}） */
  codeTemplate: string;
}

/** 栈估算输入 */
export interface CalcInput {
  entries: StackEntry[];
  /** 是否在 ISR 中调用 */
  isInIsr: boolean;
  /** 是否使用 printf */
  usesPrintf: boolean;
  /** 目标 RTOS */
  targetRtos: TargetRtos;
}

/** 栈估算结果 */
export interface CalcResult {
  /** 调用链累加字节 */
  callChainBytes: number;
  /** ISR 修正字节（CM3: 32B） */
  isrOverheadBytes: number;
  /** printf 修正字节 */
  printfOverheadBytes: number;
  /** 修正后总需求（未含安全余量） */
  adjustedBytes: number;
  /** 加 30% 安全余量后的推荐字节 */
  recommendedBytes: number;
  /** 转 word 单位（向上取整到 minimalStackWords 倍数） */
  finalStackWords: number;
  /** 最终字节数（finalStackWords * 4） */
  finalStackBytes: number;
  /** 倍数（即代码片段中 N * configMINIMAL_STACK_SIZE 的 N） */
  multiplier: number;
  /** 生成的代码片段 */
  codeSnippet: string;
}

/** 预设场景 */
export interface StackPreset {
  name: string;
  description: string;
  entries: Omit<StackEntry, "id">[];
  isInIsr: boolean;
  usesPrintf: boolean;
}
