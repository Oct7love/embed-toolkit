import type {
  CalcInput,
  CalcResult,
  RtosMeta,
  StackPreset,
  TargetRtos,
} from "@/types/stack-estimator";

/** Cortex-M3 中断压栈寄存器 (R0-R3, R12, LR, PC, xPSR) = 8 words = 32 bytes */
export const ISR_OVERHEAD_BYTES = 32;

/** printf 调用栈占用估算（字节） */
export const PRINTF_OVERHEAD_BYTES = 512;

/** 安全余量倍率 */
export const SAFETY_FACTOR = 1.3;

/** 一个 word = 4 bytes */
export const BYTES_PER_WORD = 4;

/** RTOS 元数据表 */
export const RTOS_META: Record<TargetRtos, RtosMeta> = {
  freertos: {
    label: "FreeRTOS",
    minimalStackWords: 128,
    codeTemplate:
      "xTaskCreate(taskFunc, \"task\", {N} * configMINIMAL_STACK_SIZE, NULL, tskIDLE_PRIORITY + 1, NULL);",
  },
  "rt-thread": {
    label: "RT-Thread",
    minimalStackWords: 256,
    codeTemplate:
      "rt_thread_create(\"task\", taskFunc, RT_NULL, {N} * RT_THREAD_STACK_SIZE, 10, 10);",
  },
  generic: {
    label: "通用 RTOS",
    minimalStackWords: 256,
    codeTemplate: "// 推荐栈大小: {N} * MINIMAL_STACK_SIZE words",
  },
};

/**
 * 计算任务栈深度需求
 *
 * 流程：
 *  1. 累加调用链中所有函数的局部变量字节
 *  2. 若在 ISR 中调用，加 32B（CM3 寄存器栈帧）
 *  3. 若使用 printf，加 512B
 *  4. 乘以 1.3（30% 安全余量）得到推荐字节
 *  5. 换算成 word，向上取整到目标 RTOS 的 configMINIMAL_STACK_SIZE 整数倍
 */
export function calculateStack(input: CalcInput): CalcResult {
  const { entries, isInIsr, usesPrintf, targetRtos } = input;

  const callChainBytes = entries.reduce(
    (sum, e) => sum + Math.max(0, Math.floor(e.stackBytes)),
    0
  );

  const isrOverheadBytes = isInIsr ? ISR_OVERHEAD_BYTES : 0;
  const printfOverheadBytes = usesPrintf ? PRINTF_OVERHEAD_BYTES : 0;

  const adjustedBytes = callChainBytes + isrOverheadBytes + printfOverheadBytes;
  const recommendedBytes = Math.ceil(adjustedBytes * SAFETY_FACTOR);

  const meta = RTOS_META[targetRtos];
  const minimalBytes = meta.minimalStackWords * BYTES_PER_WORD;

  // 推荐字节向上取整到 minimalBytes 整数倍；若为 0，至少给 1 倍
  const multiplier =
    recommendedBytes <= 0
      ? 1
      : Math.ceil(recommendedBytes / minimalBytes);

  const finalStackBytes = multiplier * minimalBytes;
  const finalStackWords = multiplier * meta.minimalStackWords;

  const codeSnippet = meta.codeTemplate.replace("{N}", String(multiplier));

  return {
    callChainBytes,
    isrOverheadBytes,
    printfOverheadBytes,
    adjustedBytes,
    recommendedBytes,
    finalStackWords,
    finalStackBytes,
    multiplier,
    codeSnippet,
  };
}

/** 内置预设场景 */
export const STACK_PRESETS: StackPreset[] = [
  {
    name: "简单 LED 闪烁任务",
    description: "3 个浅函数，无 printf，无 ISR",
    entries: [
      { functionName: "LED_Task", stackBytes: 32 },
      { functionName: "GPIO_TogglePin", stackBytes: 16 },
      { functionName: "vTaskDelay", stackBytes: 16 },
    ],
    isInIsr: false,
    usesPrintf: false,
  },
  {
    name: "UART 接收 + 解析",
    description: "含 printf 和深嵌套函数调用",
    entries: [
      { functionName: "UART_RxTask", stackBytes: 64 },
      { functionName: "Frame_Parse", stackBytes: 128 },
      { functionName: "CRC_Verify", stackBytes: 64 },
      { functionName: "Cmd_Dispatch", stackBytes: 96 },
      { functionName: "Log_Print", stackBytes: 48 },
    ],
    isInIsr: false,
    usesPrintf: true,
  },
  {
    name: "ISR 调度回调",
    description: "在 ISR 中调用，含 1-2 个浅函数",
    entries: [
      { functionName: "EXTI_IRQHandler", stackBytes: 24 },
      { functionName: "Button_Callback", stackBytes: 32 },
    ],
    isInIsr: true,
    usesPrintf: false,
  },
];
