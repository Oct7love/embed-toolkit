export interface PinDefinition {
  number: number;
  name: string;
  defaultFunction: string;
  alternateFunctions: string[];
}

export interface ChipDefinition {
  id: string;
  name: string;
  manufacturer?: string;
  package: string;
  pins: PinDefinition[];
}

/** 芯片索引项（从 public/chips/index.json 加载，用于搜索和列表，不含引脚数据） */
export interface ChipIndexEntry {
  id: string;
  name: string;
  series: string;
  manufacturer: string;
  package: string;
  pinCount: number;
}

/** A single pin assignment: pin number -> chosen function */
export interface PinAssignment {
  pinNumber: number;
  assignedFunction: string;
}

/** A conflict detected between two or more pins */
export interface PinConflict {
  functionName: string;
  pinNumbers: number[];
}

/** Persisted planner state */
export interface GpioPlannerState {
  chipId: string;
  assignments: Record<number, string>; // pinNumber -> assignedFunction
}

export interface GpioPlannerStore {
  chipId: string;
  assignments: Record<number, string>;
  setChipId: (chipId: string) => void;
  assignPin: (pinNumber: number, func: string) => void;
  clearPin: (pinNumber: number) => void;
  clearAll: () => void;
}
