export type Library = "FreeRTOS" | "STM32 HAL";

export interface ApiParam {
  name: string;
  type: string;
  desc: string;
}

export interface ApiEntry {
  library: Library;
  category: string;
  name: string;
  signature: string;
  params: ApiParam[];
  returns: string;
  usage: string;
  pitfalls: string[];
}
