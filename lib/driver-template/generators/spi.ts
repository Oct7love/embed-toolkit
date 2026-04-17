import type {
  DriverFiles,
  McuFamily,
  CodeStyle,
  SpiConfig,
} from "@/types/driver-template";
import {
  headerComment,
  includeGuard,
  mcuHalHeader,
  spiModeMacros,
  spiPrescalerMacro,
} from "./common";

function stm32HalSpi(mcu: McuFamily, cfg: SpiConfig): DriverFiles {
  const inst = `SPI${cfg.instance}`;
  const guard = includeGuard(`SPI${cfg.instance}_DRIVER`);
  const handle = `hspi${cfg.instance}`;
  const { polarity, phase } = spiModeMacros(cfg.mode);
  const presc = spiPrescalerMacro(cfg.prescaler);

  const header = [
    headerComment([
      `${inst} Driver — STM32 HAL`,
      `Mode      : ${cfg.mode}  (${polarity}, ${phase})`,
      `Prescaler : /${cfg.prescaler}`,
      `CS Pin    : ${cfg.csPin}`,
      "",
      "Usage:",
      "  spi_init();",
      "  uint8_t rx[4];",
      "  spi_send(tx, 4);",
      "  spi_recv(rx, 4);",
    ]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    `#include ${mcuHalHeader(mcu)}`,
    "#include <stdint.h>",
    "",
    `extern SPI_HandleTypeDef ${handle};`,
    "",
    "void spi_init(void);",
    "void spi_send(const uint8_t *data, uint16_t len);",
    "void spi_recv(uint8_t *buf, uint16_t len);",
    "void spi_transfer(const uint8_t *tx, uint8_t *rx, uint16_t len);",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  const source = [
    headerComment([`${inst} Driver — STM32 HAL implementation`]),
    `#include "spi${cfg.instance}_driver.h"`,
    "",
    `SPI_HandleTypeDef ${handle};`,
    "",
    "// ⚠️ CS 引脚需在 GPIO 初始化中配置为推挽输出",
    `#define SPI_CS_LOW()   /* TODO: drive ${cfg.csPin} LOW  */`,
    `#define SPI_CS_HIGH()  /* TODO: drive ${cfg.csPin} HIGH */`,
    "",
    "void spi_init(void)",
    "{",
    `  ${handle}.Instance = ${inst};`,
    `  ${handle}.Init.Mode = SPI_MODE_MASTER;`,
    `  ${handle}.Init.Direction = SPI_DIRECTION_2LINES;`,
    `  ${handle}.Init.DataSize = SPI_DATASIZE_8BIT;`,
    `  ${handle}.Init.CLKPolarity = ${polarity};`,
    `  ${handle}.Init.CLKPhase = ${phase};`,
    `  ${handle}.Init.NSS = SPI_NSS_SOFT;`,
    `  ${handle}.Init.BaudRatePrescaler = ${presc};`,
    `  ${handle}.Init.FirstBit = SPI_FIRSTBIT_MSB;`,
    `  ${handle}.Init.TIMode = SPI_TIMODE_DISABLE;`,
    `  ${handle}.Init.CRCCalculation = SPI_CRCCALCULATION_DISABLE;`,
    `  ${handle}.Init.CRCPolynomial = 7;`,
    `  HAL_SPI_Init(&${handle});`,
    "}",
    "",
    "void spi_send(const uint8_t *data, uint16_t len)",
    "{",
    "  SPI_CS_LOW();",
    `  HAL_SPI_Transmit(&${handle}, (uint8_t*)data, len, HAL_MAX_DELAY);`,
    "  SPI_CS_HIGH();",
    "}",
    "",
    "void spi_recv(uint8_t *buf, uint16_t len)",
    "{",
    "  SPI_CS_LOW();",
    `  HAL_SPI_Receive(&${handle}, buf, len, HAL_MAX_DELAY);`,
    "  SPI_CS_HIGH();",
    "}",
    "",
    "void spi_transfer(const uint8_t *tx, uint8_t *rx, uint16_t len)",
    "{",
    "  SPI_CS_LOW();",
    `  HAL_SPI_TransmitReceive(&${handle}, (uint8_t*)tx, rx, len, HAL_MAX_DELAY);`,
    "  SPI_CS_HIGH();",
    "}",
    "",
  ].join("\n");

  return { header, source };
}

function stm32LlSpi(cfg: SpiConfig): DriverFiles {
  const inst = `SPI${cfg.instance}`;
  const guard = includeGuard(`SPI${cfg.instance}_DRIVER`);
  const { polarity, phase } = spiModeMacros(cfg.mode);

  const header = [
    headerComment([
      `${inst} Driver — STM32 LL`,
      `Mode: ${cfg.mode}, prescaler /${cfg.prescaler}, CS=${cfg.csPin}`,
    ]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    "#include <stdint.h>",
    "",
    "void spi_init(void);",
    "void spi_send(const uint8_t *data, uint16_t len);",
    "void spi_recv(uint8_t *buf, uint16_t len);",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  const source = [
    headerComment([`${inst} Driver — STM32 LL implementation`]),
    `#include "spi${cfg.instance}_driver.h"`,
    "",
    "// ⚠️ LL 风格请先在 board init 中开启 RCC 时钟、配置 GPIO 复用",
    "void spi_init(void)",
    "{",
    `  LL_SPI_InitTypeDef init = {0};`,
    `  init.TransferDirection = LL_SPI_FULL_DUPLEX;`,
    `  init.Mode = LL_SPI_MODE_MASTER;`,
    `  init.DataWidth = LL_SPI_DATAWIDTH_8BIT;`,
    `  init.ClockPolarity = LL_SPI_${polarity.replace("SPI_POLARITY_", "POLARITY_")};`,
    `  init.ClockPhase = LL_SPI_${phase.replace("SPI_PHASE_", "PHASE_")};`,
    `  init.NSS = LL_SPI_NSS_SOFT;`,
    `  init.BaudRate = LL_SPI_BAUDRATEPRESCALER_DIV${cfg.prescaler};`,
    `  init.BitOrder = LL_SPI_MSB_FIRST;`,
    `  LL_SPI_Init(${inst}, &init);`,
    `  LL_SPI_Enable(${inst});`,
    "}",
    "",
    "void spi_send(const uint8_t *data, uint16_t len)",
    "{",
    "  for (uint16_t i = 0; i < len; i++) {",
    `    while (!LL_SPI_IsActiveFlag_TXE(${inst})) { }`,
    `    LL_SPI_TransmitData8(${inst}, data[i]);`,
    "  }",
    "}",
    "",
    "void spi_recv(uint8_t *buf, uint16_t len)",
    "{",
    "  for (uint16_t i = 0; i < len; i++) {",
    `    LL_SPI_TransmitData8(${inst}, 0xFF);`,
    `    while (!LL_SPI_IsActiveFlag_RXNE(${inst})) { }`,
    `    buf[i] = LL_SPI_ReceiveData8(${inst});`,
    "  }",
    "}",
    "",
  ].join("\n");

  return { header, source };
}

function esp32ArduinoSpi(cfg: SpiConfig): DriverFiles {
  const guard = includeGuard(`SPI${cfg.instance}_DRIVER`);
  const arduinoMode = `SPI_MODE${cfg.mode}`;
  const clockHz = Math.max(1, Math.floor(80_000_000 / cfg.prescaler));

  const header = [
    headerComment([`SPI Driver — ESP32 Arduino`, `Mode ${cfg.mode}, CS=${cfg.csPin}`]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    "#include <Arduino.h>",
    "#include <stdint.h>",
    "",
    "void spi_init(void);",
    "void spi_send(const uint8_t *data, uint16_t len);",
    "void spi_recv(uint8_t *buf, uint16_t len);",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  const source = [
    headerComment([`SPI Driver — ESP32 Arduino implementation`]),
    `#include "spi${cfg.instance}_driver.h"`,
    "#include <SPI.h>",
    "",
    `#define SPI_CS_PIN  /* TODO: ${cfg.csPin} */ 5`,
    "",
    "void spi_init(void)",
    "{",
    "  pinMode(SPI_CS_PIN, OUTPUT);",
    "  digitalWrite(SPI_CS_PIN, HIGH);",
    "  SPI.begin();",
    "}",
    "",
    "void spi_send(const uint8_t *data, uint16_t len)",
    "{",
    `  SPI.beginTransaction(SPISettings(${clockHz}, MSBFIRST, ${arduinoMode}));`,
    "  digitalWrite(SPI_CS_PIN, LOW);",
    "  SPI.writeBytes(data, len);",
    "  digitalWrite(SPI_CS_PIN, HIGH);",
    "  SPI.endTransaction();",
    "}",
    "",
    "void spi_recv(uint8_t *buf, uint16_t len)",
    "{",
    `  SPI.beginTransaction(SPISettings(${clockHz}, MSBFIRST, ${arduinoMode}));`,
    "  digitalWrite(SPI_CS_PIN, LOW);",
    "  SPI.transferBytes(NULL, buf, len);",
    "  digitalWrite(SPI_CS_PIN, HIGH);",
    "  SPI.endTransaction();",
    "}",
    "",
  ].join("\n");

  return { header, source };
}

function esp32IdfSpi(cfg: SpiConfig): DriverFiles {
  const guard = includeGuard(`SPI${cfg.instance}_DRIVER`);
  const clockHz = Math.max(1, Math.floor(80_000_000 / cfg.prescaler));

  const header = [
    headerComment([`SPI Driver — ESP-IDF`, `Mode ${cfg.mode}, CS=${cfg.csPin}`]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    "#include <stdint.h>",
    `#include "driver/spi_master.h"`,
    "",
    "void spi_init(void);",
    "void spi_send(const uint8_t *data, uint16_t len);",
    "void spi_recv(uint8_t *buf, uint16_t len);",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  const source = [
    headerComment([`SPI Driver — ESP-IDF implementation`]),
    `#include "spi${cfg.instance}_driver.h"`,
    "",
    "static spi_device_handle_t s_spi;",
    "",
    "void spi_init(void)",
    "{",
    "  spi_bus_config_t bus = { .mosi_io_num = 23, .miso_io_num = 19, .sclk_io_num = 18, .max_transfer_sz = 64 };",
    "  spi_bus_initialize(SPI2_HOST, &bus, SPI_DMA_CH_AUTO);",
    "  spi_device_interface_config_t dev = {",
    `    .clock_speed_hz = ${clockHz},`,
    `    .mode = ${cfg.mode},`,
    "    .spics_io_num = 5,",
    "    .queue_size = 4,",
    "  };",
    "  spi_bus_add_device(SPI2_HOST, &dev, &s_spi);",
    "}",
    "",
    "void spi_send(const uint8_t *data, uint16_t len)",
    "{",
    "  spi_transaction_t t = { .length = len * 8, .tx_buffer = data };",
    "  spi_device_polling_transmit(s_spi, &t);",
    "}",
    "",
    "void spi_recv(uint8_t *buf, uint16_t len)",
    "{",
    "  spi_transaction_t t = { .length = len * 8, .rx_buffer = buf };",
    "  spi_device_polling_transmit(s_spi, &t);",
    "}",
    "",
  ].join("\n");

  return { header, source };
}

export function generateSpi(
  mcu: McuFamily,
  style: CodeStyle,
  cfg: SpiConfig
): DriverFiles {
  if (mcu === "esp32") {
    return style === "Arduino" ? esp32ArduinoSpi(cfg) : esp32IdfSpi(cfg);
  }
  if (style === "LL") return stm32LlSpi(cfg);
  return stm32HalSpi(mcu, cfg);
}
