import type { ChipDefinition } from "@/types/gpio-planner";

/**
 * STM32F411CEU6 — QFN48 (a.k.a. "BlackPill")
 * ARM Cortex-M4 100 MHz, 512 KB Flash, 128 KB RAM
 * 2 USART (USART1, USART2, USART6), 5 SPI (SPI1-SPI5), 3 I2C, USB OTG FS
 * AF mapping based on STM32F411 datasheet Table 9
 */
export const STM32F411CEU6: ChipDefinition = {
  id: "stm32f411ceu6",
  name: "STM32F411CEU6",
  manufacturer: "STMicroelectronics",
  package: "QFN48",
  pins: [
    // Pin 1–12
    { number: 1, name: "VBAT", defaultFunction: "Power", alternateFunctions: [] },
    { number: 2, name: "PC13", defaultFunction: "GPIO", alternateFunctions: ["RTC_AF1", "GPIO_Output", "GPIO_Input"] },
    { number: 3, name: "PC14", defaultFunction: "GPIO", alternateFunctions: ["OSC32_IN", "GPIO_Output", "GPIO_Input"] },
    { number: 4, name: "PC15", defaultFunction: "GPIO", alternateFunctions: ["OSC32_OUT", "GPIO_Output", "GPIO_Input"] },
    { number: 5, name: "PH0", defaultFunction: "OSC_IN", alternateFunctions: ["OSC_IN", "GPIO_Output", "GPIO_Input"] },
    { number: 6, name: "PH1", defaultFunction: "OSC_OUT", alternateFunctions: ["OSC_OUT", "GPIO_Output", "GPIO_Input"] },
    { number: 7, name: "NRST", defaultFunction: "Reset", alternateFunctions: [] },
    { number: 8, name: "VSSA", defaultFunction: "Power", alternateFunctions: [] },
    { number: 9, name: "VDDA", defaultFunction: "Power", alternateFunctions: [] },
    { number: 10, name: "PA0", defaultFunction: "GPIO", alternateFunctions: [
      "TIM2_CH1 (AF1)", "TIM5_CH1 (AF2)", "USART2_CTS (AF7)", "ADC1_IN0", "WKUP",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 11, name: "PA1", defaultFunction: "GPIO", alternateFunctions: [
      "TIM2_CH2 (AF1)", "TIM5_CH2 (AF2)", "USART2_RTS (AF7)", "SPI4_MOSI (AF5)", "ADC1_IN1",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 12, name: "PA2", defaultFunction: "GPIO", alternateFunctions: [
      "TIM2_CH3 (AF1)", "TIM5_CH3 (AF2)", "TIM9_CH1 (AF3)", "USART2_TX (AF7)", "ADC1_IN2",
      "GPIO_Output", "GPIO_Input",
    ] },

    // Pin 13–24
    { number: 13, name: "PA3", defaultFunction: "GPIO", alternateFunctions: [
      "TIM2_CH4 (AF1)", "TIM5_CH4 (AF2)", "TIM9_CH2 (AF3)", "USART2_RX (AF7)", "ADC1_IN3",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 14, name: "PA4", defaultFunction: "GPIO", alternateFunctions: [
      "SPI1_NSS (AF5)", "SPI3_NSS (AF6)", "USART2_CK (AF7)", "ADC1_IN4",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 15, name: "PA5", defaultFunction: "GPIO", alternateFunctions: [
      "TIM2_CH1 (AF1)", "SPI1_SCK (AF5)", "ADC1_IN5",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 16, name: "PA6", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_BKIN (AF1)", "TIM3_CH1 (AF2)", "SPI1_MISO (AF5)", "TIM13_CH1 (AF9)", "ADC1_IN6",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 17, name: "PA7", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH1N (AF1)", "TIM3_CH2 (AF2)", "SPI1_MOSI (AF5)", "TIM14_CH1 (AF9)", "ADC1_IN7",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 18, name: "PB0", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH2N (AF1)", "TIM3_CH3 (AF2)", "SPI5_SCK (AF6)", "ADC1_IN8",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 19, name: "PB1", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH3N (AF1)", "TIM3_CH4 (AF2)", "SPI5_NSS (AF6)", "ADC1_IN9",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 20, name: "PB2", defaultFunction: "GPIO/BOOT1", alternateFunctions: ["GPIO_Output", "GPIO_Input"] },
    { number: 21, name: "PB10", defaultFunction: "GPIO", alternateFunctions: [
      "TIM2_CH3 (AF1)", "I2C2_SCL (AF4)", "SPI2_SCK (AF5)", "I2S2_CK (AF5)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 22, name: "VSS", defaultFunction: "Power", alternateFunctions: [] },
    { number: 23, name: "VDD", defaultFunction: "Power", alternateFunctions: [] },
    { number: 24, name: "PB12", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_BKIN (AF1)", "I2C2_SMBA (AF4)", "SPI2_NSS (AF5)", "I2S2_WS (AF5)", "SPI4_NSS (AF6)", "SPI3_SCK (AF7)",
      "GPIO_Output", "GPIO_Input",
    ] },

    // Pin 25–36
    { number: 25, name: "PB13", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH1N (AF1)", "SPI2_SCK (AF5)", "I2S2_CK (AF5)", "SPI4_SCK (AF6)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 26, name: "PB14", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH2N (AF1)", "SPI2_MISO (AF5)", "I2S2ext_SD (AF6)", "TIM12_CH1 (AF9)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 27, name: "PB15", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH3N (AF1)", "SPI2_MOSI (AF5)", "I2S2_SD (AF5)", "TIM12_CH2 (AF9)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 28, name: "PA8", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH1 (AF1)", "I2C3_SCL (AF4)", "USART1_CK (AF7)", "USB_OTG_FS_SOF (AF10)", "MCO1",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 29, name: "PA9", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH2 (AF1)", "I2C3_SMBA (AF4)", "USART1_TX (AF7)", "USB_OTG_FS_VBUS (AF10)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 30, name: "PA10", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH3 (AF1)", "USART1_RX (AF7)", "USB_OTG_FS_ID (AF10)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 31, name: "PA11", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH4 (AF1)", "USART1_CTS (AF7)", "USART6_TX (AF8)", "USB_OTG_FS_DM (AF10)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 32, name: "PA12", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_ETR (AF1)", "USART1_RTS (AF7)", "USART6_RX (AF8)", "USB_OTG_FS_DP (AF10)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 33, name: "PA13", defaultFunction: "SWDIO", alternateFunctions: ["JTMS (AF0)", "SWDIO (AF0)", "GPIO_Output", "GPIO_Input"] },
    { number: 34, name: "VSS", defaultFunction: "Power", alternateFunctions: [] },
    { number: 35, name: "VDD", defaultFunction: "Power", alternateFunctions: [] },
    { number: 36, name: "PA14", defaultFunction: "SWCLK", alternateFunctions: ["JTCK (AF0)", "SWCLK (AF0)", "GPIO_Output", "GPIO_Input"] },

    // Pin 37–48
    { number: 37, name: "PA15", defaultFunction: "JTDI", alternateFunctions: [
      "JTDI (AF0)", "TIM2_CH1 (AF1)", "TIM2_ETR (AF1)", "SPI1_NSS (AF5)", "SPI3_NSS (AF6)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 38, name: "PB3", defaultFunction: "JTDO", alternateFunctions: [
      "JTDO (AF0)", "TRACESWO (AF0)", "TIM2_CH2 (AF1)", "SPI1_SCK (AF5)", "SPI3_SCK (AF6)", "I2S3_CK (AF6)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 39, name: "PB4", defaultFunction: "JNTRST", alternateFunctions: [
      "JNTRST (AF0)", "TIM3_CH1 (AF2)", "SPI1_MISO (AF5)", "SPI3_MISO (AF6)", "I2S3ext_SD (AF7)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 40, name: "PB5", defaultFunction: "GPIO", alternateFunctions: [
      "TIM3_CH2 (AF2)", "I2C1_SMBA (AF4)", "SPI1_MOSI (AF5)", "SPI3_MOSI (AF6)", "I2S3_SD (AF6)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 41, name: "PB6", defaultFunction: "GPIO", alternateFunctions: [
      "TIM4_CH1 (AF2)", "I2C1_SCL (AF4)", "USART1_TX (AF7)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 42, name: "PB7", defaultFunction: "GPIO", alternateFunctions: [
      "TIM4_CH2 (AF2)", "I2C1_SDA (AF4)", "USART1_RX (AF7)", "SPI5_MISO (AF6)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 43, name: "BOOT0", defaultFunction: "Boot", alternateFunctions: [] },
    { number: 44, name: "PB8", defaultFunction: "GPIO", alternateFunctions: [
      "TIM4_CH3 (AF2)", "TIM10_CH1 (AF3)", "I2C1_SCL (AF4)", "SPI5_MOSI (AF6)", "I2C3_SDA (AF9)",
      "SDIO_D4 (AF12)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 45, name: "PB9", defaultFunction: "GPIO", alternateFunctions: [
      "TIM4_CH4 (AF2)", "TIM11_CH1 (AF3)", "I2C1_SDA (AF4)", "SPI2_NSS (AF5)", "I2C2_SDA (AF9)",
      "SDIO_D5 (AF12)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 46, name: "VSS", defaultFunction: "Power", alternateFunctions: [] },
    { number: 47, name: "VDD", defaultFunction: "Power", alternateFunctions: [] },
    { number: 48, name: "VSS (pad)", defaultFunction: "Power", alternateFunctions: [] },
  ],
};
