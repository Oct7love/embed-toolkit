import { describe, it, expect } from "vitest";
import { generateCode } from "./code-generator";
import type { ChipDefinition } from "@/types/gpio-planner";

function makeChip(id: string, name: string, pkg: string): ChipDefinition {
  return {
    id,
    name,
    package: pkg,
    pins: [
      { number: 1, name: "PA0", defaultFunction: "GPIO", alternateFunctions: ["GPIO", "USART2_TX"] },
      { number: 2, name: "PA1", defaultFunction: "GPIO", alternateFunctions: ["GPIO", "USART2_RX"] },
      { number: 3, name: "PB6", defaultFunction: "GPIO", alternateFunctions: ["GPIO", "I2C1_SCL"] },
    ],
  };
}

function makeESP32Chip(id: string, name: string): ChipDefinition {
  return {
    id,
    name,
    package: "QFN56",
    pins: [
      { number: 1, name: "GPIO1", defaultFunction: "GPIO", alternateFunctions: ["GPIO", "UART0_TX"] },
      { number: 2, name: "GPIO2", defaultFunction: "GPIO", alternateFunctions: ["GPIO", "GPIO_Output"] },
    ],
  };
}

describe("generateCode - STM32", () => {
  it("STM32F407 export contains stm32f4xx_hal.h header", () => {
    const chip = makeChip("stm32f407vet6", "STM32F407VET6", "LQFP100");
    const code = generateCode(chip, { 1: "USART2_TX" });
    expect(code).toContain("stm32f4xx_hal.h");
    expect(code).toContain("STM32F407VET6");
  });

  it("STM32F103C8T6 export contains stm32f1xx_hal.h header", () => {
    const chip = makeChip("stm32f103c8t6", "STM32F103C8T6", "LQFP48");
    const code = generateCode(chip, { 1: "USART2_TX" });
    expect(code).toContain("stm32f1xx_hal.h");
    expect(code).toContain("STM32F103C8T6");
  });

  it("STM32H743 export contains stm32h7xx_hal.h header", () => {
    const chip = makeChip("stm32h743vit6", "STM32H743VIT6", "LQFP100");
    const code = generateCode(chip, { 1: "USART2_TX" });
    expect(code).toContain("stm32h7xx_hal.h");
  });

  it("STM32 with no assignments returns helpful comment, not crash", () => {
    const chip = makeChip("stm32f103c8t6", "STM32F103C8T6", "LQFP48");
    const code = generateCode(chip, {});
    expect(code).toContain("No GPIO pins assigned");
  });
});

describe("generateCode - ESP32", () => {
  it("ESP32-S3 export contains driver/gpio.h header", () => {
    const chip = makeESP32Chip("esp32-s3", "ESP32-S3");
    const code = generateCode(chip, { 1: "UART0_TX" });
    expect(code).toContain("driver/gpio.h");
    expect(code).toContain("ESP32-S3");
  });

  it("ESP32-WROOM-32 export contains chip name in comment", () => {
    const chip = makeESP32Chip("esp32-wroom-32", "ESP32-WROOM-32");
    const code = generateCode(chip, { 1: "UART0_TX" });
    expect(code).toContain("ESP32-WROOM-32");
  });

  it("ESP32 with no assignments returns helpful comment, not crash", () => {
    const chip = makeESP32Chip("esp32-c3", "ESP32-C3");
    const code = generateCode(chip, {});
    expect(code).toContain("No GPIO pins assigned");
  });
});

describe("generateCode - GD32/CH32/AT32", () => {
  it("GD32F103 export contains gd32f10x.h header", () => {
    const chip = makeChip("gd32f103c8t6", "GD32F103C8T6", "LQFP48");
    const code = generateCode(chip, { 1: "USART2_TX" });
    expect(code).toContain("gd32f10x.h");
    expect(code).toContain("GD32F103C8T6");
  });

  it("CH32V307 export contains ch32 header", () => {
    const chip = makeChip("ch32v307vct6", "CH32V307VCT6", "LQFP100");
    const code = generateCode(chip, { 1: "USART2_TX" });
    expect(code).toContain("ch32");
  });

  it("AT32F403A export contains at32 header", () => {
    const chip = makeChip("at32f403acgu7", "AT32F403ACGU7", "QFN48");
    const code = generateCode(chip, { 1: "USART2_TX" });
    expect(code).toContain("at32");
  });
});

describe("generateCode - unknown chip", () => {
  it("falls back to generic pseudo-code", () => {
    const chip = makeChip("custom-mcu-001", "CUSTOM_MCU", "DIP40");
    const code = generateCode(chip, { 1: "USART2_TX" });
    // Should not throw; produces some output even if generic
    expect(code.length).toBeGreaterThan(0);
  });
});
