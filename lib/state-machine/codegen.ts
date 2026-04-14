import type {
  StateMachineState,
  StateTransition,
} from "@/types/state-machine";

/**
 * Sanitize a name to be a valid C identifier.
 * Converts to UPPER_SNAKE_CASE, strips invalid chars.
 */
function toCIdentifier(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9_\u4e00-\u9fff]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "")
    .toUpperCase();
}

/**
 * Sanitize a name to a valid C function-style identifier (lower_snake_case).
 */
function toCFunctionName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

/**
 * Generate C language code from a state machine definition.
 */
export function generateCCode(
  states: StateMachineState[],
  transitions: StateTransition[],
  machineName: string = "fsm"
): string {
  if (states.length === 0) {
    return "// No states defined. Add states to generate code.";
  }

  const prefix = toCIdentifier(machineName);
  const prefixLower = toCFunctionName(machineName);

  // Collect unique events
  const events = [
    ...new Set(
      transitions.map((t) => t.event).filter((e) => e.trim().length > 0)
    ),
  ];

  // Collect unique actions
  const actions = [
    ...new Set(
      transitions.map((t) => t.action).filter((a) => a.trim().length > 0)
    ),
  ];

  const lines: string[] = [];

  // Header guard and includes
  lines.push(`#ifndef ${prefix}_H`);
  lines.push(`#define ${prefix}_H`);
  lines.push("");
  lines.push("#include <stdint.h>");
  lines.push("#include <stdbool.h>");
  lines.push("");

  // State enum
  lines.push("/* ---- State Definitions ---- */");
  lines.push(`typedef enum {`);
  states.forEach((s, i) => {
    const id = toCIdentifier(s.name) || `STATE_${i}`;
    const suffix = i < states.length - 1 ? "," : "";
    const comment = s.isInitial ? " /* initial */" : s.isFinal ? " /* final */" : "";
    lines.push(`    ${prefix}_STATE_${id}${suffix}${comment}`);
  });
  lines.push(`} ${prefix}_State_t;`);
  lines.push("");

  // Event enum
  if (events.length > 0) {
    lines.push("/* ---- Event Definitions ---- */");
    lines.push(`typedef enum {`);
    events.forEach((e, i) => {
      const id = toCIdentifier(e);
      const suffix = i < events.length - 1 ? "," : "";
      lines.push(`    ${prefix}_EVENT_${id}${suffix}`);
    });
    lines.push(`} ${prefix}_Event_t;`);
    lines.push("");
  }

  // Action function prototypes
  if (actions.length > 0) {
    lines.push("/* ---- Action Function Prototypes ---- */");
    actions.forEach((a) => {
      const funcName = toCFunctionName(a);
      lines.push(`void ${prefixLower}_action_${funcName}(void);`);
    });
    lines.push("");
  }

  // FSM struct
  lines.push("/* ---- FSM Context ---- */");
  lines.push(`typedef struct {`);
  lines.push(`    ${prefix}_State_t current_state;`);
  lines.push(`} ${prefix}_Context_t;`);
  lines.push("");

  // Init function
  const initialState = states.find((s) => s.isInitial) ?? states[0];
  const initialId = toCIdentifier(initialState.name) || "STATE_0";
  lines.push("/* ---- Initialize FSM ---- */");
  lines.push(
    `static inline void ${prefixLower}_init(${prefix}_Context_t *ctx) {`
  );
  lines.push(`    ctx->current_state = ${prefix}_STATE_${initialId};`);
  lines.push("}");
  lines.push("");

  // Process event function
  if (events.length > 0) {
    lines.push("/* ---- Process Event ---- */");
    lines.push(
      `void ${prefixLower}_process(${prefix}_Context_t *ctx, ${prefix}_Event_t event) {`
    );
    lines.push("    switch (ctx->current_state) {");

    // Group transitions by source state
    const transByState = new Map<string, StateTransition[]>();
    for (const t of transitions) {
      if (!transByState.has(t.from)) {
        transByState.set(t.from, []);
      }
      transByState.get(t.from)!.push(t);
    }

    for (const state of states) {
      const stateId = toCIdentifier(state.name) || `STATE_${states.indexOf(state)}`;
      const stateTrans = transByState.get(state.id) ?? [];

      lines.push(`    case ${prefix}_STATE_${stateId}:`);

      if (stateTrans.length > 0) {
        lines.push("        switch (event) {");
        for (const t of stateTrans) {
          if (t.event.trim().length === 0) continue;
          const eventId = toCIdentifier(t.event);
          const targetState = states.find((s) => s.id === t.to);
          const targetId = targetState
            ? toCIdentifier(targetState.name) || `STATE_${states.indexOf(targetState)}`
            : "UNKNOWN";

          lines.push(`        case ${prefix}_EVENT_${eventId}:`);
          if (t.action.trim().length > 0) {
            const funcName = toCFunctionName(t.action);
            lines.push(`            ${prefixLower}_action_${funcName}();`);
          }
          lines.push(
            `            ctx->current_state = ${prefix}_STATE_${targetId};`
          );
          lines.push("            break;");
        }
        lines.push("        default:");
        lines.push("            break;");
        lines.push("        }");
      }

      lines.push("        break;");
    }

    lines.push("    default:");
    lines.push("        break;");
    lines.push("    }");
    lines.push("}");
    lines.push("");
  }

  lines.push(`#endif /* ${prefix}_H */`);

  return lines.join("\n");
}
