/**
 * 中断服务程序模板生成器 — 类型定义
 */

export type McuFamily = "stm32f1" | "stm32f4" | "stm32h7" | "stm32g0" | "stm32l4";

export type IsrType =
  | "exti"
  | "tim-update"
  | "tim-ccr"
  | "uart-rx"
  | "uart-rx-idle-dma"
  | "adc-eoc"
  | "dma-tc"
  | "systick";

export type ExtiEdge = "rising" | "falling" | "both";

export type NotifyMechanism = "task-notify" | "queue" | "binary-semaphore";

export interface ExtiConfig {
  line: number; // 0-15
  edge: ExtiEdge;
}

export interface TimerConfig {
  /** 例如 "TIM2"、"TIM3" */
  instance: string;
}

export interface UartConfig {
  /** 例如 "USART1"、"USART2" */
  instance: string;
}

export interface DmaConfig {
  /** 例如 "DMA1"、"DMA2" */
  controller: string;
  /** 例如 stream/channel 编号（0-7） */
  streamOrChannel: number;
}

export interface AdcConfig {
  /** 例如 "ADC1" */
  instance: string;
}

export interface IsrConfig {
  mcu: McuFamily;
  isrType: IsrType;
  exti?: ExtiConfig;
  timer?: TimerConfig;
  uart?: UartConfig;
  dma?: DmaConfig;
  adc?: AdcConfig;
  notify: {
    enabled: boolean;
    mechanisms: NotifyMechanism[];
  };
  enableCriticalSection: boolean;
}

export interface IsrGenerationResult {
  code: string;
  vectorNote: string;
}
