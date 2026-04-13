import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { JsonBuilderStore, JsonTemplate } from "@/types/json-builder";

const BUILTIN_TEMPLATES: JsonTemplate[] = [
  {
    id: "mqtt-cmd",
    name: "MQTT 指令帧",
    description: "常见 MCU MQTT 通信 JSON 格式",
    fields: [
      { id: "t-1", key: "cmd", type: "string", value: "set_led", children: [] },
      { id: "t-2", key: "device_id", type: "string", value: "ESP32_001", children: [] },
      {
        id: "t-3",
        key: "params",
        type: "object",
        value: null,
        children: [
          { id: "t-3-1", key: "pin", type: "number", value: 13, children: [] },
          { id: "t-3-2", key: "state", type: "boolean", value: true, children: [] },
        ],
      },
      { id: "t-4", key: "timestamp", type: "number", value: 0, children: [] },
    ],
    createdAt: 0,
  },
  {
    id: "sensor-report",
    name: "传感器上报",
    description: "传感器数据上报 JSON 格式",
    fields: [
      { id: "s-1", key: "type", type: "string", value: "sensor_data", children: [] },
      { id: "s-2", key: "node_id", type: "number", value: 1, children: [] },
      {
        id: "s-3",
        key: "data",
        type: "object",
        value: null,
        children: [
          { id: "s-3-1", key: "temperature", type: "number", value: 25.5, children: [] },
          { id: "s-3-2", key: "humidity", type: "number", value: 60, children: [] },
        ],
      },
      { id: "s-4", key: "battery", type: "number", value: 3.7, children: [] },
    ],
    createdAt: 0,
  },
];

export const useJsonBuilderStore = create<JsonBuilderStore>()(
  persist(
    (set) => ({
      templates: BUILTIN_TEMPLATES,

      addTemplate: (template) =>
        set((state) => ({
          templates: [...state.templates, template],
        })),

      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),

      updateTemplate: (id, partial) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...partial } : t
          ),
        })),
    }),
    {
      name: "embed-toolkit-json-builder",
      partialize: (state) => ({
        templates: state.templates,
      }),
    }
  )
);
