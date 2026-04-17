import type {
  DriverFiles,
  McuFamily,
  CodeStyle,
  AdcConfig,
} from "@/types/driver-template";
import { headerComment, includeGuard, mcuHalHeader } from "./common";

function stm32HalAdc(mcu: McuFamily, cfg: AdcConfig): DriverFiles {
  const inst = `ADC${cfg.instance}`;
  const guard = includeGuard(`ADC${cfg.instance}_DRIVER`);
  const handle = `hadc${cfg.instance}`;

  const header = [
    headerComment([
      `${inst} Driver — STM32 HAL`,
      `Channel    : ${cfg.channel}`,
      `Resolution : ${cfg.resolution}-bit`,
      `DMA        : ${cfg.useDma ? "enabled" : "disabled"}`,
      "",
      "Usage:",
      "  adc_init();",
      cfg.useDma
        ? "  adc_start_dma(buf, COUNT); // 后台连续采样到 buf"
        : "  uint16_t v = adc_read();",
    ]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    `#include ${mcuHalHeader(mcu)}`,
    "#include <stdint.h>",
    "",
    `extern ADC_HandleTypeDef ${handle};`,
    "",
    "void     adc_init(void);",
    "uint16_t adc_read(void);",
    cfg.useDma ? "void     adc_start_dma(uint16_t *buf, uint16_t len);" : "",
    "",
    `#endif /* ${guard} */`,
    "",
  ].filter(Boolean).join("\n");

  const source: string[] = [
    headerComment([`${inst} Driver — STM32 HAL implementation`]),
    `#include "adc${cfg.instance}_driver.h"`,
    "",
    `ADC_HandleTypeDef ${handle};`,
    "",
    "void adc_init(void)",
    "{",
    `  ${handle}.Instance = ${inst};`,
    `  ${handle}.Init.Resolution = ADC_RESOLUTION_${cfg.resolution}B;`,
    `  ${handle}.Init.DataAlign = ADC_DATAALIGN_RIGHT;`,
    `  ${handle}.Init.ScanConvMode = DISABLE;`,
    `  ${handle}.Init.ContinuousConvMode = ${cfg.useDma ? "ENABLE" : "DISABLE"};`,
    `  ${handle}.Init.DiscontinuousConvMode = DISABLE;`,
    `  ${handle}.Init.ExternalTrigConv = ADC_SOFTWARE_START;`,
    `  ${handle}.Init.NbrOfConversion = 1;`,
    `  ${handle}.Init.DMAContinuousRequests = ${cfg.useDma ? "ENABLE" : "DISABLE"};`,
    `  HAL_ADC_Init(&${handle});`,
    "",
    "  ADC_ChannelConfTypeDef ch = {0};",
    `  ch.Channel = ADC_CHANNEL_${cfg.channel};`,
    `  ch.Rank = 1;`,
    `  ch.SamplingTime = ADC_SAMPLETIME_15CYCLES;`,
    `  HAL_ADC_ConfigChannel(&${handle}, &ch);`,
    "}",
    "",
    "uint16_t adc_read(void)",
    "{",
    "  // ⚠️ DMA 模式下不要再调用阻塞 adc_read，会破坏序列",
    `  HAL_ADC_Start(&${handle});`,
    `  HAL_ADC_PollForConversion(&${handle}, 10);`,
    `  uint16_t v = (uint16_t)HAL_ADC_GetValue(&${handle});`,
    `  HAL_ADC_Stop(&${handle});`,
    "  return v;",
    "}",
  ];

  if (cfg.useDma) {
    source.push(
      "",
      "void adc_start_dma(uint16_t *buf, uint16_t len)",
      "{",
      "  // ⚠️ buf 必须放在 DMA 可访问的 RAM 区域（H7 注意 D2/D3 SRAM）",
      `  HAL_ADC_Start_DMA(&${handle}, (uint32_t*)buf, len);`,
      "}"
    );
  }

  source.push("");

  return { header, source: source.join("\n") };
}

function stm32LlAdc(cfg: AdcConfig): DriverFiles {
  const inst = `ADC${cfg.instance}`;
  const guard = includeGuard(`ADC${cfg.instance}_DRIVER`);

  const header = [
    headerComment([`${inst} Driver — STM32 LL`, `Channel ${cfg.channel}, ${cfg.resolution}-bit`]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    "#include <stdint.h>",
    "",
    "void     adc_init(void);",
    "uint16_t adc_read(void);",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  const source = [
    headerComment([`${inst} Driver — STM32 LL implementation`]),
    `#include "adc${cfg.instance}_driver.h"`,
    "",
    "void adc_init(void)",
    "{",
    `  LL_ADC_SetResolution(${inst}, LL_ADC_RESOLUTION_${cfg.resolution}B);`,
    `  LL_ADC_REG_SetSequencerRanks(${inst}, LL_ADC_REG_RANK_1, LL_ADC_CHANNEL_${cfg.channel});`,
    `  LL_ADC_Enable(${inst});`,
    "}",
    "",
    "uint16_t adc_read(void)",
    "{",
    `  LL_ADC_REG_StartConversionSWStart(${inst});`,
    `  while (!LL_ADC_IsActiveFlag_EOCS(${inst})) { }`,
    `  return (uint16_t)LL_ADC_REG_ReadConversionData32(${inst});`,
    "}",
    "",
  ].join("\n");

  return { header, source };
}

function esp32ArduinoAdc(cfg: AdcConfig): DriverFiles {
  const guard = includeGuard(`ADC${cfg.instance}_DRIVER`);

  const header = [
    headerComment([`ADC Driver — ESP32 Arduino`, `Channel/GPIO ${cfg.channel}, ${cfg.resolution}-bit`]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    "#include <Arduino.h>",
    "#include <stdint.h>",
    "",
    "void     adc_init(void);",
    "uint16_t adc_read(void);",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  const source = [
    headerComment([`ADC Driver — ESP32 Arduino implementation`]),
    `#include "adc${cfg.instance}_driver.h"`,
    "",
    `#define ADC_PIN ${cfg.channel}`,
    "",
    "void adc_init(void)",
    "{",
    `  analogReadResolution(${cfg.resolution});`,
    "  pinMode(ADC_PIN, INPUT);",
    "}",
    "",
    "uint16_t adc_read(void)",
    "{",
    "  return (uint16_t)analogRead(ADC_PIN);",
    "}",
    "",
  ].join("\n");

  return { header, source };
}

function esp32IdfAdc(cfg: AdcConfig): DriverFiles {
  const guard = includeGuard(`ADC${cfg.instance}_DRIVER`);

  const header = [
    headerComment([`ADC Driver — ESP-IDF`, `Channel ${cfg.channel}`]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    "#include <stdint.h>",
    `#include "esp_adc/adc_oneshot.h"`,
    "",
    "void     adc_init(void);",
    "uint16_t adc_read(void);",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  const source = [
    headerComment([`ADC Driver — ESP-IDF implementation`]),
    `#include "adc${cfg.instance}_driver.h"`,
    "",
    "static adc_oneshot_unit_handle_t s_adc;",
    "",
    "void adc_init(void)",
    "{",
    "  adc_oneshot_unit_init_cfg_t unit = { .unit_id = ADC_UNIT_1 };",
    "  adc_oneshot_new_unit(&unit, &s_adc);",
    `  adc_oneshot_chan_cfg_t ch = { .bitwidth = ADC_BITWIDTH_${cfg.resolution === 12 ? 12 : cfg.resolution}, .atten = ADC_ATTEN_DB_11 };`,
    `  adc_oneshot_config_channel(s_adc, ADC_CHANNEL_${cfg.channel}, &ch);`,
    "}",
    "",
    "uint16_t adc_read(void)",
    "{",
    "  int v = 0;",
    `  adc_oneshot_read(s_adc, ADC_CHANNEL_${cfg.channel}, &v);`,
    "  return (uint16_t)v;",
    "}",
    "",
  ].join("\n");

  return { header, source };
}

export function generateAdc(
  mcu: McuFamily,
  style: CodeStyle,
  cfg: AdcConfig
): DriverFiles {
  if (mcu === "esp32") {
    return style === "Arduino" ? esp32ArduinoAdc(cfg) : esp32IdfAdc(cfg);
  }
  if (style === "LL") return stm32LlAdc(cfg);
  return stm32HalAdc(mcu, cfg);
}
