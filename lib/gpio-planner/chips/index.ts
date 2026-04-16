import { STM32F103C8T6 } from "./stm32f103c8t6";
import { STM32F103RCT6 } from "./stm32f103rct6";
import { STM32F103ZET6 } from "./stm32f103zet6";
import { STM32F407VET6 } from "./stm32f407vet6";
import { STM32F411CEU6 } from "./stm32f411ceu6";
import { STM32G431RBT6 } from "./stm32g431rbt6";
import { ESP32 } from "./esp32";
import { ESP32S3 } from "./esp32s3";
import { ESP32C3 } from "./esp32c3";
import { GD32F103C8T6 } from "./gd32f103c8t6";
import type { ChipDefinition } from "@/types/gpio-planner";

export const CHIPS: ChipDefinition[] = [
  STM32F103C8T6,
  STM32F103RCT6,
  STM32F103ZET6,
  STM32F407VET6,
  STM32F411CEU6,
  STM32G431RBT6,
  ESP32,
  ESP32S3,
  ESP32C3,
  GD32F103C8T6,
];

export function getChipById(id: string): ChipDefinition | undefined {
  return CHIPS.find((c) => c.id === id);
}

export {
  STM32F103C8T6,
  STM32F103RCT6,
  STM32F103ZET6,
  STM32F407VET6,
  STM32F411CEU6,
  STM32G431RBT6,
  ESP32,
  ESP32S3,
  ESP32C3,
  GD32F103C8T6,
};
