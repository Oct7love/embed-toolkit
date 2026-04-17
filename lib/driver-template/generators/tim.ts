import type {
  DriverFiles,
  McuFamily,
  CodeStyle,
  TimConfig,
} from "@/types/driver-template";
import { headerComment, includeGuard, mcuHalHeader } from "./common";

function stm32HalTim(mcu: McuFamily, cfg: TimConfig): DriverFiles {
  const inst = `TIM${cfg.instance}`;
  const guard = includeGuard(`TIM${cfg.instance}_DRIVER`);
  const handle = `htim${cfg.instance}`;

  const header = [
    headerComment([
      `${inst} Driver — STM32 HAL`,
      `Prescaler : ${cfg.prescaler}`,
      `Period    : ${cfg.period}`,
      `IT        : ${cfg.interrupt ? "enabled" : "disabled"}`,
    ]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    `#include ${mcuHalHeader(mcu)}`,
    "#include <stdint.h>",
    "",
    `extern TIM_HandleTypeDef ${handle};`,
    "",
    "void tim_init(void);",
    "void tim_start(void);",
    "void tim_stop(void);",
    cfg.interrupt ? "void tim_period_callback(void); /* user override */" : "",
    "",
    `#endif /* ${guard} */`,
    "",
  ].filter(Boolean).join("\n");

  const source: string[] = [
    headerComment([`${inst} Driver — STM32 HAL implementation`]),
    `#include "tim${cfg.instance}_driver.h"`,
    "",
    `TIM_HandleTypeDef ${handle};`,
  ];

  if (cfg.interrupt) {
    source.push(
      "",
      "__attribute__((weak)) void tim_period_callback(void) {}"
    );
  }

  source.push(
    "",
    "void tim_init(void)",
    "{",
    `  ${handle}.Instance = ${inst};`,
    `  ${handle}.Init.Prescaler = ${cfg.prescaler};`,
    `  ${handle}.Init.CounterMode = TIM_COUNTERMODE_UP;`,
    `  ${handle}.Init.Period = ${cfg.period};`,
    `  ${handle}.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;`,
    `  ${handle}.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_ENABLE;`,
    `  HAL_TIM_Base_Init(&${handle});`,
    "}",
    "",
    "void tim_start(void)",
    "{",
    cfg.interrupt
      ? `  HAL_NVIC_SetPriority(${inst}_IRQn, 5, 0);\n  HAL_NVIC_EnableIRQ(${inst}_IRQn);\n  HAL_TIM_Base_Start_IT(&${handle});`
      : `  HAL_TIM_Base_Start(&${handle});`,
    "}",
    "",
    "void tim_stop(void)",
    "{",
    cfg.interrupt
      ? `  HAL_TIM_Base_Stop_IT(&${handle});`
      : `  HAL_TIM_Base_Stop(&${handle});`,
    "}",
  );

  if (cfg.interrupt) {
    source.push(
      "",
      `void ${inst}_IRQHandler(void)`,
      "{",
      `  HAL_TIM_IRQHandler(&${handle});`,
      "}",
      "",
      "void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)",
      "{",
      `  if (htim->Instance == ${inst}) {`,
      "    // ⚠️ ISR 中避免长时间操作或调用 printf",
      "    tim_period_callback();",
      "  }",
      "}"
    );
  }
  source.push("");

  return { header, source: source.join("\n") };
}

function stm32LlTim(cfg: TimConfig): DriverFiles {
  const inst = `TIM${cfg.instance}`;
  const guard = includeGuard(`TIM${cfg.instance}_DRIVER`);

  const header = [
    headerComment([`${inst} Driver — STM32 LL`, `PSC=${cfg.prescaler}, ARR=${cfg.period}`]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    "#include <stdint.h>",
    "",
    "void tim_init(void);",
    "void tim_start(void);",
    "void tim_stop(void);",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  const source = [
    headerComment([`${inst} Driver — STM32 LL implementation`]),
    `#include "tim${cfg.instance}_driver.h"`,
    "",
    "void tim_init(void)",
    "{",
    `  LL_TIM_InitTypeDef init = {0};`,
    `  init.Prescaler = ${cfg.prescaler};`,
    `  init.CounterMode = LL_TIM_COUNTERMODE_UP;`,
    `  init.Autoreload = ${cfg.period};`,
    `  init.ClockDivision = LL_TIM_CLOCKDIVISION_DIV1;`,
    `  LL_TIM_Init(${inst}, &init);`,
    cfg.interrupt ? `  LL_TIM_EnableIT_UPDATE(${inst});\n  NVIC_EnableIRQ(${inst}_IRQn);` : "",
    "}",
    "",
    "void tim_start(void) {",
    `  LL_TIM_EnableCounter(${inst});`,
    "}",
    "",
    "void tim_stop(void) {",
    `  LL_TIM_DisableCounter(${inst});`,
    "}",
    "",
  ].join("\n");

  return { header, source };
}

function esp32ArduinoTim(cfg: TimConfig): DriverFiles {
  const guard = includeGuard(`TIM${cfg.instance}_DRIVER`);
  // Arduino ESP32 timer：用 hw_timer
  const periodUs = (cfg.prescaler + 1) * (cfg.period + 1);

  const header = [
    headerComment([
      `Hardware Timer Driver — ESP32 Arduino`,
      `Period ≈ ${periodUs} ticks`,
    ]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    "#include <Arduino.h>",
    "#include <stdint.h>",
    "",
    "void tim_init(void);",
    "void tim_start(void);",
    "void tim_stop(void);",
    "void tim_period_callback(void);",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  const source = [
    headerComment([`Hardware Timer Driver — ESP32 Arduino implementation`]),
    `#include "tim${cfg.instance}_driver.h"`,
    "",
    "static hw_timer_t *s_tim = NULL;",
    "",
    "__attribute__((weak)) void tim_period_callback(void) {}",
    "",
    "static void IRAM_ATTR onTimer(void) {",
    "  // ⚠️ ISR 中不要使用 Serial.print / 阻塞 API",
    "  tim_period_callback();",
    "}",
    "",
    "void tim_init(void)",
    "{",
    `  s_tim = timerBegin(${cfg.instance - 1}, ${cfg.prescaler + 1}, true);`,
    "  timerAttachInterrupt(s_tim, &onTimer, true);",
    `  timerAlarmWrite(s_tim, ${cfg.period + 1}, true);`,
    "}",
    "",
    "void tim_start(void) { timerAlarmEnable(s_tim); }",
    "void tim_stop(void)  { timerAlarmDisable(s_tim); }",
    "",
  ].join("\n");

  return { header, source };
}

function esp32IdfTim(cfg: TimConfig): DriverFiles {
  const guard = includeGuard(`TIM${cfg.instance}_DRIVER`);

  const header = [
    headerComment([`General Timer Driver — ESP-IDF`]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    "#include <stdint.h>",
    `#include "driver/gptimer.h"`,
    "",
    "void tim_init(void);",
    "void tim_start(void);",
    "void tim_stop(void);",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  const source = [
    headerComment([`General Timer Driver — ESP-IDF implementation`]),
    `#include "tim${cfg.instance}_driver.h"`,
    "",
    "static gptimer_handle_t s_tim;",
    "",
    "void tim_init(void)",
    "{",
    "  gptimer_config_t cfg = {",
    "    .clk_src = GPTIMER_CLK_SRC_DEFAULT,",
    "    .direction = GPTIMER_COUNT_UP,",
    "    .resolution_hz = 1000000,",
    "  };",
    "  gptimer_new_timer(&cfg, &s_tim);",
    "  gptimer_alarm_config_t alarm = {",
    `    .alarm_count = ${(cfg.prescaler + 1) * (cfg.period + 1)},`,
    "    .reload_count = 0,",
    "    .flags.auto_reload_on_alarm = true,",
    "  };",
    "  gptimer_set_alarm_action(s_tim, &alarm);",
    "  gptimer_enable(s_tim);",
    "}",
    "",
    "void tim_start(void) { gptimer_start(s_tim); }",
    "void tim_stop(void)  { gptimer_stop(s_tim); }",
    "",
  ].join("\n");

  return { header, source };
}

export function generateTim(
  mcu: McuFamily,
  style: CodeStyle,
  cfg: TimConfig
): DriverFiles {
  if (mcu === "esp32") {
    return style === "Arduino" ? esp32ArduinoTim(cfg) : esp32IdfTim(cfg);
  }
  if (style === "LL") return stm32LlTim(cfg);
  return stm32HalTim(mcu, cfg);
}
