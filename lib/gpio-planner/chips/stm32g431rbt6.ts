import type { ChipDefinition } from "@/types/gpio-planner";

/**
 * STM32G431RBT6 — LQFP64 package
 * ARM Cortex-M4 170 MHz, 128 KB Flash, 32 KB RAM
 * 3 USART (USART1/2/3) + 1 UART (UART4) + 1 LPUART, 3 SPI, 3 I2C, USB, FDCAN, CORDIC, FMAC
 * AF mapping based on STM32G431 datasheet Table 13 (Alternate function mapping)
 */
export const STM32G431RBT6: ChipDefinition = {
  id: "stm32g431rbt6",
  name: "STM32G431RBT6",
  manufacturer: "STMicroelectronics",
  package: "LQFP64",
  pins: [
    // Pin 1-16
    { number: 1, name: "VBAT", defaultFunction: "Power", alternateFunctions: [] },
    { number: 2, name: "PC13", defaultFunction: "GPIO", alternateFunctions: ["RTC_AF1", "GPIO_Output", "GPIO_Input"] },
    { number: 3, name: "PC14", defaultFunction: "GPIO", alternateFunctions: ["OSC32_IN", "GPIO_Output", "GPIO_Input"] },
    { number: 4, name: "PC15", defaultFunction: "GPIO", alternateFunctions: ["OSC32_OUT", "GPIO_Output", "GPIO_Input"] },
    { number: 5, name: "PF0", defaultFunction: "OSC_IN", alternateFunctions: ["OSC_IN", "I2C2_SDA (AF4)", "SPI2_NSS (AF5)", "TIM1_CH3N (AF6)", "GPIO_Output", "GPIO_Input"] },
    { number: 6, name: "PF1", defaultFunction: "OSC_OUT", alternateFunctions: ["OSC_OUT", "I2C2_SCL (AF4)", "SPI2_SCK (AF5)", "GPIO_Output", "GPIO_Input"] },
    { number: 7, name: "PG10", defaultFunction: "GPIO", alternateFunctions: ["MCO (AF0)", "GPIO_Output", "GPIO_Input"] },
    { number: 8, name: "NRST", defaultFunction: "Reset", alternateFunctions: [] },
    { number: 9, name: "PC0", defaultFunction: "GPIO", alternateFunctions: ["LPTIM1_IN1 (AF1)", "LPUART1_RX (AF8)", "ADC12_IN6", "GPIO_Output", "GPIO_Input"] },
    { number: 10, name: "PC1", defaultFunction: "GPIO", alternateFunctions: ["LPTIM1_OUT (AF1)", "SPI1_MOSI (AF4)", "LPUART1_TX (AF8)", "ADC12_IN7", "GPIO_Output", "GPIO_Input"] },
    { number: 11, name: "PC2", defaultFunction: "GPIO", alternateFunctions: ["LPTIM1_IN2 (AF1)", "SPI2_MISO (AF5)", "COMP3_OUT (AF3)", "ADC12_IN8", "GPIO_Output", "GPIO_Input"] },
    { number: 12, name: "PC3", defaultFunction: "GPIO", alternateFunctions: ["LPTIM1_ETR (AF1)", "SPI2_MOSI (AF5)", "ADC12_IN9", "GPIO_Output", "GPIO_Input"] },
    { number: 13, name: "VSSA", defaultFunction: "Power", alternateFunctions: [] },
    { number: 14, name: "VDDA", defaultFunction: "Power", alternateFunctions: [] },
    { number: 15, name: "PA0", defaultFunction: "GPIO", alternateFunctions: [
      "TIM2_CH1 (AF1)", "TIM5_CH1 (AF2)", "USART2_CTS (AF7)", "COMP1_OUT (AF8)",
      "ADC12_IN1", "GPIO_Output", "GPIO_Input",
    ] },
    { number: 16, name: "PA1", defaultFunction: "GPIO", alternateFunctions: [
      "TIM2_CH2 (AF1)", "TIM5_CH2 (AF2)", "USART2_RTS (AF7)", "COMP1_INP (AF8)",
      "ADC12_IN2", "GPIO_Output", "GPIO_Input",
    ] },

    // Pin 17-32
    { number: 17, name: "PA2", defaultFunction: "GPIO", alternateFunctions: [
      "TIM2_CH3 (AF1)", "TIM5_CH3 (AF2)", "TIM15_CH1 (AF9)", "USART2_TX (AF7)", "COMP2_OUT (AF8)",
      "LPUART1_TX (AF12)", "ADC1_IN3", "GPIO_Output", "GPIO_Input",
    ] },
    { number: 18, name: "PA3", defaultFunction: "GPIO", alternateFunctions: [
      "TIM2_CH4 (AF1)", "TIM5_CH4 (AF2)", "TIM15_CH2 (AF9)", "USART2_RX (AF7)",
      "LPUART1_RX (AF12)", "ADC1_IN4", "GPIO_Output", "GPIO_Input",
    ] },
    { number: 19, name: "VSS", defaultFunction: "Power", alternateFunctions: [] },
    { number: 20, name: "VDD", defaultFunction: "Power", alternateFunctions: [] },
    { number: 21, name: "PA4", defaultFunction: "GPIO", alternateFunctions: [
      "TIM3_CH2 (AF2)", "SPI1_NSS (AF5)", "SPI3_NSS (AF6)", "USART2_CK (AF7)",
      "ADC2_IN17", "DAC1_OUT1", "GPIO_Output", "GPIO_Input",
    ] },
    { number: 22, name: "PA5", defaultFunction: "GPIO", alternateFunctions: [
      "TIM2_CH1 (AF1)", "TIM2_ETR (AF2)", "SPI1_SCK (AF5)",
      "ADC2_IN13", "DAC1_OUT2", "GPIO_Output", "GPIO_Input",
    ] },
    { number: 23, name: "PA6", defaultFunction: "GPIO", alternateFunctions: [
      "TIM3_CH1 (AF2)", "TIM1_BKIN (AF6)", "SPI1_MISO (AF5)", "TIM16_CH1 (AF1)", "COMP1_OUT (AF8)",
      "ADC2_IN3", "DAC2_OUT1", "GPIO_Output", "GPIO_Input",
    ] },
    { number: 24, name: "PA7", defaultFunction: "GPIO", alternateFunctions: [
      "TIM3_CH2 (AF2)", "TIM1_CH1N (AF6)", "SPI1_MOSI (AF5)", "TIM17_CH1 (AF1)", "COMP2_OUT (AF8)",
      "ADC2_IN4", "GPIO_Output", "GPIO_Input",
    ] },
    { number: 25, name: "PC4", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_ETR (AF2)", "USART1_TX (AF7)", "ADC2_IN5",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 26, name: "PC5", defaultFunction: "GPIO", alternateFunctions: [
      "TIM15_BKIN (AF2)", "USART1_RX (AF7)", "ADC2_IN11",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 27, name: "PB0", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH2N (AF6)", "TIM3_CH3 (AF2)", "TIM8_CH2N (AF4)", "UCPD1_FRSTX (AF14)",
      "ADC1_IN15", "GPIO_Output", "GPIO_Input",
    ] },
    { number: 28, name: "PB1", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH3N (AF6)", "TIM3_CH4 (AF2)", "TIM8_CH3N (AF4)", "COMP4_OUT (AF8)",
      "LPUART1_RTS (AF12)", "ADC1_IN12", "GPIO_Output", "GPIO_Input",
    ] },
    { number: 29, name: "PB2", defaultFunction: "GPIO", alternateFunctions: [
      "TIM20_CH1 (AF3)", "LPTIM1_OUT (AF1)", "RTC_OUT2 (AF0)",
      "ADC2_IN12", "GPIO_Output", "GPIO_Input",
    ] },
    { number: 30, name: "PE7", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_ETR (AF2)", "GPIO_Output", "GPIO_Input",
    ] },
    { number: 31, name: "PE8", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH1N (AF2)", "GPIO_Output", "GPIO_Input",
    ] },
    { number: 32, name: "PE9", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH1 (AF2)", "GPIO_Output", "GPIO_Input",
    ] },

    // Pin 33-48
    { number: 33, name: "PE10", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH2N (AF2)", "GPIO_Output", "GPIO_Input",
    ] },
    { number: 34, name: "PE11", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH2 (AF2)", "SPI4_NSS (AF5)", "GPIO_Output", "GPIO_Input",
    ] },
    { number: 35, name: "PE12", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH3N (AF2)", "SPI4_SCK (AF5)", "GPIO_Output", "GPIO_Input",
    ] },
    { number: 36, name: "PE13", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH3 (AF2)", "SPI4_MISO (AF5)", "GPIO_Output", "GPIO_Input",
    ] },
    { number: 37, name: "PE14", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH4 (AF2)", "SPI4_MOSI (AF5)", "TIM1_BKIN2 (AF6)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 38, name: "PE15", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_BKIN (AF2)", "USART3_RX (AF7)", "GPIO_Output", "GPIO_Input",
    ] },
    { number: 39, name: "PB10", defaultFunction: "GPIO", alternateFunctions: [
      "TIM2_CH3 (AF1)", "I2C2_SCL (AF4)", "SPI2_SCK (AF5)", "USART3_TX (AF7)", "LPUART1_RX (AF8)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 40, name: "PB11", defaultFunction: "GPIO", alternateFunctions: [
      "TIM2_CH4 (AF1)", "I2C2_SDA (AF4)", "USART3_RX (AF7)", "LPUART1_TX (AF8)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 41, name: "VSS", defaultFunction: "Power", alternateFunctions: [] },
    { number: 42, name: "VDD", defaultFunction: "Power", alternateFunctions: [] },
    { number: 43, name: "PB12", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_BKIN (AF6)", "I2C2_SMBA (AF4)", "SPI2_NSS (AF5)", "USART3_CK (AF7)",
      "LPUART1_RTS (AF8)", "FDCAN2_RX (AF9)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 44, name: "PB13", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH1N (AF6)", "SPI2_SCK (AF5)", "USART3_CTS (AF7)",
      "LPUART1_CTS (AF8)", "FDCAN2_TX (AF9)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 45, name: "PB14", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH2N (AF6)", "TIM15_CH1 (AF1)", "SPI2_MISO (AF5)", "USART3_RTS (AF7)",
      "COMP4_OUT (AF8)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 46, name: "PB15", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH3N (AF4)", "TIM15_CH2 (AF1)", "TIM15_CH1N (AF2)", "SPI2_MOSI (AF5)", "COMP3_OUT (AF3)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 47, name: "PD8", defaultFunction: "GPIO", alternateFunctions: [
      "USART3_TX (AF7)", "FDCAN3_RX (AF11)", "GPIO_Output", "GPIO_Input",
    ] },
    { number: 48, name: "PD9", defaultFunction: "GPIO", alternateFunctions: [
      "USART3_RX (AF7)", "FDCAN3_TX (AF11)", "GPIO_Output", "GPIO_Input",
    ] },

    // Pin 49-64
    { number: 49, name: "PC6", defaultFunction: "GPIO", alternateFunctions: [
      "TIM3_CH1 (AF2)", "TIM8_CH1 (AF4)", "I2S2_MCK (AF5)", "COMP6_OUT (AF7)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 50, name: "PC7", defaultFunction: "GPIO", alternateFunctions: [
      "TIM3_CH2 (AF2)", "TIM8_CH2 (AF4)", "I2S3_MCK (AF6)", "COMP5_OUT (AF7)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 51, name: "PA8", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH1 (AF6)", "I2C3_SCL (AF2)", "I2C2_SDA (AF4)", "USART1_CK (AF7)", "MCO (AF0)",
      "FDCAN3_RX (AF11)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 52, name: "PA9", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH2 (AF6)", "TIM2_CH3 (AF10)", "I2C3_SMBA (AF2)", "I2C2_SCL (AF4)", "USART1_TX (AF7)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 53, name: "PA10", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH3 (AF6)", "TIM2_CH4 (AF10)", "I2C2_SMBA (AF4)", "SPI2_MISO (AF5)", "USART1_RX (AF7)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 54, name: "PA11", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_CH4 (AF11)", "TIM1_CH1N (AF6)", "TIM4_CH1 (AF10)", "USART1_CTS (AF7)", "FDCAN1_RX (AF9)",
      "USB_DM (AF14)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 55, name: "PA12", defaultFunction: "GPIO", alternateFunctions: [
      "TIM1_ETR (AF11)", "TIM1_CH2N (AF6)", "TIM4_CH2 (AF10)", "USART1_RTS (AF7)", "FDCAN1_TX (AF9)",
      "USB_DP (AF14)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 56, name: "PA13", defaultFunction: "SWDIO", alternateFunctions: ["JTMS (AF0)", "SWDIO (AF0)", "GPIO_Output", "GPIO_Input"] },
    { number: 57, name: "VSS", defaultFunction: "Power", alternateFunctions: [] },
    { number: 58, name: "VDD", defaultFunction: "Power", alternateFunctions: [] },
    { number: 59, name: "PA14", defaultFunction: "SWCLK", alternateFunctions: ["JTCK (AF0)", "SWCLK (AF0)", "I2C1_SDA (AF4)", "GPIO_Output", "GPIO_Input"] },
    { number: 60, name: "PA15", defaultFunction: "JTDI", alternateFunctions: [
      "JTDI (AF0)", "TIM2_CH1 (AF1)", "TIM2_ETR (AF14)", "TIM8_CH1 (AF2)", "SPI1_NSS (AF5)",
      "SPI3_NSS (AF6)", "USART2_RX (AF7)", "UART4_RTS (AF8)", "I2C1_SCL (AF4)",
      "FDCAN3_TX (AF11)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 61, name: "PC10", defaultFunction: "GPIO", alternateFunctions: [
      "TIM8_CH1N (AF4)", "SPI3_SCK (AF6)", "USART3_TX (AF7)", "UART4_TX (AF5)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 62, name: "PC11", defaultFunction: "GPIO", alternateFunctions: [
      "TIM8_CH2N (AF4)", "SPI3_MISO (AF6)", "USART3_RX (AF7)", "UART4_RX (AF5)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 63, name: "PB3", defaultFunction: "JTDO", alternateFunctions: [
      "JTDO (AF0)", "TRACESWO (AF0)", "TIM2_CH2 (AF1)", "TIM8_CH1N (AF4)",
      "SPI1_SCK (AF5)", "SPI3_SCK (AF6)", "USART2_TX (AF7)",
      "FDCAN3_RX (AF11)", "I2C3_SDA (AF8)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 64, name: "PB4", defaultFunction: "JNTRST", alternateFunctions: [
      "JNTRST (AF0)", "TIM3_CH1 (AF2)", "TIM8_CH2N (AF4)", "TIM16_CH1 (AF1)",
      "SPI1_MISO (AF5)", "SPI3_MISO (AF6)", "USART2_RX (AF7)", "UART5_RTS (AF8)",
      "GPIO_Output", "GPIO_Input",
    ] },
  ],
};
