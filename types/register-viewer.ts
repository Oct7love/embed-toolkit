export interface BitField {
  name: string;
  startBit: number; // inclusive
  endBit: number; // inclusive
  description: string;
  color: string;
}

export interface RegisterTemplate {
  id: string;
  name: string;
  description: string;
  width: 8 | 16 | 32;
  fields: BitField[];
  createdAt: number;
}

export interface RegisterViewerStore {
  templates: RegisterTemplate[];
  activeTemplateId: string | null;
  addTemplate: (template: RegisterTemplate) => void;
  deleteTemplate: (id: string) => void;
  setActiveTemplate: (id: string | null) => void;
  updateTemplate: (id: string, template: Partial<RegisterTemplate>) => void;
}
