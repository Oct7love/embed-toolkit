/** A single state node in the state machine */
export interface StateMachineState {
  /** Unique identifier */
  id: string;
  /** Display name (used in C enum) */
  name: string;
  /** X position on canvas */
  x: number;
  /** Y position on canvas */
  y: number;
  /** Whether this is the initial state */
  isInitial: boolean;
  /** Whether this is a final/accept state */
  isFinal: boolean;
}

/** A transition between two states */
export interface StateTransition {
  /** Unique identifier */
  id: string;
  /** Source state ID */
  from: string;
  /** Target state ID */
  to: string;
  /** Trigger event name */
  event: string;
  /** Action to execute on transition */
  action: string;
}

/** A saved state machine project */
export interface StateMachineProject {
  /** Unique identifier */
  id: string;
  /** Project name */
  name: string;
  /** All state nodes */
  states: StateMachineState[];
  /** All transitions */
  transitions: StateTransition[];
  /** Creation timestamp */
  createdAt: number;
}

/** Canvas interaction mode */
export type CanvasMode = "select" | "add-state" | "add-transition";

/** Dimensions for state node rendering */
export const STATE_NODE_WIDTH = 140;
export const STATE_NODE_HEIGHT = 50;
export const STATE_NODE_RADIUS = 10;

