import { describe, it, expect } from "vitest";
import { generateIsr } from "./index";
import type { IsrConfig } from "@/types/isr-template";

function baseConfig(overrides: Partial<IsrConfig>): IsrConfig {
  return {
    mcu: "stm32f4",
    isrType: "exti",
    notify: { enabled: false, mechanisms: [] },
    enableCriticalSection: false,
    ...overrides,
  };
}

describe("generateIsr — EXTI", () => {
  it("STM32F4 EXTI0 上升沿生成 EXTI0_IRQHandler 与 __HAL_GPIO_EXTI_CLEAR_IT", () => {
    const result = generateIsr(
      baseConfig({
        mcu: "stm32f4",
        isrType: "exti",
        exti: { line: 0, edge: "rising" },
      })
    );
    expect(result.code).toContain("EXTI0_IRQHandler");
    expect(result.code).toContain("__HAL_GPIO_EXTI_CLEAR_IT");
    expect(result.code).toContain("GPIO_PIN_0");
    expect(result.vectorNote.length).toBeGreaterThan(0);
  });

  it("STM32H7 EXTI 使用 RISING/FALLING 独立清标志宏", () => {
    const result = generateIsr(
      baseConfig({
        mcu: "stm32h7",
        isrType: "exti",
        exti: { line: 5, edge: "both" },
      })
    );
    expect(result.code).toContain("__HAL_GPIO_EXTI_CLEAR_RISING_IT");
    expect(result.code).toContain("__HAL_GPIO_EXTI_CLEAR_FALLING_IT");
    // line 5 应使用 EXTI9_5_IRQHandler
    expect(result.code).toContain("EXTI9_5_IRQHandler");
  });

  it("STM32G0 EXTI 线 4 应进入 EXTI4_15_IRQHandler 分组", () => {
    const result = generateIsr(
      baseConfig({
        mcu: "stm32g0",
        isrType: "exti",
        exti: { line: 4, edge: "rising" },
      })
    );
    expect(result.code).toContain("EXTI4_15_IRQHandler");
  });
});

describe("generateIsr — UART", () => {
  it("UART RX + Queue 通知生成 xQueueSendFromISR 与 portYIELD_FROM_ISR", () => {
    const result = generateIsr(
      baseConfig({
        mcu: "stm32f1",
        isrType: "uart-rx",
        uart: { instance: "USART1" },
        notify: { enabled: true, mechanisms: ["queue"] },
      })
    );
    expect(result.code).toContain("USART1_IRQHandler");
    expect(result.code).toContain("xQueueSendFromISR");
    expect(result.code).toContain("portYIELD_FROM_ISR");
    // F1 用 DR 寄存器
    expect(result.code).toContain("->DR");
  });

  it("UART RX IDLE + DMA 不定长接收生成 HAL_UARTEx_RxEventCallback", () => {
    const result = generateIsr(
      baseConfig({
        mcu: "stm32f4",
        isrType: "uart-rx-idle-dma",
        uart: { instance: "USART2" },
      })
    );
    expect(result.code).toContain("USART2_IRQHandler");
    expect(result.code).toContain("HAL_UARTEx_RxEventCallback");
    expect(result.code).toContain("HAL_UARTEx_ReceiveToIdle_DMA");
  });
});

describe("generateIsr — TIM", () => {
  it("TIM Update + Task Notification 生成 vTaskNotifyGiveFromISR", () => {
    const result = generateIsr(
      baseConfig({
        mcu: "stm32h7",
        isrType: "tim-update",
        timer: { instance: "TIM2" },
        notify: { enabled: true, mechanisms: ["task-notify"] },
      })
    );
    expect(result.code).toContain("TIM2_IRQHandler");
    expect(result.code).toContain("TIM_FLAG_UPDATE");
    expect(result.code).toContain("vTaskNotifyGiveFromISR");
    expect(result.code).toContain("portYIELD_FROM_ISR");
  });

  it("TIM Update + Binary Semaphore 生成 xSemaphoreGiveFromISR", () => {
    const result = generateIsr(
      baseConfig({
        mcu: "stm32h7",
        isrType: "tim-update",
        timer: { instance: "TIM3" },
        notify: { enabled: true, mechanisms: ["binary-semaphore"] },
      })
    );
    expect(result.code).toContain("TIM3_IRQHandler");
    expect(result.code).toContain("xSemaphoreGiveFromISR");
  });
});

describe("generateIsr — 临界区", () => {
  it("启用临界区生成 portSET/CLEAR_INTERRUPT_MASK_FROM_ISR 并提及 portENTER_CRITICAL_FROM_ISR", () => {
    const result = generateIsr(
      baseConfig({
        mcu: "stm32f4",
        isrType: "systick",
        enableCriticalSection: true,
      })
    );
    expect(result.code).toContain("portSET_INTERRUPT_MASK_FROM_ISR");
    expect(result.code).toContain("portCLEAR_INTERRUPT_MASK_FROM_ISR");
    expect(result.code).toContain("portENTER_CRITICAL_FROM_ISR");
    expect(result.code).toContain("portEXIT_CRITICAL_FROM_ISR");
  });

  it("不启用临界区不应包含 portENTER_CRITICAL_FROM_ISR", () => {
    const result = generateIsr(
      baseConfig({
        mcu: "stm32f4",
        isrType: "systick",
        enableCriticalSection: false,
      })
    );
    expect(result.code).not.toContain("portENTER_CRITICAL_FROM_ISR");
  });
});

describe("generateIsr — DMA", () => {
  it("STM32F4 DMA Transfer Complete 生成对应 stream 的 IRQHandler", () => {
    const result = generateIsr(
      baseConfig({
        mcu: "stm32f4",
        isrType: "dma-tc",
        dma: { controller: "DMA1", streamOrChannel: 5 },
      })
    );
    expect(result.code).toContain("DMA1_Stream5_IRQHandler");
    expect(result.code).toContain("HAL_DMA_IRQHandler");
    expect(result.code).toContain("HAL_DMA_XferCpltCallback");
  });

  it("STM32G0 DMA channel 1 使用 DMA1_Channel1_IRQHandler", () => {
    const result = generateIsr(
      baseConfig({
        mcu: "stm32g0",
        isrType: "dma-tc",
        dma: { controller: "DMA1", streamOrChannel: 1 },
      })
    );
    expect(result.code).toContain("DMA1_Channel1_IRQHandler");
  });
});

describe("generateIsr — ADC", () => {
  it("STM32G0 ADC EOC 使用 ADC1_COMP_IRQHandler", () => {
    const result = generateIsr(
      baseConfig({
        mcu: "stm32g0",
        isrType: "adc-eoc",
        adc: { instance: "ADC1" },
      })
    );
    expect(result.code).toContain("ADC1_COMP_IRQHandler");
    expect(result.code).toContain("ADC_FLAG_EOC");
    expect(result.code).toContain("HAL_ADC_GetValue");
  });
});

describe("generateIsr — SysTick & 警告", () => {
  it("SysTick 生成 SysTick_Handler 与 HAL_IncTick", () => {
    const result = generateIsr(
      baseConfig({
        mcu: "stm32l4",
        isrType: "systick",
      })
    );
    expect(result.code).toContain("SysTick_Handler");
    expect(result.code).toContain("HAL_IncTick");
  });

  it("所有生成结果顶部都带警告横幅", () => {
    const result = generateIsr(
      baseConfig({ mcu: "stm32f4", isrType: "systick" })
    );
    expect(result.code).toContain("WARNINGS");
    expect(result.code).toContain("printf");
    expect(result.code).toContain("HAL_Delay");
    expect(result.code).toContain("malloc");
  });

  it("UART RX 在 STM32H7 上使用 RDR 寄存器（与 F1/F4 的 DR 不同）", () => {
    const h7 = generateIsr(
      baseConfig({
        mcu: "stm32h7",
        isrType: "uart-rx",
        uart: { instance: "USART3" },
      })
    );
    expect(h7.code).toContain("->RDR");
    expect(h7.code).not.toContain("->DR ");
  });
});
