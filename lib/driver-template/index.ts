/* ------------------------------------------------------------------ */
/*  Driver Template Generator — entry point                            */
/* ------------------------------------------------------------------ */

import type {
  DriverConfig,
  DriverFiles,
  DriverPreset,
  PeripheralConfig,
  PeripheralType,
  McuFamily,
  CodeStyle,
} from "@/types/driver-template";

import { generateUart } from "./generators/uart";
import { generateSpi } from "./generators/spi";
import { generateI2c } from "./generators/i2c";
import { generateAdc } from "./generators/adc";
import { generateTim } from "./generators/tim";
import { generatePwm } from "./generators/pwm";

/** 主入口：根据 DriverConfig 生成 .h / .c */
export function generateDriver(config: DriverConfig): DriverFiles {
  const { mcu, style, peripheral } = config;

  switch (peripheral.peripheral) {
    case "UART":
      return generateUart(mcu, style, peripheral);
    case "SPI":
      return generateSpi(mcu, style, peripheral);
    case "I2C":
      return generateI2c(mcu, style, peripheral);
    case "ADC":
      return generateAdc(mcu, style, peripheral);
    case "TIM":
      return generateTim(mcu, style, peripheral);
    case "PWM":
      return generatePwm(mcu, style, peripheral);
  }
}

/** 给定 MCU + 外设类型，返回一个合理的默认 PeripheralConfig */
export function defaultPeripheralConfig(
  type: PeripheralType
): PeripheralConfig {
  switch (type) {
    case "UART":
      return {
        peripheral: "UART",
        instance: 1,
        baudrate: 115200,
        rxInterrupt: false,
      };
    case "SPI":
      return {
        peripheral: "SPI",
        instance: 1,
        mode: 0,
        prescaler: 16,
        csPin: "PA4",
      };
    case "I2C":
      return {
        peripheral: "I2C",
        instance: 1,
        speed: 100000,
        slaveAddr7bit: 0x50,
      };
    case "ADC":
      return {
        peripheral: "ADC",
        instance: 1,
        channel: 0,
        resolution: 12,
        useDma: false,
      };
    case "TIM":
      return {
        peripheral: "TIM",
        instance: 3,
        prescaler: 7199,
        period: 9999,
        interrupt: false,
      };
    case "PWM":
      return {
        peripheral: "PWM",
        instance: 3,
        channel: 1,
        prescaler: 71,
        period: 999,
        dutyPercent: 50,
      };
  }
}

/** 默认 style：STM32 → HAL，ESP32 → Arduino */
export function defaultStyle(mcu: McuFamily): CodeStyle {
  return mcu === "esp32" ? "Arduino" : "HAL";
}

/** 给某 MCU 列出可用 style */
export function availableStyles(mcu: McuFamily): CodeStyle[] {
  if (mcu === "esp32") return ["Arduino", "HAL"]; // HAL = ESP-IDF map
  return ["HAL", "LL"];
}

/* ---------- Presets ---------- */

export const DRIVER_PRESETS: DriverPreset[] = [
  {
    id: "stm32f1-usart1-115200-rxit",
    label: "STM32F1 USART1 + 115200 RX 中断",
    config: {
      mcu: "stm32f1",
      style: "HAL",
      peripheral: {
        peripheral: "UART",
        instance: 1,
        baudrate: 115200,
        rxInterrupt: true,
      },
    },
  },
  {
    id: "stm32f4-spi1-master",
    label: "STM32F4 SPI1 主机模式",
    config: {
      mcu: "stm32f4",
      style: "HAL",
      peripheral: {
        peripheral: "SPI",
        instance: 1,
        mode: 0,
        prescaler: 8,
        csPin: "PA4",
      },
    },
  },
  {
    id: "stm32h7-i2c1-400k",
    label: "STM32H7 I2C1 400kHz",
    config: {
      mcu: "stm32h7",
      style: "HAL",
      peripheral: {
        peripheral: "I2C",
        instance: 1,
        speed: 400000,
        slaveAddr7bit: 0x50,
      },
    },
  },
  {
    id: "stm32g0-adc-dma",
    label: "STM32G0 ADC 单通道 + DMA",
    config: {
      mcu: "stm32g0",
      style: "HAL",
      peripheral: {
        peripheral: "ADC",
        instance: 1,
        channel: 0,
        resolution: 12,
        useDma: true,
      },
    },
  },
  {
    id: "stm32l4-tim3-pwm",
    label: "STM32L4 TIM3 PWM 输出",
    config: {
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
    },
  },
  {
    id: "esp32-uart1-arduino",
    label: "ESP32 UART1 + Arduino 风格",
    config: {
      mcu: "esp32",
      style: "Arduino",
      peripheral: {
        peripheral: "UART",
        instance: 1,
        baudrate: 115200,
        rxInterrupt: false,
      },
    },
  },
];

/* ---------- Default config ---------- */

export function createDefaultDriverConfig(): DriverConfig {
  return {
    mcu: "stm32f4",
    style: "HAL",
    peripheral: defaultPeripheralConfig("UART"),
  };
}
