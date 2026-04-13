import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProtocolTemplate } from "@/types/serial-parser";
import { createDefaultTemplate } from "@/lib/serial-parser";

interface SerialParserState {
  /** All saved templates */
  templates: ProtocolTemplate[];
  /** Currently active template ID */
  activeTemplateId: string;

  /** Add or update a template */
  saveTemplate: (template: ProtocolTemplate) => void;
  /** Delete a template */
  deleteTemplate: (id: string) => void;
  /** Set the active template */
  setActiveTemplateId: (id: string) => void;
}

export const useSerialParserStore = create<SerialParserState>()(
  persist(
    (set, get) => ({
      templates: [createDefaultTemplate()],
      activeTemplateId: "default",

      saveTemplate: (template) => {
        const { templates } = get();
        const idx = templates.findIndex((t) => t.id === template.id);
        if (idx >= 0) {
          const updated = [...templates];
          updated[idx] = template;
          set({ templates: updated });
        } else {
          set({ templates: [...templates, template] });
        }
      },

      deleteTemplate: (id) => {
        const { templates, activeTemplateId } = get();
        const filtered = templates.filter((t) => t.id !== id);
        if (filtered.length === 0) {
          // Always keep at least one template
          filtered.push(createDefaultTemplate());
        }
        set({
          templates: filtered,
          activeTemplateId:
            activeTemplateId === id ? filtered[0].id : activeTemplateId,
        });
      },

      setActiveTemplateId: (id) => set({ activeTemplateId: id }),
    }),
    {
      name: "embed-toolkit-serial-parser",
    }
  )
);
