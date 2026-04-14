export interface PinDefinition {
  number: number;
  name: string;
  defaultFunction: string;
  alternateFunctions: string[];
}

export interface ChipDefinition {
  id: string;
  name: string;
  package: string;
  pins: PinDefinition[];
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
