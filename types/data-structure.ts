/**
 * Types for the embedded data structure code generator.
 * Supports 4 structures: ring buffer, simple FSM, software timers, pub/sub.
 */

/** All supported data structure kinds */
export type DataStructureType =
  | "ring-buffer"
  | "state-machine"
  | "sw-timer"
  | "pub-sub";

/** Element types supported by the ring buffer generator */
export type ElementType =
  | "uint8_t"
  | "uint16_t"
  | "uint32_t"
  | "custom";

/** Configuration for a ring buffer */
export interface RingBufferConfig {
  /** C identifier used for the type / function prefix (e.g. "my_buf") */
  typeName: string;
  /** Element type stored in the buffer */
  elementType: ElementType;
  /** Used when elementType === "custom" */
  customElementType: string;
  /** Number of slots; must be a power of two for mask optimization */
  capacity: number;
  /** Whether to wrap critical sections around mutating operations */
  threadSafe: boolean;
}

/** Configuration for the simple switch-case state machine generator */
export interface StateMachineConfig {
  /** Function / type prefix (e.g. "fsm") */
  prefix: string;
  /** State name list */
  states: string[];
  /** Event name list */
  events: string[];
}

/** Configuration for the software timer array generator */
export interface SwTimerConfig {
  /** Type / function prefix */
  prefix: string;
  /** Maximum number of timers in the static array */
  maxTimers: number;
  /** Tick frequency in Hz (used in comments) */
  tickHz: number;
}

/** Configuration for the pub/sub event framework generator */
export interface PubSubConfig {
  /** Type / function prefix */
  prefix: string;
  /** Maximum number of subscribers */
  maxSubscribers: number;
  /** Event type names that form the event_type_t enum */
  eventTypes: string[];
}

/** Header + source pair returned by most generators */
export interface GeneratedSources {
  header: string;
  source: string;
}

/** Discriminated union of all generator inputs (used by main entry point) */
export type GenerateOptions =
  | { type: "ring-buffer"; config: RingBufferConfig }
  | { type: "state-machine"; config: StateMachineConfig }
  | { type: "sw-timer"; config: SwTimerConfig }
  | { type: "pub-sub"; config: PubSubConfig };
