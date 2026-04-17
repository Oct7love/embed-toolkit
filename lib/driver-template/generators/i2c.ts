import type {
  DriverFiles,
  McuFamily,
  CodeStyle,
  I2cConfig,
} from "@/types/driver-template";
import { headerComment, includeGuard, mcuHalHeader } from "./common";

function stm32HalI2c(mcu: McuFamily, cfg: I2cConfig): DriverFiles {
  const inst = `I2C${cfg.instance}`;
  const guard = includeGuard(`I2C${cfg.instance}_DRIVER`);
  const handle = `hi2c${cfg.instance}`;
  const speedStr = cfg.speed === 100000 ? "100000 (Standard 100kHz)" : "400000 (Fast 400kHz)";

  const header = [
    headerComment([
      `${inst} Driver — STM32 HAL`,
      `Speed     : ${speedStr}`,
      `Slave addr: 0x${cfg.slaveAddr7bit.toString(16).toUpperCase()} (7bit)`,
      "",
      "Usage:",
      "  i2c_init();",
      "  i2c_send(0x50, data, 8);",
    ]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    `#include ${mcuHalHeader(mcu)}`,
    "#include <stdint.h>",
    "",
    `extern I2C_HandleTypeDef ${handle};`,
    "",
    "void i2c_init(void);",
    "int  i2c_send(uint8_t addr7, const uint8_t *data, uint16_t len);",
    "int  i2c_recv(uint8_t addr7, uint8_t *buf, uint16_t len);",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  // STM32H7/G0/L4 use Timing register; F1/F4 use ClockSpeed
  const useTiming = mcu === "stm32h7" || mcu === "stm32g0" || mcu === "stm32l4";

  const source: string[] = [
    headerComment([`${inst} Driver — STM32 HAL implementation`]),
    `#include "i2c${cfg.instance}_driver.h"`,
    "",
    `I2C_HandleTypeDef ${handle};`,
    "",
    "// ⚠️ I2C 总线悬空时 SDA/SCL 必须接外部上拉电阻（通常 4.7kΩ）",
    "void i2c_init(void)",
    "{",
    `  ${handle}.Instance = ${inst};`,
  ];

  if (useTiming) {
    // 100k or 400k typical TIMING values
    const timing = cfg.speed === 100000 ? "0x10707DBC" : "0x00B03FDB";
    source.push(`  ${handle}.Init.Timing = ${timing}; // ${cfg.speed} Hz typical`);
  } else {
    source.push(`  ${handle}.Init.ClockSpeed = ${cfg.speed};`);
    if (cfg.speed === 400000) {
      source.push(`  ${handle}.Init.DutyCycle = I2C_DUTYCYCLE_2;`);
    }
  }

  source.push(
    `  ${handle}.Init.OwnAddress1 = 0;`,
    `  ${handle}.Init.AddressingMode = I2C_ADDRESSINGMODE_7BIT;`,
    `  ${handle}.Init.DualAddressMode = I2C_DUALADDRESS_DISABLE;`,
    `  ${handle}.Init.GeneralCallMode = I2C_GENERALCALL_DISABLE;`,
    `  ${handle}.Init.NoStretchMode = I2C_NOSTRETCH_DISABLE;`,
    `  HAL_I2C_Init(&${handle});`,
    "}",
    "",
    "int i2c_send(uint8_t addr7, const uint8_t *data, uint16_t len)",
    "{",
    `  return HAL_I2C_Master_Transmit(&${handle}, (uint16_t)(addr7 << 1), (uint8_t*)data, len, 100) == HAL_OK ? 0 : -1;`,
    "}",
    "",
    "int i2c_recv(uint8_t addr7, uint8_t *buf, uint16_t len)",
    "{",
    `  return HAL_I2C_Master_Receive(&${handle}, (uint16_t)(addr7 << 1), buf, len, 100) == HAL_OK ? 0 : -1;`,
    "}",
    ""
  );

  return { header, source: source.join("\n") };
}

function stm32LlI2c(cfg: I2cConfig): DriverFiles {
  const inst = `I2C${cfg.instance}`;
  const guard = includeGuard(`I2C${cfg.instance}_DRIVER`);

  const header = [
    headerComment([
      `${inst} Driver — STM32 LL`,
      `Speed: ${cfg.speed} Hz`,
    ]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    "#include <stdint.h>",
    "",
    "void i2c_init(void);",
    "int  i2c_send(uint8_t addr7, const uint8_t *data, uint16_t len);",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  const source = [
    headerComment([`${inst} Driver — STM32 LL implementation`]),
    `#include "i2c${cfg.instance}_driver.h"`,
    "",
    "// ⚠️ LL 风格请先在 board init 中开启时钟、上拉、复用",
    "void i2c_init(void)",
    "{",
    `  LL_I2C_InitTypeDef init = {0};`,
    `  init.PeripheralMode = LL_I2C_MODE_I2C;`,
    `  init.ClockSpeed = ${cfg.speed};`,
    `  init.OwnAddress1 = 0;`,
    `  init.TypeAcknowledge = LL_I2C_ACK;`,
    `  init.OwnAddrSize = LL_I2C_OWNADDRESS1_7BIT;`,
    `  LL_I2C_Init(${inst}, &init);`,
    `  LL_I2C_Enable(${inst});`,
    "}",
    "",
    "int i2c_send(uint8_t addr7, const uint8_t *data, uint16_t len)",
    "{",
    "  (void)addr7; (void)data; (void)len;",
    "  // TODO: implement LL master transmit state machine",
    "  return 0;",
    "}",
    "",
  ].join("\n");

  return { header, source };
}

function esp32ArduinoI2c(cfg: I2cConfig): DriverFiles {
  const guard = includeGuard(`I2C${cfg.instance}_DRIVER`);

  const header = [
    headerComment([`I2C Driver — ESP32 Arduino`, `Speed: ${cfg.speed} Hz`]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    "#include <Arduino.h>",
    "#include <stdint.h>",
    "",
    "void i2c_init(void);",
    "int  i2c_send(uint8_t addr7, const uint8_t *data, uint16_t len);",
    "int  i2c_recv(uint8_t addr7, uint8_t *buf, uint16_t len);",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  const source = [
    headerComment([`I2C Driver — ESP32 Arduino implementation`]),
    `#include "i2c${cfg.instance}_driver.h"`,
    "#include <Wire.h>",
    "",
    "void i2c_init(void)",
    "{",
    "  // ⚠️ I2C 总线 SDA/SCL 需外部上拉",
    `  Wire.begin();`,
    `  Wire.setClock(${cfg.speed});`,
    "}",
    "",
    "int i2c_send(uint8_t addr7, const uint8_t *data, uint16_t len)",
    "{",
    "  Wire.beginTransmission(addr7);",
    "  Wire.write(data, len);",
    "  return Wire.endTransmission() == 0 ? 0 : -1;",
    "}",
    "",
    "int i2c_recv(uint8_t addr7, uint8_t *buf, uint16_t len)",
    "{",
    "  uint8_t got = Wire.requestFrom((int)addr7, (int)len);",
    "  for (uint8_t i = 0; i < got && Wire.available(); i++) buf[i] = (uint8_t)Wire.read();",
    "  return got;",
    "}",
    "",
  ].join("\n");

  return { header, source };
}

function esp32IdfI2c(cfg: I2cConfig): DriverFiles {
  const guard = includeGuard(`I2C${cfg.instance}_DRIVER`);
  const port = `I2C_NUM_${cfg.instance === 1 ? 1 : 0}`;

  const header = [
    headerComment([`I2C Driver — ESP-IDF`, `Speed: ${cfg.speed} Hz`]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    "#include <stdint.h>",
    `#include "driver/i2c.h"`,
    "",
    "void i2c_init(void);",
    "int  i2c_send(uint8_t addr7, const uint8_t *data, uint16_t len);",
    "int  i2c_recv(uint8_t addr7, uint8_t *buf, uint16_t len);",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  const source = [
    headerComment([`I2C Driver — ESP-IDF implementation`]),
    `#include "i2c${cfg.instance}_driver.h"`,
    "",
    "void i2c_init(void)",
    "{",
    "  i2c_config_t cfg = {",
    "    .mode = I2C_MODE_MASTER,",
    "    .sda_io_num = 21,",
    "    .scl_io_num = 22,",
    "    .sda_pullup_en = GPIO_PULLUP_ENABLE,",
    "    .scl_pullup_en = GPIO_PULLUP_ENABLE,",
    `    .master.clk_speed = ${cfg.speed},`,
    "  };",
    `  i2c_param_config(${port}, &cfg);`,
    `  i2c_driver_install(${port}, I2C_MODE_MASTER, 0, 0, 0);`,
    "}",
    "",
    "int i2c_send(uint8_t addr7, const uint8_t *data, uint16_t len)",
    "{",
    "  i2c_cmd_handle_t cmd = i2c_cmd_link_create();",
    "  i2c_master_start(cmd);",
    "  i2c_master_write_byte(cmd, (addr7 << 1) | I2C_MASTER_WRITE, true);",
    "  i2c_master_write(cmd, (uint8_t*)data, len, true);",
    "  i2c_master_stop(cmd);",
    `  esp_err_t err = i2c_master_cmd_begin(${port}, cmd, pdMS_TO_TICKS(100));`,
    "  i2c_cmd_link_delete(cmd);",
    "  return err == ESP_OK ? 0 : -1;",
    "}",
    "",
    "int i2c_recv(uint8_t addr7, uint8_t *buf, uint16_t len)",
    "{",
    "  i2c_cmd_handle_t cmd = i2c_cmd_link_create();",
    "  i2c_master_start(cmd);",
    "  i2c_master_write_byte(cmd, (addr7 << 1) | I2C_MASTER_READ, true);",
    "  if (len > 1) i2c_master_read(cmd, buf, len - 1, I2C_MASTER_ACK);",
    "  i2c_master_read_byte(cmd, buf + len - 1, I2C_MASTER_NACK);",
    "  i2c_master_stop(cmd);",
    `  esp_err_t err = i2c_master_cmd_begin(${port}, cmd, pdMS_TO_TICKS(100));`,
    "  i2c_cmd_link_delete(cmd);",
    "  return err == ESP_OK ? (int)len : -1;",
    "}",
    "",
  ].join("\n");

  return { header, source };
}

export function generateI2c(
  mcu: McuFamily,
  style: CodeStyle,
  cfg: I2cConfig
): DriverFiles {
  if (mcu === "esp32") {
    return style === "Arduino" ? esp32ArduinoI2c(cfg) : esp32IdfI2c(cfg);
  }
  if (style === "LL") return stm32LlI2c(cfg);
  return stm32HalI2c(mcu, cfg);
}
