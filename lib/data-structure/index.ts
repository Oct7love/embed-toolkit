/**
 * Pure code generators for common embedded data structures.
 * All functions are side-effect free so they can be unit tested directly.
 */

import type {
  DataStructureType,
  GeneratedSources,
  GenerateOptions,
  PubSubConfig,
  RingBufferConfig,
  StateMachineConfig,
  SwTimerConfig,
} from "@/types/data-structure";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Returns true if n is a positive power of two */
export function isPowerOfTwo(n: number): boolean {
  return Number.isInteger(n) && n > 0 && (n & (n - 1)) === 0;
}

/** Sanitize a name to a valid lower_snake_case C identifier */
function toSnake(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
  return cleaned.length > 0 ? cleaned : "x";
}

/** Sanitize a name to UPPER_SNAKE_CASE for enum members */
function toUpper(name: string): string {
  return toSnake(name).toUpperCase();
}

/** Resolve an element type from RingBufferConfig (handles "custom") */
function resolveElementType(c: RingBufferConfig): string {
  if (c.elementType === "custom") {
    const t = c.customElementType.trim();
    return t.length > 0 ? t : "uint8_t";
  }
  return c.elementType;
}

/* ------------------------------------------------------------------ */
/* 1. Ring buffer                                                      */
/* ------------------------------------------------------------------ */

/**
 * Generate a power-of-two-sized ring buffer in C.
 *
 * @throws Error when capacity is not a power of two.
 */
export function generateRingBuffer(c: RingBufferConfig): GeneratedSources {
  if (!isPowerOfTwo(c.capacity)) {
    throw new Error(
      `Ring buffer capacity must be a power of two, got ${c.capacity}`
    );
  }

  const name = toSnake(c.typeName);
  const upper = name.toUpperCase();
  const elem = resolveElementType(c);
  const cap = c.capacity;
  const mask = cap - 1;

  const headerLines: string[] = [];
  headerLines.push(`#ifndef ${upper}_H`);
  headerLines.push(`#define ${upper}_H`);
  headerLines.push("");
  headerLines.push("#include <stdint.h>");
  headerLines.push("#include <stdbool.h>");
  headerLines.push("#include <stddef.h>");
  headerLines.push("");
  headerLines.push(`#define ${upper}_CAPACITY ${cap}u`);
  headerLines.push(`#define ${upper}_MASK     ${mask}u`);
  headerLines.push("");
  headerLines.push("/* Ring buffer storing a power-of-two number of elements. */");
  headerLines.push("typedef struct {");
  headerLines.push(`    ${elem} data[${upper}_CAPACITY];`);
  headerLines.push("    volatile uint32_t head; /* write index */");
  headerLines.push("    volatile uint32_t tail; /* read  index */");
  headerLines.push(`} ${name}_t;`);
  headerLines.push("");
  headerLines.push(`void    ${name}_init(${name}_t *rb);`);
  headerLines.push(`bool    ${name}_push(${name}_t *rb, ${elem} item);`);
  headerLines.push(`bool    ${name}_pop (${name}_t *rb, ${elem} *out);`);
  headerLines.push(`bool    ${name}_peek(const ${name}_t *rb, ${elem} *out);`);
  headerLines.push(`bool    ${name}_is_empty(const ${name}_t *rb);`);
  headerLines.push(`bool    ${name}_is_full (const ${name}_t *rb);`);
  headerLines.push(`uint32_t ${name}_size  (const ${name}_t *rb);`);
  headerLines.push("");
  headerLines.push(`#endif /* ${upper}_H */`);

  const tsEnter = c.threadSafe
    ? "    /* enter critical section (ISR-safe via PRIMASK) */\n    uint32_t __primask = __get_PRIMASK();\n    __disable_irq();\n"
    : "";
  const tsExit = c.threadSafe
    ? "    /* leave critical section */\n    __set_PRIMASK(__primask);\n"
    : "";

  const sourceLines: string[] = [];
  sourceLines.push(`#include "${name}.h"`);
  sourceLines.push("");
  sourceLines.push("/*");
  sourceLines.push(" * 本实现仅保证单写单读场景下的 ISR 安全：一个生产者 + 一个消费者");
  sourceLines.push(" *（典型如 UART RX ISR 推入、任务循环弹出）。");
  sourceLines.push(" *");
  sourceLines.push(" * 多写或多读场景必须改用 FreeRTOS StreamBuffer / MessageBuffer，");
  sourceLines.push(" * 或在 push/pop 外层加 Mutex 保护。head/tail 的 volatile 与内存序约束");
  sourceLines.push(" * 仅对 Cortex-M 的 strong memory model 成立。");
  sourceLines.push(" */");
  if (c.threadSafe) {
    sourceLines.push("");
    sourceLines.push("/* ISR-safe variant: 通过 PRIMASK 关中断保护 head/tail 更新。");
    sourceLines.push(" * Replace __disable_irq / __get_PRIMASK with your platform primitives. */");
  }
  sourceLines.push("");
  sourceLines.push(`void ${name}_init(${name}_t *rb) {`);
  sourceLines.push("    rb->head = 0;");
  sourceLines.push("    rb->tail = 0;");
  sourceLines.push("}");
  sourceLines.push("");
  sourceLines.push(`bool ${name}_push(${name}_t *rb, ${elem} item) {`);
  if (c.threadSafe) sourceLines.push(tsEnter.trimEnd());
  sourceLines.push(`    uint32_t next = (rb->head + 1u) & ${upper}_MASK;`);
  sourceLines.push("    if (next == rb->tail) {");
  if (c.threadSafe) sourceLines.push(tsExit.trimEnd());
  sourceLines.push("        return false; /* full */");
  sourceLines.push("    }");
  sourceLines.push(`    rb->data[rb->head & ${upper}_MASK] = item;`);
  sourceLines.push("    rb->head = next;");
  if (c.threadSafe) sourceLines.push(tsExit.trimEnd());
  sourceLines.push("    return true;");
  sourceLines.push("}");
  sourceLines.push("");
  sourceLines.push(`bool ${name}_pop(${name}_t *rb, ${elem} *out) {`);
  if (c.threadSafe) sourceLines.push(tsEnter.trimEnd());
  sourceLines.push("    if (rb->head == rb->tail) {");
  if (c.threadSafe) sourceLines.push(tsExit.trimEnd());
  sourceLines.push("        return false; /* empty */");
  sourceLines.push("    }");
  sourceLines.push(`    *out = rb->data[rb->tail & ${upper}_MASK];`);
  sourceLines.push(`    rb->tail = (rb->tail + 1u) & ${upper}_MASK;`);
  if (c.threadSafe) sourceLines.push(tsExit.trimEnd());
  sourceLines.push("    return true;");
  sourceLines.push("}");
  sourceLines.push("");
  sourceLines.push(`bool ${name}_peek(const ${name}_t *rb, ${elem} *out) {`);
  sourceLines.push("    if (rb->head == rb->tail) {");
  sourceLines.push("        return false;");
  sourceLines.push("    }");
  sourceLines.push(`    *out = rb->data[rb->tail & ${upper}_MASK];`);
  sourceLines.push("    return true;");
  sourceLines.push("}");
  sourceLines.push("");
  sourceLines.push(`bool ${name}_is_empty(const ${name}_t *rb) {`);
  sourceLines.push("    return rb->head == rb->tail;");
  sourceLines.push("}");
  sourceLines.push("");
  sourceLines.push(`bool ${name}_is_full(const ${name}_t *rb) {`);
  sourceLines.push(`    return ((rb->head + 1u) & ${upper}_MASK) == rb->tail;`);
  sourceLines.push("}");
  sourceLines.push("");
  sourceLines.push(`uint32_t ${name}_size(const ${name}_t *rb) {`);
  sourceLines.push(`    return (rb->head - rb->tail) & ${upper}_MASK;`);
  sourceLines.push("}");

  return {
    header: headerLines.join("\n") + "\n",
    source: sourceLines.join("\n") + "\n",
  };
}

/* ------------------------------------------------------------------ */
/* 2. Simple state machine (switch-case)                               */
/* ------------------------------------------------------------------ */

/**
 * Generate a minimal switch-case style FSM as a single string.
 * Complex graphs should use the visual editor at /tools/codegen/state-machine.
 */
export function generateStateMachine(c: StateMachineConfig): string {
  const prefix = toSnake(c.prefix);
  const PREFIX = prefix.toUpperCase();

  const states = c.states
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const events = c.events
    .map((e) => e.trim())
    .filter((e) => e.length > 0);

  if (states.length === 0) {
    return "// At least one state is required.";
  }

  const lines: string[] = [];
  lines.push(`#ifndef ${PREFIX}_H`);
  lines.push(`#define ${PREFIX}_H`);
  lines.push("");
  lines.push("#include <stdint.h>");
  lines.push("#include <stdbool.h>");
  lines.push("");
  lines.push("/*");
  lines.push(" * Simple switch-case state machine framework.");
  lines.push(" * For complex state graphs, use the visual editor at:");
  lines.push(" *   /tools/codegen/state-machine");
  lines.push(" */");
  lines.push("");

  // State enum
  lines.push("typedef enum {");
  states.forEach((s, i) => {
    const member = `${PREFIX}_STATE_${toUpper(s)}`;
    const sep = i < states.length - 1 ? "," : "";
    lines.push(`    ${member}${sep}`);
  });
  lines.push(`} ${prefix}_state_t;`);
  lines.push("");

  // Event enum
  if (events.length > 0) {
    lines.push("typedef enum {");
    events.forEach((e, i) => {
      const member = `${PREFIX}_EVENT_${toUpper(e)}`;
      const sep = i < events.length - 1 ? "," : "";
      lines.push(`    ${member}${sep}`);
    });
    lines.push(`} ${prefix}_event_t;`);
    lines.push("");
  }

  // Global current state
  lines.push(`extern ${prefix}_state_t ${prefix}_current_state;`);
  lines.push("");

  // Transition function definition (static inline for header-only convenience)
  if (events.length > 0) {
    lines.push("/* Transition function: switch on state, then on event. */");
    lines.push(
      `static inline void ${prefix}_handle_event(${prefix}_event_t event) {`
    );
    lines.push(`    switch (${prefix}_current_state) {`);
    for (const s of states) {
      const stateMember = `${PREFIX}_STATE_${toUpper(s)}`;
      lines.push(`    case ${stateMember}:`);
      lines.push("        switch (event) {");
      for (const e of events) {
        const evMember = `${PREFIX}_EVENT_${toUpper(e)}`;
        lines.push(`        case ${evMember}:`);
        lines.push(`            /* TODO: action for ${stateMember} + ${evMember} */`);
        lines.push("            break;");
      }
      lines.push("        default:");
      lines.push("            break;");
      lines.push("        }");
      lines.push("        break;");
    }
    lines.push("    default:");
    lines.push("        break;");
    lines.push("    }");
    lines.push("}");
    lines.push("");
  }

  lines.push(`#endif /* ${PREFIX}_H */`);
  return lines.join("\n") + "\n";
}

/* ------------------------------------------------------------------ */
/* 3. Software timer array                                             */
/* ------------------------------------------------------------------ */

/**
 * Generate a tick-driven software timer array.
 * Call swtimer_tick() from a SysTick / 1ms ISR.
 */
export function generateSwTimer(c: SwTimerConfig): GeneratedSources {
  const prefix = toSnake(c.prefix);
  const PREFIX = prefix.toUpperCase();
  const max = Math.max(1, Math.floor(c.maxTimers));
  const tickHz = Math.max(1, Math.floor(c.tickHz));

  const headerLines: string[] = [];
  headerLines.push(`#ifndef ${PREFIX}_H`);
  headerLines.push(`#define ${PREFIX}_H`);
  headerLines.push("");
  headerLines.push("#include <stdint.h>");
  headerLines.push("#include <stdbool.h>");
  headerLines.push("");
  headerLines.push(`#define ${PREFIX}_MAX     ${max}u`);
  headerLines.push(`#define ${PREFIX}_TICK_HZ ${tickHz}u`);
  headerLines.push("");
  headerLines.push("typedef void (*swtimer_callback_t)(void);");
  headerLines.push("");
  headerLines.push("typedef struct {");
  headerLines.push("    uint32_t period;          /* reload value in ticks  */");
  headerLines.push("    uint32_t counter;         /* down counter in ticks  */");
  headerLines.push("    bool     active;          /* slot is in use         */");
  headerLines.push("    swtimer_callback_t callback;");
  headerLines.push(`} ${prefix}_t;`);
  headerLines.push("");
  headerLines.push(`void ${prefix}_init(void);`);
  headerLines.push(
    `int8_t ${prefix}_start(uint32_t period_ticks, swtimer_callback_t cb);`
  );
  headerLines.push(`bool ${prefix}_stop(int8_t handle);`);
  headerLines.push(`void ${prefix}_tick(void); /* call from SysTick */`);
  headerLines.push("");
  headerLines.push(`#endif /* ${PREFIX}_H */`);

  const sourceLines: string[] = [];
  sourceLines.push(`#include "${prefix}.h"`);
  sourceLines.push("");
  sourceLines.push("/*");
  sourceLines.push(" * 协作式软件定时器：回调在 tick ISR 上下文执行。");
  sourceLines.push(" *");
  sourceLines.push(" * ⚠️ 回调内禁止：");
  sourceLines.push(" *   - 阻塞 / vTaskDelay / osDelay");
  sourceLines.push(" *   - 非 FromISR 版本的 FreeRTOS API（xQueueSend → xQueueSendFromISR）");
  sourceLines.push(" *   - printf / malloc / 浮点运算（无 FPU 保存）");
  sourceLines.push(" *");
  sourceLines.push(" * 复杂回调逻辑请改用 FreeRTOS xTimerCreate + xTimerPendFunctionCall，");
  sourceLines.push(" * 回调在守护任务上下文执行，上述限制全部解除。");
  sourceLines.push(" */");
  sourceLines.push("");
  sourceLines.push(`static ${prefix}_t timers[${PREFIX}_MAX];`);
  sourceLines.push("");
  sourceLines.push(`void ${prefix}_init(void) {`);
  sourceLines.push(`    for (uint32_t i = 0; i < ${PREFIX}_MAX; ++i) {`);
  sourceLines.push("        timers[i].active = false;");
  sourceLines.push("        timers[i].callback = (swtimer_callback_t)0;");
  sourceLines.push("    }");
  sourceLines.push("}");
  sourceLines.push("");
  sourceLines.push(
    `int8_t ${prefix}_start(uint32_t period_ticks, swtimer_callback_t cb) {`
  );
  sourceLines.push("    if (cb == (swtimer_callback_t)0 || period_ticks == 0u) {");
  sourceLines.push("        return -1;");
  sourceLines.push("    }");
  sourceLines.push(`    for (uint32_t i = 0; i < ${PREFIX}_MAX; ++i) {`);
  sourceLines.push("        if (!timers[i].active) {");
  sourceLines.push("            timers[i].period   = period_ticks;");
  sourceLines.push("            timers[i].counter  = period_ticks;");
  sourceLines.push("            timers[i].callback = cb;");
  sourceLines.push("            timers[i].active   = true;");
  sourceLines.push("            return (int8_t)i;");
  sourceLines.push("        }");
  sourceLines.push("    }");
  sourceLines.push("    return -1; /* no free slot */");
  sourceLines.push("}");
  sourceLines.push("");
  sourceLines.push(`bool ${prefix}_stop(int8_t handle) {`);
  sourceLines.push(
    `    if (handle < 0 || (uint32_t)handle >= ${PREFIX}_MAX) {`
  );
  sourceLines.push("        return false;");
  sourceLines.push("    }");
  sourceLines.push("    timers[handle].active = false;");
  sourceLines.push("    return true;");
  sourceLines.push("}");
  sourceLines.push("");
  sourceLines.push("/* O(N) scan over every slot; call from 1-tick ISR. */");
  sourceLines.push(`void ${prefix}_tick(void) {`);
  sourceLines.push(`    for (uint32_t i = 0; i < ${PREFIX}_MAX; ++i) {`);
  sourceLines.push("        if (!timers[i].active) {");
  sourceLines.push("            continue;");
  sourceLines.push("        }");
  sourceLines.push("        if (timers[i].counter > 0u) {");
  sourceLines.push("            timers[i].counter--;");
  sourceLines.push("        }");
  sourceLines.push("        if (timers[i].counter == 0u) {");
  sourceLines.push("            if (timers[i].callback != (swtimer_callback_t)0) {");
  sourceLines.push("                timers[i].callback();");
  sourceLines.push("            }");
  sourceLines.push("            timers[i].counter = timers[i].period; /* auto-reload */");
  sourceLines.push("        }");
  sourceLines.push("    }");
  sourceLines.push("}");

  return {
    header: headerLines.join("\n") + "\n",
    source: sourceLines.join("\n") + "\n",
  };
}

/* ------------------------------------------------------------------ */
/* 4. Pub/Sub event framework                                          */
/* ------------------------------------------------------------------ */

/**
 * Generate a simple statically-allocated pub/sub event framework.
 * No RTOS dependency: dispatch is synchronous via array iteration.
 */
export function generatePubSub(c: PubSubConfig): GeneratedSources {
  const prefix = toSnake(c.prefix);
  const PREFIX = prefix.toUpperCase();
  const max = Math.max(1, Math.floor(c.maxSubscribers));

  const events = c.eventTypes
    .map((e) => e.trim())
    .filter((e) => e.length > 0);

  const headerLines: string[] = [];
  headerLines.push(`#ifndef ${PREFIX}_H`);
  headerLines.push(`#define ${PREFIX}_H`);
  headerLines.push("");
  headerLines.push("#include <stdint.h>");
  headerLines.push("#include <stdbool.h>");
  headerLines.push("");
  headerLines.push(`#define ${PREFIX}_MAX_SUBSCRIBERS ${max}u`);
  headerLines.push("");

  if (events.length > 0) {
    headerLines.push("typedef enum {");
    events.forEach((e, i) => {
      const member = `${PREFIX}_EVT_${toUpper(e)}`;
      const sep = i < events.length - 1 ? "," : "";
      headerLines.push(`    ${member}${sep}`);
    });
    headerLines.push(`} ${prefix}_event_type_t;`);
  } else {
    headerLines.push("typedef uint32_t " + prefix + "_event_type_t;");
  }
  headerLines.push("");
  headerLines.push("typedef struct {");
  headerLines.push(`    ${prefix}_event_type_t type;`);
  headerLines.push("    void              *payload;");
  headerLines.push(`} ${prefix}_event_t;`);
  headerLines.push("");
  headerLines.push(
    `typedef void (*${prefix}_callback_t)(const ${prefix}_event_t *evt);`
  );
  headerLines.push("");
  headerLines.push("typedef struct {");
  headerLines.push(`    ${prefix}_event_type_t type;`);
  headerLines.push(`    ${prefix}_callback_t   cb;`);
  headerLines.push("    bool                in_use;");
  headerLines.push(`} ${prefix}_subscriber_t;`);
  headerLines.push("");
  headerLines.push(`void ${prefix}_init(void);`);
  headerLines.push(
    `bool ${prefix}_subscribe(${prefix}_event_type_t type, ${prefix}_callback_t cb);`
  );
  headerLines.push(
    `void ${prefix}_publish(const ${prefix}_event_t *evt);`
  );
  headerLines.push("");
  headerLines.push(`#endif /* ${PREFIX}_H */`);

  const sourceLines: string[] = [];
  sourceLines.push(`#include "${prefix}.h"`);
  sourceLines.push("");
  sourceLines.push(
    `static ${prefix}_subscriber_t subs[${PREFIX}_MAX_SUBSCRIBERS];`
  );
  sourceLines.push("");
  sourceLines.push(`void ${prefix}_init(void) {`);
  sourceLines.push(
    `    for (uint32_t i = 0; i < ${PREFIX}_MAX_SUBSCRIBERS; ++i) {`
  );
  sourceLines.push("        subs[i].in_use = false;");
  sourceLines.push(`        subs[i].cb     = (${prefix}_callback_t)0;`);
  sourceLines.push("    }");
  sourceLines.push("}");
  sourceLines.push("");
  sourceLines.push(
    `bool ${prefix}_subscribe(${prefix}_event_type_t type, ${prefix}_callback_t cb) {`
  );
  sourceLines.push(`    if (cb == (${prefix}_callback_t)0) {`);
  sourceLines.push("        return false;");
  sourceLines.push("    }");
  sourceLines.push(
    `    for (uint32_t i = 0; i < ${PREFIX}_MAX_SUBSCRIBERS; ++i) {`
  );
  sourceLines.push("        if (!subs[i].in_use) {");
  sourceLines.push("            subs[i].type   = type;");
  sourceLines.push("            subs[i].cb     = cb;");
  sourceLines.push("            subs[i].in_use = true;");
  sourceLines.push("            return true;");
  sourceLines.push("        }");
  sourceLines.push("    }");
  sourceLines.push("    return false; /* no slot left */");
  sourceLines.push("}");
  sourceLines.push("");
  sourceLines.push("/* Iterate every subscriber; dispatch matching event types. */");
  sourceLines.push(`void ${prefix}_publish(const ${prefix}_event_t *evt) {`);
  sourceLines.push("    if (evt == (void *)0) {");
  sourceLines.push("        return;");
  sourceLines.push("    }");
  sourceLines.push(
    `    for (uint32_t i = 0; i < ${PREFIX}_MAX_SUBSCRIBERS; ++i) {`
  );
  sourceLines.push("        if (subs[i].in_use && subs[i].type == evt->type) {");
  sourceLines.push("            subs[i].cb(evt);");
  sourceLines.push("        }");
  sourceLines.push("    }");
  sourceLines.push("}");

  return {
    header: headerLines.join("\n") + "\n",
    source: sourceLines.join("\n") + "\n",
  };
}

/* ------------------------------------------------------------------ */
/* Main entry point                                                    */
/* ------------------------------------------------------------------ */

/**
 * Dispatch generation based on the data structure type.
 * The state-machine generator returns a single header string;
 * other generators return both header and source.
 */
export function generate(opts: GenerateOptions): GeneratedSources {
  switch (opts.type) {
    case "ring-buffer":
      return generateRingBuffer(opts.config);
    case "state-machine":
      return { header: generateStateMachine(opts.config), source: "" };
    case "sw-timer":
      return generateSwTimer(opts.config);
    case "pub-sub":
      return generatePubSub(opts.config);
    default: {
      // Exhaustiveness check
      const _exhaustive: never = opts;
      throw new Error(`Unknown data structure type: ${String(_exhaustive)}`);
    }
  }
}

/** Re-export for convenience */
export type { DataStructureType };
