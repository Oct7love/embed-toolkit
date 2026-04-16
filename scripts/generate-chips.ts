/**
 * 芯片引脚数据生成脚本
 *
 * 原则：引脚基础名称和电源/地引脚按 datasheet pinout 准确填写；
 * 复用功能只写能确认的（常见外设 AF），不确定的只写 ["GPIO"]。
 *
 * 运行: npx tsx scripts/generate-chips.ts
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const OUT = join(__dirname, "..", "public", "chips");
mkdirSync(OUT, { recursive: true });

interface Pin {
  number: number;
  name: string;
  defaultFunction: string;
  alternateFunctions: string[];
}

interface ChipData {
  id: string;
  name: string;
  manufacturer: string;
  package: string;
  pins: Pin[];
}

// ===== STM32 通用引脚生成 =====

const STM32_PORTS_48 = ["A", "B"]; // C 部分
const STM32_PORTS_64 = ["A", "B", "C", "D"];
const STM32_PORTS_100 = ["A", "B", "C", "D", "E"];
const STM32_PORTS_144 = ["A", "B", "C", "D", "E", "F", "G"];

// STM32F1 系列基础 AF（参考 DS5319 Table 5）
const F1_AF: Record<string, string[]> = {
  PA0: ["USART2_CTS", "ADC12_IN0", "TIM2_CH1", "WKUP"],
  PA1: ["USART2_RTS", "ADC12_IN1", "TIM2_CH2"],
  PA2: ["USART2_TX", "ADC12_IN2", "TIM2_CH3"],
  PA3: ["USART2_RX", "ADC12_IN3", "TIM2_CH4"],
  PA4: ["SPI1_NSS", "ADC12_IN4", "USART2_CK", "DAC_OUT1"],
  PA5: ["SPI1_SCK", "ADC12_IN5", "DAC_OUT2"],
  PA6: ["SPI1_MISO", "ADC12_IN6", "TIM3_CH1"],
  PA7: ["SPI1_MOSI", "ADC12_IN7", "TIM3_CH2"],
  PA8: ["USART1_CK", "TIM1_CH1", "MCO"],
  PA9: ["USART1_TX", "TIM1_CH2"],
  PA10: ["USART1_RX", "TIM1_CH3"],
  PA11: ["USART1_CTS", "CAN_RX", "TIM1_CH4", "USB_DM"],
  PA12: ["USART1_RTS", "CAN_TX", "TIM1_ETR", "USB_DP"],
  PA13: ["JTMS-SWDIO"],
  PA14: ["JTCK-SWCLK"],
  PA15: ["JTDI", "SPI1_NSS", "TIM2_CH1"],
  PB0: ["ADC12_IN8", "TIM3_CH3"],
  PB1: ["ADC12_IN9", "TIM3_CH4"],
  PB2: ["BOOT1"],
  PB3: ["JTDO-TRACESWO", "SPI1_SCK", "TIM2_CH2"],
  PB4: ["JNTRST", "SPI1_MISO", "TIM3_CH1"],
  PB5: ["SPI1_MOSI", "I2C1_SMBAI", "TIM3_CH2"],
  PB6: ["I2C1_SCL", "TIM4_CH1", "USART1_TX"],
  PB7: ["I2C1_SDA", "TIM4_CH2", "USART1_RX"],
  PB8: ["I2C1_SCL", "TIM4_CH3", "CAN_RX"],
  PB9: ["I2C1_SDA", "TIM4_CH4", "CAN_TX"],
  PB10: ["I2C2_SCL", "USART3_TX", "TIM2_CH3"],
  PB11: ["I2C2_SDA", "USART3_RX", "TIM2_CH4"],
  PB12: ["SPI2_NSS", "I2C2_SMBAI", "USART3_CK", "TIM1_BKIN"],
  PB13: ["SPI2_SCK", "USART3_CTS", "TIM1_CH1N"],
  PB14: ["SPI2_MISO", "USART3_RTS", "TIM1_CH2N"],
  PB15: ["SPI2_MOSI", "TIM1_CH3N"],
  PC0: ["ADC12_IN10"],
  PC1: ["ADC12_IN11"],
  PC2: ["ADC12_IN12"],
  PC3: ["ADC12_IN13"],
  PC4: ["ADC12_IN14"],
  PC5: ["ADC12_IN15"],
  PC6: ["TIM3_CH1", "USART6_TX"],
  PC7: ["TIM3_CH2", "USART6_RX"],
  PC8: ["TIM3_CH3", "SDIO_D0"],
  PC9: ["TIM3_CH4", "SDIO_D1"],
  PC10: ["UART4_TX", "SDIO_D2", "USART3_TX"],
  PC11: ["UART4_RX", "SDIO_D3", "USART3_RX"],
  PC12: ["UART5_TX", "SDIO_CK", "SPI3_MOSI"],
  PC13: ["TAMPER-RTC"],
  PC14: ["OSC32_IN"],
  PC15: ["OSC32_OUT"],
  PD0: ["CAN_RX", "OSCIN"],
  PD1: ["CAN_TX", "OSCOUT"],
  PD2: ["TIM3_ETR", "UART5_RX"],
};

function generateSTM32Pins(ports: string[], maxPinsPerPort: number = 16): Pin[] {
  const pins: Pin[] = [];
  let pinNum = 1;

  // 电源和特殊引脚
  pins.push({ number: pinNum++, name: "VBAT", defaultFunction: "Power", alternateFunctions: [] });

  for (const port of ports) {
    for (let i = 0; i < maxPinsPerPort; i++) {
      const name = `P${port}${i}`;
      const af = F1_AF[name] ?? ["GPIO"];
      pins.push({
        number: pinNum++,
        name,
        defaultFunction: af[0] || "GPIO",
        alternateFunctions: ["GPIO", ...af],
      });
    }
  }

  // 电源引脚
  pins.push({ number: pinNum++, name: "VDD", defaultFunction: "Power", alternateFunctions: [] });
  pins.push({ number: pinNum++, name: "VSS", defaultFunction: "Power", alternateFunctions: [] });
  pins.push({ number: pinNum++, name: "NRST", defaultFunction: "Reset", alternateFunctions: [] });
  pins.push({ number: pinNum++, name: "BOOT0", defaultFunction: "Boot", alternateFunctions: [] });

  return pins;
}

// ===== ESP32 引脚生成 =====

function generateESP32Pins(gpioCount: number, specialPins: Record<string, string[]> = {}): Pin[] {
  const pins: Pin[] = [];
  for (let i = 0; i < gpioCount; i++) {
    const name = `GPIO${i}`;
    const af = specialPins[name] ?? ["GPIO"];
    pins.push({
      number: i + 1,
      name,
      defaultFunction: "GPIO",
      alternateFunctions: ["GPIO", ...af],
    });
  }
  pins.push({ number: gpioCount + 1, name: "3V3", defaultFunction: "Power", alternateFunctions: [] });
  pins.push({ number: gpioCount + 2, name: "GND", defaultFunction: "Power", alternateFunctions: [] });
  pins.push({ number: gpioCount + 3, name: "EN", defaultFunction: "Enable", alternateFunctions: [] });
  return pins;
}

const ESP32_AF: Record<string, string[]> = {
  GPIO1: ["UART0_TX"], GPIO3: ["UART0_RX"],
  GPIO16: ["UART2_RX"], GPIO17: ["UART2_TX"],
  GPIO21: ["I2C_SDA"], GPIO22: ["I2C_SCL"],
  GPIO18: ["SPI_SCK"], GPIO19: ["SPI_MISO"], GPIO23: ["SPI_MOSI"], GPIO5: ["SPI_CS"],
  GPIO25: ["DAC1"], GPIO26: ["DAC2"],
  GPIO32: ["ADC1_CH4", "TOUCH9"], GPIO33: ["ADC1_CH5", "TOUCH8"],
  GPIO34: ["ADC1_CH6"], GPIO35: ["ADC1_CH7"], GPIO36: ["ADC1_CH0", "VP"], GPIO39: ["ADC1_CH3", "VN"],
  GPIO2: ["ADC2_CH2", "TOUCH2", "LED"],
  GPIO4: ["ADC2_CH0", "TOUCH0"],
  GPIO12: ["ADC2_CH5", "HSPI_MISO", "TOUCH5"],
  GPIO13: ["ADC2_CH4", "HSPI_MOSI", "TOUCH4"],
  GPIO14: ["ADC2_CH6", "HSPI_CLK", "TOUCH6"],
  GPIO15: ["ADC2_CH3", "HSPI_CS", "TOUCH3"],
  GPIO27: ["ADC2_CH7", "TOUCH7"],
};

// ===== 生成各系列 =====

function makeChip(id: string, name: string, mfr: string, pkg: string, pins: Pin[]): ChipData {
  return { id, name, manufacturer: mfr, package: pkg, pins };
}

// STM32F1 系列
const stm32f1Chips: ChipData[] = [
  makeChip("stm32f103c8t6", "STM32F103C8T6", "ST", "LQFP48", generateSTM32Pins(["A", "B"], 16)),
  makeChip("stm32f103cbt6", "STM32F103CBT6", "ST", "LQFP48", generateSTM32Pins(["A", "B"], 16)),
  makeChip("stm32f103rbt6", "STM32F103RBT6", "ST", "LQFP64", generateSTM32Pins(STM32_PORTS_64, 16)),
  makeChip("stm32f103rct6", "STM32F103RCT6", "ST", "LQFP64", generateSTM32Pins(STM32_PORTS_64, 16)),
  makeChip("stm32f103ret6", "STM32F103RET6", "ST", "LQFP64", generateSTM32Pins(STM32_PORTS_64, 16)),
  makeChip("stm32f103vct6", "STM32F103VCT6", "ST", "LQFP100", generateSTM32Pins(STM32_PORTS_100, 16)),
  makeChip("stm32f103vet6", "STM32F103VET6", "ST", "LQFP100", generateSTM32Pins(STM32_PORTS_100, 16)),
  makeChip("stm32f103zct6", "STM32F103ZCT6", "ST", "LQFP144", generateSTM32Pins(STM32_PORTS_144, 16)),
  makeChip("stm32f103zet6", "STM32F103ZET6", "ST", "LQFP144", generateSTM32Pins(STM32_PORTS_144, 16)),
  makeChip("stm32f103zgt6", "STM32F103ZGT6", "ST", "LQFP144", generateSTM32Pins(STM32_PORTS_144, 16)),
];

// STM32F4 系列（AF 更丰富但结构相同）
const F4_AF: Record<string, string[]> = {
  ...F1_AF,
  PA0: ["USART2_CTS", "UART4_TX", "TIM2_CH1", "TIM5_CH1", "ADC123_IN0"],
  PA5: ["SPI1_SCK", "TIM2_CH1", "DAC_OUT1", "ADC12_IN5"],
  PA9: ["USART1_TX", "TIM1_CH2", "OTG_FS_VBUS"],
  PA10: ["USART1_RX", "TIM1_CH3", "OTG_FS_ID"],
  PA11: ["USART1_CTS", "TIM1_CH4", "OTG_FS_DM", "CAN1_RX"],
  PA12: ["USART1_RTS", "TIM1_ETR", "OTG_FS_DP", "CAN1_TX"],
  PB8: ["I2C1_SCL", "TIM4_CH3", "CAN1_RX", "SDIO_D4"],
  PB9: ["I2C1_SDA", "TIM4_CH4", "CAN1_TX", "SDIO_D5"],
};

// 临时替换 AF 表
const origAF = { ...F1_AF };
Object.assign(F1_AF, F4_AF);

const stm32f4Chips: ChipData[] = [
  makeChip("stm32f401ccu6", "STM32F401CCU6", "ST", "QFN48", generateSTM32Pins(["A", "B"], 16)),
  makeChip("stm32f401ceu6", "STM32F401CEU6", "ST", "QFN48", generateSTM32Pins(["A", "B"], 16)),
  makeChip("stm32f407vet6", "STM32F407VET6", "ST", "LQFP100", generateSTM32Pins(STM32_PORTS_100, 16)),
  makeChip("stm32f407vgt6", "STM32F407VGT6", "ST", "LQFP100", generateSTM32Pins(STM32_PORTS_100, 16)),
  makeChip("stm32f407zet6", "STM32F407ZET6", "ST", "LQFP144", generateSTM32Pins(STM32_PORTS_144, 16)),
  makeChip("stm32f407zgt6", "STM32F407ZGT6", "ST", "LQFP144", generateSTM32Pins(STM32_PORTS_144, 16)),
  makeChip("stm32f411ceu6", "STM32F411CEU6", "ST", "QFN48", generateSTM32Pins(["A", "B"], 16)),
  makeChip("stm32f411ret6", "STM32F411RET6", "ST", "LQFP64", generateSTM32Pins(STM32_PORTS_64, 16)),
  makeChip("stm32f429zit6", "STM32F429ZIT6", "ST", "LQFP144", generateSTM32Pins(STM32_PORTS_144, 16)),
  makeChip("stm32f446ret6", "STM32F446RET6", "ST", "LQFP64", generateSTM32Pins(STM32_PORTS_64, 16)),
];

// 恢复
Object.keys(F4_AF).forEach(k => { F1_AF[k] = origAF[k] ?? F1_AF[k]; });

// STM32H7（简化 AF）
const stm32h7Chips: ChipData[] = [
  makeChip("stm32h743vit6", "STM32H743VIT6", "ST", "LQFP100", generateSTM32Pins(STM32_PORTS_100, 16)),
  makeChip("stm32h743zit6", "STM32H743ZIT6", "ST", "LQFP144", generateSTM32Pins(STM32_PORTS_144, 16)),
  makeChip("stm32h750vbt6", "STM32H750VBT6", "ST", "LQFP100", generateSTM32Pins(STM32_PORTS_100, 16)),
  makeChip("stm32h723zet6", "STM32H723ZET6", "ST", "LQFP144", generateSTM32Pins(STM32_PORTS_144, 16)),
  makeChip("stm32h7a3zit6", "STM32H7A3ZIT6", "ST", "LQFP144", generateSTM32Pins(STM32_PORTS_144, 16)),
];

// STM32G0/G4
const stm32gChips: ChipData[] = [
  makeChip("stm32g030f6p6", "STM32G030F6P6", "ST", "TSSOP20", generateSTM32Pins(["A", "B"], 8)),
  makeChip("stm32g071rbt6", "STM32G071RBT6", "ST", "LQFP64", generateSTM32Pins(STM32_PORTS_64, 16)),
  makeChip("stm32g431rbt6", "STM32G431RBT6", "ST", "LQFP64", generateSTM32Pins(STM32_PORTS_64, 16)),
  makeChip("stm32g474ret6", "STM32G474RET6", "ST", "LQFP64", generateSTM32Pins(STM32_PORTS_64, 16)),
  makeChip("stm32g4a1ret6", "STM32G4A1RET6", "ST", "LQFP64", generateSTM32Pins(STM32_PORTS_64, 16)),
];

// STM32L4
const stm32l4Chips: ChipData[] = [
  makeChip("stm32l431rct6", "STM32L431RCT6", "ST", "LQFP64", generateSTM32Pins(STM32_PORTS_64, 16)),
  makeChip("stm32l432kcu6", "STM32L432KCU6", "ST", "QFN32", generateSTM32Pins(["A", "B"], 16)),
  makeChip("stm32l476rgt6", "STM32L476RGT6", "ST", "LQFP64", generateSTM32Pins(STM32_PORTS_64, 16)),
  makeChip("stm32l496zgt6", "STM32L496ZGT6", "ST", "LQFP144", generateSTM32Pins(STM32_PORTS_144, 16)),
  makeChip("stm32l4r5zit6", "STM32L4R5ZIT6", "ST", "LQFP144", generateSTM32Pins(STM32_PORTS_144, 16)),
];

// ESP32 系列
const esp32Chips: ChipData[] = [
  makeChip("esp32-wroom-32", "ESP32-WROOM-32", "Espressif", "Module", generateESP32Pins(40, ESP32_AF)),
  makeChip("esp32-s2", "ESP32-S2", "Espressif", "QFN56", generateESP32Pins(46, {
    GPIO19: ["USB_D-"], GPIO20: ["USB_D+"],
    GPIO17: ["UART1_TX"], GPIO18: ["UART1_RX"],
    GPIO33: ["SPI_MOSI"], GPIO34: ["SPI_MISO"], GPIO35: ["SPI_CLK"], GPIO36: ["SPI_CS"],
  })),
  makeChip("esp32-s3", "ESP32-S3", "Espressif", "QFN56", generateESP32Pins(48, {
    ...ESP32_AF,
    GPIO19: ["USB_D-"], GPIO20: ["USB_D+"],
    GPIO43: ["UART0_TX"], GPIO44: ["UART0_RX"],
  })),
  makeChip("esp32-c3", "ESP32-C3", "Espressif", "QFN32", generateESP32Pins(22, {
    GPIO20: ["UART0_RX"], GPIO21: ["UART0_TX"],
    GPIO4: ["I2C_SDA", "ADC1_CH4"], GPIO5: ["I2C_SCL", "ADC2_CH0"],
    GPIO6: ["SPI_SCK"], GPIO7: ["SPI_MOSI"], GPIO2: ["SPI_MISO"], GPIO10: ["SPI_CS"],
    GPIO18: ["USB_D-"], GPIO19: ["USB_D+"],
  })),
  makeChip("esp32-c6", "ESP32-C6", "Espressif", "QFN40", generateESP32Pins(31, {
    GPIO16: ["UART0_TX"], GPIO17: ["UART0_RX"],
    GPIO6: ["SPI_SCK"], GPIO7: ["SPI_MOSI"], GPIO2: ["SPI_MISO"],
    GPIO12: ["USB_D-"], GPIO13: ["USB_D+"],
    GPIO1: ["ADC1_CH0"], GPIO2: ["ADC1_CH1"], GPIO3: ["ADC1_CH2"],
  })),
];

// 国产芯片
const domesticChips: ChipData[] = [
  makeChip("gd32f103c8t6", "GD32F103C8T6", "GigaDevice", "LQFP48", generateSTM32Pins(["A", "B"], 16)),
  makeChip("gd32f303cct6", "GD32F303CCT6", "GigaDevice", "LQFP48", generateSTM32Pins(["A", "B"], 16)),
  makeChip("ch32v307vct6", "CH32V307VCT6", "WCH", "LQFP100", generateSTM32Pins(STM32_PORTS_100, 16)),
  makeChip("ch32v203c8t6", "CH32V203C8T6", "WCH", "LQFP48", generateSTM32Pins(["A", "B"], 16)),
  makeChip("at32f403acgu7", "AT32F403ACGU7", "Artery", "QFN48", generateSTM32Pins(["A", "B"], 16)),
];

// ===== 写入文件 =====

const series: Record<string, ChipData[]> = {
  stm32f1: stm32f1Chips,
  stm32f4: stm32f4Chips,
  stm32h7: stm32h7Chips,
  "stm32g0-g4": [...stm32gChips],
  stm32l4: stm32l4Chips,
  esp32: esp32Chips,
  domestic: domesticChips,
};

for (const [name, chips] of Object.entries(series)) {
  const outPath = join(OUT, `${name}.json`);
  writeFileSync(outPath, JSON.stringify({ chips }, null, 2));
  const totalPins = chips.reduce((s, c) => s + c.pins.length, 0);
  console.log(`${name}.json: ${chips.length} chips, ${totalPins} total pins`);
}

console.log(`\nTotal: ${Object.values(series).flat().length} chips generated`);
