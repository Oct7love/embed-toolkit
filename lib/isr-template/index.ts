import type {
  IsrConfig,
  IsrGenerationResult,
  McuFamily,
  IsrType,
  NotifyMechanism,
  ExtiEdge,
} from "@/types/isr-template";

/**
 * 中断服务程序模板生成器 — 纯计算逻辑
 *
 * generateIsr(config) 返回完整 C 代码与向量表注册说明。
 */

/** 标准警告注释块，顶部提醒 */
const WARNING_BANNER: string = [
  "/* ==========================================================================",
  " * WARNINGS — 中断服务程序必读",
  " * --------------------------------------------------------------------------",
  " * ⚠️ 不要在 ISR 中调用 printf / fprintf / puts 等标准 IO（非异步，耗时巨大）",
  " * ⚠️ 不要调用阻塞 API（HAL_Delay、osDelay、semaphore 非 FromISR 版本等）",
  " * ⚠️ 不要使用 malloc / free / new / delete（非确定性、可能死锁）",
  " * ⚠️ 不要在 ISR 内做长循环 / 长延时，保持执行时间最短",
  " * ⚠️ 共享变量需加 volatile，或使用 FromISR 专用同步原语",
  " * ⚠️ FreeRTOS 中断优先级必须 ≥ configMAX_SYSCALL_INTERRUPT_PRIORITY",
  " * ========================================================================== */",
].join("\n");

/** MCU 系列的人类可读名 */
const MCU_LABEL: Record<McuFamily, string> = {
  stm32f1: "STM32F1",
  stm32f4: "STM32F4",
  stm32h7: "STM32H7",
  stm32g0: "STM32G0",
  stm32l4: "STM32L4",
};

/** EXTI 清中断标志宏：不同 MCU 系列宏名称不同 */
function extiClearMacro(mcu: McuFamily, line: number): string {
  switch (mcu) {
    case "stm32f1":
      // F1 使用旧版 HAL 宏
      return `__HAL_GPIO_EXTI_CLEAR_IT(GPIO_PIN_${line});`;
    case "stm32f4":
    case "stm32l4":
      return `__HAL_GPIO_EXTI_CLEAR_IT(GPIO_PIN_${line});`;
    case "stm32h7":
      // H7 的 EXTI 有 rising/falling 独立标志
      return `__HAL_GPIO_EXTI_CLEAR_RISING_IT(GPIO_PIN_${line});\n    __HAL_GPIO_EXTI_CLEAR_FALLING_IT(GPIO_PIN_${line});`;
    case "stm32g0":
      // G0 EXTI 也区分 rising/falling
      return `__HAL_GPIO_EXTI_CLEAR_RISING_IT(GPIO_PIN_${line});\n    __HAL_GPIO_EXTI_CLEAR_FALLING_IT(GPIO_PIN_${line});`;
  }
}

/** EXTI IRQ 名：单独线 / 分组线 */
function extiIrqName(mcu: McuFamily, line: number): string {
  // STM32 惯例：EXTI0、EXTI1、EXTI2、EXTI3、EXTI4、EXTI9_5、EXTI15_10
  // G0 较特殊：EXTI0_1_IRQn / EXTI2_3_IRQn / EXTI4_15_IRQn
  if (mcu === "stm32g0") {
    if (line <= 1) return "EXTI0_1_IRQHandler";
    if (line <= 3) return "EXTI2_3_IRQHandler";
    return "EXTI4_15_IRQHandler";
  }
  if (line <= 4) return `EXTI${line}_IRQHandler`;
  if (line <= 9) return "EXTI9_5_IRQHandler";
  return "EXTI15_10_IRQHandler";
}

function edgeComment(edge: ExtiEdge): string {
  switch (edge) {
    case "rising":
      return "上升沿触发";
    case "falling":
      return "下降沿触发";
    case "both":
      return "双边沿触发";
  }
}

/** 通知机制代码块 */
function notifyBlock(mechanisms: NotifyMechanism[]): string[] {
  if (mechanisms.length === 0) return [];
  const lines: string[] = [];
  lines.push("    BaseType_t higherPriorityTaskWoken = pdFALSE;");
  lines.push("");
  for (const m of mechanisms) {
    switch (m) {
      case "task-notify":
        lines.push("    /* FreeRTOS Task Notification */");
        lines.push(
          "    vTaskNotifyGiveFromISR(xNotifyTaskHandle, &higherPriorityTaskWoken);"
        );
        lines.push(
          "    /* 或使用带值通知: xTaskNotifyFromISR(xNotifyTaskHandle, 0, eSetBits, &higherPriorityTaskWoken); */"
        );
        break;
      case "queue":
        lines.push("    /* FreeRTOS Queue */");
        lines.push(
          "    xQueueSendFromISR(xIsrQueueHandle, &isrPayload, &higherPriorityTaskWoken);"
        );
        break;
      case "binary-semaphore":
        lines.push("    /* FreeRTOS Binary Semaphore */");
        lines.push(
          "    xSemaphoreGiveFromISR(xIsrSemaphoreHandle, &higherPriorityTaskWoken);"
        );
        break;
    }
    lines.push("");
  }
  lines.push("    /* 若有更高优先级任务被唤醒则立即切换上下文 */");
  lines.push("    portYIELD_FROM_ISR(higherPriorityTaskWoken);");
  return lines;
}

/** 临界区代码块（ISR 版本）*/
function criticalSectionEnter(): string[] {
  return [
    "    /* ISR 临界区（屏蔽比 configMAX_SYSCALL_INTERRUPT_PRIORITY 更低的中断）*/",
    "    UBaseType_t uxSavedInterruptStatus = portSET_INTERRUPT_MASK_FROM_ISR();",
    "    /* 或使用宏形式: portENTER_CRITICAL_FROM_ISR(&uxSavedInterruptStatus); */",
  ];
}

function criticalSectionExit(): string[] {
  return [
    "    portCLEAR_INTERRUPT_MASK_FROM_ISR(uxSavedInterruptStatus);",
    "    /* 或使用宏形式: portEXIT_CRITICAL_FROM_ISR(uxSavedInterruptStatus); */",
  ];
}

/** EXTI ISR 代码生成 */
function generateExti(config: IsrConfig): IsrGenerationResult {
  const line = config.exti?.line ?? 0;
  const edge = config.exti?.edge ?? "rising";
  const irq = extiIrqName(config.mcu, line);
  const clearStmt = extiClearMacro(config.mcu, line);

  const lines: string[] = [];
  lines.push(`/* EXTI Line ${line} — ${edgeComment(edge)} (${MCU_LABEL[config.mcu]}) */`);
  lines.push(`void ${irq}(void)`);
  lines.push("{");
  lines.push(`    if (__HAL_GPIO_EXTI_GET_IT(GPIO_PIN_${line}) != RESET) {`);
  lines.push(`        /* 清除中断挂起标志 */`);
  lines.push(`        ${clearStmt.replace(/\n/g, "\n        ")}`);
  lines.push("");

  if (config.enableCriticalSection) {
    for (const l of criticalSectionEnter()) lines.push(`    ${l}`);
    lines.push("");
  }

  lines.push("        // TODO: your handler logic here");
  lines.push("");

  if (config.notify.enabled && config.notify.mechanisms.length > 0) {
    for (const l of notifyBlock(config.notify.mechanisms)) {
      lines.push(`    ${l}`);
    }
  }

  if (config.enableCriticalSection) {
    lines.push("");
    for (const l of criticalSectionExit()) lines.push(`    ${l}`);
  }

  lines.push("    }");
  lines.push("}");

  const vectorNote = `请在启动文件（startup_${config.mcu}xxxx.s）确认 ${irq} 已正确注册，或使用 CubeMX/HAL 自动生成的 stm32${config.mcu.slice(5)}xx_it.c 中对应的向量条目。`;

  return { code: lines.join("\n"), vectorNote };
}

/** TIM ISR 代码生成（Update / CCR） */
function generateTim(config: IsrConfig, kind: "update" | "ccr"): IsrGenerationResult {
  const tim = config.timer?.instance ?? "TIM2";
  const timNum = tim.replace(/[^0-9]/g, "") || "2";
  const flag = kind === "update" ? "TIM_FLAG_UPDATE" : "TIM_FLAG_CC1";
  const it = kind === "update" ? "TIM_IT_UPDATE" : "TIM_IT_CC1";
  const kindCn = kind === "update" ? "Update (周期)" : "CCR (捕获比较)";

  const lines: string[] = [];
  lines.push(`/* ${tim} ${kindCn} 中断 (${MCU_LABEL[config.mcu]}) */`);
  lines.push(`/* 假设句柄名为 htim${timNum} */`);
  lines.push(`extern TIM_HandleTypeDef htim${timNum};`);
  lines.push("");
  lines.push(`void ${tim}_IRQHandler(void)`);
  lines.push("{");
  lines.push(`    if (__HAL_TIM_GET_FLAG(&htim${timNum}, ${flag}) != RESET) {`);
  lines.push(`        if (__HAL_TIM_GET_IT_SOURCE(&htim${timNum}, ${it}) != RESET) {`);
  lines.push(`            __HAL_TIM_CLEAR_IT(&htim${timNum}, ${it});`);
  lines.push("");

  if (config.enableCriticalSection) {
    for (const l of criticalSectionEnter()) lines.push(`    ${l}`);
    lines.push("");
  }

  lines.push("            // TODO: your handler logic here");
  lines.push("");

  if (config.notify.enabled && config.notify.mechanisms.length > 0) {
    for (const l of notifyBlock(config.notify.mechanisms)) {
      lines.push(`        ${l}`);
    }
  }

  if (config.enableCriticalSection) {
    lines.push("");
    for (const l of criticalSectionExit()) lines.push(`    ${l}`);
  }

  lines.push("        }");
  lines.push("    }");
  lines.push("    /* 可选：交由 HAL 处理其他标志 */");
  lines.push(`    /* HAL_TIM_IRQHandler(&htim${timNum}); */`);
  lines.push("}");

  const vectorNote = `${tim}_IRQHandler 在 stm32${config.mcu.slice(5)}xx_it.c 中由 CubeMX 生成；若手写请确认启动文件向量表已指向此符号。`;
  return { code: lines.join("\n"), vectorNote };
}

/** UART RX ISR 代码生成 */
function generateUartRx(config: IsrConfig): IsrGenerationResult {
  const uart = config.uart?.instance ?? "USART1";
  const huartName = `h${uart.toLowerCase()}`;

  const lines: string[] = [];
  lines.push(`/* ${uart} RX 中断 (${MCU_LABEL[config.mcu]}) */`);
  lines.push(`extern UART_HandleTypeDef ${huartName};`);
  lines.push("");
  lines.push(`void ${uart}_IRQHandler(void)`);
  lines.push("{");
  lines.push(`    if (__HAL_UART_GET_FLAG(&${huartName}, UART_FLAG_RXNE) != RESET) {`);
  lines.push(`        uint8_t rxByte = (uint8_t)(${huartName}.Instance->${rxDataReg(config.mcu)} & 0xFFU);`);
  lines.push("");

  if (config.enableCriticalSection) {
    for (const l of criticalSectionEnter()) lines.push(`    ${l}`);
    lines.push("");
  }

  lines.push("        // TODO: your handler logic here (store rxByte into ring buffer etc.)");
  lines.push("");

  if (config.notify.enabled && config.notify.mechanisms.length > 0) {
    for (const l of notifyBlock(config.notify.mechanisms)) {
      lines.push(`    ${l}`);
    }
  }

  if (config.enableCriticalSection) {
    lines.push("");
    for (const l of criticalSectionExit()) lines.push(`    ${l}`);
  }

  lines.push("    }");
  lines.push("    /* 兜底：清除 ORE 等错误标志 */");
  lines.push(`    /* HAL_UART_IRQHandler(&${huartName}); */`);
  lines.push("}");

  const vectorNote = `确认 stm32${config.mcu.slice(5)}xx_it.c 中 ${uart}_IRQHandler 符号存在；启动文件向量表应指向此函数。`;
  return { code: lines.join("\n"), vectorNote };
}

/** 不同 MCU 系列 UART RX 数据寄存器名不同 */
function rxDataReg(mcu: McuFamily): string {
  // F1/F4 用 DR；H7/G0/L4 用 RDR
  switch (mcu) {
    case "stm32f1":
    case "stm32f4":
      return "DR";
    case "stm32h7":
    case "stm32g0":
    case "stm32l4":
      return "RDR";
  }
}

/** UART RX IDLE + DMA 不定长接收 */
function generateUartRxIdleDma(config: IsrConfig): IsrGenerationResult {
  const uart = config.uart?.instance ?? "USART1";
  const huartName = `h${uart.toLowerCase()}`;

  const lines: string[] = [];
  lines.push(
    `/* ${uart} RX IDLE + DMA 不定长接收 (${MCU_LABEL[config.mcu]}) */`
  );
  lines.push("/* 使用步骤：");
  lines.push(`   1) HAL_UARTEx_ReceiveToIdle_DMA(&${huartName}, buf, BUF_SIZE);`);
  lines.push("   2) 禁用 DMA 的 half-transfer 中断以减少 ISR 次数（可选）");
  lines.push("   3) 在 HAL_UARTEx_RxEventCallback 中处理接收到的数据 */");
  lines.push("");
  lines.push(`extern UART_HandleTypeDef ${huartName};`);
  lines.push("");
  lines.push(`void ${uart}_IRQHandler(void)`);
  lines.push("{");
  lines.push(`    HAL_UART_IRQHandler(&${huartName});`);
  lines.push("}");
  lines.push("");
  lines.push("/* HAL 回调：不定长接收完成（IDLE 或 DMA 满触发） */");
  lines.push(
    "void HAL_UARTEx_RxEventCallback(UART_HandleTypeDef *huart, uint16_t Size)"
  );
  lines.push("{");
  lines.push(`    if (huart->Instance == ${uart}) {`);

  if (config.enableCriticalSection) {
    for (const l of criticalSectionEnter()) lines.push(`    ${l}`);
    lines.push("");
  }

  lines.push("        // TODO: your handler logic here — Size 即本次接收字节数");
  lines.push("");

  if (config.notify.enabled && config.notify.mechanisms.length > 0) {
    for (const l of notifyBlock(config.notify.mechanisms)) {
      lines.push(`    ${l}`);
    }
  }

  if (config.enableCriticalSection) {
    lines.push("");
    for (const l of criticalSectionExit()) lines.push(`    ${l}`);
  }

  lines.push(
    `        /* 重新启动接收 */`
  );
  lines.push(
    `        HAL_UARTEx_ReceiveToIdle_DMA(&${huartName}, rxBuffer, RX_BUFFER_SIZE);`
  );
  lines.push("    }");
  lines.push("}");

  const vectorNote = `确保 ${uart}_IRQHandler 和对应 DMA stream 的 IRQHandler 都在向量表中注册；启用 NVIC UART 和 DMA 中断。`;
  return { code: lines.join("\n"), vectorNote };
}

/** ADC EOC */
function generateAdcEoc(config: IsrConfig): IsrGenerationResult {
  const adc = config.adc?.instance ?? "ADC1";
  const hadc = `h${adc.toLowerCase()}`;

  const lines: string[] = [];
  lines.push(`/* ${adc} EOC (End Of Conversion) 中断 (${MCU_LABEL[config.mcu]}) */`);
  lines.push(`extern ADC_HandleTypeDef ${hadc};`);
  lines.push("");
  lines.push(`void ${adcIrqName(config.mcu, adc)}(void)`);
  lines.push("{");
  lines.push(`    if (__HAL_ADC_GET_FLAG(&${hadc}, ADC_FLAG_EOC) != RESET) {`);
  lines.push(`        __HAL_ADC_CLEAR_FLAG(&${hadc}, ADC_FLAG_EOC);`);
  lines.push(`        uint32_t adcValue = HAL_ADC_GetValue(&${hadc});`);
  lines.push("        (void)adcValue;");
  lines.push("");

  if (config.enableCriticalSection) {
    for (const l of criticalSectionEnter()) lines.push(`    ${l}`);
    lines.push("");
  }

  lines.push("        // TODO: your handler logic here");
  lines.push("");

  if (config.notify.enabled && config.notify.mechanisms.length > 0) {
    for (const l of notifyBlock(config.notify.mechanisms)) {
      lines.push(`    ${l}`);
    }
  }

  if (config.enableCriticalSection) {
    lines.push("");
    for (const l of criticalSectionExit()) lines.push(`    ${l}`);
  }

  lines.push("    }");
  lines.push("}");

  const vectorNote = `ADC 中断在不同 MCU 上可能与其他 ADC 共享 IRQ 向量（如 ADC1_2_IRQn 或 ADC1_COMP_IRQn），请以启动文件为准。`;
  return { code: lines.join("\n"), vectorNote };
}

function adcIrqName(mcu: McuFamily, adc: string): string {
  const n = adc.replace(/[^0-9]/g, "") || "1";
  switch (mcu) {
    case "stm32f1":
      return `ADC1_2_IRQHandler`; // F1 ADC1/2 共用
    case "stm32f4":
      return `ADC_IRQHandler`; // F4 所有 ADC 共用
    case "stm32h7":
      return `ADC_IRQHandler`;
    case "stm32g0":
      return `ADC1_COMP_IRQHandler`;
    case "stm32l4":
      return `ADC${n}_IRQHandler`;
  }
}

/** DMA Transfer Complete */
function generateDmaTc(config: IsrConfig): IsrGenerationResult {
  const controller = config.dma?.controller ?? "DMA1";
  const n = config.dma?.streamOrChannel ?? 0;
  const irqName = dmaIrqName(config.mcu, controller, n);
  const hdma = `hdma_${controller.toLowerCase()}_${dmaUnitName(config.mcu)}${n}`;

  const lines: string[] = [];
  lines.push(
    `/* ${controller} ${dmaUnitName(config.mcu).toUpperCase()}${n} Transfer Complete (${MCU_LABEL[config.mcu]}) */`
  );
  lines.push(`extern DMA_HandleTypeDef ${hdma};`);
  lines.push("");
  lines.push(`void ${irqName}(void)`);
  lines.push("{");
  lines.push(`    HAL_DMA_IRQHandler(&${hdma});`);
  lines.push("}");
  lines.push("");
  lines.push("/* HAL 回调：DMA 传输完成 */");
  lines.push("void HAL_DMA_XferCpltCallback(DMA_HandleTypeDef *hdma)");
  lines.push("{");
  lines.push(`    if (hdma == &${hdma}) {`);

  if (config.enableCriticalSection) {
    for (const l of criticalSectionEnter()) lines.push(`    ${l}`);
    lines.push("");
  }

  lines.push("        // TODO: your handler logic here");
  lines.push("");

  if (config.notify.enabled && config.notify.mechanisms.length > 0) {
    for (const l of notifyBlock(config.notify.mechanisms)) {
      lines.push(`    ${l}`);
    }
  }

  if (config.enableCriticalSection) {
    lines.push("");
    for (const l of criticalSectionExit()) lines.push(`    ${l}`);
  }

  lines.push("    }");
  lines.push("}");

  const vectorNote = `${irqName} 必须在启动文件和 NVIC 中使能；DMA 通道/Stream 号与外设请求映射关系请查阅参考手册 DMA 章节。`;
  return { code: lines.join("\n"), vectorNote };
}

function dmaUnitName(mcu: McuFamily): string {
  // F4/H7 用 Stream，F1/G0/L4 用 Channel
  switch (mcu) {
    case "stm32f4":
    case "stm32h7":
      return "stream";
    case "stm32f1":
    case "stm32g0":
    case "stm32l4":
      return "channel";
  }
}

function dmaIrqName(mcu: McuFamily, controller: string, n: number): string {
  switch (mcu) {
    case "stm32f4":
    case "stm32h7":
      return `${controller}_Stream${n}_IRQHandler`;
    case "stm32f1":
    case "stm32l4":
      return `${controller}_Channel${n}_IRQHandler`;
    case "stm32g0":
      // G0 Channel 1 独立，Channel 2-3 合并，Channel 4-7 合并
      if (n === 1) return `${controller}_Channel1_IRQHandler`;
      if (n <= 3) return `${controller}_Channel2_3_IRQHandler`;
      return `${controller}_Ch4_7_DMAMUX1_OVR_IRQHandler`;
  }
}

/** SysTick */
function generateSysTick(config: IsrConfig): IsrGenerationResult {
  const lines: string[] = [];
  lines.push(`/* SysTick 系统滴答中断 (${MCU_LABEL[config.mcu]}) */`);
  lines.push("void SysTick_Handler(void)");
  lines.push("{");
  lines.push("    HAL_IncTick();");
  lines.push("");

  if (config.enableCriticalSection) {
    for (const l of criticalSectionEnter()) lines.push(`    ${l}`);
    lines.push("");
  }

  lines.push("    // TODO: your handler logic here");
  lines.push("");

  if (config.notify.enabled && config.notify.mechanisms.length > 0) {
    for (const l of notifyBlock(config.notify.mechanisms)) {
      lines.push(`    ${l}`);
    }
  }

  if (config.enableCriticalSection) {
    lines.push("");
    for (const l of criticalSectionExit()) lines.push(`    ${l}`);
  }

  lines.push("");
  lines.push("    /* 若使用 FreeRTOS，需在此调用 xPortSysTickHandler（由 port.c 提供） */");
  lines.push("    /* #if (INCLUDE_xTaskGetSchedulerState == 1) */");
  lines.push("    /*     if (xTaskGetSchedulerState() != taskSCHEDULER_NOT_STARTED) */");
  lines.push("    /* #endif */");
  lines.push("    /*     { xPortSysTickHandler(); } */");
  lines.push("}");

  const vectorNote = `SysTick_Handler 是 Cortex-M 内核异常，在启动文件中已预留向量位；无需 NVIC 使能。`;
  return { code: lines.join("\n"), vectorNote };
}

/** 分发器 */
function dispatch(config: IsrConfig): IsrGenerationResult {
  switch (config.isrType) {
    case "exti":
      return generateExti(config);
    case "tim-update":
      return generateTim(config, "update");
    case "tim-ccr":
      return generateTim(config, "ccr");
    case "uart-rx":
      return generateUartRx(config);
    case "uart-rx-idle-dma":
      return generateUartRxIdleDma(config);
    case "adc-eoc":
      return generateAdcEoc(config);
    case "dma-tc":
      return generateDmaTc(config);
    case "systick":
      return generateSysTick(config);
  }
}

/**
 * 生成完整 ISR 模板代码。
 */
export function generateIsr(config: IsrConfig): IsrGenerationResult {
  const result = dispatch(config);
  const fullCode = `${WARNING_BANNER}\n\n${result.code}\n`;
  return {
    code: fullCode,
    vectorNote: result.vectorNote,
  };
}

/** 可用 ISR 类型（给 UI 使用） */
export const ISR_TYPES: { value: IsrType; label: string }[] = [
  { value: "exti", label: "EXTI 外部中断（线 0-15）" },
  { value: "tim-update", label: "TIM Update（定时器周期）" },
  { value: "tim-ccr", label: "TIM CCR（捕获比较）" },
  { value: "uart-rx", label: "UART RX（接收中断）" },
  { value: "uart-rx-idle-dma", label: "UART RX IDLE + DMA（不定长接收）" },
  { value: "adc-eoc", label: "ADC EOC（转换完成）" },
  { value: "dma-tc", label: "DMA Transfer Complete" },
  { value: "systick", label: "SysTick" },
];

/** 可用 MCU 系列 */
export const MCU_FAMILIES: { value: McuFamily; label: string }[] = [
  { value: "stm32f1", label: "STM32F1" },
  { value: "stm32f4", label: "STM32F4" },
  { value: "stm32h7", label: "STM32H7" },
  { value: "stm32g0", label: "STM32G0" },
  { value: "stm32l4", label: "STM32L4" },
];
