import type { ChipDefinition } from "@/types/gpio-planner";

export const ESP32: ChipDefinition = {
  id: "esp32",
  name: "ESP32-WROOM-32",
  package: "38-pin DevKit",
  pins: [
    // 3V3 power
    { number: 1, name: "3V3", defaultFunction: "Power", alternateFunctions: [] },
    // EN
    { number: 2, name: "EN", defaultFunction: "Enable", alternateFunctions: [] },
    // VP (GPIO36)
    {
      number: 3,
      name: "GPIO36/VP",
      defaultFunction: "GPIO (Input Only)",
      alternateFunctions: ["ADC1_CH0", "GPIO_Input"],
    },
    // VN (GPIO39)
    {
      number: 4,
      name: "GPIO39/VN",
      defaultFunction: "GPIO (Input Only)",
      alternateFunctions: ["ADC1_CH3", "GPIO_Input"],
    },
    // GPIO34
    {
      number: 5,
      name: "GPIO34",
      defaultFunction: "GPIO (Input Only)",
      alternateFunctions: ["ADC1_CH6", "GPIO_Input"],
    },
    // GPIO35
    {
      number: 6,
      name: "GPIO35",
      defaultFunction: "GPIO (Input Only)",
      alternateFunctions: ["ADC1_CH7", "GPIO_Input"],
    },
    // GPIO32
    {
      number: 7,
      name: "GPIO32",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "ADC1_CH4", "TOUCH9", "XTAL_32K_P",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // GPIO33
    {
      number: 8,
      name: "GPIO33",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "ADC1_CH5", "TOUCH8", "XTAL_32K_N",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // GPIO25
    {
      number: 9,
      name: "GPIO25",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "ADC2_CH8", "DAC_1",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // GPIO26
    {
      number: 10,
      name: "GPIO26",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "ADC2_CH9", "DAC_2",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // GPIO27
    {
      number: 11,
      name: "GPIO27",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "ADC2_CH7", "TOUCH7",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // GPIO14
    {
      number: 12,
      name: "GPIO14",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "ADC2_CH6", "TOUCH6", "HSPI_CLK", "JTAG_TMS",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // GPIO12
    {
      number: 13,
      name: "GPIO12",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "ADC2_CH5", "TOUCH5", "HSPI_MISO", "JTAG_TDI",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // GND
    { number: 14, name: "GND", defaultFunction: "Power", alternateFunctions: [] },
    // GPIO13
    {
      number: 15,
      name: "GPIO13",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "ADC2_CH4", "TOUCH4", "HSPI_MOSI", "JTAG_TCK",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // GPIO9 (flash, not recommended)
    {
      number: 16,
      name: "GPIO9",
      defaultFunction: "Flash (D2)",
      alternateFunctions: [],
    },
    // GPIO10 (flash, not recommended)
    {
      number: 17,
      name: "GPIO10",
      defaultFunction: "Flash (D3)",
      alternateFunctions: [],
    },
    // GPIO11 (flash, not recommended)
    {
      number: 18,
      name: "GPIO11",
      defaultFunction: "Flash (CMD)",
      alternateFunctions: [],
    },
    // VIN
    { number: 19, name: "VIN", defaultFunction: "Power (5V)", alternateFunctions: [] },

    // Right side (top to bottom)
    // GND
    { number: 20, name: "GND", defaultFunction: "Power", alternateFunctions: [] },
    // GPIO23
    {
      number: 21,
      name: "GPIO23",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "VSPI_MOSI",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // GPIO22
    {
      number: 22,
      name: "GPIO22",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "I2C_SCL", "WIRE_SCL",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // TX0 (GPIO1)
    {
      number: 23,
      name: "GPIO1/TX0",
      defaultFunction: "UART0_TX",
      alternateFunctions: [
        "UART0_TX", "GPIO_Output", "GPIO_Input",
      ],
    },
    // RX0 (GPIO3)
    {
      number: 24,
      name: "GPIO3/RX0",
      defaultFunction: "UART0_RX",
      alternateFunctions: [
        "UART0_RX", "GPIO_Output", "GPIO_Input",
      ],
    },
    // GPIO21
    {
      number: 25,
      name: "GPIO21",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "I2C_SDA", "WIRE_SDA",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // GND
    { number: 26, name: "GND", defaultFunction: "Power", alternateFunctions: [] },
    // GPIO19
    {
      number: 27,
      name: "GPIO19",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "VSPI_MISO", "UART2_CTS",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // GPIO18
    {
      number: 28,
      name: "GPIO18",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "VSPI_CLK",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // GPIO5
    {
      number: 29,
      name: "GPIO5",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "VSPI_SS",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // GPIO17
    {
      number: 30,
      name: "GPIO17",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "UART2_TX",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // GPIO16
    {
      number: 31,
      name: "GPIO16",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "UART2_RX",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // GPIO4
    {
      number: 32,
      name: "GPIO4",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "ADC2_CH0", "TOUCH0",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // GPIO0
    {
      number: 33,
      name: "GPIO0",
      defaultFunction: "GPIO/Boot",
      alternateFunctions: [
        "ADC2_CH1", "TOUCH1", "BOOT",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // GPIO2
    {
      number: 34,
      name: "GPIO2",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "ADC2_CH2", "TOUCH2", "HSPI_WP",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // GPIO15
    {
      number: 35,
      name: "GPIO15",
      defaultFunction: "GPIO",
      alternateFunctions: [
        "ADC2_CH3", "TOUCH3", "HSPI_SS", "JTAG_TDO",
        "GPIO_Output", "GPIO_Input",
      ],
    },
    // GPIO8 (flash, not recommended)
    {
      number: 36,
      name: "GPIO8",
      defaultFunction: "Flash (D1)",
      alternateFunctions: [],
    },
    // GPIO7 (flash, not recommended)
    {
      number: 37,
      name: "GPIO7",
      defaultFunction: "Flash (D0)",
      alternateFunctions: [],
    },
    // GPIO6 (flash, not recommended)
    {
      number: 38,
      name: "GPIO6",
      defaultFunction: "Flash (CLK)",
      alternateFunctions: [],
    },
  ],
};
