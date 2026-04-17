import { describe, it, expect } from "vitest";
import { generateDriver, DRIVER_PRESETS } from "./index";
import type { DriverConfig } from "@/types/driver-template";

describe("driver-template — STM32F1 UART HAL", () => {
  it("生成的 .h 含 include guard，.c include .h", () => {
    const config: DriverConfig = {
      mcu: "stm32f1",
      style: "HAL",
      peripheral: {
        peripheral: "UART",
        instance: 1,
        baudrate: 115200,
        rxInterrupt: false,
      },
    };
    const { header, source } = generateDriver(config);
    expect(header).toContain("#ifndef UART1_DRIVER_H");
    expect(header).toContain("#define UART1_DRIVER_H");
    expect(header).toContain("#endif");
    expect(source).toContain('#include "uart1_driver.h"');
    expect(source).toContain("HAL_UART_Init");
    expect(source).toContain("115200");
  });
});

describe("driver-template — STM32F4 SPI HAL mode 0", () => {
  it("mode 0 生成 SPI_POLARITY_LOW + SPI_PHASE_1EDGE", () => {
    const config: DriverConfig = {
      mcu: "stm32f4",
      style: "HAL",
      peripheral: {
        peripheral: "SPI",
        instance: 1,
        mode: 0,
        prescaler: 16,
        csPin: "PA4",
      },
    };
    const { source } = generateDriver(config);
    expect(source).toContain("SPI_POLARITY_LOW");
    expect(source).toContain("SPI_PHASE_1EDGE");
    expect(source).toContain("SPI_BAUDRATEPRESCALER_16");
  });

  it("mode 3 生成 HIGH + 2EDGE", () => {
    const config: DriverConfig = {
      mcu: "stm32f4",
      style: "HAL",
      peripheral: {
        peripheral: "SPI",
        instance: 2,
        mode: 3,
        prescaler: 8,
        csPin: "PB12",
      },
    };
    const { source } = generateDriver(config);
    expect(source).toContain("SPI_POLARITY_HIGH");
    expect(source).toContain("SPI_PHASE_2EDGE");
  });
});

describe("driver-template — STM32H7 I2C HAL 400kHz", () => {
  it("H7 400kHz 使用 Timing 寄存器配置", () => {
    const config: DriverConfig = {
      mcu: "stm32h7",
      style: "HAL",
      peripheral: {
        peripheral: "I2C",
        instance: 1,
        speed: 400000,
        slaveAddr7bit: 0x50,
      },
    };
    const { source, header } = generateDriver(config);
    expect(header).toContain("stm32h7xx_hal.h");
    // H7 走 Timing 寄存器，且注释里含 400000
    expect(source).toContain("Timing");
    expect(source).toContain("400000");
  });
});

describe("driver-template — STM32G0 ADC + DMA HAL", () => {
  it("启用 DMA 时生成 HAL_ADC_Start_DMA 调用", () => {
    const config: DriverConfig = {
      mcu: "stm32g0",
      style: "HAL",
      peripheral: {
        peripheral: "ADC",
        instance: 1,
        channel: 0,
        resolution: 12,
        useDma: true,
      },
    };
    const { header, source } = generateDriver(config);
    expect(header).toContain("adc_start_dma");
    expect(source).toContain("HAL_ADC_Start_DMA");
    expect(source).toContain("ADC_RESOLUTION_12B");
  });
});

describe("driver-template — STM32L4 TIM PWM HAL", () => {
  it("PWM 生成 __HAL_TIM_SET_COMPARE 调用", () => {
    const config: DriverConfig = {
      mcu: "stm32l4",
      style: "HAL",
      peripheral: {
        peripheral: "PWM",
        instance: 3,
        channel: 1,
        prescaler: 79,
        period: 999,
        dutyPercent: 50,
      },
    };
    const { source } = generateDriver(config);
    expect(source).toContain("__HAL_TIM_SET_COMPARE");
    expect(source).toContain("TIM_CHANNEL_1");
    expect(source).toContain("HAL_TIM_PWM_Start");
  });
});

describe("driver-template — ESP32 UART Arduino", () => {
  it("Arduino 风格生成 Serial1.begin", () => {
    const config: DriverConfig = {
      mcu: "esp32",
      style: "Arduino",
      peripheral: {
        peripheral: "UART",
        instance: 1,
        baudrate: 115200,
        rxInterrupt: false,
      },
    };
    const { source, header } = generateDriver(config);
    expect(header).toContain("#include <Arduino.h>");
    expect(source).toContain("Serial1.begin(115200)");
  });
});

describe("driver-template — 实例编号替换", () => {
  it("不同 USART 实例正确替换 (1 → 2 → 3)", () => {
    const make = (n: number): DriverConfig => ({
      mcu: "stm32f4",
      style: "HAL",
      peripheral: {
        peripheral: "UART",
        instance: n,
        baudrate: 9600,
        rxInterrupt: false,
      },
    });
    const r1 = generateDriver(make(1));
    const r2 = generateDriver(make(2));
    const r3 = generateDriver(make(3));
    expect(r1.source).toContain("Instance = USART1");
    expect(r2.source).toContain("Instance = USART2");
    expect(r3.source).toContain("Instance = USART3");
    // 互不污染
    expect(r1.source).not.toContain("USART2");
    expect(r2.source).not.toContain("USART3");
  });
});

describe("driver-template — RX 中断接口", () => {
  it("启用 RX 中断后 .h 暴露 RX 回调和缓冲区", () => {
    const config: DriverConfig = {
      mcu: "stm32f1",
      style: "HAL",
      peripheral: {
        peripheral: "UART",
        instance: 1,
        baudrate: 115200,
        rxInterrupt: true,
      },
    };
    const { header, source } = generateDriver(config);
    // header 暴露回调 + 缓冲区
    expect(header).toMatch(/uart_rx_(callback|buffer)/);
    expect(header).toContain("UART_RX_BUF_SIZE");
    // source 实现 IRQHandler
    expect(source).toContain("USART1_IRQHandler");
    expect(source).toContain("HAL_UART_Receive_IT");
  });

  it("关闭 RX 中断时 .h 不暴露缓冲区", () => {
    const config: DriverConfig = {
      mcu: "stm32f1",
      style: "HAL",
      peripheral: {
        peripheral: "UART",
        instance: 1,
        baudrate: 115200,
        rxInterrupt: false,
      },
    };
    const { header } = generateDriver(config);
    expect(header).not.toContain("UART_RX_BUF_SIZE");
  });
});

describe("driver-template — presets", () => {
  it("所有预设均能成功生成非空 header/source", () => {
    for (const preset of DRIVER_PRESETS) {
      const { header, source } = generateDriver(preset.config);
      expect(header.length).toBeGreaterThan(0);
      expect(source.length).toBeGreaterThan(0);
      expect(header).toContain("#ifndef");
      expect(header).toContain("#endif");
    }
  });

  it("包含至少 6 个预设场景", () => {
    expect(DRIVER_PRESETS.length).toBeGreaterThanOrEqual(6);
  });
});
