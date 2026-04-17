import { describe, it, expect } from "vitest";
import {
  generateRingBuffer,
  generateStateMachine,
  generateSwTimer,
  generatePubSub,
  generate,
  isPowerOfTwo,
} from "./index";
import type {
  PubSubConfig,
  RingBufferConfig,
  StateMachineConfig,
  SwTimerConfig,
} from "@/types/data-structure";

describe("isPowerOfTwo", () => {
  it("accepts 1, 2, 4, 8, 16, 256", () => {
    for (const n of [1, 2, 4, 8, 16, 256]) {
      expect(isPowerOfTwo(n)).toBe(true);
    }
  });

  it("rejects non powers of two and zero", () => {
    for (const n of [0, 3, 5, 6, 7, 100, -4]) {
      expect(isPowerOfTwo(n)).toBe(false);
    }
  });
});

describe("generateRingBuffer", () => {
  const base: RingBufferConfig = {
    typeName: "my_buf",
    elementType: "uint16_t",
    customElementType: "",
    capacity: 16,
    threadSafe: false,
  };

  it("throws when capacity is not a power of two", () => {
    expect(() =>
      generateRingBuffer({ ...base, capacity: 10 })
    ).toThrow(/power of two/i);
    expect(() =>
      generateRingBuffer({ ...base, capacity: 0 })
    ).toThrow(/power of two/i);
  });

  it("accepts power-of-two capacities and emits MASK macro", () => {
    const out = generateRingBuffer({ ...base, capacity: 32 });
    expect(out.header).toContain("MY_BUF_CAPACITY 32u");
    expect(out.header).toContain("MY_BUF_MASK     31u");
  });

  it("push/pop signatures contain the configured element type", () => {
    const out = generateRingBuffer({ ...base, elementType: "uint16_t" });
    expect(out.header).toContain("bool    my_buf_push(my_buf_t *rb, uint16_t item);");
    expect(out.header).toContain("bool    my_buf_pop (my_buf_t *rb, uint16_t *out);");
    expect(out.source).toContain("uint16_t item)");
    expect(out.source).toContain("uint16_t *out)");
  });

  it("uses custom element type when elementType=='custom'", () => {
    const out = generateRingBuffer({
      ...base,
      elementType: "custom",
      customElementType: "my_packet_t",
    });
    expect(out.header).toContain("my_packet_t data[");
    expect(out.header).toContain("my_packet_t item)");
  });

  it("emits critical-section primitives when threadSafe=true", () => {
    const safe = generateRingBuffer({ ...base, threadSafe: true });
    expect(safe.source).toContain("__disable_irq");
    expect(safe.source).toContain("__set_PRIMASK");

    const unsafe = generateRingBuffer({ ...base, threadSafe: false });
    expect(unsafe.source).not.toContain("__disable_irq");
  });
});

describe("generateStateMachine", () => {
  const cfg: StateMachineConfig = {
    prefix: "door",
    states: ["IDLE", "OPENING", "OPEN", "CLOSING"],
    events: ["BUTTON", "TIMEOUT"],
  };

  it("enum contains every supplied state name", () => {
    const code = generateStateMachine(cfg);
    expect(code).toContain("DOOR_STATE_IDLE");
    expect(code).toContain("DOOR_STATE_OPENING");
    expect(code).toContain("DOOR_STATE_OPEN");
    expect(code).toContain("DOOR_STATE_CLOSING");
  });

  it("transition function uses double-nested switch on state then event", () => {
    const code = generateStateMachine(cfg);
    const stateSwitchIdx = code.indexOf("switch (door_current_state)");
    const eventSwitchIdx = code.indexOf("switch (event)");
    expect(stateSwitchIdx).toBeGreaterThanOrEqual(0);
    expect(eventSwitchIdx).toBeGreaterThan(stateSwitchIdx);
  });

  it("references the link to the visual editor", () => {
    const code = generateStateMachine(cfg);
    expect(code).toContain("/tools/codegen/state-machine");
  });

  it("returns informative comment when no states are provided", () => {
    const code = generateStateMachine({ ...cfg, states: [] });
    expect(code).toMatch(/at least one state/i);
  });
});

describe("generateSwTimer", () => {
  const cfg: SwTimerConfig = {
    prefix: "swtimer",
    maxTimers: 8,
    tickHz: 1000,
  };

  it("struct contains period/counter/active/callback fields", () => {
    const out = generateSwTimer(cfg);
    expect(out.header).toContain("uint32_t period;");
    expect(out.header).toContain("uint32_t counter;");
    expect(out.header).toContain("bool     active;");
    expect(out.header).toContain("swtimer_callback_t callback;");
  });

  it("tick function performs O(N) scan over every slot", () => {
    const out = generateSwTimer(cfg);
    expect(out.source).toContain("void swtimer_tick(void)");
    expect(out.source).toContain("for (uint32_t i = 0; i < SWTIMER_MAX; ++i)");
    // The tick body must check active flag and decrement counter
    expect(out.source).toContain("if (!timers[i].active)");
    expect(out.source).toContain("timers[i].counter--");
  });

  it("exposes start / stop / init / tick API in the header", () => {
    const out = generateSwTimer(cfg);
    expect(out.header).toContain("void swtimer_init(void);");
    expect(out.header).toContain("int8_t swtimer_start(");
    expect(out.header).toContain("bool swtimer_stop(int8_t handle);");
    expect(out.header).toContain("void swtimer_tick(void);");
  });
});

describe("generatePubSub", () => {
  const cfg: PubSubConfig = {
    prefix: "evt",
    maxSubscribers: 4,
    eventTypes: ["KEY_DOWN", "KEY_UP"],
  };

  it("publish iterates every subscriber slot", () => {
    const out = generatePubSub(cfg);
    expect(out.source).toContain("void evt_publish(const evt_event_t *evt)");
    expect(out.source).toContain(
      "for (uint32_t i = 0; i < EVT_MAX_SUBSCRIBERS; ++i)"
    );
    expect(out.source).toContain("subs[i].cb(evt)");
  });

  it("emits an event_type enum that includes every supplied event", () => {
    const out = generatePubSub(cfg);
    expect(out.header).toContain("EVT_EVT_KEY_DOWN");
    expect(out.header).toContain("EVT_EVT_KEY_UP");
    expect(out.header).toContain("} evt_event_type_t;");
  });

  it("subscribe API is declared in the header", () => {
    const out = generatePubSub(cfg);
    expect(out.header).toContain(
      "bool evt_subscribe(evt_event_type_t type, evt_callback_t cb);"
    );
  });
});

describe("generate (entry point)", () => {
  it("dispatches on the type discriminator", () => {
    const ring = generate({
      type: "ring-buffer",
      config: {
        typeName: "rb",
        elementType: "uint8_t",
        customElementType: "",
        capacity: 8,
        threadSafe: false,
      },
    });
    expect(ring.header).toContain("rb_t");
    expect(ring.source).toContain("rb_init");

    const sm = generate({
      type: "state-machine",
      config: { prefix: "fsm", states: ["A", "B"], events: ["GO"] },
    });
    expect(sm.header).toContain("FSM_STATE_A");
    expect(sm.source).toBe("");
  });
});
