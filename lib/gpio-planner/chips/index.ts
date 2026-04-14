import { STM32F103C8T6 } from "./stm32f103c8t6";
import { ESP32 } from "./esp32";
import type { ChipDefinition } from "@/types/gpio-planner";

export const CHIPS: ChipDefinition[] = [STM32F103C8T6, ESP32];

export function getChipById(id: string): ChipDefinition | undefined {
  return CHIPS.find((c) => c.id === id);
}

export { STM32F103C8T6, ESP32 };
