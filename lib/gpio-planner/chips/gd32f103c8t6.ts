import type { ChipDefinition } from "@/types/gpio-planner";

/**
 * GD32F103C8T6 — LQFP48 package
 * ARM Cortex-M3 108 MHz (higher clock than STM32F103 at 72 MHz), 64 KB Flash, 20 KB RAM
 * Pin-compatible with STM32F103C8T6, but AF (Alternate Function) remapping differs.
 *
 * Key differences from STM32F103C8T6:
 * - GD32 uses AFIO remap system similar to STM32F1, but some remap bits differ
 * - Timer performance differences (GD32 runs at higher base clock)
 * - USB device peripheral timing differs slightly
 * - DAC not available on C8T6 variant (same as STM32)
 *
 * AF mapping based on GD32F103 User Manual (remap via AFIO registers).
 * Where AF differs from STM32, it is noted with "(GD32)" suffix.
 */
export const GD32F103C8T6: ChipDefinition = {
  id: "gd32f103c8t6",
  name: "GD32F103C8T6",
  manufacturer: "GigaDevice",
  package: "LQFP48",
  pins: [
    // Pin 1–12
    { number: 1, name: "VBAT", defaultFunction: "Power", alternateFunctions: [] },
    { number: 2, name: "PC13", defaultFunction: "GPIO", alternateFunctions: ["TAMPER-RTC", "GPIO_Output", "GPIO_Input"] },
    { number: 3, name: "PC14", defaultFunction: "GPIO", alternateFunctions: ["OSC32_IN", "GPIO_Output", "GPIO_Input"] },
    { number: 4, name: "PC15", defaultFunction: "GPIO", alternateFunctions: ["OSC32_OUT", "GPIO_Output", "GPIO_Input"] },
    { number: 5, name: "PD0", defaultFunction: "OSC_IN", alternateFunctions: ["OSC_IN", "GPIO_Input"] },
    { number: 6, name: "PD1", defaultFunction: "OSC_OUT", alternateFunctions: ["OSC_OUT", "GPIO_Input"] },
    { number: 7, name: "NRST", defaultFunction: "Reset", alternateFunctions: [] },
    { number: 8, name: "VSSA", defaultFunction: "Power", alternateFunctions: [] },
    { number: 9, name: "VDDA", defaultFunction: "Power", alternateFunctions: [] },
    { number: 10, name: "PA0", defaultFunction: "GPIO", alternateFunctions: [
      "USART1_CTS (GD32: USART idx starts at 0)", "ADC01_IN0", "TIMER1_CH0 (GD32)", "TIMER1_ETR (GD32)",
      "WKUP", "GPIO_Output", "GPIO_Input",
    ] },
    { number: 11, name: "PA1", defaultFunction: "GPIO", alternateFunctions: [
      "USART1_RTS (GD32)", "ADC01_IN1", "TIMER1_CH1 (GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 12, name: "PA2", defaultFunction: "GPIO", alternateFunctions: [
      "USART1_TX (GD32)", "ADC01_IN2", "TIMER1_CH2 (GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },

    // Pin 13–24
    { number: 13, name: "PA3", defaultFunction: "GPIO", alternateFunctions: [
      "USART1_RX (GD32)", "ADC01_IN3", "TIMER1_CH3 (GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 14, name: "PA4", defaultFunction: "GPIO", alternateFunctions: [
      "SPI0_NSS (GD32)", "USART1_CK (GD32)", "ADC01_IN4",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 15, name: "PA5", defaultFunction: "GPIO", alternateFunctions: [
      "SPI0_SCK (GD32)", "ADC01_IN5",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 16, name: "PA6", defaultFunction: "GPIO", alternateFunctions: [
      "SPI0_MISO (GD32)", "ADC01_IN6", "TIMER2_CH0 (GD32)", "TIMER0_BRKIN (GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 17, name: "PA7", defaultFunction: "GPIO", alternateFunctions: [
      "SPI0_MOSI (GD32)", "ADC01_IN7", "TIMER2_CH1 (GD32)", "TIMER0_CH0N (GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 18, name: "PB0", defaultFunction: "GPIO", alternateFunctions: [
      "ADC01_IN8", "TIMER2_CH2 (GD32)", "TIMER0_CH1N (GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 19, name: "PB1", defaultFunction: "GPIO", alternateFunctions: [
      "ADC01_IN9", "TIMER2_CH3 (GD32)", "TIMER0_CH2N (GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 20, name: "PB2", defaultFunction: "GPIO/BOOT1", alternateFunctions: ["GPIO_Output", "GPIO_Input"] },
    { number: 21, name: "PB10", defaultFunction: "GPIO", alternateFunctions: [
      "I2C1_SCL (GD32: I2C idx starts at 0)", "USART2_TX (GD32)", "TIMER1_CH2 (GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 22, name: "PB11", defaultFunction: "GPIO", alternateFunctions: [
      "I2C1_SDA (GD32)", "USART2_RX (GD32)", "TIMER1_CH3 (GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 23, name: "VSS", defaultFunction: "Power", alternateFunctions: [] },
    { number: 24, name: "VDD", defaultFunction: "Power", alternateFunctions: [] },

    // Pin 25–36
    { number: 25, name: "PB12", defaultFunction: "GPIO", alternateFunctions: [
      "SPI1_NSS (GD32)", "I2C1_SMBA (GD32)", "USART2_CK (GD32)", "TIMER0_BRKIN (GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 26, name: "PB13", defaultFunction: "GPIO", alternateFunctions: [
      "SPI1_SCK (GD32)", "USART2_CTS (GD32)", "TIMER0_CH0N (GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 27, name: "PB14", defaultFunction: "GPIO", alternateFunctions: [
      "SPI1_MISO (GD32)", "USART2_RTS (GD32)", "TIMER0_CH1N (GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 28, name: "PB15", defaultFunction: "GPIO", alternateFunctions: [
      "SPI1_MOSI (GD32)", "TIMER0_CH2N (GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 29, name: "PA8", defaultFunction: "GPIO", alternateFunctions: [
      "USART0_CK (GD32)", "TIMER0_CH0 (GD32)", "MCO",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 30, name: "PA9", defaultFunction: "GPIO", alternateFunctions: [
      "USART0_TX (GD32)", "TIMER0_CH1 (GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 31, name: "PA10", defaultFunction: "GPIO", alternateFunctions: [
      "USART0_RX (GD32)", "TIMER0_CH2 (GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 32, name: "PA11", defaultFunction: "GPIO", alternateFunctions: [
      "USART0_CTS (GD32)", "USBFS_DM (GD32)", "CAN0_RX (GD32)", "TIMER0_CH3 (GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 33, name: "PA12", defaultFunction: "GPIO", alternateFunctions: [
      "USART0_RTS (GD32)", "USBFS_DP (GD32)", "CAN0_TX (GD32)", "TIMER0_ETR (GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 34, name: "PA13", defaultFunction: "SWDIO", alternateFunctions: ["JTMS", "SWDIO", "GPIO_Output", "GPIO_Input"] },
    { number: 35, name: "VSS", defaultFunction: "Power", alternateFunctions: [] },
    { number: 36, name: "VDD", defaultFunction: "Power", alternateFunctions: [] },

    // Pin 37–48
    { number: 37, name: "PA14", defaultFunction: "SWCLK", alternateFunctions: ["JTCK", "SWCLK", "GPIO_Output", "GPIO_Input"] },
    { number: 38, name: "PA15", defaultFunction: "JTDI", alternateFunctions: [
      "JTDI", "TIMER1_CH0 (GD32)", "TIMER1_ETR (GD32)", "SPI0_NSS (remap, GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 39, name: "PB3", defaultFunction: "JTDO", alternateFunctions: [
      "JTDO", "TRACESWO", "TIMER1_CH1 (GD32)", "SPI0_SCK (remap, GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 40, name: "PB4", defaultFunction: "JNTRST", alternateFunctions: [
      "JNTRST", "TIMER2_CH0 (GD32)", "SPI0_MISO (remap, GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 41, name: "PB5", defaultFunction: "GPIO", alternateFunctions: [
      "I2C0_SMBA (GD32)", "TIMER2_CH1 (GD32)", "SPI0_MOSI (remap, GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 42, name: "PB6", defaultFunction: "GPIO", alternateFunctions: [
      "I2C0_SCL (GD32)", "TIMER3_CH0 (GD32)", "USART0_TX (remap, GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 43, name: "PB7", defaultFunction: "GPIO", alternateFunctions: [
      "I2C0_SDA (GD32)", "TIMER3_CH1 (GD32)", "USART0_RX (remap, GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 44, name: "BOOT0", defaultFunction: "Boot", alternateFunctions: [] },
    { number: 45, name: "PB8", defaultFunction: "GPIO", alternateFunctions: [
      "TIMER3_CH2 (GD32)", "I2C0_SCL (remap, GD32)", "CAN0_RX (remap, GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 46, name: "PB9", defaultFunction: "GPIO", alternateFunctions: [
      "TIMER3_CH3 (GD32)", "I2C0_SDA (remap, GD32)", "CAN0_TX (remap, GD32)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 47, name: "VSS", defaultFunction: "Power", alternateFunctions: [] },
    { number: 48, name: "VDD", defaultFunction: "Power", alternateFunctions: [] },
  ],
};
