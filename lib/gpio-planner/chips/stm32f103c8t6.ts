import type { ChipDefinition } from "@/types/gpio-planner";

export const STM32F103C8T6: ChipDefinition = {
  id: "stm32f103c8t6",
  name: "STM32F103C8T6",
  package: "LQFP48",
  pins: [
    // VBAT
    { number: 1, name: "VBAT", defaultFunction: "Power", alternateFunctions: [] },
    // PC13
    { number: 2, name: "PC13", defaultFunction: "GPIO", alternateFunctions: ["TAMPER-RTC", "GPIO_Output", "GPIO_Input"] },
    // PC14
    { number: 3, name: "PC14", defaultFunction: "GPIO", alternateFunctions: ["OSC32_IN", "GPIO_Output", "GPIO_Input"] },
    // PC15
    { number: 4, name: "PC15", defaultFunction: "GPIO", alternateFunctions: ["OSC32_OUT", "GPIO_Output", "GPIO_Input"] },
    // OSC_IN
    { number: 5, name: "PD0", defaultFunction: "OSC_IN", alternateFunctions: ["OSC_IN", "GPIO_Input"] },
    // OSC_OUT
    { number: 6, name: "PD1", defaultFunction: "OSC_OUT", alternateFunctions: ["OSC_OUT", "GPIO_Input"] },
    // NRST
    { number: 7, name: "NRST", defaultFunction: "Reset", alternateFunctions: [] },
    // VSSA
    { number: 8, name: "VSSA", defaultFunction: "Power", alternateFunctions: [] },
    // VDDA
    { number: 9, name: "VDDA", defaultFunction: "Power", alternateFunctions: [] },
    // PA0
    {
      number: 10,
      name: "PA0",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "USART2_CTS", "ADC12_IN0", "TIM2_CH1", "TIM2_ETR",
        "WKUP", "GPIO_Output", "GPIO_Input",
      ],
    },
    // PA1
    {
      number: 11,
      name: "PA1",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "USART2_RTS", "ADC12_IN1", "TIM2_CH2",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PA2
    {
      number: 12,
      name: "PA2",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "USART2_TX", "ADC12_IN2", "TIM2_CH3",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PA3
    {
      number: 13,
      name: "PA3",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "USART2_RX", "ADC12_IN3", "TIM2_CH4",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PA4
    {
      number: 14,
      name: "PA4",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "SPI1_NSS", "USART2_CK", "ADC12_IN4", "DAC_OUT1",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PA5
    {
      number: 15,
      name: "PA5",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "SPI1_SCK", "ADC12_IN5", "DAC_OUT2",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PA6
    {
      number: 16,
      name: "PA6",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "SPI1_MISO", "ADC12_IN6", "TIM3_CH1", "TIM1_BKIN",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PA7
    {
      number: 17,
      name: "PA7",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "SPI1_MOSI", "ADC12_IN7", "TIM3_CH2", "TIM1_CH1N",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PB0
    {
      number: 18,
      name: "PB0",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "ADC12_IN8", "TIM3_CH3", "TIM1_CH2N",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PB1
    {
      number: 19,
      name: "PB1",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "ADC12_IN9", "TIM3_CH4", "TIM1_CH3N",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PB2/BOOT1
    {
      number: 20,
      name: "PB2",
      defaultFunction: "GPIO/BOOT1",
      alternateFunctions: ["GPIO_Output", "GPIO_Input"],
    },
    // PB10
    {
      number: 21,
      name: "PB10",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "I2C2_SCL", "USART3_TX", "TIM2_CH3",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PB11
    {
      number: 22,
      name: "PB11",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "I2C2_SDA", "USART3_RX", "TIM2_CH4",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // VSS
    { number: 23, name: "VSS", defaultFunction: "Power", alternateFunctions: [] },
    // VDD
    { number: 24, name: "VDD", defaultFunction: "Power", alternateFunctions: [] },
    // PB12
    {
      number: 25,
      name: "PB12",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "SPI2_NSS", "I2C2_SMBA", "USART3_CK", "TIM1_BKIN",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PB13
    {
      number: 26,
      name: "PB13",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "SPI2_SCK", "USART3_CTS", "TIM1_CH1N",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PB14
    {
      number: 27,
      name: "PB14",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "SPI2_MISO", "USART3_RTS", "TIM1_CH2N",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PB15
    {
      number: 28,
      name: "PB15",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "SPI2_MOSI", "TIM1_CH3N",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PA8
    {
      number: 29,
      name: "PA8",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "USART1_CK", "TIM1_CH1", "MCO",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PA9
    {
      number: 30,
      name: "PA9",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "USART1_TX", "TIM1_CH2",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PA10
    {
      number: 31,
      name: "PA10",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "USART1_RX", "TIM1_CH3",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PA11
    {
      number: 32,
      name: "PA11",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "USART1_CTS", "USB_DM", "CAN_RX", "TIM1_CH4",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PA12
    {
      number: 33,
      name: "PA12",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "USART1_RTS", "USB_DP", "CAN_TX", "TIM1_ETR",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PA13
    {
      number: 34,
      name: "PA13",
      defaultFunction: "SWDIO",
      alternateFunctions: ["JTMS", "SWDIO", "GPIO_Output", "GPIO_Input"],
    },
    // VSS
    { number: 35, name: "VSS", defaultFunction: "Power", alternateFunctions: [] },
    // VDD
    { number: 36, name: "VDD", defaultFunction: "Power", alternateFunctions: [] },
    // PA14
    {
      number: 37,
      name: "PA14",
      defaultFunction: "SWCLK",
      alternateFunctions: ["JTCK", "SWCLK", "GPIO_Output", "GPIO_Input"],
    },
    // PA15
    {
      number: 38,
      name: "PA15",
      defaultFunction: "JTDI",
      alternateFunctions: [
        "JTDI", "TIM2_CH1", "TIM2_ETR", "SPI1_NSS",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PB3
    {
      number: 39,
      name: "PB3",
      defaultFunction: "JTDO",
      alternateFunctions: [
        "JTDO", "TRACESWO", "TIM2_CH2", "SPI1_SCK",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PB4
    {
      number: 40,
      name: "PB4",
      defaultFunction: "JNTRST",
      alternateFunctions: [
        "JNTRST", "TIM3_CH1", "SPI1_MISO",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PB5
    {
      number: 41,
      name: "PB5",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "I2C1_SMBA", "TIM3_CH2", "SPI1_MOSI",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PB6
    {
      number: 42,
      name: "PB6",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "I2C1_SCL", "TIM4_CH1", "USART1_TX",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PB7
    {
      number: 43,
      name: "PB7",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "I2C1_SDA", "TIM4_CH2", "USART1_RX",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // BOOT0
    { number: 44, name: "BOOT0", defaultFunction: "Boot", alternateFunctions: [] },
    // PB8
    {
      number: 45,
      name: "PB8",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "TIM4_CH3", "I2C1_SCL", "CAN_RX",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // PB9
    {
      number: 46,
      name: "PB9",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "TIM4_CH4", "I2C1_SDA", "CAN_TX",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // VSS
    { number: 47, name: "VSS", defaultFunction: "Power", alternateFunctions: [] },
    // VDD
    { number: 48, name: "VDD", defaultFunction: "Power", alternateFunctions: [] },
  ],
};
