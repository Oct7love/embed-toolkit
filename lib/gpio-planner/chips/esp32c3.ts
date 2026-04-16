import type { ChipDefinition } from "@/types/gpio-planner";

/**
 * ESP32-C3 — QFN32 package (ESP32-C3-MINI-1 / DevKit)
 * RISC-V single core 160 MHz, 400 KB SRAM, Wi-Fi + BLE 5.0
 * 22 GPIOs total, GPIO matrix allows flexible peripheral mapping
 * GPIO12-17 used for internal SPI flash — not available for user.
 * Listed alternate functions reflect common/default bindings.
 */
export const ESP32C3: ChipDefinition = {
  id: "esp32c3",
  name: "ESP32-C3 (MINI-1)",
  manufacturer: "Espressif",
  package: "QFN32",
  pins: [
    // QFN32 physical pinout
    { number: 1, name: "LNA_IN", defaultFunction: "RF", alternateFunctions: [] },
    { number: 2, name: "VDD3P3", defaultFunction: "Power", alternateFunctions: [] },
    { number: 3, name: "VDD3P3", defaultFunction: "Power", alternateFunctions: [] },
    { number: 4, name: "GPIO2", defaultFunction: "GPIO", alternateFunctions: [
      "ADC1_CH2", "FSPIQ", "BOOT (strapping)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 5, name: "GPIO3", defaultFunction: "GPIO", alternateFunctions: [
      "ADC1_CH3",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 6, name: "VDD_SPI", defaultFunction: "Power", alternateFunctions: [] },
    { number: 7, name: "GPIO4", defaultFunction: "GPIO", alternateFunctions: [
      "ADC1_CH4", "FSPIHD", "MTMS (JTAG_TMS)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 8, name: "GPIO5", defaultFunction: "GPIO", alternateFunctions: [
      "ADC2_CH0", "FSPIWP", "MTDI (JTAG_TDI)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 9, name: "GPIO6", defaultFunction: "GPIO", alternateFunctions: [
      "FSPICLK", "MTCK (JTAG_TCK)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 10, name: "GPIO7", defaultFunction: "GPIO", alternateFunctions: [
      "FSPID", "MTDO (JTAG_TDO)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 11, name: "GPIO8", defaultFunction: "GPIO", alternateFunctions: [
      "BOOT (strapping — 1 for normal boot)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 12, name: "GPIO9", defaultFunction: "GPIO", alternateFunctions: [
      "BOOT_BUTTON (strapping)",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 13, name: "VDD3P3_CPU", defaultFunction: "Power", alternateFunctions: [] },
    { number: 14, name: "GPIO10", defaultFunction: "GPIO", alternateFunctions: [
      "FSPICS0",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 15, name: "VDD3P3_RTC", defaultFunction: "Power", alternateFunctions: [] },
    { number: 16, name: "XTAL_32K_P (GPIO0)", defaultFunction: "GPIO", alternateFunctions: [
      "XTAL_32K_P", "ADC1_CH0",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 17, name: "XTAL_32K_N (GPIO1)", defaultFunction: "GPIO", alternateFunctions: [
      "XTAL_32K_N", "ADC1_CH1",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 18, name: "GPIO12", defaultFunction: "Flash (SPIHD)", alternateFunctions: [] },
    { number: 19, name: "GPIO13", defaultFunction: "Flash (SPIWP)", alternateFunctions: [] },
    { number: 20, name: "GPIO14", defaultFunction: "Flash (SPICS0)", alternateFunctions: [] },
    { number: 21, name: "GPIO15", defaultFunction: "Flash (SPICLK)", alternateFunctions: [] },
    { number: 22, name: "VDD_SPI", defaultFunction: "Power", alternateFunctions: [] },
    { number: 23, name: "GPIO16", defaultFunction: "Flash (SPID)", alternateFunctions: [] },
    { number: 24, name: "GPIO17", defaultFunction: "Flash (SPIQ)", alternateFunctions: [] },
    { number: 25, name: "GPIO18", defaultFunction: "GPIO", alternateFunctions: [
      "USB_D-",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 26, name: "GPIO19", defaultFunction: "GPIO", alternateFunctions: [
      "USB_D+",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 27, name: "GPIO20", defaultFunction: "UART0_RX", alternateFunctions: [
      "U0RXD",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 28, name: "GPIO21", defaultFunction: "UART0_TX", alternateFunctions: [
      "U0TXD",
      "GPIO_Output", "GPIO_Input",
    ] },
    { number: 29, name: "XTAL_P", defaultFunction: "Crystal", alternateFunctions: [] },
    { number: 30, name: "XTAL_N", defaultFunction: "Crystal", alternateFunctions: [] },
    { number: 31, name: "VDD3P3", defaultFunction: "Power", alternateFunctions: [] },
    { number: 32, name: "CHIP_EN", defaultFunction: "Enable", alternateFunctions: [] },
    // Exposed pad
    { number: 33, name: "GND (pad)", defaultFunction: "Power", alternateFunctions: [] },
  ],
};
