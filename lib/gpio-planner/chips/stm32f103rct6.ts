import type { ChipDefinition } from "@/types/gpio-planner";

/**
 * STM32F103RCT6 — LQFP64 package
 * ARM Cortex-M3 72 MHz, 256 KB Flash, 48 KB RAM
 * 3 USART, 2 SPI, 2 I2C, USB, CAN, 2 DAC, 16 ADC channels
 * AF mapping based on STM32F103 datasheet (remapping via AFIO)
 */
export const STM32F103RCT6: ChipDefinition = {
  id: "stm32f103rct6",
  name: "STM32F103RCT6",
  manufacturer: "STMicroelectronics",
  package: "LQFP64",
  pins: [
    // Pin 1-16
    { number: 1, name: "VBAT", defaultFunction: "Power", alternateFunctions: [] },
    { number: 2, name: "PC13", defaultFunction: "GPIO", alternateFunctions: ["TAMPER-RTC", "GPIO_Output", "GPIO_Input"] },
    { number: 3, name: "PC14", defaultFunction: "GPIO", alternateFunctions: ["OSC32_IN", "GPIO_Output", "GPIO_Input"] },
    { number: 4, name: "PC15", defaultFunction: "GPIO", alternateFunctions: ["OSC32_OUT", "GPIO_Output", "GPIO_Input"] },
    { number: 5, name: "PD0", defaultFunction: "OSC_IN", alternateFunctions: ["OSC_IN", "CAN1_RX (remap)", "GPIO_Input"] },
    { number: 6, name: "PD1", defaultFunction: "OSC_OUT", alternateFunctions: ["OSC_OUT", "CAN1_TX (remap)", "GPIO_Input"] },
    { number: 7, name: "NRST", defaultFunction: "Reset", alternateFunctions: [] },
    { number: 8, name: "PC0", defaultFunction: "GPIO", alternateFunctions: ["ADC12_IN10", "GPIO_Output", "GPIO_Input"] },
    { number: 9, name: "PC1", defaultFunction: "GPIO", alternateFunctions: ["ADC12_IN11", "GPIO_Output", "GPIO_Input"] },
    { number: 10, name: "PC2", defaultFunction: "GPIO", alternateFunctions: ["ADC12_IN12", "GPIO_Output", "GPIO_Input"] },
    { number: 11, name: "PC3", defaultFunction: "GPIO", alternateFunctions: ["ADC12_IN13", "GPIO_Output", "GPIO_Input"] },
    { number: 12, name: "VSSA", defaultFunction: "Power", alternateFunctions: [] },
    { number: 13, name: "VDDA", defaultFunction: "Power", alternateFunctions: [] },
    { number: 14, name: "PA0", defaultFunction: "GPIO", alternateFunctions: ["USART2_CTS", "ADC12_IN0", "TIM2_CH1", "TIM2_ETR", "TIM5_CH1", "WKUP", "GPIO_Output", "GPIO_Input"] },
    { number: 15, name: "PA1", defaultFunction: "GPIO", alternateFunctions: ["USART2_RTS", "ADC12_IN1", "TIM2_CH2", "TIM5_CH2", "GPIO_Output", "GPIO_Input"] },
    { number: 16, name: "PA2", defaultFunction: "GPIO", alternateFunctions: ["USART2_TX", "ADC12_IN2", "TIM2_CH3", "TIM5_CH3", "GPIO_Output", "GPIO_Input"] },

    // Pin 17-32
    { number: 17, name: "PA3", defaultFunction: "GPIO", alternateFunctions: ["USART2_RX", "ADC12_IN3", "TIM2_CH4", "TIM5_CH4", "GPIO_Output", "GPIO_Input"] },
    { number: 18, name: "VSS", defaultFunction: "Power", alternateFunctions: [] },
    { number: 19, name: "VDD", defaultFunction: "Power", alternateFunctions: [] },
    { number: 20, name: "PA4", defaultFunction: "GPIO", alternateFunctions: ["SPI1_NSS", "USART2_CK", "ADC12_IN4", "DAC_OUT1", "GPIO_Output", "GPIO_Input"] },
    { number: 21, name: "PA5", defaultFunction: "GPIO", alternateFunctions: ["SPI1_SCK", "ADC12_IN5", "DAC_OUT2", "GPIO_Output", "GPIO_Input"] },
    { number: 22, name: "PA6", defaultFunction: "GPIO", alternateFunctions: ["SPI1_MISO", "ADC12_IN6", "TIM3_CH1", "TIM1_BKIN", "TIM8_BKIN", "GPIO_Output", "GPIO_Input"] },
    { number: 23, name: "PA7", defaultFunction: "GPIO", alternateFunctions: ["SPI1_MOSI", "ADC12_IN7", "TIM3_CH2", "TIM1_CH1N", "TIM8_CH1N", "GPIO_Output", "GPIO_Input"] },
    { number: 24, name: "PC4", defaultFunction: "GPIO", alternateFunctions: ["ADC12_IN14", "GPIO_Output", "GPIO_Input"] },
    { number: 25, name: "PC5", defaultFunction: "GPIO", alternateFunctions: ["ADC12_IN15", "GPIO_Output", "GPIO_Input"] },
    { number: 26, name: "PB0", defaultFunction: "GPIO", alternateFunctions: ["ADC12_IN8", "TIM3_CH3", "TIM1_CH2N", "TIM8_CH2N", "GPIO_Output", "GPIO_Input"] },
    { number: 27, name: "PB1", defaultFunction: "GPIO", alternateFunctions: ["ADC12_IN9", "TIM3_CH4", "TIM1_CH3N", "TIM8_CH3N", "GPIO_Output", "GPIO_Input"] },
    { number: 28, name: "PB2", defaultFunction: "GPIO/BOOT1", alternateFunctions: ["GPIO_Output", "GPIO_Input"] },
    { number: 29, name: "PB10", defaultFunction: "GPIO", alternateFunctions: ["I2C2_SCL", "USART3_TX", "TIM2_CH3", "GPIO_Output", "GPIO_Input"] },
    { number: 30, name: "PB11", defaultFunction: "GPIO", alternateFunctions: ["I2C2_SDA", "USART3_RX", "TIM2_CH4", "GPIO_Output", "GPIO_Input"] },
    { number: 31, name: "VSS", defaultFunction: "Power", alternateFunctions: [] },
    { number: 32, name: "VDD", defaultFunction: "Power", alternateFunctions: [] },

    // Pin 33-48
    { number: 33, name: "PB12", defaultFunction: "GPIO", alternateFunctions: ["SPI2_NSS", "I2C2_SMBA", "USART3_CK", "TIM1_BKIN", "GPIO_Output", "GPIO_Input"] },
    { number: 34, name: "PB13", defaultFunction: "GPIO", alternateFunctions: ["SPI2_SCK", "USART3_CTS", "TIM1_CH1N", "GPIO_Output", "GPIO_Input"] },
    { number: 35, name: "PB14", defaultFunction: "GPIO", alternateFunctions: ["SPI2_MISO", "USART3_RTS", "TIM1_CH2N", "TIM8_CH2N", "GPIO_Output", "GPIO_Input"] },
    { number: 36, name: "PB15", defaultFunction: "GPIO", alternateFunctions: ["SPI2_MOSI", "TIM1_CH3N", "TIM8_CH3N", "GPIO_Output", "GPIO_Input"] },
    { number: 37, name: "PD8", defaultFunction: "GPIO", alternateFunctions: ["USART3_TX (remap)", "GPIO_Output", "GPIO_Input"] },
    { number: 38, name: "PD9", defaultFunction: "GPIO", alternateFunctions: ["USART3_RX (remap)", "GPIO_Output", "GPIO_Input"] },
    { number: 39, name: "PD10", defaultFunction: "GPIO", alternateFunctions: ["USART3_CK (remap)", "GPIO_Output", "GPIO_Input"] },
    { number: 40, name: "PD11", defaultFunction: "GPIO", alternateFunctions: ["USART3_CTS (remap)", "GPIO_Output", "GPIO_Input"] },
    { number: 41, name: "PD12", defaultFunction: "GPIO", alternateFunctions: ["TIM4_CH1 (remap)", "USART3_RTS (remap)", "GPIO_Output", "GPIO_Input"] },
    { number: 42, name: "PD13", defaultFunction: "GPIO", alternateFunctions: ["TIM4_CH2 (remap)", "GPIO_Output", "GPIO_Input"] },
    { number: 43, name: "PD14", defaultFunction: "GPIO", alternateFunctions: ["TIM4_CH3 (remap)", "GPIO_Output", "GPIO_Input"] },
    { number: 44, name: "PD15", defaultFunction: "GPIO", alternateFunctions: ["TIM4_CH4 (remap)", "GPIO_Output", "GPIO_Input"] },
    { number: 45, name: "PC6", defaultFunction: "GPIO", alternateFunctions: ["TIM3_CH1 (remap)", "TIM8_CH1", "GPIO_Output", "GPIO_Input"] },
    { number: 46, name: "PC7", defaultFunction: "GPIO", alternateFunctions: ["TIM3_CH2 (remap)", "TIM8_CH2", "GPIO_Output", "GPIO_Input"] },
    { number: 47, name: "PC8", defaultFunction: "GPIO", alternateFunctions: ["TIM3_CH3 (remap)", "TIM8_CH3", "GPIO_Output", "GPIO_Input"] },
    { number: 48, name: "PC9", defaultFunction: "GPIO", alternateFunctions: ["TIM3_CH4 (remap)", "TIM8_CH4", "GPIO_Output", "GPIO_Input"] },

    // Pin 49-64
    { number: 49, name: "PA8", defaultFunction: "GPIO", alternateFunctions: ["USART1_CK", "TIM1_CH1", "MCO", "GPIO_Output", "GPIO_Input"] },
    { number: 50, name: "PA9", defaultFunction: "GPIO", alternateFunctions: ["USART1_TX", "TIM1_CH2", "GPIO_Output", "GPIO_Input"] },
    { number: 51, name: "PA10", defaultFunction: "GPIO", alternateFunctions: ["USART1_RX", "TIM1_CH3", "GPIO_Output", "GPIO_Input"] },
    { number: 52, name: "PA11", defaultFunction: "GPIO", alternateFunctions: ["USART1_CTS", "USB_DM", "CAN_RX", "TIM1_CH4", "GPIO_Output", "GPIO_Input"] },
    { number: 53, name: "PA12", defaultFunction: "GPIO", alternateFunctions: ["USART1_RTS", "USB_DP", "CAN_TX", "TIM1_ETR", "GPIO_Output", "GPIO_Input"] },
    { number: 54, name: "PA13", defaultFunction: "SWDIO", alternateFunctions: ["JTMS", "SWDIO", "GPIO_Output", "GPIO_Input"] },
    { number: 55, name: "VSS", defaultFunction: "Power", alternateFunctions: [] },
    { number: 56, name: "VDD", defaultFunction: "Power", alternateFunctions: [] },
    { number: 57, name: "PA14", defaultFunction: "SWCLK", alternateFunctions: ["JTCK", "SWCLK", "GPIO_Output", "GPIO_Input"] },
    { number: 58, name: "PA15", defaultFunction: "JTDI", alternateFunctions: ["JTDI", "TIM2_CH1", "TIM2_ETR", "SPI1_NSS (remap)", "GPIO_Output", "GPIO_Input"] },
    { number: 59, name: "PC10", defaultFunction: "GPIO", alternateFunctions: ["USART3_TX (partial remap)", "UART4_TX", "GPIO_Output", "GPIO_Input"] },
    { number: 60, name: "PC11", defaultFunction: "GPIO", alternateFunctions: ["USART3_RX (partial remap)", "UART4_RX", "GPIO_Output", "GPIO_Input"] },
    { number: 61, name: "PC12", defaultFunction: "GPIO", alternateFunctions: ["UART5_TX", "GPIO_Output", "GPIO_Input"] },
    { number: 62, name: "PD2", defaultFunction: "GPIO", alternateFunctions: ["TIM3_ETR", "UART5_RX", "GPIO_Output", "GPIO_Input"] },
    { number: 63, name: "PB3", defaultFunction: "JTDO", alternateFunctions: ["JTDO", "TRACESWO", "TIM2_CH2", "SPI1_SCK (remap)", "GPIO_Output", "GPIO_Input"] },
    { number: 64, name: "PB4", defaultFunction: "JNTRST", alternateFunctions: ["JNTRST", "TIM3_CH1", "SPI1_MISO (remap)", "GPIO_Output", "GPIO_Input"] },
  ],
};
