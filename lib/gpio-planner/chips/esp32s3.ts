import type { ChipDefinition } from "@/types/gpio-planner";

/**
 * ESP32-S3 DevKit (ESP32-S3-WROOM-1)
 * Dual-core Xtensa LX7 240 MHz, 512 KB SRAM, Wi-Fi + BLE 5.0
 * USB OTG, 45 programmable GPIOs, ADC, touch sensor, SPI, I2C, I2S, UART, etc.
 * GPIO matrix allows most peripherals to be mapped to any GPIO.
 * Listed alternate functions reflect common/default mappings.
 */
export const ESP32S3: ChipDefinition = {
  id: "esp32s3",
  name: "ESP32-S3-DevKitC-1",
  manufacturer: "Espressif",
  package: "44-pin DevKit",
  pins: [
    // Left side (top to bottom)
    { number: 1, name: "3V3", defaultFunction: "Power", alternateFunctions: [] },
    { number: 2, name: "3V3", defaultFunction: "Power", alternateFunctions: [] },
    { number: 3, name: "RST", defaultFunction: "Reset", alternateFunctions: [] },
    { number: 4, name: "GPIO4", defaultFunction: "GPIO", alternateFunctions: ["ADC1_CH3", "TOUCH4", "SPI2_HD (FSPIHD)", "GPIO_Output", "GPIO_Input"] },
    { number: 5, name: "GPIO5", defaultFunction: "GPIO", alternateFunctions: ["ADC1_CH4", "TOUCH5", "SPI2_CS (FSPICS0)", "GPIO_Output", "GPIO_Input"] },
    { number: 6, name: "GPIO6", defaultFunction: "GPIO", alternateFunctions: ["ADC1_CH5", "TOUCH6", "SPI2_CLK (FSPICLK)", "GPIO_Output", "GPIO_Input"] },
    { number: 7, name: "GPIO7", defaultFunction: "GPIO", alternateFunctions: ["ADC1_CH6", "TOUCH7", "SPI2_D (FSPID)", "GPIO_Output", "GPIO_Input"] },
    { number: 8, name: "GPIO15", defaultFunction: "GPIO", alternateFunctions: ["ADC2_CH4", "XTAL_32K_P", "U0RTS", "GPIO_Output", "GPIO_Input"] },
    { number: 9, name: "GPIO16", defaultFunction: "GPIO", alternateFunctions: ["ADC2_CH5", "XTAL_32K_N", "U0CTS", "GPIO_Output", "GPIO_Input"] },
    { number: 10, name: "GPIO17", defaultFunction: "GPIO", alternateFunctions: ["ADC2_CH6", "U1TX", "GPIO_Output", "GPIO_Input"] },
    { number: 11, name: "GPIO18", defaultFunction: "GPIO", alternateFunctions: ["ADC2_CH7", "U1RX", "CLK_OUT3", "GPIO_Output", "GPIO_Input"] },
    { number: 12, name: "GPIO8", defaultFunction: "GPIO", alternateFunctions: ["ADC1_CH7", "TOUCH8", "SUBSPICS1", "GPIO_Output", "GPIO_Input"] },
    { number: 13, name: "GPIO19", defaultFunction: "USB_D-", alternateFunctions: ["USB_D-", "CLK_OUT2", "GPIO_Output", "GPIO_Input"] },
    { number: 14, name: "GPIO20", defaultFunction: "USB_D+", alternateFunctions: ["USB_D+", "CLK_OUT1", "GPIO_Output", "GPIO_Input"] },
    { number: 15, name: "GPIO3", defaultFunction: "GPIO", alternateFunctions: ["ADC1_CH2", "TOUCH3", "SPI2_WP (FSPIWP)", "GPIO_Output", "GPIO_Input"] },
    { number: 16, name: "GPIO46", defaultFunction: "GPIO (Input Only)", alternateFunctions: ["GPIO_Input"] },
    { number: 17, name: "GPIO9", defaultFunction: "GPIO", alternateFunctions: ["ADC1_CH8", "TOUCH9", "FSPIHD", "GPIO_Output", "GPIO_Input"] },
    { number: 18, name: "GPIO10", defaultFunction: "GPIO", alternateFunctions: ["ADC1_CH9", "TOUCH10", "FSPICS0", "FSPIIO4", "GPIO_Output", "GPIO_Input"] },
    { number: 19, name: "GPIO11", defaultFunction: "GPIO", alternateFunctions: ["ADC2_CH0", "TOUCH11", "FSPID", "FSPIIO5", "GPIO_Output", "GPIO_Input"] },
    { number: 20, name: "GPIO12", defaultFunction: "GPIO", alternateFunctions: ["ADC2_CH1", "TOUCH12", "FSPICLK", "FSPIIO6", "GPIO_Output", "GPIO_Input"] },
    { number: 21, name: "GPIO13", defaultFunction: "GPIO", alternateFunctions: ["ADC2_CH2", "TOUCH13", "FSPIQ", "FSPIIO7", "GPIO_Output", "GPIO_Input"] },
    { number: 22, name: "GPIO14", defaultFunction: "GPIO", alternateFunctions: ["ADC2_CH3", "TOUCH14", "FSPIWP", "FSPIDQS", "GPIO_Output", "GPIO_Input"] },

    // Right side (bottom to top)
    { number: 23, name: "5V", defaultFunction: "Power (5V)", alternateFunctions: [] },
    { number: 24, name: "GND", defaultFunction: "Power", alternateFunctions: [] },
    { number: 25, name: "GPIO43", defaultFunction: "UART0_TX", alternateFunctions: ["U0TXD", "CLK_OUT1", "GPIO_Output", "GPIO_Input"] },
    { number: 26, name: "GPIO44", defaultFunction: "UART0_RX", alternateFunctions: ["U0RXD", "CLK_OUT2", "GPIO_Output", "GPIO_Input"] },
    { number: 27, name: "GPIO1", defaultFunction: "GPIO", alternateFunctions: ["ADC1_CH0", "TOUCH1", "GPIO_Output", "GPIO_Input"] },
    { number: 28, name: "GPIO2", defaultFunction: "GPIO", alternateFunctions: ["ADC1_CH1", "TOUCH2", "GPIO_Output", "GPIO_Input"] },
    { number: 29, name: "GPIO42", defaultFunction: "GPIO", alternateFunctions: ["MTMS", "GPIO_Output", "GPIO_Input"] },
    { number: 30, name: "GPIO41", defaultFunction: "GPIO", alternateFunctions: ["MTDI", "CLK_OUT1", "GPIO_Output", "GPIO_Input"] },
    { number: 31, name: "GPIO40", defaultFunction: "GPIO", alternateFunctions: ["MTDO", "CLK_OUT2", "GPIO_Output", "GPIO_Input"] },
    { number: 32, name: "GPIO39", defaultFunction: "GPIO", alternateFunctions: ["MTCK", "CLK_OUT3", "SUBSPICS1", "GPIO_Output", "GPIO_Input"] },
    { number: 33, name: "GPIO38", defaultFunction: "GPIO", alternateFunctions: ["FSPIWP", "SUBSPIWP", "GPIO_Output", "GPIO_Input"] },
    { number: 34, name: "GPIO37", defaultFunction: "GPIO", alternateFunctions: ["FSPIQ", "SUBSPIQ", "GPIO_Output", "GPIO_Input"] },
    { number: 35, name: "GPIO36", defaultFunction: "GPIO", alternateFunctions: ["FSPICLK", "SUBSPICLK", "GPIO_Output", "GPIO_Input"] },
    { number: 36, name: "GPIO35", defaultFunction: "GPIO", alternateFunctions: ["FSPID", "SUBSPID", "GPIO_Output", "GPIO_Input"] },
    { number: 37, name: "GPIO0", defaultFunction: "GPIO/Strapping", alternateFunctions: ["GPIO_Output", "GPIO_Input"] },
    { number: 38, name: "GPIO45", defaultFunction: "GPIO/Strapping", alternateFunctions: ["GPIO_Output", "GPIO_Input"] },
    { number: 39, name: "GPIO48", defaultFunction: "GPIO", alternateFunctions: ["SPICLK_N", "SUBSPICS1", "RGB_LED", "GPIO_Output", "GPIO_Input"] },
    { number: 40, name: "GPIO47", defaultFunction: "GPIO", alternateFunctions: ["SPICLK_P", "SUBSPICLK_P_DIFF", "GPIO_Output", "GPIO_Input"] },
    { number: 41, name: "GPIO21", defaultFunction: "GPIO", alternateFunctions: ["I2C0_SDA", "GPIO_Output", "GPIO_Input"] },
    { number: 42, name: "GND", defaultFunction: "Power", alternateFunctions: [] },
    { number: 43, name: "GPIO26", defaultFunction: "Flash/PSRAM", alternateFunctions: [] },
    { number: 44, name: "GPIO33", defaultFunction: "Flash/PSRAM", alternateFunctions: [] },
  ],
};
