import type {
  DriverFiles,
  McuFamily,
  CodeStyle,
  PwmConfig,
} from "@/types/driver-template";
import { headerComment, includeGuard, mcuHalHeader } from "./common";

function clampDuty(p: number): number {
  if (p < 0) return 0;
  if (p > 100) return 100;
  return Math.round(p);
}

function stm32HalPwm(mcu: McuFamily, cfg: PwmConfig): DriverFiles {
  const tim = `TIM${cfg.instance}`;
  const ch = `TIM_CHANNEL_${cfg.channel}`;
  const guard = includeGuard(`PWM${cfg.instance}_CH${cfg.channel}_DRIVER`);
  const handle = `htim${cfg.instance}`;
  const duty = clampDuty(cfg.dutyPercent);
  const compare = Math.round(((cfg.period + 1) * duty) / 100);

  const header = [
    headerComment([
      `${tim} CH${cfg.channel} PWM Driver — STM32 HAL`,
      `Prescaler : ${cfg.prescaler}`,
      `Period    : ${cfg.period}`,
      `Duty      : ${duty}% (CCR=${compare})`,
      "",
      "Usage:",
      "  pwm_init();",
      "  pwm_start();",
      "  pwm_set_duty(50);  // 0..100",
    ]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    `#include ${mcuHalHeader(mcu)}`,
    "#include <stdint.h>",
    "",
    `extern TIM_HandleTypeDef ${handle};`,
    "",
    "void pwm_init(void);",
    "void pwm_start(void);",
    "void pwm_stop(void);",
    "void pwm_set_duty(uint8_t percent);",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  const source = [
    headerComment([`${tim} CH${cfg.channel} PWM — STM32 HAL implementation`]),
    `#include "pwm${cfg.instance}_ch${cfg.channel}_driver.h"`,
    "",
    `TIM_HandleTypeDef ${handle};`,
    "",
    "void pwm_init(void)",
    "{",
    `  ${handle}.Instance = ${tim};`,
    `  ${handle}.Init.Prescaler = ${cfg.prescaler};`,
    `  ${handle}.Init.CounterMode = TIM_COUNTERMODE_UP;`,
    `  ${handle}.Init.Period = ${cfg.period};`,
    `  ${handle}.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;`,
    `  ${handle}.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_ENABLE;`,
    `  HAL_TIM_PWM_Init(&${handle});`,
    "",
    "  TIM_OC_InitTypeDef oc = {0};",
    "  oc.OCMode = TIM_OCMODE_PWM1;",
    `  oc.Pulse = ${compare};`,
    "  oc.OCPolarity = TIM_OCPOLARITY_HIGH;",
    "  oc.OCFastMode = TIM_OCFAST_DISABLE;",
    `  HAL_TIM_PWM_ConfigChannel(&${handle}, &oc, ${ch});`,
    "}",
    "",
    "void pwm_start(void)",
    "{",
    `  HAL_TIM_PWM_Start(&${handle}, ${ch});`,
    "}",
    "",
    "void pwm_stop(void)",
    "{",
    `  HAL_TIM_PWM_Stop(&${handle}, ${ch});`,
    "}",
    "",
    "void pwm_set_duty(uint8_t percent)",
    "{",
    "  // ⚠️ percent 范围 0..100，未做 saturation 检查",
    `  uint32_t ccr = (uint32_t)((${cfg.period + 1}UL * percent) / 100U);`,
    `  __HAL_TIM_SET_COMPARE(&${handle}, ${ch}, ccr);`,
    "}",
    "",
  ].join("\n");

  return { header, source };
}

function stm32LlPwm(cfg: PwmConfig): DriverFiles {
  const tim = `TIM${cfg.instance}`;
  const guard = includeGuard(`PWM${cfg.instance}_CH${cfg.channel}_DRIVER`);
  const duty = clampDuty(cfg.dutyPercent);

  const header = [
    headerComment([`${tim} CH${cfg.channel} PWM — STM32 LL`]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    "#include <stdint.h>",
    "",
    "void pwm_init(void);",
    "void pwm_start(void);",
    "void pwm_set_duty(uint8_t percent);",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  const compare = Math.round(((cfg.period + 1) * duty) / 100);
  const source = [
    headerComment([`${tim} CH${cfg.channel} PWM — STM32 LL implementation`]),
    `#include "pwm${cfg.instance}_ch${cfg.channel}_driver.h"`,
    "",
    "void pwm_init(void)",
    "{",
    `  LL_TIM_SetPrescaler(${tim}, ${cfg.prescaler});`,
    `  LL_TIM_SetAutoReload(${tim}, ${cfg.period});`,
    `  LL_TIM_OC_SetMode(${tim}, LL_TIM_CHANNEL_CH${cfg.channel}, LL_TIM_OCMODE_PWM1);`,
    `  LL_TIM_OC_SetCompareCH${cfg.channel}(${tim}, ${compare});`,
    `  LL_TIM_CC_EnableChannel(${tim}, LL_TIM_CHANNEL_CH${cfg.channel});`,
    "}",
    "",
    "void pwm_start(void)",
    "{",
    `  LL_TIM_EnableCounter(${tim});`,
    "}",
    "",
    "void pwm_set_duty(uint8_t percent)",
    "{",
    `  uint32_t ccr = (uint32_t)((${cfg.period + 1}UL * percent) / 100U);`,
    `  LL_TIM_OC_SetCompareCH${cfg.channel}(${tim}, ccr);`,
    "}",
    "",
  ].join("\n");

  return { header, source };
}

function esp32ArduinoPwm(cfg: PwmConfig): DriverFiles {
  const guard = includeGuard(`PWM${cfg.instance}_CH${cfg.channel}_DRIVER`);
  const duty = clampDuty(cfg.dutyPercent);

  const header = [
    headerComment([`PWM CH${cfg.channel} Driver — ESP32 Arduino (LEDC)`]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    "#include <Arduino.h>",
    "#include <stdint.h>",
    "",
    "void pwm_init(void);",
    "void pwm_set_duty(uint8_t percent);",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  const dutyRaw = Math.round((255 * duty) / 100);
  const source = [
    headerComment([`PWM CH${cfg.channel} Driver — ESP32 Arduino LEDC implementation`]),
    `#include "pwm${cfg.instance}_ch${cfg.channel}_driver.h"`,
    "",
    `#define PWM_CH    ${cfg.channel - 1}`,
    `#define PWM_PIN   2  // TODO: 改成实际输出引脚`,
    `#define PWM_FREQ  5000`,
    "#define PWM_RES   8",
    "",
    "void pwm_init(void)",
    "{",
    "  ledcSetup(PWM_CH, PWM_FREQ, PWM_RES);",
    "  ledcAttachPin(PWM_PIN, PWM_CH);",
    `  ledcWrite(PWM_CH, ${dutyRaw});`,
    "}",
    "",
    "void pwm_set_duty(uint8_t percent)",
    "{",
    "  ledcWrite(PWM_CH, (uint32_t)((255U * percent) / 100U));",
    "}",
    "",
  ].join("\n");

  return { header, source };
}

function esp32IdfPwm(cfg: PwmConfig): DriverFiles {
  const guard = includeGuard(`PWM${cfg.instance}_CH${cfg.channel}_DRIVER`);
  const duty = clampDuty(cfg.dutyPercent);

  const header = [
    headerComment([`PWM CH${cfg.channel} Driver — ESP-IDF (LEDC)`]),
    `#ifndef ${guard}`,
    `#define ${guard}`,
    "",
    "#include <stdint.h>",
    `#include "driver/ledc.h"`,
    "",
    "void pwm_init(void);",
    "void pwm_set_duty(uint8_t percent);",
    "",
    `#endif /* ${guard} */`,
    "",
  ].join("\n");

  const dutyRaw = Math.round((255 * duty) / 100);
  const source = [
    headerComment([`PWM CH${cfg.channel} Driver — ESP-IDF LEDC implementation`]),
    `#include "pwm${cfg.instance}_ch${cfg.channel}_driver.h"`,
    "",
    "void pwm_init(void)",
    "{",
    "  ledc_timer_config_t t = {",
    "    .speed_mode = LEDC_LOW_SPEED_MODE,",
    "    .duty_resolution = LEDC_TIMER_8_BIT,",
    "    .timer_num = LEDC_TIMER_0,",
    "    .freq_hz = 5000,",
    "    .clk_cfg = LEDC_AUTO_CLK,",
    "  };",
    "  ledc_timer_config(&t);",
    "  ledc_channel_config_t c = {",
    `    .channel = LEDC_CHANNEL_${cfg.channel - 1},`,
    "    .gpio_num = 2,",
    "    .speed_mode = LEDC_LOW_SPEED_MODE,",
    "    .timer_sel = LEDC_TIMER_0,",
    `    .duty = ${dutyRaw},`,
    "  };",
    "  ledc_channel_config(&c);",
    "}",
    "",
    "void pwm_set_duty(uint8_t percent)",
    "{",
    `  ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_${cfg.channel - 1}, (255U * percent) / 100U);`,
    `  ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_${cfg.channel - 1});`,
    "}",
    "",
  ].join("\n");

  return { header, source };
}

export function generatePwm(
  mcu: McuFamily,
  style: CodeStyle,
  cfg: PwmConfig
): DriverFiles {
  if (mcu === "esp32") {
    return style === "Arduino" ? esp32ArduinoPwm(cfg) : esp32IdfPwm(cfg);
  }
  if (style === "LL") return stm32LlPwm(cfg);
  return stm32HalPwm(mcu, cfg);
}
