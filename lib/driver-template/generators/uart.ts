import type {
  DriverFiles,
  McuFamily,
  CodeStyle,
  UartConfig,
} from "@/types/driver-template";
import { headerComment, includeGuard, mcuHalHeader } from "./common";

function stm32HalUart(
  mcu: McuFamily,
  cfg: UartConfig
): DriverFiles {
  const inst = `USART${cfg.instance}`;
  const lower = `usart${cfg.instance}`;
  const handleName = `h${lower}`;
  const guard = includeGuard(`UART${cfg.instance}_DRIVER`);

  const headerLines: string[] = [
    headerComment([
      `${inst} Driver — STM32 HAL`,
      `Baudrate : ${cfg.baudrate}`,
      `RX IT    : ${cfg.rxInterrupt ? "enabled" : "disabled"}`,
      "",
      "Usage:",
      `  uart_init();`,
      `  uart_send((uint8_t*)"hello", 5);`,
      cfg.rxInterrupt
        ? `  // 在 main 循环中检查 uart_rx_buffer / uart_rx_ready`
        : `  uart_recv(buf, sizeof(buf));`,
    ]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    `#include ${mcuHalHeader(mcu)}`,
    "#include <stdint.h>",
    "",
    `extern UART_HandleTypeDef ${handleName};`,
    "",
    "void uart_init(void);",
    "void uart_send(const uint8_t *data, uint16_t len);",
    "uint16_t uart_recv(uint8_t *buf, uint16_t maxLen);",
  ];

  if (cfg.rxInterrupt) {
    headerLines.push(
      "",
      "/* RX 中断缓冲区接口 */",
      "#define UART_RX_BUF_SIZE 128",
      "extern volatile uint8_t  uart_rx_buffer[UART_RX_BUF_SIZE];",
      "extern volatile uint16_t uart_rx_index;",
      "extern volatile uint8_t  uart_rx_ready;",
      "",
      "/* 用户可重写：每收到 1 字节回调一次 */",
      "void uart_rx_callback(uint8_t byte);"
    );
  }

  headerLines.push("", `#endif /* ${guard} */`, "");

  /* ---------- source ---------- */
  const sourceLines: string[] = [
    headerComment([`${inst} Driver implementation — STM32 HAL`]),
    `#include "uart${cfg.instance}_driver.h"`,
    "",
    `UART_HandleTypeDef ${handleName};`,
  ];

  if (cfg.rxInterrupt) {
    sourceLines.push(
      "",
      "volatile uint8_t  uart_rx_buffer[UART_RX_BUF_SIZE];",
      "volatile uint16_t uart_rx_index = 0;",
      "volatile uint8_t  uart_rx_ready = 0;",
      "static uint8_t    s_rx_byte;",
      "",
      "__attribute__((weak)) void uart_rx_callback(uint8_t byte) { (void)byte; }"
    );
  }

  sourceLines.push(
    "",
    "void uart_init(void)",
    "{",
    `  ${handleName}.Instance = ${inst};`,
    `  ${handleName}.Init.BaudRate = ${cfg.baudrate};`,
    `  ${handleName}.Init.WordLength = UART_WORDLENGTH_8B;`,
    `  ${handleName}.Init.StopBits = UART_STOPBITS_1;`,
    `  ${handleName}.Init.Parity = UART_PARITY_NONE;`,
    `  ${handleName}.Init.Mode = UART_MODE_TX_RX;`,
    `  ${handleName}.Init.HwFlowCtl = UART_HWCONTROL_NONE;`,
    `  ${handleName}.Init.OverSampling = UART_OVERSAMPLING_16;`,
    `  HAL_UART_Init(&${handleName});`
  );

  if (cfg.rxInterrupt) {
    sourceLines.push(
      "",
      "  // ⚠️ 启用 NVIC 中断必须在 GPIO/RCC 时钟使能之后执行",
      `  HAL_NVIC_SetPriority(${inst}_IRQn, 5, 0);`,
      `  HAL_NVIC_EnableIRQ(${inst}_IRQn);`,
      `  HAL_UART_Receive_IT(&${handleName}, &s_rx_byte, 1);`
    );
  }

  sourceLines.push("}", "");

  sourceLines.push(
    "void uart_send(const uint8_t *data, uint16_t len)",
    "{",
    `  HAL_UART_Transmit(&${handleName}, (uint8_t*)data, len, HAL_MAX_DELAY);`,
    "}",
    "",
    "uint16_t uart_recv(uint8_t *buf, uint16_t maxLen)",
    "{",
    "  // ⚠️ 阻塞接收：超时 100ms。RX 中断模式下不要混用此函数",
    `  if (HAL_UART_Receive(&${handleName}, buf, maxLen, 100) == HAL_OK) {`,
    "    return maxLen;",
    "  }",
    "  return 0;",
    "}"
  );

  if (cfg.rxInterrupt) {
    sourceLines.push(
      "",
      `void ${inst}_IRQHandler(void)`,
      "{",
      `  HAL_UART_IRQHandler(&${handleName});`,
      "}",
      "",
      "void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)",
      "{",
      `  if (huart->Instance == ${inst}) {`,
      "    if (uart_rx_index < UART_RX_BUF_SIZE) {",
      "      uart_rx_buffer[uart_rx_index++] = s_rx_byte;",
      "    }",
      "    uart_rx_ready = 1;",
      "    uart_rx_callback(s_rx_byte);",
      "    // ⚠️ ISR 中不要调用 printf / 阻塞 API",
      `    HAL_UART_Receive_IT(&${handleName}, &s_rx_byte, 1);`,
      "  }",
      "}"
    );
  }

  sourceLines.push("");

  return {
    header: headerLines.join("\n"),
    source: sourceLines.join("\n"),
  };
}

function stm32LlUart(cfg: UartConfig): DriverFiles {
  const inst = `USART${cfg.instance}`;
  const guard = includeGuard(`UART${cfg.instance}_DRIVER`);

  const header = [
    headerComment([
      `${inst} Driver — STM32 LL`,
      `Baudrate: ${cfg.baudrate}`,
      `RX IT  : ${cfg.rxInterrupt ? "enabled" : "disabled"}`,
    ]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    "#include <stdint.h>",
    "",
    "void uart_init(void);",
    "void uart_send(const uint8_t *data, uint16_t len);",
    "uint16_t uart_recv(uint8_t *buf, uint16_t maxLen);",
    cfg.rxInterrupt ? "" : "",
    cfg.rxInterrupt
      ? "/* RX 中断缓冲区 */\n#define UART_RX_BUF_SIZE 128\nextern volatile uint8_t  uart_rx_buffer[UART_RX_BUF_SIZE];\nextern volatile uint16_t uart_rx_index;\nvoid uart_rx_callback(uint8_t byte);"
      : "",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  const source = [
    headerComment([`${inst} Driver — STM32 LL implementation`]),
    `#include "uart${cfg.instance}_driver.h"`,
    "",
    "// ⚠️ LL 风格需手动开启 RCC 时钟、配置 GPIO，请在 board init 中完成",
    "void uart_init(void)",
    "{",
    `  LL_USART_InitTypeDef init = {0};`,
    `  init.BaudRate = ${cfg.baudrate};`,
    `  init.DataWidth = LL_USART_DATAWIDTH_8B;`,
    `  init.StopBits = LL_USART_STOPBITS_1;`,
    `  init.Parity = LL_USART_PARITY_NONE;`,
    `  init.TransferDirection = LL_USART_DIRECTION_TX_RX;`,
    `  init.HardwareFlowControl = LL_USART_HWCONTROL_NONE;`,
    `  LL_USART_Init(${inst}, &init);`,
    `  LL_USART_Enable(${inst});`,
    cfg.rxInterrupt
      ? `  LL_USART_EnableIT_RXNE(${inst});\n  NVIC_EnableIRQ(${inst}_IRQn);`
      : "",
    "}",
    "",
    "void uart_send(const uint8_t *data, uint16_t len)",
    "{",
    "  for (uint16_t i = 0; i < len; i++) {",
    `    while (!LL_USART_IsActiveFlag_TXE(${inst})) { }`,
    `    LL_USART_TransmitData8(${inst}, data[i]);`,
    "  }",
    `  while (!LL_USART_IsActiveFlag_TC(${inst})) { }`,
    "}",
    "",
    "uint16_t uart_recv(uint8_t *buf, uint16_t maxLen)",
    "{",
    "  uint16_t i = 0;",
    "  while (i < maxLen) {",
    `    if (LL_USART_IsActiveFlag_RXNE(${inst})) {`,
    `      buf[i++] = LL_USART_ReceiveData8(${inst});`,
    "    }",
    "  }",
    "  return i;",
    "}",
    "",
  ].join("\n");

  return { header, source };
}

function esp32ArduinoUart(cfg: UartConfig): DriverFiles {
  const guard = includeGuard(`UART${cfg.instance}_DRIVER`);
  const serial = `Serial${cfg.instance}`;

  const header = [
    headerComment([
      `${serial} Driver — ESP32 Arduino`,
      `Baudrate: ${cfg.baudrate}`,
    ]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    "#include <Arduino.h>",
    "#include <stdint.h>",
    "",
    "void uart_init(void);",
    "void uart_send(const uint8_t *data, uint16_t len);",
    "uint16_t uart_recv(uint8_t *buf, uint16_t maxLen);",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  const source = [
    headerComment([`${serial} Driver — ESP32 Arduino implementation`]),
    `#include "uart${cfg.instance}_driver.h"`,
    "",
    "void uart_init(void)",
    "{",
    `  ${serial}.begin(${cfg.baudrate});`,
    "  // ⚠️ ESP32 默认引脚映射依赖板型，必要时使用 Serial1.begin(baud, SERIAL_8N1, RX_PIN, TX_PIN)",
    "}",
    "",
    "void uart_send(const uint8_t *data, uint16_t len)",
    "{",
    `  ${serial}.write(data, len);`,
    "}",
    "",
    "uint16_t uart_recv(uint8_t *buf, uint16_t maxLen)",
    "{",
    "  uint16_t i = 0;",
    `  while (${serial}.available() && i < maxLen) {`,
    `    buf[i++] = (uint8_t)${serial}.read();`,
    "  }",
    "  return i;",
    "}",
    "",
  ].join("\n");

  return { header, source };
}

function esp32IdfUart(cfg: UartConfig): DriverFiles {
  const guard = includeGuard(`UART${cfg.instance}_DRIVER`);
  const port = `UART_NUM_${cfg.instance}`;

  const header = [
    headerComment([
      `UART${cfg.instance} Driver — ESP-IDF`,
      `Baudrate: ${cfg.baudrate}`,
    ]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    "#include <stdint.h>",
    `#include "driver/uart.h"`,
    "",
    "void uart_init(void);",
    "void uart_send(const uint8_t *data, uint16_t len);",
    "uint16_t uart_recv(uint8_t *buf, uint16_t maxLen);",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  const source = [
    headerComment([`UART${cfg.instance} Driver — ESP-IDF implementation`]),
    `#include "uart${cfg.instance}_driver.h"`,
    "",
    "#define UART_BUF_SIZE 1024",
    "",
    "void uart_init(void)",
    "{",
    "  uart_config_t cfg = {",
    `    .baud_rate = ${cfg.baudrate},`,
    "    .data_bits = UART_DATA_8_BITS,",
    "    .parity    = UART_PARITY_DISABLE,",
    "    .stop_bits = UART_STOP_BITS_1,",
    "    .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,",
    "  };",
    `  uart_param_config(${port}, &cfg);`,
    `  uart_driver_install(${port}, UART_BUF_SIZE, 0, 0, NULL, 0);`,
    "}",
    "",
    "void uart_send(const uint8_t *data, uint16_t len)",
    "{",
    `  uart_write_bytes(${port}, (const char*)data, len);`,
    "}",
    "",
    "uint16_t uart_recv(uint8_t *buf, uint16_t maxLen)",
    "{",
    `  int n = uart_read_bytes(${port}, buf, maxLen, pdMS_TO_TICKS(100));`,
    "  return n < 0 ? 0 : (uint16_t)n;",
    "}",
    "",
  ].join("\n");

  return { header, source };
}

export function generateUart(
  mcu: McuFamily,
  style: CodeStyle,
  cfg: UartConfig
): DriverFiles {
  if (mcu === "esp32") {
    return style === "Arduino" ? esp32ArduinoUart(cfg) : esp32IdfUart(cfg);
  }
  if (style === "LL") return stm32LlUart(cfg);
  return stm32HalUart(mcu, cfg);
}
