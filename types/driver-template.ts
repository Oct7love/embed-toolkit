/* ------------------------------------------------------------------ */
/*  Driver Template Generator — Data Model                            */
/* ------------------------------------------------------------------ */

/** Supported MCU families. STM32 走 HAL/LL，ESP32 走 ESP-IDF/Arduino */
export type McuFamily =
  | "stm32f1"
  | "stm32f4"
  | "stm32h7"
  | "stm32g0"
  | "stm32l4"
  | "esp32";

/** 外设类型 */
export type PeripheralType = "UART" | "SPI" | "I2C" | "ADC" | "TIM" | "PWM";

/** 代码风格：HAL（STM32 默认） / LL（仅 STM32） / Arduino（仅 ESP32） */
export type CodeStyle = "HAL" | "LL" | "Arduino";

/* ---------- 各外设配置 ---------- */

export interface UartConfig {
  peripheral: "UART";
  /** 实例编号，例如 1 → USART1 */
  instance: number;
  baudrate: number;
  /** 是否启用 RX 中断 */
  rxInterrupt: boolean;
}

export interface SpiConfig {
  peripheral: "SPI";
  instance: number;
  /** SPI mode 0/1/2/3 */
  mode: 0 | 1 | 2 | 3;
  /** Speed prescaler，2/4/8/16/32/64/128/256 */
  prescaler: number;
  /** CS 引脚标识，例如 "PA4" 或 "GPIO5" */
  csPin: string;
}

export interface I2cConfig {
  peripheral: "I2C";
  instance: number;
  /** 100000 或 400000 */
  speed: 100000 | 400000;
  /** 7-bit slave 地址占位 */
  slaveAddr7bit: number;
}

export interface AdcConfig {
  peripheral: "ADC";
  instance: number;
  channel: number;
  resolution: 8 | 10 | 12;
  useDma: boolean;
}

export interface TimConfig {
  peripheral: "TIM";
  instance: number;
  prescaler: number;
  period: number;
  /** 是否启用更新中断 */
  interrupt: boolean;
}

export interface PwmConfig {
  peripheral: "PWM";
  /** 基于哪个 TIM 实例 */
  instance: number;
  channel: 1 | 2 | 3 | 4;
  prescaler: number;
  period: number;
  /** 默认占空比百分比 0-100 */
  dutyPercent: number;
}

/** Discriminated union by `peripheral` */
export type PeripheralConfig =
  | UartConfig
  | SpiConfig
  | I2cConfig
  | AdcConfig
  | TimConfig
  | PwmConfig;

export interface DriverConfig {
  mcu: McuFamily;
  style: CodeStyle;
  peripheral: PeripheralConfig;
}

export interface DriverFiles {
  header: string;
  source: string;
}

/* ---------- 预设场景 ---------- */

export interface DriverPreset {
  id: string;
  label: string;
  config: DriverConfig;
}
